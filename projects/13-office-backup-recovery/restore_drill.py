from hashlib import sha256
from pathlib import Path
from shutil import copytree
from tempfile import TemporaryDirectory
from time import monotonic


def manifest(directory):
    return {
        path.relative_to(directory): sha256(path.read_bytes()).hexdigest()
        for path in directory.rglob("*") if path.is_file()
    }


with TemporaryDirectory() as scratch:
    workspace = Path(scratch)
    share = workspace / "office"
    share.mkdir()
    (share / "requests.txt").write_text("Synthetic office request log.\n")
    expected = manifest(share)
    snapshot = workspace / "snapshot"
    copytree(share, snapshot)
    (share / "requests.txt").unlink()
    start = monotonic()
    restored = workspace / "isolated-restore"
    copytree(snapshot, restored)
    if manifest(restored) != expected:
        raise RuntimeError("Restore integrity check failed.")
    print(f"Verified {len(expected)} recovered file in {monotonic() - start:.3f} seconds.")
