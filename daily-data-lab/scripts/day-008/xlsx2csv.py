"""Convert the first sheet of an .xlsx (Seed Portal export) to CSV on stdout. Standard library only."""
import csv, re, sys, zipfile, xml.etree.ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
T = "{%s}t" % NS["m"]


def rows(path):
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS):
            shared.append("".join(t.text or "" for t in si.iter(T)))
    sheet = sorted(n for n in z.namelist() if n.startswith("xl/worksheets/sheet"))[0]
    for r in ET.fromstring(z.read(sheet)).iter("{%s}row" % NS["m"]):
        out = []
        for c in r.findall("m:c", NS):
            col = 0
            for ch in re.match(r"[A-Z]+", c.get("r")).group(0):
                col = col * 26 + ord(ch) - 64
            while len(out) < col - 1:
                out.append("")
            v = c.find("m:v", NS)
            if c.get("t") == "s":
                out.append(shared[int(v.text)])
            elif c.get("t") == "inlineStr":
                out.append("".join(t.text or "" for t in c.find("m:is", NS).iter(T)))
            else:
                out.append(v.text if v is not None else "")
        yield [x.strip() for x in out]


if __name__ == "__main__":
    w = csv.writer(sys.stdout)
    for row in rows(sys.argv[1]):
        w.writerow(row)
