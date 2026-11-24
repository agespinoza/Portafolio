"""Day 003 · Where and when do light pillars appear? (Wikimedia Commons photo catalog + ERA5 weather)"""
import datetime as dt
import json
import math
import os

from book import Book, Col, Meta, SERIES, ACCENT, COPPER

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
S = json.load(open(os.path.join(ROOT, "src/days/day-003-light-pillars/catalog.json"), encoding="utf-8"))
PH = [("light_pillar", "Light pillar", "reflection"), ("sun_pillar", "Sun pillar", "reflection"), ("moon_pillar", "Moon pillar", "reflection"),
      ("parhelion", "Parhelion", "refraction"), ("halo22", "Halo 22", "refraction"), ("cza", "Circumzenithal arc", "refraction")]
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

META = Meta(
    day=3, slug="light-pillars", title="Where and when do light pillars appear?",
    question="Where and in which seasons are light pillars and related ice-crystal halos photographed, and under what weather?",
    summary=f"{len(S['rows'])} dated photographs of light, sun and moon pillars, sun dogs (parhelia), 22° halos and circumzenithal arcs from Wikimedia Commons, "
            f"{S['window'][0][:4]}–{S['window'][1][:4]}, each with its author and license, an evidence level, and ERA5 weather where the photo is located.",
    captured=S["capturedAt"][:10],
    sources=[
        ("Commons categories: Sun pillars, Light pillars, Parhelia, 22° halo, Circumzenithal arcs", "Wikimedia Commons (via the MediaWiki API)", "https://commons.wikimedia.org/wiki/Category:Sun_pillars",
         "Each photo's own license (CC BY, CC BY-SA, CC0, public domain); see the License column", "Photo metadata: date, time, place, author"),
        ("Admin-0 countries 1:50m v5.1.2", "Natural Earth", "https://www.naturalearthdata.com/", "Public domain", "Country and offshore flag of each located photo"),
        ("Historical weather (ERA5 / ERA5-Land reanalysis)", "Open-Meteo.com, Copernicus Climate Change Service", "https://open-meteo.com/", "CC BY 4.0", "Weather at the photo's place and hour"),
    ],
    caveats=[
        "Photos show where people photograph the sky and upload to Commons, not where the phenomena are most frequent; compare shares, not counts.",
        "Evidence A = camera position and time, B = a place only, C = a date only. Missing values stay empty; they are never set to zero.",
        "Sun elevation is computed from the photo's local time and place (NOAA solar position formulas), so it is only as good as the camera clock.",
        f"{S['excluded']['noDate']} files without a date and {S['excluded']['outOfRange']} outside the window were excluded ({S['excluded']['total']} files examined).",
    ],
)


def solar_elevation(date, time, off, lat, lon):
    y, m, d = map(int, date.split("-"))
    hh, mm = map(int, time.split(":")[:2])
    utc = (dt.datetime(y, m, d, hh, mm, tzinfo=dt.timezone.utc).timestamp() * 1000) - off * 3600 * 1000
    jd = utc / 86400000 + 2440587.5
    T = (jd - 2451545) / 36525
    rad = math.pi / 180
    L0 = math.fmod(280.46646 + T * (36000.76983 + T * 0.0003032), 360)
    M = 357.52911 + T * (35999.05029 - 0.0001537 * T)
    e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T)
    C = math.sin(M * rad) * (1.914602 - T * (0.004817 + 0.000014 * T)) + math.sin(2 * M * rad) * (0.019993 - 0.000101 * T) + math.sin(3 * M * rad) * 0.000289
    lam = L0 + C - 0.00569 - 0.00478 * math.sin((125.04 - 1934.136 * T) * rad)
    eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60
    eps = eps0 + 0.00256 * math.cos((125.04 - 1934.136 * T) * rad)
    decl = math.asin(math.sin(eps * rad) * math.sin(lam * rad))
    yv = math.tan((eps / 2) * rad) ** 2
    eq = 4 / rad * (yv * math.sin(2 * L0 * rad) - 2 * e * math.sin(M * rad) + 4 * e * yv * math.sin(M * rad) * math.cos(2 * L0 * rad)
                    - 0.5 * yv * yv * math.sin(4 * L0 * rad) - 1.25 * e * e * math.sin(2 * M * rad))
    minutes = ((utc / 60000) % 1440 + 1440) % 1440
    tst = (minutes + eq + 4 * lon + 1440) % 1440
    ha = (tst / 4 + 180 if tst / 4 < 0 else tst / 4 - 180) * rad
    cz = math.sin(lat * rad) * math.sin(decl) + math.cos(lat * rad) * math.cos(decl) * math.cos(ha)
    return round(90 - math.acos(max(-1, min(1, cz))) / rad, 1)


def build(b: Book):
    rows = []
    for r in S["rows"]:
        geo = r["lat"] is not None and r["lon"] is not None
        ev = "A" if geo and r["locType"] == "camera" and r["time"] else ("B" if geo else "C")
        sun = solar_elevation(r["date"], r["time"], r["utcOffset"], r["lat"], r["lon"]) if geo and r["time"] and r.get("utcOffset") is not None else None
        w = r.get("wx") or {}
        url = "https://commons.wikimedia.org/wiki/File:" + r["title"].replace(" ", "_")
        rows.append([r["id"], r["title"], url, r["artist"], r["license"], r["licenseUrl"], "; ".join(r["phenomena"]),
                     *[1 if p in r["phenomena"] else 0 for p, _l, _f in PH],
                     dt.datetime.strptime(r["date"], "%Y-%m-%d"), int(r["date"][:4]), int(r["date"][5:7]), r["time"],
                     r["lat"], r["lon"], r["locType"], r["country"], r["iso"], None if r["offshore"] is None else int(r["offshore"]), r["region"],
                     {"N": "North", "S": "South"}.get(r["hemisphere"]), r.get("tz"), r.get("utcOffset"), ev, sun,
                     w.get("basis"), w.get("t"), w.get("rh"), w.get("td"), w.get("ws"), w.get("wd"), w.get("cc"), w.get("ccl"), w.get("ccm"), w.get("cch"), w.get("p"),
                     (r.get("description") or "")[:500]])
    an = b.sheet("Analysis", "Counts and evidence by phenomenon, pillar share by year with Wilson intervals, seasons by hemisphere, weather medians, countries.", ACCENT)
    ch = b.sheet("Charts", "Photos per year by phenomenon, the pillar share with its interval, seasons by hemisphere, and the weather scatter.", ACCENT)
    cols = [Col("ID", "text", "Commons page id (WMC-pageid)"), Col("File", "text", "Commons file title"), Col("URL", "text", "Commons file page"),
            Col("Author", "text", "As credited on Commons"), Col("License", "text", "Photo license"), Col("License URL", "text", ""),
            Col("Phenomena", "text", "All phenomena in the photo's categories")]
    cols += [Col(lbl, "int", f"1 = the photo shows a {lbl.lower()} ({fam})") for _p, lbl, fam in PH]
    cols += [Col("Date", "date", "Date taken (EXIF or description)"), Col("Year", "year", ""), Col("Month", "int", ""), Col("Local time", "text", "HH:MM, blank if unknown"),
             Col("Latitude", "coord", "Camera or object position", "degrees"), Col("Longitude", "coord", "", "degrees"), Col("Location type", "text", "camera or object"),
             Col("Country", "text", "Natural Earth country (blank offshore or unknown)"), Col("ISO", "text", ""), Col("Offshore", "int", "1 = point at sea"),
             Col("Region", "text", "Lab region used by the page's comparator"), Col("Hemisphere", "text", ""), Col("Time zone", "text", ""), Col("UTC offset h", "num1", "", "hours"),
             Col("Evidence", "text", "A camera position and time · B place only · C date only"), Col("Sun elevation deg", "num1", "Computed from time and place (NOAA)", "degrees"),
             Col("Weather basis", "text", "hour = ERA5 at the photo's hour; daymean = daily mean (no time)"), Col("Temp C", "num1", "2 m air temperature", "°C"),
             Col("Humidity pct", "num1", "Relative humidity", "%"), Col("Dew point C", "num1", "", "°C"), Col("Wind kmh", "num1", "10 m wind speed", "km/h"), Col("Wind dir deg", "int", "", "degrees"),
             Col("Cloud total pct", "num1", "", "%"), Col("Cloud low pct", "num1", "", "%"), Col("Cloud mid pct", "num1", "", "%"), Col("Cloud high pct", "num1", "", "%"),
             Col("Pressure hPa", "num1", "Surface pressure", "hPa"), Col("Description", "text", "First 500 characters of the Commons description", width=60),
             Col("Pillar", "int", "1 = light, sun or moon pillar", formula="=MAX([@[Light pillar]],[@[Sun pillar]],[@[Moon pillar]])"),
             Col("Located", "int", "1 = has coordinates", formula='=IF([@Latitude]="",0,1)')]
    t = b.data_table("Data_Photos", "tblPhotos", "Photo catalog", "One row per dated Commons photo, 2000–2026.", cols, rows, freeze_cols=1)
    for i in range(len(rows)):  # clickable links
        b.wb.get_worksheet_by_name("Data_Photos").write_url(4 + i, 3, rows[i][2], b.f(font_color=ACCENT, underline=1), rows[i][2])

    an.set_column("B:B", 26); an.set_column("C:N", 12)
    b.title(an, "Analysis", "Wilson 95% intervals are written as plain formulas, so they also work in the .xlsx.")
    r = 3
    an.write(r, 1, "A · Phenomena and evidence", b.h2); r += 1
    b.header_row(an, r, 1, ["Phenomenon", "Photos", "Located", "Evidence A", "Evidence B", "Evidence C", "With weather", "Share of photos"]); r += 1
    a0 = r
    for _p, lbl, _f in PH:
        R = r + 1
        col = f"tblPhotos[{lbl}]"
        an.write(r, 1, lbl, b.f())
        an.write_formula(r, 2, f"=SUM({col})", b.numfmt("int"))
        an.write_formula(r, 3, f"=COUNTIFS({col},1,tblPhotos[Located],1)", b.numfmt("int"))
        for j, ev in enumerate("ABC"):
            an.write_formula(r, 4 + j, f'=COUNTIFS({col},1,tblPhotos[Evidence],"{ev}")', b.numfmt("int"))
        an.write_formula(r, 7, f'=COUNTIFS({col},1,tblPhotos[Temp C],"<>")', b.numfmt("int"))
        an.write_formula(r, 8, f"=C{R}/ROWS(tblPhotos[ID])", b.numfmt("pct"))
        r += 1
    an.write(r, 1, "All photos", b.label)
    an.write_formula(r, 2, "=ROWS(tblPhotos[ID])", b.numfmt("int", bold=True)); an.write_formula(r, 3, "=SUM(tblPhotos[Located])", b.numfmt("int", bold=True))
    for j, ev in enumerate("ABC"):
        an.write_formula(r, 4 + j, f'=COUNTIF(tblPhotos[Evidence],"{ev}")', b.numfmt("int", bold=True))
    an.write_formula(r, 7, '=COUNT(tblPhotos[Temp C])', b.numfmt("int", bold=True)); r += 1
    an.write(r, 1, "Photos can show several phenomena, so the rows add up to more than the total.", b.muted); r += 2

    an.write(r, 1, "B · Share of photos that are pillars, by year (95% Wilson interval)", b.h2); r += 1
    b.header_row(an, r, 1, ["Year", "Photos", "Pillars", "Share", "95% low", "95% high", "+ error", "− error"]); r += 1
    y0 = r
    z = 1.96
    for y in range(int(S["window"][0][:4]), int(S["window"][1][:4]) + 1):
        R = r + 1
        an.write(r, 1, y, b.numfmt("year"))
        an.write_formula(r, 2, f"=COUNTIF(tblPhotos[Year],B{R})", b.numfmt("int"))
        an.write_formula(r, 3, f"=COUNTIFS(tblPhotos[Year],B{R},tblPhotos[Pillar],1)", b.numfmt("int"))
        an.write_formula(r, 4, f"=IF(C{R}>0,D{R}/C{R},NA())", b.numfmt("pct"))
        wil = lambda s: f"=IF(C{R}>0,(E{R}+{z}^2/(2*C{R}){s}{z}*SQRT(E{R}*(1-E{R})/C{R}+{z}^2/(4*C{R}^2)))/(1+{z}^2/C{R}),NA())"
        an.write_formula(r, 5, wil("-"), b.numfmt("pct"))
        an.write_formula(r, 6, wil("+"), b.numfmt("pct"))
        an.write_formula(r, 7, f"=IFERROR(G{R}-E{R},0)", b.numfmt("pct", font_color="#B7B0A2"))
        an.write_formula(r, 8, f"=IFERROR(E{R}-F{R},0)", b.numfmt("pct", font_color="#B7B0A2"))
        r += 1
    y1 = r - 1
    b.kv(an, r, 1, "Overall pillar share", "=SUM(tblPhotos[Pillar])/ROWS(tblPhotos[ID])", "pct"); r += 2

    an.write(r, 1, "C · Seasons: located photos by month and hemisphere", b.h2); r += 1
    b.header_row(an, r, 1, ["Month", "North", "South", "Pillars North", "Pillars South"]); r += 1
    s0 = r
    for m in range(1, 13):
        an.write(r, 1, MONTHS[m - 1], b.f())
        for j, h in enumerate(["North", "South"]):
            an.write_formula(r, 2 + j, f'=COUNTIFS(tblPhotos[Month],{m},tblPhotos[Hemisphere],"{h}")', b.numfmt("int"))
            an.write_formula(r, 4 + j, f'=COUNTIFS(tblPhotos[Month],{m},tblPhotos[Hemisphere],"{h}",tblPhotos[Pillar],1)', b.numfmt("int"))
        r += 1
    s1 = r - 1
    an.conditional_format(s0, 2, s1, 3, {"type": "2_color_scale", "min_color": "#FFFFFF", "max_color": "#8FCFC6"})
    r += 1

    an.write(r, 1, "D · Weather at the photo: medians and quartiles (photos with ERA5 weather)", b.h2); r += 1
    an.write(r, 1, "AGGREGATE(17, 6, values/(phenomenon=1), q) is a conditional quartile that skips errors: no array entry needed.", b.muted); r += 1
    b.header_row(an, r, 1, ["Phenomenon", "n", "Temp Q1", "Temp median", "Temp Q3", "Humidity median", "Wind median", "High cloud median", "Sun elev. median"]); r += 1
    for _p, lbl, _f in PH:
        R = r + 1
        col = f"tblPhotos[{lbl}]"
        q = lambda v, k: f'=IFERROR(AGGREGATE(17,6,tblPhotos[{v}]/(({col}=1)*(tblPhotos[{v}]<>"")),{k}),"")'
        an.write(r, 1, lbl, b.f())
        an.write_formula(r, 2, f'=COUNTIFS({col},1,tblPhotos[Temp C],"<>")', b.numfmt("int"))
        an.write_formula(r, 3, q("Temp C", 1), b.numfmt("num1")); an.write_formula(r, 4, q("Temp C", 2), b.numfmt("num1", bold=True)); an.write_formula(r, 5, q("Temp C", 3), b.numfmt("num1"))
        an.write_formula(r, 6, q("Humidity pct", 2), b.numfmt("num1")); an.write_formula(r, 7, q("Wind kmh", 2), b.numfmt("num1"))
        an.write_formula(r, 8, q("Cloud high pct", 2), b.numfmt("num1")); an.write_formula(r, 9, q("Sun elevation deg", 2), b.numfmt("num1"))
        r += 1
    an.write(r, 1, "Reading: pillars form from plate crystals near the ground, so expect cold, humid, calm air; halos come from high cirrus.", b.muted); r += 2

    an.write(r, 1, "E · Countries (located photos)", b.h2); r += 1
    countries = sorted({x[20] for x in rows if x[20]})
    b.header_row(an, r, 1, ["Country", "Photos", "Pillars", "Halos 22", "First year", "Last year"]); r += 1
    c0 = r
    for c in countries:
        R = r + 1
        an.write(r, 1, c, b.f())
        an.write_formula(r, 2, f"=COUNTIF(tblPhotos[Country],B{R})", b.numfmt("int"))
        an.write_formula(r, 3, f"=COUNTIFS(tblPhotos[Country],B{R},tblPhotos[Pillar],1)", b.numfmt("int"))
        an.write_formula(r, 4, f"=COUNTIFS(tblPhotos[Country],B{R},tblPhotos[Halo 22],1)", b.numfmt("int"))
        an.write_formula(r, 5, f"=MINIFS(tblPhotos[Year],tblPhotos[Country],B{R})", b.numfmt("year"))
        an.write_formula(r, 6, f"=MAXIFS(tblPhotos[Year],tblPhotos[Country],B{R})", b.numfmt("year"))
        r += 1
    an.conditional_format(c0, 2, r - 1, 2, {"type": "data_bar", "bar_color": "#8FCFC6", "bar_solid": True})
    r += 1
    an.write(r, 1, "F · Phenomenon by year (pick one)", b.h2); r += 1
    b.list_sheet_range("lstPhenomena", [l for _p, l, _f in PH])
    sel = b.selector(an, r, 1, "Phenomenon", "=lstPhenomena", "Sun pillar"); r += 1
    an.write(r, 1, "Column", b.label); an.write_formula(r, 2, f"=MATCH({sel},lstPhenomena,0)", b.f()); pc = f"$C${r + 1}"; r += 1
    b.header_row(an, r, 1, ["Year", "Photos of it", "Share of that year"]); r += 1
    f0 = r
    for y in range(int(S["window"][0][:4]), int(S["window"][1][:4]) + 1):
        R = r + 1
        an.write(r, 1, y, b.numfmt("year"))
        an.write_formula(r, 2, f"=SUMIFS(INDEX(tblPhotos[[Light pillar]:[Circumzenithal arc]],0,{pc}),tblPhotos[Year],B{R})", b.numfmt("int"))
        an.write_formula(r, 3, f"=IFERROR(C{R}/COUNTIF(tblPhotos[Year],B{R}),\"\")", b.numfmt("pct"))
        r += 1
    f1 = r - 1

    b.title(ch, "Charts", "")
    c1 = b.chart("column", title="Share of photos that are pillars, by year, with 95% Wilson intervals", legend={"none": True}, width=1000, y_axis={"num_format": "0%"})
    c1.add_series({"name": "Pillar share", "categories": f"='Analysis'!$B${y0 + 1}:$B${y1 + 1}", "values": f"='Analysis'!$E${y0 + 1}:$E${y1 + 1}", "fill": {"color": ACCENT}, "gap": 40,
                   "y_error_bars": {"type": "custom", "plus_values": f"='Analysis'!$H${y0 + 1}:$H${y1 + 1}", "minus_values": f"='Analysis'!$I${y0 + 1}:$I${y1 + 1}", "line": {"color": "#3D4A5F"}}})
    ch.insert_chart("B4", c1)
    c2 = b.chart("column", title="Located photos by month and hemisphere")
    for j, h in enumerate(["North", "South"]):
        L = chr(ord("C") + j)
        c2.add_series({"name": h, "categories": f"='Analysis'!$B${s0 + 1}:$B${s1 + 1}", "values": f"='Analysis'!${L}${s0 + 1}:${L}${s1 + 1}", "fill": {"color": SERIES[j]}, "gap": 50})
    ch.insert_chart("B23", c2)
    c3 = b.chart("scatter", title="Temperature vs humidity at the photo (ERA5)", x_axis={"name": "Air temperature (°C)"}, y_axis={"name": "Relative humidity (%)"})
    c3.add_series({"name": "Photos", "categories": t.col_range("Temp C"), "values": t.col_range("Humidity pct"),
                   "marker": {"type": "circle", "size": 5, "fill": {"color": SERIES[0]}, "border": {"color": "#FFFFFF", "width": 0.5}}})
    ch.insert_chart("N23", c3)
    c4 = b.chart("column", title="Photos per year of the phenomenon picked on the Analysis sheet", legend={"none": True}, width=1000)
    c4.add_series({"name": "Photos", "categories": f"='Analysis'!$B${f0 + 1}:$B${f1 + 1}", "values": f"='Analysis'!$C${f0 + 1}:$C${f1 + 1}", "fill": {"color": COPPER}, "gap": 40})
    ch.insert_chart("B42", c4)

    b.step("Extract", "List files in the Commons categories (and sub-categories by country); read EXIF date, time, GPS and credits", "Node.js + MediaWiki API", "commons.wikimedia.org/w/api.php", "candidate files", S["excluded"]["total"], "scripts/snapshot-light-pillars.mjs")
    b.step("Transform", "Keep dated files inside the window; tag phenomena from categories; geocode country and offshore with Natural Earth", "Node.js", "Commons metadata", "catalog rows", len(rows), "scripts/snapshot-light-pillars.mjs")
    b.step("Extract", "ERA5 weather at each located photo's place and hour (daily mean when there is no time)", "Node.js + Open-Meteo archive API", "lat, lon, date", "wx fields", sum(1 for x in rows if x[30] is not None), "scripts/snapshot-light-pillars.mjs")
    b.step("Load", "Bundle the catalog with the page", "Node.js", "", "src/days/day-003-light-pillars/catalog.json", len(rows), "scripts/snapshot-light-pillars.mjs")
    b.step("Publish", "Evidence level and sun elevation (as on the page), formulas, intervals, checks", "Python (XlsxWriter)", "catalog.json", "this workbook", len(rows), "scripts/excel/days/d003.py")
    b.check("Photos in the table", len(rows), "=ROWS(tblPhotos[ID])")
    b.check("Kept + no date + out of range = files examined", S["excluded"]["total"], f"=ROWS(tblPhotos[ID])+{S['excluded']['noDate']}+{S['excluded']['outOfRange']}")
    b.check("No duplicate IDs", 0, "=ROWS(tblPhotos[ID])-SUMPRODUCT(1/COUNTIF(tblPhotos[ID],tblPhotos[ID]))", 0.001)
    b.check("Every photo shows at least one phenomenon", 0, "=SUMPRODUCT(--((tblPhotos[Light pillar]+tblPhotos[Sun pillar]+tblPhotos[Moon pillar]+tblPhotos[Parhelion]+tblPhotos[Halo 22]+tblPhotos[Circumzenithal arc])=0))")
    b.check("Evidence A + B + C = all photos", len(rows), '=COUNTIF(tblPhotos[Evidence],"A")+COUNTIF(tblPhotos[Evidence],"B")+COUNTIF(tblPhotos[Evidence],"C")')
    b.check("Located photos have a hemisphere", 0, '=SUM(tblPhotos[Located])-COUNTIF(tblPhotos[Hemisphere],"North")-COUNTIF(tblPhotos[Hemisphere],"South")')
    b.check("Dates inside the window", 0, f'=COUNTIF(tblPhotos[Date],"<"&DATE({S["window"][0][:4]},1,1))+COUNTIF(tblPhotos[Date],">"&DATE({S["window"][1][:4]},12,31))')
    b.check("Relative humidity within 0–100%", 0, '=COUNTIF(tblPhotos[Humidity pct],"<0")+COUNTIF(tblPhotos[Humidity pct],">100")')
    b.set_config(cfgMainTable="tblPhotos", cfgPivotRows="Year", cfgPivotCols="Evidence", cfgPivotValue="ID", cfgPivotFunc="count")
