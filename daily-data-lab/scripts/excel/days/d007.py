"""Day 007 · How much of Earth orbit is junk, and who left it there? (CelesTrak SATCAT, ESA, NASA HOOSF)"""
import json
import os

from book import Book, Col, Meta, SERIES, ACCENT, COPPER

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
S = json.load(open(os.path.join(ROOT, "data/day-007-space-debris/day-007.json"), encoding="utf-8"))
K = S["kpis"]
KIND = {"active": "Active satellite", "inactive": "Dead satellite", "rocket": "Rocket body", "debris": "Debris", "unknown": "Unidentified"}
CAUSE = {"asat": "Anti-satellite test", "collision": "Accidental collision", "propulsion": "Propulsion explosion", "battery": "Battery explosion",
         "selfDestruct": "Deliberate self-destruct", "unknown": "Unknown cause", "afterList": "After NASA's list (May 2022)", "none": "No break-up"}
RCS = {"small": "Small (< 0.1 m²)", "medium": "Medium (0.1–1 m²)", "large": "Large (> 1 m²)", "none": "No RCS published"}

META = Meta(
    day=7, slug="space-debris", title="How much of Earth orbit is junk, and who left it there?",
    question="How many objects orbit the Earth, how many still work, where is the junk, who owns it, and what broke it up?",
    summary=f"Every Earth-orbiting object in CelesTrak's satellite catalogue ({K['catalogued']:,} since 1957; {K['tracked']:,} in orbit on {S['asOf']}), "
            "by kind (active, dead satellite, rocket body, debris, unidentified), ESA orbit class, mean altitude, year, owner, radar size and break-up cause.",
    captured=S["asOf"],
    sources=[
        ("Satellite catalogue (SATCAT)", "CelesTrak", "https://celestrak.org/pub/satcat.csv", "Free use with attribution (CelesTrak usage policy)", "Every object: owner, dates, orbit, status, radar cross-section"),
        ("Owner codes (sources.php)", "CelesTrak", "https://celestrak.org/satcat/sources.php", "Free use with attribution", "Owner names"),
        ("Annual Space Environment Report 2026 (MASTER, 1 Feb 2026)", "ESA Space Debris Office", "https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2026",
         "© ESA, reuse with credit", "Orbit classes; size-class estimates"),
        ("History of On-orbit Satellite Fragmentations, 16th ed. (Table 2.1)", "NASA Orbital Debris Program Office", "https://orbitaldebris.jsc.nasa.gov/library/", "U.S. government work", "Break-up causes"),
    ],
    caveats=[
        "Counts are catalogued (tracked) objects, usually larger than about 10 cm in low orbit; ESA's MASTER model estimates far more small fragments (see Data_ESA).",
        "SATCAT has no catalogue-entry date: it is estimated from catalogue numbers, which places debris clouds in the year of the break-up.",
        "Active = CelesTrak operational status +, P, B, S or X. Mean altitude = (apogee + perigee) ÷ 2. Each debris piece inherits its parent launch's break-up cause.",
        "59% of objects in orbit have no radar cross-section because none is published for payloads launched after April 2017.",
        "The fragmentation table holds the 10 largest debris clouds kept in the page snapshot; the cause table covers all debris.",
    ],
)


def build(b: Book):
    O, W, C = S["orbits"], S["owners"], S["classes"]
    cube = [[O[o], W[w]["code"], W[w]["name"], KIND[C[c]], ey, dy or None, bin_ * 50 if bin_ >= 0 else None, rec, n] for o, w, c, ey, dy, bin_, rec, n in S["cube"]]
    an = b.sheet("Analysis", "Filter by orbit and owner with drop-downs; kinds by orbit, population by year, the altitude profile, owners, causes and radar size.", ACCENT)
    ch = b.sheet("Charts", "Population over time, the low-orbit altitude profile, causes of debris, and every owner's objects in orbit.", ACCENT)
    t = b.data_table("Data_Objects", "tblObjects", "Catalogue cube", "Every catalogued object, grouped by orbit × owner × kind × entry year × decay year × altitude bin × recent re-entry.", [
        Col("Orbit", "text", "ESA orbit class (LEO, MEO, GEO, …)"), Col("Owner code", "text", "CelesTrak owner code"), Col("Owner", "text", ""),
        Col("Kind", "text", "Active satellite, dead satellite, rocket body, debris, unidentified"), Col("Entry year", "year", "Year the object entered the catalogue (estimated)"),
        Col("Decay year", "year", "Year of re-entry; blank = still in orbit"), Col("Altitude bin km", "int", "Lower edge of the 50 km mean-altitude bin (objects in orbit below 2,000 km)", "km"),
        Col("Reentered last 365 days", "int", f"1 = re-entered after {S['yearAgo']}"), Col("Objects", "int", "Number of objects in this cell"),
        Col("In orbit", "int", "1 = not decayed", formula='=IF([@[Decay year]]="",1,0)'),
        Col("Junk", "int", "1 = anything in orbit that is not an active satellite", formula='=IF([@Kind]="Active satellite",0,1)')], cube, freeze_cols=0)
    to = b.data_table("Data_Owners", "tblOwners", "Owners", "Objects per owner, all kinds (catalogued = ever, the rest = in orbit now).", [
        Col("Code", "text", ""), Col("Owner", "text", ""), Col("Active", "int", "In orbit"), Col("Dead satellites", "int", "In orbit"), Col("Rocket bodies", "int", "In orbit"),
        Col("Debris", "int", "In orbit"), Col("Unidentified", "int", "In orbit"), Col("Catalogued", "int", "Ever catalogued"),
        Col("In orbit", "int", "", formula="=SUM(tblOwners[@[Active]:[Unidentified]])"),
        Col("Junk share", "pct", "Share of the owner's objects in orbit that are not active", formula='=IF([@[In orbit]]>0,1-[@Active]/[@[In orbit]],"")'),
        Col("Rank in orbit", "int", "", formula="=RANK.EQ([@[In orbit]],[In orbit],0)")],
        [[o["owner"], o["name"], o["active"], o["inactive"], o["rocketBody"], o["debris"], o["unknown"], o["catalogued"]] for o in sorted(S["byOwner"], key=lambda o: -(o["active"] + o["inactive"] + o["rocketBody"] + o["debris"] + o["unknown"]))])
    tc = b.data_table("Data_Causes", "tblCauses", "Debris by break-up cause", "Debris pieces by orbit, owner and the cause of the break-up that made them (NASA HOOSF 16th ed.).", [
        Col("Orbit", "text", ""), Col("Owner code", "text", ""), Col("Cause", "text", ""), Col("In orbit", "int", "Debris pieces still in orbit"), Col("Catalogued", "int", "Ever catalogued")],
        [[O[o], W[w]["code"], CAUSE[S["causes"][c]], n1, n2] for o, w, c, n1, n2 in S["causeCube"]])
    tr = b.data_table("Data_RadarSize", "tblRCS", "Objects in orbit by radar size", "SATCAT radar cross-section in the historical NORAD classes.", [
        Col("Orbit", "text", ""), Col("Owner code", "text", ""), Col("Kind", "text", ""), Col("RCS class", "text", ""), Col("Objects", "int", "")],
        [[O[o], W[w]["code"], KIND[C[c]], RCS[S["rcsClasses"][k]], n] for o, w, c, k, n in S["rcsCube"]])
    tsh = b.data_table("Data_Shells", "tblShells", "Shells (3-D view)", "Objects in orbit by mean altitude (10 km steps) and inclination (1° steps).", [
        Col("Orbit", "text", ""), Col("Owner code", "text", ""), Col("Kind", "text", ""), Col("Mean altitude km", "int", "", "km"), Col("Inclination deg", "int", "", "degrees"), Col("Objects", "int", "")],
        [[O[o], W[w]["code"], KIND[C[c]], alt, inc, n] for o, w, c, alt, inc, n in S["shells"]])
    tp = b.data_table("Data_Fragmentations", "tblParents", "Largest debris clouds", "The 10 largest fragmentation parents kept in the page snapshot.", [
        Col("Launch", "text", "International designator"), Col("Parent", "text", ""), Col("Owner code", "text", ""), Col("Orbit", "text", ""),
        Col("Pieces catalogued", "int", ""), Col("Pieces in orbit", "int", ""), Col("Cause", "text", ""), Col("Event year", "year", ""), Col("Launched", "text", ""),
        Col("Still in orbit", "pct", "", formula="=[@[Pieces in orbit]]/[@[Pieces catalogued]]")],
        [[p["launch"], p["parent"], p["owner"], p["orbit"], p["pieces"], p["inOrbit"], CAUSE[p["cause"]], p["eventYear"], p["launched"]] for p in S["topFragmentationParents"]])
    e = S["esa"]
    te = b.data_table("Data_ESA", "tblESA", "ESA size classes (MASTER model)", f"{e['report']}; population at {e['epoch']}.", [
        Col("Size class", "text", ""), Col("Objects", "int", "ESA estimate"), Col("Share tracked here", "pct", "Catalogued objects in orbit ÷ ESA estimate", formula=f"=IFERROR({K['tracked']}/[@Objects],\"\")")],
        [["Larger than 10 cm", e["gt10cm"]], ["1 to 10 cm", e["cm1to10"]], ["1 mm to 1 cm", e["mm1to1cm"]]])

    an.set_column("B:B", 30); an.set_column("C:I", 14)
    b.title(an, "Analysis", "Pick an orbit class and an owner (or 'All'). Formulas use SUMIFS with '*' as the wildcard for All.")
    r = 3
    orbits = ["All"] + O
    owners = ["All"] + sorted(o["name"] for o in W)
    b.list_sheet_range("lstOrbits", orbits)
    b.list_sheet_range("lstOwners", owners)
    an.write(r, 1, "Orbit class", b.label); an.write(r, 2, "All", b.input); an.data_validation(r, 2, r, 2, {"validate": "list", "source": "=lstOrbits"}); oc = f"$C${r + 1}"; r += 1
    sel = b.selector(an, r, 1, "Owner", "=lstOwners", "All"); r += 1
    an.write(r, 1, "Owner code (helper)", b.label)
    an.write_formula(r, 2, f'=IF({sel}="All","*",INDEX(tblOwners[Code],MATCH({sel},tblOwners[Owner],0)))', b.f()); wc = f"$C${r + 1}"; r += 1
    an.write(r, 1, "Orbit (helper)", b.label); an.write_formula(r, 2, f'=IF({oc}="All","*",{oc})', b.f()); oo = f"$C${r + 1}"; r += 2
    F = f"tblObjects[Orbit],{oo},tblObjects[Owner code],{wc}"

    an.write(r, 1, "A · Key numbers for the filter", b.h2); r += 1
    k0 = r
    for label, fml, kind, note in [
        ("Objects in orbit", f"=SUMIFS(tblObjects[Objects],{F},tblObjects[In orbit],1)", "int", f"page (no filter): {K['tracked']:,}"),
        ("Active satellites", f'=SUMIFS(tblObjects[Objects],{F},tblObjects[In orbit],1,tblObjects[Kind],"Active satellite")', "int", f"page: {K['active']:,}"),
        ("Junk share (not active)", f"=IFERROR(1-C{k0 + 2}/C{k0 + 1},\"\")", "pct", f"page: {K['pctJunk']:.1%}"),
        ("Catalogued since 1957", f"=SUMIFS(tblObjects[Objects],{F})", "int", f"page: {K['catalogued']:,}"),
        ("Re-entries in the last 365 days", f"=SUMIFS(tblObjects[Objects],{F},tblObjects[Reentered last 365 days],1)", "int", f"page: {K['reentriesLastYear']:,}"),
        ("Intact re-entries (satellites and rocket bodies)", f'=C{k0 + 5}-SUMIFS(tblObjects[Objects],{F},tblObjects[Reentered last 365 days],1,tblObjects[Kind],"Debris")-SUMIFS(tblObjects[Objects],{F},tblObjects[Reentered last 365 days],1,tblObjects[Kind],"Unidentified")', "int", f"page: {K['reentriesIntactLastYear']:,}"),
        ("Intact re-entries per day", f"=C{k0 + 6}/365", "num1", "")]:
        b.kv(an, r, 1, label, fml, kind, note); r += 1
    r += 1

    an.write(r, 1, "B · Objects in orbit by kind and orbit class (owner filter applies)", b.h2); r += 1
    kinds = list(KIND.values())
    b.header_row(an, r, 1, ["Orbit"] + kinds + ["Total", "Junk share"]); r += 1
    b0 = r
    for o in O:
        R = r + 1
        an.write(r, 1, o, b.f())
        for j, k in enumerate(kinds):
            an.write_formula(r, 2 + j, f'=SUMIFS(tblObjects[Objects],tblObjects[Orbit],$B{R},tblObjects[Owner code],{wc},tblObjects[In orbit],1,tblObjects[Kind],"{k}")', b.numfmt("int"))
        an.write_formula(r, 7, f"=SUM(C{R}:G{R})", b.numfmt("int", bold=True))
        an.write_formula(r, 8, f'=IF(H{R}>0,1-C{R}/H{R},"")', b.numfmt("pct"))
        r += 1
    an.conditional_format(b0, 7, r - 1, 7, {"type": "data_bar", "bar_color": "#8FCFC6", "bar_solid": True})
    r += 1

    an.write(r, 1, "C · Population over time (filter applies)", b.h2); r += 1
    an.write(r, 1, "Added = entered the catalogue that year; Removed = re-entered; In orbit at year end = cumulative added − cumulative removed.", b.muted); r += 1
    b.header_row(an, r, 1, ["Year", "Added", "Removed", "In orbit at year end"] + [f"In orbit: {k}" for k in kinds]); r += 1
    y0 = r
    for y in range(1957, int(S["asOf"][:4]) + 1):
        R = r + 1
        an.write(r, 1, y, b.numfmt("year"))
        an.write_formula(r, 2, f"=SUMIFS(tblObjects[Objects],{F},tblObjects[Entry year],B{R})", b.numfmt("int"))
        an.write_formula(r, 3, f"=SUMIFS(tblObjects[Objects],{F},tblObjects[Decay year],B{R})", b.numfmt("int"))
        an.write_formula(r, 4, f"=SUM(C${y0 + 1}:C{R})-SUM(D${y0 + 1}:D{R})", b.numfmt("int", bold=True))
        for j, k in enumerate(kinds):
            an.write_formula(r, 5 + j, f'=SUMIFS(tblObjects[Objects],{F},tblObjects[Kind],"{k}",tblObjects[Entry year],"<="&B{R})-SUMIFS(tblObjects[Objects],{F},tblObjects[Kind],"{k}",tblObjects[Decay year],"<="&B{R})', b.numfmt("int"))
        r += 1
    y1 = r - 1
    r += 1

    an.write(r, 1, "D · Altitude profile below 2,000 km (objects in orbit, filter applies)", b.h2); r += 1
    b.header_row(an, r, 1, ["From km", "Active", "Junk", "Debris", "Junk share"]); r += 1
    a0 = r
    for k in range(0, 2000, 50):
        R = r + 1
        an.write(r, 1, k, b.numfmt("int"))
        an.write_formula(r, 2, f'=SUMIFS(tblObjects[Objects],{F},tblObjects[Altitude bin km],B{R},tblObjects[In orbit],1,tblObjects[Kind],"Active satellite")', b.numfmt("int"))
        an.write_formula(r, 3, f'=SUMIFS(tblObjects[Objects],{F},tblObjects[Altitude bin km],B{R},tblObjects[In orbit],1,tblObjects[Junk],1)', b.numfmt("int"))
        an.write_formula(r, 4, f'=SUMIFS(tblObjects[Objects],{F},tblObjects[Altitude bin km],B{R},tblObjects[In orbit],1,tblObjects[Kind],"Debris")', b.numfmt("int"))
        an.write_formula(r, 5, f'=IF(C{R}+D{R}>0,D{R}/(C{R}+D{R}),"")', b.numfmt("pct"))
        r += 1
    a1 = r - 1
    b.kv(an, r, 1, "Busiest band for active satellites", f'=INDEX(B{a0 + 1}:B{a1 + 1},MATCH(MAX(C{a0 + 1}:C{a1 + 1}),C{a0 + 1}:C{a1 + 1},0))&"–"&INDEX(B{a0 + 1}:B{a1 + 1},MATCH(MAX(C{a0 + 1}:C{a1 + 1}),C{a0 + 1}:C{a1 + 1},0))+50&" km"', "text"); r += 1
    b.kv(an, r, 1, "Busiest band for junk", f'=INDEX(B{a0 + 1}:B{a1 + 1},MATCH(MAX(D{a0 + 1}:D{a1 + 1}),D{a0 + 1}:D{a1 + 1},0))&"–"&INDEX(B{a0 + 1}:B{a1 + 1},MATCH(MAX(D{a0 + 1}:D{a1 + 1}),D{a0 + 1}:D{a1 + 1},0))+50&" km"', "text"); r += 2

    an.write(r, 1, "E · What broke up the debris in orbit (filter applies)", b.h2); r += 1
    b.header_row(an, r, 1, ["Cause", "Debris in orbit", "Share", "Ever catalogued"]); r += 1
    c0 = r
    for cz in CAUSE.values():
        R = r + 1
        an.write(r, 1, cz, b.f())
        an.write_formula(r, 2, f'=SUMIFS(tblCauses[In orbit],tblCauses[Cause],B{R},tblCauses[Orbit],{oo},tblCauses[Owner code],{wc})', b.numfmt("int"))
        an.write_formula(r, 3, f"=IFERROR(C{R}/SUM($C${c0 + 1}:$C${c0 + len(CAUSE)}),\"\")", b.numfmt("pct"))
        an.write_formula(r, 4, f'=SUMIFS(tblCauses[Catalogued],tblCauses[Cause],B{R},tblCauses[Orbit],{oo},tblCauses[Owner code],{wc})', b.numfmt("int"))
        r += 1
    c1 = r - 1
    r += 1
    an.write(r, 1, "F · Radar size of objects in orbit (filter applies)", b.h2); r += 1
    b.header_row(an, r, 1, ["RCS class"] + kinds + ["Total"]); r += 1
    for rc in RCS.values():
        R = r + 1
        an.write(r, 1, rc, b.f())
        for j, k in enumerate(kinds):
            an.write_formula(r, 2 + j, f'=SUMIFS(tblRCS[Objects],tblRCS[RCS class],$B{R},tblRCS[Kind],"{k}",tblRCS[Orbit],{oo},tblRCS[Owner code],{wc})', b.numfmt("int"))
        an.write_formula(r, 7, f"=SUM(C{R}:G{R})", b.numfmt("int", bold=True))
        r += 1

    b.title(ch, "Charts", "Charts follow the orbit and owner picked on the Analysis sheet.")
    c1c = b.chart("area", "stacked", title="Objects in orbit at the end of each year, by kind", width=1000, x_axis={"interval_unit": 5})
    for j, k in enumerate(kinds):
        L = chr(ord("F") + j)
        c1c.add_series({"name": k, "categories": f"='Analysis'!$B${y0 + 1}:$B${y1 + 1}", "values": f"='Analysis'!${L}${y0 + 1}:${L}${y1 + 1}", "fill": {"color": SERIES[j]}, "line": {"none": True}})
    ch.insert_chart("B4", c1c)
    c2 = b.chart("column", "stacked", title="Objects in orbit by mean altitude (50 km bins, below 2,000 km)", width=1000, x_axis={"name": "km", "interval_unit": 4})
    c2.add_series({"name": "Active", "categories": f"='Analysis'!$B${a0 + 1}:$B${a1 + 1}", "values": f"='Analysis'!$C${a0 + 1}:$C${a1 + 1}", "fill": {"color": ACCENT}, "gap": 10})
    c2.add_series({"name": "Junk", "categories": f"='Analysis'!$B${a0 + 1}:$B${a1 + 1}", "values": f"='Analysis'!$D${a0 + 1}:$D${a1 + 1}", "fill": {"color": COPPER}})
    ch.insert_chart("B23", c2)
    c3 = b.chart("pie", title="Debris in orbit by break-up cause")
    c3.add_series({"name": "Debris", "categories": f"='Analysis'!$B${c0 + 1}:$B${c1 + 1}", "values": f"='Analysis'!$C${c0 + 1}:$C${c1 + 1}",
                   "points": [{"fill": {"color": SERIES[i % len(SERIES)]}} for i in range(len(CAUSE))], "data_labels": {"percentage": True}})
    ch.insert_chart("B42", c3)
    c4 = b.chart("bar", "stacked", title=f"Objects in orbit by owner, all {len(W)} owners", height=max(600, 15 * len(W)), width=760,
                 y_axis={"reverse": True, "num_font": {"size": 7}, "major_gridlines": {"visible": False}}, x_axis={"major_gridlines": {"visible": True, "line": {"color": "#ECE8E0"}}})
    for j, (col, nm) in enumerate([("Active", "Active"), ("Dead satellites", "Dead satellites"), ("Rocket bodies", "Rocket bodies"), ("Debris", "Debris"), ("Unidentified", "Unidentified")]):
        c4.add_series({"name": nm, "categories": to.col_range("Owner"), "values": to.col_range(col), "fill": {"color": SERIES[j]}, "gap": 40})
    ch.insert_chart("N42", c4)

    b.step("Extract", "Download the full SATCAT once (as CelesTrak's usage policy asks), owner names, ESA report, NASA HOOSF PDF", "curl", "celestrak.org, esa.int, nasa.gov", "raw/day-007-space-debris/", K["catalogued"], "README.md")
    b.step("Transform", "Parse NASA HOOSF Table 2.1 (268 break-ups); stop unless all 268 parse", "Python (pypdf)", "hoosf16.txt", "breakups.csv", S["breakups"], "scripts/day-007/hoosf.py")
    b.step("Transform", "Classify orbits (ESA Table 1.2), kind, mean altitude, entry year from catalogue numbers, cause, RCS class", "DuckDB SQL", "satcat.csv + breakups.csv", "object.parquet", K["catalogued"], "scripts/day-007/build.sql")
    b.step("Load", "Aggregate the filter cubes; stop if the cube does not reproduce the SQL totals", "Node.js + DuckDB", "object.parquet", "data/day-007-space-debris/day-007.json", len(cube), "scripts/day-007/snapshot.mjs")
    b.step("Publish", "Decode the cubes to labels, SUMIFS filters, population model, checks", "Python (XlsxWriter)", "day-007.json", "this workbook", len(cube), "scripts/excel/days/d007.py")
    b.check("Catalogued objects (sum of the cube)", K["catalogued"], "=SUM(tblObjects[Objects])")
    b.check("Objects in orbit", K["tracked"], "=SUMIFS(tblObjects[Objects],tblObjects[In orbit],1)")
    b.check("Active satellites", K["active"], '=SUMIFS(tblObjects[Objects],tblObjects[In orbit],1,tblObjects[Kind],"Active satellite")')
    b.check("Re-entries in the last 365 days", K["reentriesLastYear"], "=SUMIFS(tblObjects[Objects],tblObjects[Reentered last 365 days],1)")
    b.check("Owner table matches the cube (objects in orbit)", K["tracked"], "=SUM(tblOwners[In orbit])")
    b.check("Owner table matches the cube (catalogued)", K["catalogued"], "=SUM(tblOwners[Catalogued])")
    b.check("Shells hold the objects in orbit with orbit data", sum(x[5] for x in S["shells"]), "=SUM(tblShells[Objects])")
    b.check("Radar-size table holds every object in orbit", K["tracked"], "=SUM(tblRCS[Objects])")
    b.check("Debris in orbit by cause = debris in orbit", sum(x[3] for x in S["causeCube"]), '=SUMIFS(tblObjects[Objects],tblObjects[In orbit],1,tblObjects[Kind],"Debris")')
    b.check("Altitude bins match the page's LEO profile (active, 450–500 km)", next((a["n"] for a in S["byAltitudeBin"] if a["km"] == 450 and a["cls"] == "active"), 0),
            '=SUMIFS(tblObjects[Objects],tblObjects[Altitude bin km],450,tblObjects[Kind],"Active satellite",tblObjects[In orbit],1)')
    b.set_config(cfgMainTable="tblObjects", cfgPivotRows="Owner", cfgPivotCols="Kind", cfgPivotValue="Objects")
