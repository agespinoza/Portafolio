"""Day 002 · Where do New Zealand's glowworms shine? (GBIF records corrected for iNaturalist observer effort)"""
import json
import os

from book import Book, Col, Meta, SERIES, ACCENT, COPPER

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
S = json.load(open(os.path.join(ROOT, "src/days/day-002-glowworms/snapshot.json"), encoding="utf-8"))
SOUTH = {"Tasman", "Nelson", "Marlborough", "West Coast", "Canterbury", "Otago", "Southland"}
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
SRC = {0: "iNaturalist", 1: "Museum specimen or sample", 2: "Other observation"}
WAITOMO = (-38.26, 175.1)

META = Meta(
    day=2, slug="waitomo-glowworms", title="Where do New Zealand's glowworms shine?",
    question="Where and in which months are Waitomo glowworms (Arachnocampa luminosa) recorded most, once you correct for where and when people use iNaturalist?",
    summary="Every georeferenced public GBIF record of the New Zealand glowworm, joined with iNaturalist observer effort (all species) per region, month and year, "
            "and the monthly climate outside the Waitomo Caves. Rates are glowworm records per 100,000 iNaturalist observations.",
    captured=S["capturedAt"][:10],
    sources=[
        ("Occurrence records, Arachnocampa luminosa (taxonKey 1564326)", "GBIF.org (iNaturalist, museums and other datasets)", "https://www.gbif.org/species/1564326", "Per record: CC0, CC BY or CC BY-NC", "Every georeferenced record"),
        ("iNaturalist research-grade observations in New Zealand, all species (facet counts)", "GBIF.org / iNaturalist", "https://www.gbif.org/dataset/50c9509d-22c7-4a22-a47d-8c48425ef4a7", "CC BY-NC 4.0 (dataset)", "Observer-effort denominator by region, month and year"),
        ("Historical weather at Waitomo (ERA5)", "Open-Meteo.com", "https://open-meteo.com/", "CC BY 4.0", f"Monthly climate {S['climate']['years'][0]}–{S['climate']['years'][1]}"),
    ],
    caveats=[
        "Records show where people photographed or collected glowworms, not where glowworms live: caves, tracks and tourist sites dominate.",
        "Rates use iNaturalist records only, because effort exists only for iNaturalist; museum specimens are kept in the data but not in the rates.",
        "Regions with fewer than 10 records are flagged; their rates are too noisy to rank. Intervals are 95% Poisson (Wilson–Hilferty, as on the page).",
        "21 records have no region in GBIF; they count in totals and the map but not in regional rates.",
    ],
)


def build(b: Book):
    sight = [[s[0], s[1], s[2], s[3], s[4], s[5], SRC.get(s[5], "")] for s in S["sightings"]]
    regions = sorted(S["effort"]["regions"])
    an = b.sheet("Analysis", "Effort-corrected rates by region, month and year with 95% intervals, the climate link, and a region profile.", ACCENT)
    ch = b.sheet("Charts", "Rates by region with error bars, the seasonal cycle against temperature, and records by year.", ACCENT)
    lat0, lon0 = WAITOMO
    t = b.data_table("Data_Records", "tblRecords", "Glowworm records (GBIF)", "One row per georeferenced record of Arachnocampa luminosa.", [
        Col("Latitude", "coord", "WGS84", "degrees"), Col("Longitude", "coord", "WGS84", "degrees"), Col("Year", "year", "Year observed (blank if unknown)"),
        Col("Month", "int", "Month observed, 1–12 (blank if unknown)"), Col("Region", "text", "GBIF state/province, cleaned (blank if none)"),
        Col("Source code", "int", "0 iNaturalist, 1 specimen or sample, 2 other"), Col("Source", "text", ""),
        Col("Island", "text", "Region's island; without a region, split along Cook Strait", formula='=IF([@Region]="Chatham Islands","Chatham",IF([@Region]<>"",IF(OR([@Region]="Tasman",[@Region]="Nelson",[@Region]="Marlborough",[@Region]="West Coast",[@Region]="Canterbury",[@Region]="Otago",[@Region]="Southland"),"South","North"),IF(OR([@Latitude]<-41.6,AND([@Latitude]<-40.4,[@Longitude]<174.5)),"South","North")))'),
        Col("Km to Waitomo Caves", "num1", "Great-circle (haversine) distance to the caves", "km",
            formula=f"=2*6371*ASIN(SQRT(SIN(RADIANS([@Latitude]-({lat0}))/2)^2+COS(RADIANS({lat0}))*COS(RADIANS([@Latitude]))*SIN(RADIANS([@Longitude]-{lon0})/2)^2))"),
    ], sight)
    eff_m = [[r, m, S["effort"]["regions"][r]["month"].get(str(m), 0)] for r in regions for m in range(1, 13)]
    te = b.data_table("Data_EffortMonth", "tblEffortMonth", "Observer effort by region and month", "iNaturalist research-grade observations of every species in New Zealand.", [
        Col("Region", "text", ""), Col("Month", "int", "1–12"), Col("Observations", "int", "All-species iNaturalist observations", "observations")], eff_m)
    eff_y = [[r, int(y), n] for r in regions for y, n in sorted(S["effort"]["regions"][r]["year"].items(), key=lambda kv: int(kv[0]))]
    ty = b.data_table("Data_EffortYear", "tblEffortYear", "Observer effort by region and year", "Same denominator, by year.", [
        Col("Region", "text", ""), Col("Year", "year", ""), Col("Observations", "int", "", "observations")], eff_y)
    tt = b.data_table("Data_EffortRegion", "tblEffortRegion", "Observer effort by region (total)", "All years and months.", [
        Col("Region", "text", ""), Col("Observations", "int", "", "observations"),
        Col("Island", "text", "", formula='=IF([@Region]="Chatham Islands","Chatham",IF(OR([@Region]="Tasman",[@Region]="Nelson",[@Region]="Marlborough",[@Region]="West Coast",[@Region]="Canterbury",[@Region]="Otago",[@Region]="Southland"),"South","North"))')],
        [[r, S["effort"]["regions"][r]["total"]] for r in regions])
    tc = b.data_table("Data_Climate", "tblClimate", f"Climate at Waitomo, {S['climate']['years'][0]}–{S['climate']['years'][1]}", "Monthly averages from Open-Meteo (ERA5).", [
        Col("Month", "int", ""), Col("Month name", "text", ""), Col("Mean high C", "num1", "Average daily maximum", "°C"), Col("Mean low C", "num1", "Average daily minimum", "°C"),
        Col("Hottest day C", "num1", "Highest daily maximum", "°C"), Col("Coldest day C", "num1", "Lowest daily minimum", "°C"),
        Col("Humidity pct", "num1", "Mean relative humidity", "%"), Col("Rain mm", "num1", "Mean monthly precipitation", "mm")],
        [[m["month"], MONTHS[m["month"] - 1], m["high"], m["low"], m["max"], m["min"], m["humidity"], m["rain"]] for m in S["climate"]["months"]])

    an.set_column("B:B", 24); an.set_column("C:L", 13)
    b.title(an, "Analysis", "Rate = iNaturalist glowworm records ÷ all iNaturalist observations × 100,000. 95% Poisson interval (Wilson–Hilferty).")
    r = 3
    b.kv(an, r, 1, "Records per (rate unit)", 100000, "int", "Change to 10,000 or 1,000,000 to rescale every rate"); an.write(r, 2, 100000, b.input)
    b.wb.define_name("ratePer", f"='Analysis'!$C${r + 1}"); r += 1
    b.kv(an, r, 1, "Minimum records to rank", 10, "int", "Below this a rate is flagged as too noisy"); an.write(r, 2, 10, b.input)
    b.wb.define_name("minN", f"='Analysis'!$C${r + 1}"); r += 2
    lo = lambda k: f"IF({k}=0,0,{k}*(1-1/(9*{k})-1.96/(3*SQRT({k})))^3)"
    hi = lambda k: f"(({k})+1)*(1-1/(9*(({k})+1))+1.96/(3*SQRT(({k})+1)))^3"

    an.write(r, 1, "A · Regions: records corrected for observer effort", b.h2); r += 1
    b.header_row(an, r, 1, ["Region", "All records", "iNaturalist records", "Effort", "Rate", "95% low", "95% high", "Rank (n ≥ min)", "Flag"]); r += 1
    a0 = r
    for reg in regions:
        R = r + 1
        an.write(r, 1, reg, b.f())
        an.write_formula(r, 2, f'=COUNTIF(tblRecords[Region],B{R})', b.numfmt("int"))
        an.write_formula(r, 3, f'=COUNTIFS(tblRecords[Region],B{R},tblRecords[Source code],0)', b.numfmt("int"))
        an.write_formula(r, 4, f'=SUMIFS(tblEffortRegion[Observations],tblEffortRegion[Region],B{R})', b.numfmt("int"))
        an.write_formula(r, 5, f'=IFERROR(D{R}/E{R}*ratePer,"")', b.numfmt("num1"))
        an.write_formula(r, 6, f'=IFERROR({lo(f"D{R}")}/E{R}*ratePer,"")', b.numfmt("num1"))
        an.write_formula(r, 7, f'=IFERROR({hi(f"D{R}")}/E{R}*ratePer,"")', b.numfmt("num1"))
        an.write_formula(r, 8, f'=IF(D{R}>=minN,COUNTIFS($D${a0 + 1}:$D${a0 + len(regions)},">="&minN,$F${a0 + 1}:$F${a0 + len(regions)},">"&F{R})+1,"")', b.numfmt("int"))
        an.write_formula(r, 9, f'=IF(D{R}<minN,"low n","")', b.f(font_color=COPPER, italic=True))
        r += 1
    a1 = r - 1
    an.conditional_format(a0, 5, a1, 5, {"type": "data_bar", "bar_color": "#8FCFC6", "bar_solid": True})
    an.write(r, 1, "No region", b.f(italic=True)); an.write_formula(r, 2, '=COUNTIF(tblRecords[Region],"")', b.numfmt("int")); r += 1
    an.write(r, 1, "Total", b.label); an.write_formula(r, 2, "=ROWS(tblRecords[Region])", b.numfmt("int", bold=True))
    an.write_formula(r, 3, f"=SUM(D{a0 + 1}:D{a1 + 1})", b.numfmt("int", bold=True)); an.write_formula(r, 4, "=SUM(tblEffortRegion[Observations])", b.numfmt("int", bold=True))
    an.write_formula(r, 5, f"=D{r + 1}/E{r + 1}*ratePer", b.numfmt("num1", bold=True)); r += 2
    b.kv(an, r, 1, "Top region by raw records", f"=INDEX(B{a0 + 1}:B{a1 + 1},MATCH(MAX(C{a0 + 1}:C{a1 + 1}),C{a0 + 1}:C{a1 + 1},0))", "text"); r += 1
    b.kv(an, r, 1, "Top region by rate (n ≥ min)", f"=INDEX(B{a0 + 1}:B{a1 + 1},MATCH(1,I{a0 + 1}:I{a1 + 1},0))", "text", "Correcting for effort can change the leader"); r += 2

    an.write(r, 1, "B · Seasons: records, effort and climate by month (all regions)", b.h2); r += 1
    b.header_row(an, r, 1, ["Month", "iNat records", "Effort", "Rate", "95% low", "95% high", "Mean high °C", "Rain mm", "Humidity %"]); r += 1
    m0 = r
    for m in range(1, 13):
        R = r + 1
        an.write(r, 1, MONTHS[m - 1][:3], b.f())
        an.write_formula(r, 2, f'=COUNTIFS(tblRecords[Month],{m},tblRecords[Source code],0,tblRecords[Region],"<>")', b.numfmt("int"))
        an.write_formula(r, 3, f'=SUMIFS(tblEffortMonth[Observations],tblEffortMonth[Month],{m})', b.numfmt("int"))
        an.write_formula(r, 4, f"=C{R}/D{R}*ratePer", b.numfmt("num1"))
        an.write_formula(r, 5, f"={lo(f'C{R}')}/D{R}*ratePer", b.numfmt("num1"))
        an.write_formula(r, 6, f"={hi(f'C{R}')}/D{R}*ratePer", b.numfmt("num1"))
        for j, c in enumerate(["Mean high C", "Rain mm", "Humidity pct"]):
            an.write_formula(r, 7 + j, f"=INDEX(tblClimate[{c}],MATCH({m},tblClimate[Month],0))", b.numfmt("num1"))
        r += 1
    m1 = r - 1
    b.kv(an, r, 1, "Peak month (rate)", f"=INDEX(B{m0 + 1}:B{m1 + 1},MATCH(MAX(E{m0 + 1}:E{m1 + 1}),E{m0 + 1}:E{m1 + 1},0))", "text"); r += 1
    b.kv(an, r, 1, "Peak month (raw records)", f"=INDEX(B{m0 + 1}:B{m1 + 1},MATCH(MAX(C{m0 + 1}:C{m1 + 1}),C{m0 + 1}:C{m1 + 1},0))", "text"); r += 1
    b.kv(an, r, 1, "r (rate vs mean high)", f"=CORREL(E{m0 + 1}:E{m1 + 1},H{m0 + 1}:H{m1 + 1})", "r", "12 months only: descriptive, not a test"); r += 1
    b.kv(an, r, 1, "r (rate vs rain)", f"=CORREL(E{m0 + 1}:E{m1 + 1},I{m0 + 1}:I{m1 + 1})", "r"); r += 2

    an.write(r, 1, "C · Records by year", b.h2); r += 1
    b.header_row(an, r, 1, ["Year", "All records", "iNat records", "Effort", "Rate"]); r += 1
    years = sorted({s[2] for s in S["sightings"] if s[2]})
    y0 = r
    for y in range(years[0], years[-1] + 1):
        R = r + 1
        an.write(r, 1, y, b.numfmt("year"))
        an.write_formula(r, 2, f"=COUNTIF(tblRecords[Year],B{R})", b.numfmt("int"))
        an.write_formula(r, 3, f'=COUNTIFS(tblRecords[Year],B{R},tblRecords[Source code],0,tblRecords[Region],"<>")', b.numfmt("int"))
        an.write_formula(r, 4, f"=SUMIFS(tblEffortYear[Observations],tblEffortYear[Year],B{R})", b.numfmt("int"))
        an.write_formula(r, 5, f'=IF(E{R}>0,D{R}/E{R}*ratePer,"")', b.numfmt("num1"))
        r += 1
    y1 = r - 1
    b.kv(an, r, 1, "Share of records since 2016", f'=COUNTIF(tblRecords[Year],">=2016")/COUNT(tblRecords[Year])', "pct", "iNaturalist took off in New Zealand after 2016"); r += 2

    an.write(r, 1, "D · Region profile", b.h2); r += 1
    b.list_sheet_range("lstRegions", regions)
    sel = b.selector(an, r, 1, "Region", "=lstRegions", "Waikato"); r += 1
    rows_ = [("Island", f'=INDEX(tblEffortRegion[Island],MATCH({sel},tblEffortRegion[Region],0))', "text"),
             ("Records", f"=COUNTIF(tblRecords[Region],{sel})", "int"),
             ("Rate per unit", f'=INDEX(F{a0 + 1}:F{a1 + 1},MATCH({sel},B{a0 + 1}:B{a1 + 1},0))', "num1"),
             ("Closest record to Waitomo (km)", f'=MINIFS(tblRecords[Km to Waitomo Caves],tblRecords[Region],{sel})', "num1"),
             ("Farthest record (km)", f'=MAXIFS(tblRecords[Km to Waitomo Caves],tblRecords[Region],{sel})', "num1"),
             ("First year recorded", f'=MINIFS(tblRecords[Year],tblRecords[Region],{sel})', "year"),
             ("Busiest month (records)", f'=INDEX(tblClimate[Month name],MATCH(MAX(COUNTIFS(tblRecords[Region],{sel},tblRecords[Month],ROW($1:$12))),COUNTIFS(tblRecords[Region],{sel},tblRecords[Month],ROW($1:$12)),0))', "text")]
    for label, fml, kind in rows_:
        if label.startswith("Busiest"):
            an.write(r, 1, label, b.label)
            an.write_array_formula(r, 2, r, 2, "{" + fml + "}", b.numfmt(kind, bold=True, font_size=12))
        else:
            b.kv(an, r, 1, label, fml, kind)
        r += 1

    b.title(ch, "Charts", "Error bars are the 95% Poisson intervals from the Analysis sheet.")
    c1 = b.chart("bar", title="Glowworm records per 100,000 iNaturalist observations, by region", legend={"none": True}, height=520, y_axis={"reverse": True, "major_gridlines": {"visible": False}},
                 x_axis={"major_gridlines": {"visible": True, "line": {"color": "#ECE8E0"}}})
    c1.add_series({"name": "Rate", "categories": f"='Analysis'!$B${a0 + 1}:$B${a1 + 1}", "values": f"='Analysis'!$F${a0 + 1}:$F${a1 + 1}", "fill": {"color": ACCENT}, "gap": 50,
                   "x_error_bars": {"type": "custom", "plus_values": f"='Analysis'!$N${a0 + 1}:$N${a1 + 1}", "minus_values": f"='Analysis'!$O${a0 + 1}:$O${a1 + 1}", "line": {"color": "#3D4A5F"}}})
    for i in range(a0, a1 + 1):  # error bar lengths (helpers beside the table)
        an.write_formula(i, 13, f'=IFERROR(H{i + 1}-F{i + 1},0)', b.numfmt("num1", font_color="#B7B0A2"))
        an.write_formula(i, 14, f'=IFERROR(F{i + 1}-G{i + 1},0)', b.numfmt("num1", font_color="#B7B0A2"))
    an.write(a0 - 1, 13, "+ error", b.head); an.write(a0 - 1, 14, "− error", b.head)
    ch.insert_chart("B4", c1)
    c2 = b.chart("column", title="Seasonal cycle: rate by month and mean high at Waitomo", y_axis={"name": "Records per 100k"})
    c2.add_series({"name": "Rate", "categories": f"='Analysis'!$B${m0 + 1}:$B${m1 + 1}", "values": f"='Analysis'!$E${m0 + 1}:$E${m1 + 1}", "fill": {"color": ACCENT}, "gap": 60})
    line = b.wb.add_chart({"type": "line"})
    line.add_series({"name": "Mean high °C", "categories": f"='Analysis'!$B${m0 + 1}:$B${m1 + 1}", "values": f"='Analysis'!$H${m0 + 1}:$H${m1 + 1}", "y2_axis": True,
                     "line": {"color": COPPER, "width": 2.25}, "marker": {"type": "circle", "size": 5, "fill": {"color": COPPER}, "border": {"color": "#FFFFFF", "width": 0.5}}})
    line.set_y2_axis({"name": "°C"})
    c2.combine(line)
    ch.insert_chart("N4", c2)
    c3 = b.chart("column", title="Glowworm records by year (all sources)", legend={"none": True}, width=1100)
    c3.add_series({"name": "Records", "categories": f"='Analysis'!$B${y0 + 1}:$B${y1 + 1}", "values": f"='Analysis'!$C${y0 + 1}:$C${y1 + 1}", "fill": {"color": SERIES[1]}, "gap": 30})
    ch.insert_chart("B32", c3)

    b.step("Extract", "Page through GBIF occurrence search for taxonKey 1564326 with coordinates and no geospatial issues", "Node.js fetch", "api.gbif.org/v1/occurrence/search", "records", len(sight), "scripts/snapshot-glowworms.mjs")
    b.step("Extract", "Facet counts of all iNaturalist observations in New Zealand by region, month and year (effort)", "Node.js fetch", "GBIF facets", "effort counts", len(eff_m) + len(eff_y), "scripts/snapshot-glowworms.mjs")
    b.step("Extract", "Daily weather at Waitomo reduced to 12 monthly averages", "Node.js fetch", "archive-api.open-meteo.com", "climate", 12, "scripts/snapshot-glowworms.mjs")
    b.step("Transform", "Clean region names (drop ' Region', unify Manawatū-Whanganui), classify source, round coordinates", "JavaScript", "API JSON", "snapshot rows", len(sight), "src/days/day-002-glowworms/data.js")
    b.step("Load", "Bundle one snapshot with the page", "Node.js", "", "src/days/day-002-glowworms/snapshot.json", len(sight), "scripts/snapshot-glowworms.mjs")
    b.step("Publish", "Tables, effort-corrected rates with intervals, climate join, checks", "Python (XlsxWriter)", "snapshot.json", "this workbook", len(sight), "scripts/excel/days/d002.py")
    b.check("Records in the table", len(sight), "=ROWS(tblRecords[Region])")
    b.check("iNaturalist records", sum(1 for s in sight if s[5] == 0), "=COUNTIF(tblRecords[Source code],0)")
    b.check("Records without a region", sum(1 for s in sight if not s[4]), '=COUNTIF(tblRecords[Region],"")')
    b.check("Regions with effort data", len(regions), "=ROWS(tblEffortRegion[Region])")
    b.check("Month effort never exceeds region total", 0, "=SUMPRODUCT(--(SUMIFS(tblEffortMonth[Observations],tblEffortMonth[Region],tblEffortRegion[Region])>tblEffortRegion[Observations]))")
    b.check("Year effort never exceeds region total", 0, "=SUMPRODUCT(--(SUMIFS(tblEffortYear[Observations],tblEffortYear[Region],tblEffortRegion[Region])>tblEffortRegion[Observations]))")
    b.check("All records inside New Zealand's bounding box", 0, '=COUNTIFS(tblRecords[Latitude],">-33")+COUNTIFS(tblRecords[Latitude],"<-48")+COUNTIFS(tblRecords[Longitude],"<165",tblRecords[Longitude],">-175")')
    b.check("12 climate months", 12, "=ROWS(tblClimate[Month])")
    b.set_config(cfgMainTable="tblRecords", cfgPivotRows="Region", cfgPivotCols="Source", cfgPivotValue="Year", cfgPivotFunc="count")
