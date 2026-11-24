"""Builds a vbaProject.bin (the VBA part of an .xlsm) from plain-text modules, with no Excel needed.

Python libraries can attach a vbaProject.bin but cannot create one, so this file writes it from the
published format, Microsoft [MS-OVBA] and [MS-CFB]:
  * MS-OVBA 2.4.1 compression for the `dir` stream and each module's source code;
  * the `dir` stream records (project information, one reference to OLE Automation, modules);
  * the `PROJECT` and `PROJECTwm` streams, with the unprotected-project values encrypted as 2.4.3 requires;
  * `_VBA_PROJECT` with version 0xFFFF and no performance cache, so Excel compiles the source on open;
  * a version-3 compound file (512-byte sectors, 64-byte mini stream for streams under 4,096 bytes).

Document modules must match the workbook's code names: XlsxWriter names them ThisWorkbook, Sheet1, Sheet2, ...
"""
from __future__ import annotations

import struct
import uuid

ENDOFCHAIN, FREESECT, FATSECT, NOSTREAM = 0xFFFFFFFE, 0xFFFFFFFF, 0xFFFFFFFD, 0xFFFFFFFF
WORKBOOK_BASE = "0{00020819-0000-0000-C000-000000000046}"
SHEET_BASE = "0{00020820-0000-0000-C000-000000000046}"


# ---------------------------------------------------------------- MS-OVBA 2.4.1 compression
def compress(data: bytes) -> bytes:
    out = bytearray(b"\x01")
    for start in range(0, len(data), 4096):
        chunk = data[start:start + 4096]
        body = bytearray()
        pos = 0
        while pos < len(chunk):
            flag_at = len(body)
            body.append(0)
            flags = 0
            for bit in range(8):
                if pos >= len(chunk):
                    break
                diff = pos
                bit_count = max((diff - 1).bit_length(), 4) if diff > 0 else 4
                length_mask = 0xFFFF >> bit_count
                max_len = length_mask + 3
                best_len, best_off = 0, 0
                if pos > 0:
                    limit = min(max_len, len(chunk) - pos)
                    lo = 0
                    for cand in range(pos - 1, lo - 1, -1):
                        ln = 0
                        while ln < limit and chunk[cand + ln] == chunk[pos + ln]:
                            ln += 1
                        if ln > best_len:
                            best_len, best_off = ln, pos - cand
                            if ln == limit:
                                break
                if best_len >= 3:
                    token = ((best_off - 1) << (16 - bit_count)) | (best_len - 3)
                    body += struct.pack("<H", token)
                    flags |= 1 << bit
                    pos += best_len
                else:
                    body.append(chunk[pos])
                    pos += 1
            body[flag_at] = flags
        if len(body) > 4096:  # incompressible: raw chunk, padded to 4,096 bytes
            body = bytearray(chunk.ljust(4096, b"\x00"))
            header = 0x3000 | 4095
        else:
            header = 0xB000 | (len(body) - 1)  # size field = chunk size (2-byte header + body) - 3
        out += struct.pack("<H", header) + body
    return bytes(out)


def decompress(data: bytes) -> bytes:
    """Reference decompressor, used only by the self-check."""
    assert data[0] == 1
    out = bytearray()
    i = 1
    while i < len(data):
        header = struct.unpack_from("<H", data, i)[0]
        size = (header & 0x0FFF) + 3
        compressed = header & 0x8000
        end = i + size
        i += 2
        start = len(out)
        if not compressed:
            out += data[i:i + 4096]
            i += 4096
            continue
        while i < end:
            flags = data[i]
            i += 1
            for bit in range(8):
                if i >= end:
                    break
                if flags & (1 << bit):
                    token = struct.unpack_from("<H", data, i)[0]
                    i += 2
                    diff = len(out) - start
                    bit_count = max((diff - 1).bit_length(), 4)
                    length_mask = 0xFFFF >> bit_count
                    length = (token & length_mask) + 3
                    offset = (token >> (16 - bit_count)) + 1
                    for _ in range(length):
                        out.append(out[-offset])
                else:
                    out.append(data[i])
                    i += 1
    return bytes(out)


# ---------------------------------------------------------------- MS-OVBA 2.4.3 data encryption (PROJECT stream)
def encrypt(project_id: str, data: bytes, seed: int = 0x5A) -> str:
    version, proj_key = 2, sum(project_id.encode("ascii")) & 0xFF
    out = bytearray([seed, seed ^ version, seed ^ proj_key])
    unenc1, enc1, enc2 = proj_key, seed ^ proj_key, seed ^ version
    for _ in range((seed & 6) // 2):
        temp = 0
        b = (temp ^ ((enc2 + unenc1) & 0xFF)) & 0xFF
        out.append(b)
        enc2, enc1, unenc1 = enc1, b, temp
    for byte in struct.pack("<I", len(data)) + data:
        b = byte ^ ((enc2 + unenc1) & 0xFF)
        out.append(b)
        enc2, enc1, unenc1 = enc1, b, byte
    return out.hex().upper()


# ---------------------------------------------------------------- dir stream
def _rec(rid: int, payload: bytes) -> bytes:
    return struct.pack("<HI", rid, len(payload)) + payload


def _dir_stream(modules: list[tuple[str, str, bool]]) -> bytes:
    """modules: (name, source, is_document)."""
    mb = lambda s: s.encode("cp1252")
    u16 = lambda s: s.encode("utf-16-le")
    d = bytearray()
    d += _rec(0x0001, struct.pack("<I", 3))          # SYSKIND: 64-bit Windows (Excel recompiles for its platform)
    d += _rec(0x0002, struct.pack("<I", 0x409))      # LCID
    d += _rec(0x0014, struct.pack("<I", 0x409))      # LCIDINVOKE
    d += _rec(0x0003, struct.pack("<H", 1252))       # CODEPAGE
    d += _rec(0x0004, mb("VBAProject"))              # NAME
    d += _rec(0x0005, b"") + _rec(0x0040, b"")       # DOCSTRING + unicode
    d += _rec(0x0006, b"") + _rec(0x003D, b"")       # HELPFILEPATH 1 + 2
    d += _rec(0x0007, struct.pack("<I", 0))          # HELPCONTEXT
    d += _rec(0x0008, struct.pack("<I", 0))          # LIBFLAGS
    d += struct.pack("<HIIH", 0x0009, 4, 1, 0)       # VERSION: reserved=4, major, minor
    d += _rec(0x000C, b"") + _rec(0x003C, b"")       # CONSTANTS + unicode
    # Reference: OLE Automation (stdole), present in every project Excel writes.
    d += _rec(0x0016, mb("stdole")) + _rec(0x003E, u16("stdole"))
    libid = mb("*\\G{00020430-0000-0000-C000-000000000046}#2.0#0#C:\\Windows\\System32\\stdole2.tlb#OLE Automation")
    d += _rec(0x000D, struct.pack("<I", len(libid)) + libid + struct.pack("<IH", 0, 0))
    d += _rec(0x000F, struct.pack("<H", len(modules)))
    d += _rec(0x0013, struct.pack("<H", 0xFFFF))
    for name, _src, is_doc in modules:
        d += _rec(0x0019, mb(name)) + _rec(0x0047, u16(name))
        d += _rec(0x001A, mb(name)) + _rec(0x0032, u16(name))
        d += _rec(0x001C, b"") + _rec(0x0048, b"")
        d += _rec(0x0031, struct.pack("<I", 0))      # TextOffset: source starts at byte 0 (no cache)
        d += _rec(0x001E, struct.pack("<I", 0))
        d += _rec(0x002C, struct.pack("<H", 0xFFFF))
        d += struct.pack("<HI", 0x0022 if is_doc else 0x0021, 0)
        d += struct.pack("<HI", 0x002B, 0)
    d += struct.pack("<HI", 0x0010, 0)
    return bytes(d)


def _module_source(name: str, body: str, base: str | None) -> str:
    if base:
        head = [f'Attribute VB_Name = "{name}"', f'Attribute VB_Base = "{base}"', "Attribute VB_GlobalNameSpace = False",
                "Attribute VB_Creatable = False", "Attribute VB_PredeclaredId = True", "Attribute VB_Exposed = True",
                "Attribute VB_TemplateDerived = False", "Attribute VB_Customizable = True"]
    else:
        head = [f'Attribute VB_Name = "{name}"']
    lines = head + body.strip("\n").splitlines()
    return "\r\n".join(lines) + "\r\n"


# ---------------------------------------------------------------- MS-CFB writer
def _entry_name_key(name: str):
    return (len(name), name.upper())


class _Entry:
    def __init__(self, name, kind, data=b"", children=None):
        self.name, self.kind, self.data, self.children = name, kind, data, children or []
        self.left = self.right = self.child = NOSTREAM
        self.start, self.size = ENDOFCHAIN, 0


def _cfb(tree: _Entry) -> bytes:
    entries: list[_Entry] = []

    def collect(e):
        e.id = len(entries)
        entries.append(e)
        for c in e.children:
            collect(c)
    collect(tree)

    def balance(nodes):
        if not nodes:
            return NOSTREAM
        mid = len(nodes) // 2
        n = nodes[mid]
        n.left, n.right = balance(nodes[:mid]), balance(nodes[mid + 1:])
        return n.id
    for e in entries:
        if e.children:
            e.child = balance(sorted(e.children, key=lambda c: _entry_name_key(c.name)))

    streams = [e for e in entries if e.kind == 2]
    mini = bytearray()
    minifat: list[int] = []
    big = [e for e in streams if len(e.data) >= 4096]
    for e in streams:
        e.size = len(e.data)
        if 0 < len(e.data) < 4096:
            n = (len(e.data) + 63) // 64
            e.start = len(minifat)
            minifat += list(range(e.start + 1, e.start + n)) + [ENDOFCHAIN]
            mini += e.data.ljust(n * 64, b"\x00")
        elif not e.data:
            e.start = ENDOFCHAIN

    sec = lambda b: (len(b) + 511) // 512
    dir_bytes_len = len(entries) * 128
    n_dir = sec(bytes(dir_bytes_len))
    n_minifat = sec(bytes(len(minifat) * 4))
    n_mini = sec(mini)
    n_big = [sec(e.data) for e in big]
    content = n_dir + n_minifat + n_mini + sum(n_big)
    n_fat = 1
    while n_fat * 128 < content + n_fat:
        n_fat += 1
    assert n_fat <= 109
    fat: list[int] = [FATSECT] * n_fat
    cursor = n_fat

    def chain(n):
        nonlocal cursor
        if n == 0:
            return ENDOFCHAIN
        first = cursor
        fat.extend(list(range(cursor + 1, cursor + n)) + [ENDOFCHAIN])
        cursor += n
        return first
    dir_start = chain(n_dir)
    minifat_start = chain(n_minifat) if n_minifat else ENDOFCHAIN
    tree.start = chain(n_mini) if n_mini else ENDOFCHAIN
    tree.size = len(mini)
    for e, n in zip(big, n_big):
        e.start = chain(n)
    fat += [FREESECT] * (n_fat * 128 - len(fat))

    header = bytearray(512)
    struct.pack_into("<8s16sHHHHH6sIIIIIIIII", header, 0, bytes.fromhex("D0CF11E0A1B11AE1"), bytes(16), 0x3E, 3, 0xFFFE,
                     9, 6, bytes(6), 0, n_fat, dir_start, 0, 4096, minifat_start, n_minifat, ENDOFCHAIN, 0)
    difat = list(range(n_fat)) + [FREESECT] * (109 - n_fat)
    struct.pack_into("<109I", header, 76, *difat)

    d = bytearray()
    for e in entries:
        name = e.name.encode("utf-16-le") + b"\x00\x00"
        rec = bytearray(128)
        rec[0:len(name)] = name
        struct.pack_into("<HBBIII", rec, 64, len(name), e.kind, 1, e.left, e.right, e.child)
        if e.kind == 1:
            start, size = 0, 0
        else:
            start, size = (e.start if (e.kind == 5 or e.size) else ENDOFCHAIN), e.size
        struct.pack_into("<IQ", rec, 116, start, size)
        d += rec
    empty = bytearray(128)
    struct.pack_into("<III", empty, 68, NOSTREAM, NOSTREAM, NOSTREAM)
    while len(d) % 512:
        d += empty

    body = bytearray(header)
    body += struct.pack(f"<{n_fat * 128}I", *fat)
    body += d
    if n_minifat:
        mf = minifat + [FREESECT] * (n_minifat * 128 - len(minifat))
        body += struct.pack(f"<{len(mf)}I", *mf)
    body += mini.ljust(n_mini * 512, b"\x00")
    for e, n in zip(big, n_big):
        body += e.data.ljust(n * 512, b"\x00")
    return bytes(body)


# ---------------------------------------------------------------- public API
def build_vba_project(sheet_count: int, standard_modules: dict[str, str], workbook_code: str = "", seed_id: str | None = None) -> bytes:
    """vbaProject.bin with ThisWorkbook, Sheet1..SheetN (document modules) and the given standard modules."""
    mods: list[tuple[str, str, bool]] = [("ThisWorkbook", _module_source("ThisWorkbook", workbook_code, WORKBOOK_BASE), True)]
    for i in range(1, sheet_count + 1):
        mods.append((f"Sheet{i}", _module_source(f"Sheet{i}", "", SHEET_BASE), True))
    for name, code in standard_modules.items():
        mods.append((name, _module_source(name, code, None), False))

    pid = "{" + str(uuid.uuid5(uuid.NAMESPACE_URL, seed_id or "daily-data-lab")).upper() + "}"
    lines = [f'ID="{pid}"']
    lines += [f"Document={n}/&H00000000" for n, _s, doc in mods if doc]
    lines += [f"Module={n}" for n, _s, doc in mods if not doc]
    lines += ['Name="VBAProject"', 'HelpContextID="0"', 'VersionCompatible32="393222000"',
              'CMG="' + encrypt(pid, struct.pack("<I", 0), 0x5A) + '"',
              'DPB="' + encrypt(pid, bytes([0]), 0x3C) + '"',
              'GC="' + encrypt(pid, bytes([0xFF]), 0x1E) + '"',
              "", "[Host Extender Info]", "&H00000001={3832D640-CF90-11CF-8E43-00A0C911005A};VBE;&H00000000", "", "[Workspace]"]
    lines += [f"{n}=0, 0, 0, 0, C" for n, _s, _d in mods]
    project = ("\r\n".join(lines) + "\r\n").encode("cp1252")
    wm = b"".join(n.encode("cp1252") + b"\x00" + n.encode("utf-16-le") + b"\x00\x00" for n, _s, _d in mods) + b"\x00\x00"

    vba_children = [_Entry("_VBA_PROJECT", 2, bytes([0xCC, 0x61, 0xFF, 0xFF, 0x00, 0x00, 0x00])),
                    _Entry("dir", 2, compress(_dir_stream(mods)))]
    vba_children += [_Entry(n, 2, compress(s.encode("cp1252"))) for n, s, _d in mods]
    root = _Entry("Root Entry", 5, children=[_Entry("VBA", 1, children=vba_children), _Entry("PROJECT", 2, project), _Entry("PROJECTwm", 2, wm)])
    return _cfb(root)


if __name__ == "__main__":  # self-check: compression round trip
    import random
    rnd = random.Random(1)
    for sample in [b"", b"abc", b"#aaabcdefaaaaghijaaaaaklaaamnopqaaaaaaaaaaaarstuvwxyzaaa",
                   bytes(rnd.choice(b"Sub Dim As Long\r\n ") for _ in range(20000)), bytes(rnd.getrandbits(8) for _ in range(9000))]:
        assert decompress(compress(sample)) == sample, sample[:20]
    print("compression round trip ok")
