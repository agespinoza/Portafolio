"""Download and validate public orbit data for the satellite operations console.

Sources
- CelesTrak GP catalog (two-line element sets published from U.S. Space Force
  tracking data): https://celestrak.org/NORAD/elements/
- NASA Johnson Space Center ISS trajectory ephemeris (CCSDS OEM, EME2000 frame):
  https://nasa-public-data.s3.amazonaws.com/iss-coords/current/ISS_OEM/ISS.OEM_J2K_EPH.txt

Writes data/elements.json and data/iss_oem.json. Uses only the Python standard
library. CelesTrak asks clients not to download the same data more than once
every two hours, so run this script at most a few times a day.
"""
import json
import math
import re
import sys
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

DIRECTORY = Path(__file__).resolve().parent
DATA = DIRECTORY / "data"
CELESTRAK = "https://celestrak.org/NORAD/elements/gp.php?CATNR={norad}&FORMAT=tle"
ISS_OEM = "https://nasa-public-data.s3.amazonaws.com/iss-coords/current/ISS_OEM/ISS.OEM_J2K_EPH.txt"
USER_AGENT = "satellite-ops-console-portfolio/1.0"
OEM_HOURS = 72  # keep three days of the 15-day NASA ephemeris

# NASA-led or NASA-partnered missions covering every major orbit regime.
FLEET = [
    (25544, "ISS", "NASA / international partners", "Crewed research laboratory"),
    (20580, "Hubble", "NASA / ESA", "Space telescope"),
    (25994, "Terra", "NASA", "Earth observing system flagship"),
    (27424, "Aqua", "NASA", "Water-cycle Earth observation"),
    (28376, "Aura", "NASA", "Atmospheric chemistry"),
    (39084, "Landsat 8", "NASA / USGS", "Land imaging"),
    (49260, "Landsat 9", "NASA / USGS", "Land imaging"),
    (43613, "ICESat-2", "NASA", "Laser altimetry of ice sheets"),
    (39574, "GPM Core", "NASA / JAXA", "Global precipitation radar"),
    (54754, "SWOT", "NASA / CNES", "Surface water and ocean topography"),
    (58928, "PACE", "NASA", "Ocean color and aerosols"),
    (43013, "NOAA-20", "NOAA / NASA", "Polar weather (JPSS-1)"),
    (54234, "NOAA-21", "NOAA / NASA", "Polar weather (JPSS-2)"),
    (51850, "GOES-18", "NOAA / NASA", "Geostationary weather (GOES West)"),
    (40482, "MMS 1", "NASA", "Magnetospheric multiscale, highly elliptical"),
    (25867, "Chandra", "NASA", "X-ray observatory, highly elliptical"),
]


def download(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8")


def tle_checksum(line):
    total = sum(int(c) if c.isdigit() else 1 if c == "-" else 0 for c in line[:68])
    return total % 10


def validate_tle(norad, line1, line2):
    """Reject element sets that would silently propagate the wrong object."""
    for number, line in ((1, line1), (2, line2)):
        if len(line) != 69 or not line.startswith(f"{number} "):
            raise ValueError(f"{norad}: line {number} is not a 69-column TLE line")
        if tle_checksum(line) != int(line[68]):
            raise ValueError(f"{norad}: line {number} checksum mismatch")
    if int(line1[2:7]) != norad or int(line2[2:7]) != norad:
        raise ValueError(f"{norad}: catalog number does not match the request")
    eccentricity = float("0." + line2[26:33])
    mean_motion = float(line2[52:63])
    if not (0 <= eccentricity < 1 and 0.05 < mean_motion < 17):
        raise ValueError(f"{norad}: orbital elements out of range")
    year = int(line1[18:20])
    year += 2000 if year < 57 else 1900
    epoch = datetime(year, 1, 1, tzinfo=timezone.utc) + timedelta(days=float(line1[20:32]) - 1)
    return epoch


def fetch_elements(now):
    satellites = []
    for norad, name, agency, mission in FLEET:
        lines = [line.rstrip() for line in download(CELESTRAK.format(norad=norad)).splitlines() if line.strip()]
        if len(lines) < 3:
            raise ValueError(f"{norad}: CelesTrak returned no element set ({lines[:1]})")
        epoch = validate_tle(norad, lines[1], lines[2])
        age_days = (now - epoch).total_seconds() / 86400
        satellites.append({
            "norad": norad, "name": name, "catalogName": lines[0].strip(), "agency": agency,
            "mission": mission, "line1": lines[1], "line2": lines[2],
            "epochUtc": epoch.isoformat().replace("+00:00", "Z"),
        })
        print(f"  {name:<10} epoch {epoch:%Y-%m-%d %H:%M}Z  age {age_days:5.2f} d")
    return satellites


def parse_oem(text):
    """Parse a CCSDS OEM v2 file and keep OEM_HOURS of state vectors."""
    meta = dict(re.findall(r"^\s*(\w+)\s*=\s*(.+?)\s*$", text, re.MULTILINE))
    if meta.get("REF_FRAME") != "EME2000" or meta.get("TIME_SYSTEM") != "UTC":
        raise ValueError("Unexpected OEM frame or time system")
    start = datetime.fromisoformat(meta["START_TIME"]).replace(tzinfo=timezone.utc)
    stop = start + timedelta(hours=OEM_HOURS)
    records = []
    for line in text.splitlines():
        parts = line.split()
        if len(parts) != 7 or not re.match(r"\d{4}-\d{2}-\d{2}T", parts[0]):
            continue
        time = datetime.fromisoformat(parts[0]).replace(tzinfo=timezone.utc)
        if time > stop:
            break
        values = [float(value) for value in parts[1:]]
        if not all(map(math.isfinite, values)) or not 6000 < math.dist(values[:3], (0, 0, 0)) < 7500:
            raise ValueError(f"Implausible ISS state at {parts[0]}")
        records.append([parts[0] + "Z", *[round(value, 4) for value in values[:3]], *[round(value, 7) for value in values[3:]]])
    if len(records) < 100:
        raise ValueError("OEM file has too few state vectors")
    return {
        "source": ISS_OEM, "originator": meta.get("ORIGINATOR"), "creationDate": meta.get("CREATION_DATE") + "Z",
        "frame": "EME2000", "units": "km, km/s", "records": records,
    }


def main():
    now = datetime.now(timezone.utc)
    DATA.mkdir(exist_ok=True)
    print("Downloading CelesTrak element sets…")
    satellites = fetch_elements(now)
    generated = now.isoformat(timespec="seconds").replace("+00:00", "Z")
    elements = {"generatedUtc": generated, "source": "CelesTrak GP catalog (celestrak.org)", "satellites": satellites}
    (DATA / "elements.json").write_text(json.dumps(elements, indent=1) + "\n", encoding="utf-8")

    print("Downloading NASA ISS ephemeris…")
    oem = parse_oem(download(ISS_OEM))
    iss = next(sat for sat in satellites if sat["norad"] == 25544)
    oem["generatedUtc"] = generated
    oem["tle"] = {"line1": iss["line1"], "line2": iss["line2"]}  # the TLE captured alongside this OEM
    (DATA / "iss_oem.json").write_text(json.dumps(oem, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Saved {len(satellites)} element sets and {len(oem['records'])} ISS state vectors.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        sys.exit(f"Data refresh failed: {error}")
