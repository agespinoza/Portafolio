# Day 011 · UN M49 table (unstats.un.org/unsd/methodology/m49/overview/) → raw/day-011-spices/m49.csv: M49 code, ISO3, name, region.
# FAOSTAT identifies countries by M49; the World Bank by ISO3. Run: python3 -I scripts/day-011/m49.py
import csv, html, re
R = "raw/day-011-spices"
h = open(f"{R}/m49.html", encoding="utf-8").read()
i = h.find('id = "downloadTableEN"'); t = h[i:h.find("</table>", i)]
rows = [[html.unescape(re.sub(r"<[^>]+>", "", c)).strip() for c in re.findall(r"<td[^>]*>(.*?)</td>", r, re.S)] for r in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S)]
head = rows[0]; body = [r for r in rows[1:] if len(r) == len(head)]
ix = {k: head.index(k) for k in ["M49 Code", "ISO-alpha3 Code", "Country or Area", "Region Name", "Sub-region Name"]}
with open(f"{R}/m49.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(["m49", "iso3", "name", "region", "subregion"])
    for r in body: w.writerow([r[ix["M49 Code"]], r[ix["ISO-alpha3 Code"]], r[ix["Country or Area"]], r[ix["Region Name"]], r[ix["Sub-region Name"]]])
print(f"✓ m49.csv: {len(body)} countries and areas")
