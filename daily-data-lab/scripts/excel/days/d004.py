"""Day 004 · How fast are winters warming at Abraham Lake? (HydroLAKES, LakeTEMP, ERA5 via Open-Meteo)"""
import json
import os

from book import Book, Col, Meta, SERIES, ACCENT, COPPER

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
S = json.load(open(os.path.join(ROOT, "src/days/day-004-abraham-lake/snapshot.json"), encoding="utf-8"))
MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
U = S["universe"]

META = Meta(
    day=4, slug="abraham-lake", title="How fast are winters warming at Abraham Lake?",
    question="How fast are winters warming at Abraham Lake (Alberta), and how does it compare with the world's large lakes in size, depth, ice and warming?",
    summary=f"Abraham Lake against every lake in HydroLAKES ({U['total']:,} lakes of at least 0.1 km²): the {len(S['lakes']):,} named or ≥100 km² lakes the page lets you pick, "
            f"their LakeTEMP ice and water-temperature statistics, and winter (Dec–Feb) air-temperature trends from ERA5 for Abraham and {len(S['trends']) - 1} of the 300 largest lakes.",
    captured=S["capturedAt"][:10],
    sources=[
        ("HydroLAKES v1.0 (lake pour points and attributes)", "HydroSHEDS / WWF, McGill University", "https://www.hydrosheds.org/products/hydrolakes", "CC BY 4.0", "Every lake's size, depth, volume, elevation, reservoir flag"),
        ("LakeTEMP v1.1 (lake surface temperature and ice)", "HydroSHEDS", "https://www.hydrosheds.org/", "CC BY 4.0", "Ice days, ice dates, monthly water temperature"),
        ("ERA5 daily mean 2 m air temperature", "Open-Meteo.com (Copernicus C3S)", "https://open-meteo.com/en/docs/historical-weather-api", "CC BY 4.0", "Winter means and trends"),
    ],
    caveats=[
        "Winter = December to February, assigned to the year of the January; a winter needs at least 89 days of data.",
        "Trends are ordinary least squares in °C per decade; the 95% interval uses Student's t with n − 2 degrees of freedom and assumes independent winters.",
        "Air temperature at the lake's pour point is not water temperature; LakeTEMP water and ice figures are separate satellite-model estimates.",
        f"The lake table holds the {len(S['lakes']):,} lakes the page uses (every named lake and every lake ≥100 km²). Counts over all {U['total']:,} lakes come precomputed from DuckDB.",
        "The 300-lake backfill is ongoing because of API quotas; trends exist for the lakes listed in Data_Trends.",
    ],
)


def build(b: Book):
    lt = S["laketemp"]
    top = set(S["top300"])
    lakes = []
    for L in S["lakes"]:
        t = lt.get(str(L[0]))
        tv = [None] * 10 + [None] * 12
        if t:
            months = t[10] or [None] * 12
            tv = [t[0], t[1], *(None if v is None else v / 100 for v in t[2:5]), *t[5:10], *[None if v is None else v / 10 for v in months]]
        lakes.append([L[0], L[1] or f"Lake #{L[0]}", L[2], L[3], L[4], L[5], L[6], L[7], L[8], L[9], 1 if L[0] in top else 0, 1 if str(L[0]) in S["trends"] else 0, *tv])
    an = b.sheet("Analysis", "Abraham against the world, trend recomputation for any lake with a drop-down, warming summary, ice by latitude.", ACCENT)
    ch = b.sheet("Charts", "Winter series with trend line, distribution of warming rates, ice days by latitude, lake sizes.", ACCENT)
    cols = [Col("Lake ID", "int", "HydroLAKES Hylak_id"), Col("Name", "text", "Lake name ('Lake #id' when unnamed)"), Col("Country", "text", ""),
            Col("Latitude", "coord", "Pour point", "degrees"), Col("Longitude", "coord", "", "degrees"), Col("Area km2", "num", "Surface area", "km²"),
            Col("Depth m", "num1", "Average depth", "m"), Col("Reservoir", "int", "1 = reservoir (HydroLAKES Lake_type 2)"), Col("Elevation m", "int", "", "m above sea level"),
            Col("Volume mcm", "num", "Total volume", "million m³"), Col("In top 300", "int", "1 = one of the 300 largest lakes by area"), Col("Has trend", "int", "1 = winter trend in Data_Trends"),
            Col("LakeTEMP obs", "int", "Number of LakeTEMP observations"), Col("LakeTEMP quality ok", "int", "1 = passes LakeTEMP quality flag"),
            Col("Water mean C", "num", "Annual mean lake surface temperature", "°C"), Col("Open-water mean C", "num", "Mean over ice-free days", "°C"),
            Col("Water max C", "num", "Annual maximum", "°C"), Col("Ice days", "int", "Typical days with ice per year", "days"), Col("Ice days min", "int", "", "days"),
            Col("Ice days max", "int", "", "days"), Col("Ice start doy", "int", "Typical freeze-up, day of year", "day"), Col("Ice end doy", "int", "Typical break-up, day of year", "day")]
    cols += [Col(f"Water {m} C", "num1", f"Mean {m} lake surface temperature", "°C") for m in MON]
    cols += [Col("Size rank", "int", "Rank by area among the lakes in this table", formula="=RANK.EQ([@[Area km2]],[Area km2],0)"),
             Col("Ice months", "num1", "Ice days ÷ 30.4", "months", formula='=IF([@[Ice days]]="","",[@[Ice days]]/30.4)')]
    t = b.data_table("Data_Lakes", "tblLakes", "Lakes (named or ≥100 km²)", "HydroLAKES attributes joined with LakeTEMP statistics. Sorted by area.", cols, lakes, freeze_cols=2)

    tc = S["trendColumns"]
    names = {L[0]: (L[1] or f"Lake #{L[0]}", L[2], L[5]) for L in S["lakes"]}
    trows = []
    for lid, v in S["trends"].items():
        nm, ctry, area = names.get(int(lid), (f"Lake #{lid}", "", None))
        trows.append([int(lid), nm, ctry, area, *v])
    trows.sort(key=lambda r: -(r[3] or 0))
    tt = b.data_table("Data_Trends", "tblTrends", "Winter warming trends", "OLS of winter (Dec–Feb) mean air temperature on year, per lake.", [
        Col("Lake ID", "int", ""), Col("Name", "text", ""), Col("Country", "text", ""), Col("Area km2", "num", "", "km²"),
        Col("First winter", "year", ""), Col("Last winter", "year", ""), Col("Winters", "int", "Number of winters in the fit"),
        Col("Winter mean C", "num", "Mean of the winter means", "°C"), Col("Slope C per decade", "num3", "Warming rate", "°C/decade"),
        Col("Intercept", "num", "OLS intercept (°C at year 0, per-year fit)", "°C"), Col("R2", "r", "Coefficient of determination"),
        Col("Slope SE", "num3", "Standard error of the slope", "°C/decade"),
        Col("t critical", "num3", "Student's t, 95%, n − 2 df", formula="=T.INV.2T(0.05,[@Winters]-2)"),
        Col("CI low", "num3", "95% lower bound", "°C/decade", formula="=[@[Slope C per decade]]-[@[t critical]]*[@[Slope SE]]"),
        Col("CI high", "num3", "95% upper bound", "°C/decade", formula="=[@[Slope C per decade]]+[@[t critical]]*[@[Slope SE]]"),
        Col("Verdict", "text", "warming / cooling when the interval excludes 0", formula='=IF([@[CI low]]>0,"warming",IF([@[CI high]]<0,"cooling","not significant"))'),
        Col("Warming over the record C", "num", "Slope × length of record", "°C", formula="=[@[Slope C per decade]]*([@[Last winter]]-[@[First winter]])/10")],
        [[r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11]] for r in trows])

    wrows = [[int(lid), names.get(int(lid), (f"Lake #{lid}",))[0], w, m] for lid, s in S["series"].items() for w, m in s]
    tw = b.data_table("Data_Winters", "tblWinters", "Winter means", "One row per lake and winter: Dec–Feb mean daily air temperature (ERA5).", [
        Col("Lake ID", "int", ""), Col("Name", "text", ""), Col("Winter", "year", "Year of the January"), Col("Mean C", "num", "Dec–Feb mean", "°C")], wrows)
    ti = b.data_table("Data_IceByLatitude", "tblIceLat", "Ice days by latitude", f"Every high-quality LakeTEMP lake ({S['iceUniverse']['good']:,}), by 1° latitude band.", [
        Col("Latitude band", "int", "floor(latitude)", "degrees"), Col("Lakes", "int", ""), Col("Ice days P25", "num1", "25th percentile", "days"),
        Col("Ice days median", "num1", "", "days"), Col("Ice days P75", "num1", "", "days"), Col("Open-water mean C", "num1", "Mean of the lakes' open-water means", "°C")],
        [list(r) for r in S["iceByLat"]])
    ta = b.data_table("Data_Universe", "tblAreaBins", "All HydroLAKES lakes by size", "Counts over all lakes (precomputed in DuckDB).", [
        Col("Log10 area bin", "int", "floor(log10(area km²)): −1 = 0.1–1 km², 0 = 1–10 …"), Col("Lakes", "int", ""),
        Col("Size class", "text", "", formula='=TEXT(10^[@[Log10 area bin]],"#,##0.#")&"–"&TEXT(10^([@[Log10 area bin]]+1),"#,##0")&" km²"')],
        [list(r) for r in S["areaBins"]])
    tco = b.data_table("Data_Continents", "tblContinents", "Lakes by continent", "All HydroLAKES lakes.", [
        Col("Continent", "text", ""), Col("Lakes", "int", ""), Col("Reservoirs", "int", ""), Col("Reservoir share", "pct", "", formula="=[@Reservoirs]/[@Lakes]")],
        [list(r) for r in S["continents"]])
    tm = b.data_table("Data_AbrahamClimate", "tblAbrahamAir", "Abraham Lake: monthly air temperature", "ERA5 daily mean air temperature since 1951, by month.", [
        Col("Month", "int", ""), Col("Mean C", "num1", "", "°C"), Col("Coldest day C", "num1", "", "°C"), Col("Warmest day C", "num1", "", "°C"),
        Col("Days below zero pct", "int", "Share of days with mean below 0 °C", "%")], [list(r) for r in S["abraham"]["monthsAir"]])

    A = S["abraham"]
    an.set_column("B:B", 34); an.set_column("C:C", 16); an.set_column("D:D", 44); an.set_column("E:M", 12)
    b.title(an, "Analysis", "Change the yellow cell to recompute any lake's trend from its winter series.")
    r = 3
    an.write(r, 1, "A · Abraham Lake against every lake in HydroLAKES", b.h2); r += 1
    ab = lambda c: f'INDEX(tblLakes[{c}],MATCH(7243,tblLakes[Lake ID],0))'
    for label, fml, kind, note in [
        ("Area (km²)", f"={ab('[Area km2]')}", "num", ""), ("Depth (m)", f"={ab('[Depth m]')}", "num1", ""), ("Elevation (m)", f"={ab('[Elevation m]')}", "int", "a reservoir behind the Bighorn Dam"),
        ("Lakes in HydroLAKES", U["total"], "int", "≥ 0.1 km²"), ("Lakes larger than Abraham", U["larger_than_abraham"], "int", ""),
        ("Share of lakes Abraham is larger than", f"=1-C{r + 5}/C{r + 4}", "pct", "percentile by area"),
        ("Lakes deeper than Abraham", U["deeper_than_abraham"], "int", ""),
        ("Ice days per year (LakeTEMP)", f"={ab('[Ice days]')}", "int", ""),
        ("Median ice days, same 1° latitude band", f"=INDEX(tblIceLat[Ice days median],MATCH(INT({A['lat']}),tblIceLat[Latitude band],0))", "int", "all high-quality LakeTEMP lakes"),
        ("Median ice days, same latitude and elevation", A["peersSameLatElevation"]["p50"], "int", f"{A['peersSameLatElevation']['n']:,} peer lakes"),
        ("Share of lakes with more ice than Abraham", S["iceUniverse"]["more_ice_than_abraham"] / S["iceUniverse"]["with_ice"], "pct", "among lakes that freeze"),
        ("Winter trend since 1951 (°C/decade)", '=INDEX(tblTrends[Slope C per decade],MATCH(7243,tblTrends[Lake ID],0))', "num3", ""),
        ("95% interval", '=TEXT(INDEX(tblTrends[CI low],MATCH(7243,tblTrends[Lake ID],0)),"0.000")&" to "&TEXT(INDEX(tblTrends[CI high],MATCH(7243,tblTrends[Lake ID],0)),"0.000")', "text", ""),
        ("Winter trend since 1991 (°C/decade)", A["trend1991"]["slope"], "num3", f"SE {A['trend1991']['se']}: same window as the 300 lakes")]:
        b.kv(an, r, 1, label, fml, kind, note); r += 1
    r += 1

    an.write(r, 1, "B · Recompute a lake's winter trend from its series", b.h2); r += 1
    an.write(r, 1, "SLOPE, INTERCEPT, RSQ and STEYX over the lake's rows of tblWinters (array formulas); compare with the stored fit.", b.muted); r += 1
    names_t = [x[1] for x in trows]
    b.list_sheet_range("lstTrendLakes", names_t)
    sel = b.selector(an, r, 1, "Lake", "=lstTrendLakes", "Abraham"); r += 1
    b.kv(an, r, 1, "Lake ID", f"=INDEX(tblTrends[Lake ID],MATCH({sel},tblTrends[Name],0))", "int"); lid = f"$C${r + 1}"; r += 1
    cond = f"tblWinters[Lake ID]={lid}"
    an.write(r, 1, "Winters (n)", b.label); an.write_formula(r, 2, f"=COUNTIF(tblWinters[Lake ID],{lid})", b.numfmt("int", bold=True, font_size=12)); n_ = f"$C${r + 1}"; r += 1
    an.write(r, 1, "Slope (°C/decade), recomputed", b.label)
    an.write_array_formula(r, 2, r, 2, f"{{=10*SLOPE(IF({cond},tblWinters[Mean C]),IF({cond},tblWinters[Winter]))}}", b.numfmt("num3", bold=True, font_size=12)); sl = f"$C${r + 1}"; r += 1
    an.write(r, 1, "Slope stored in tblTrends", b.label)
    an.write_formula(r, 2, f"=INDEX(tblTrends[Slope C per decade],MATCH({lid},tblTrends[Lake ID],0))", b.numfmt("num3", bold=True, font_size=12)); r += 1
    an.write(r, 1, "R², recomputed", b.label)
    an.write_array_formula(r, 2, r, 2, f"{{=RSQ(IF({cond},tblWinters[Mean C]),IF({cond},tblWinters[Winter]))}}", b.numfmt("r", bold=True, font_size=12)); r += 1
    an.write(r, 1, "Slope standard error (°C/decade)", b.label)
    an.write_array_formula(r, 2, r, 2, f"{{=10*STEYX(IF({cond},tblWinters[Mean C]),IF({cond},tblWinters[Winter]))/SQRT(DEVSQ(IF({cond},tblWinters[Winter])))}}", b.numfmt("num3", bold=True, font_size=12)); se = f"$C${r + 1}"; r += 1
    b.kv(an, r, 1, "95% interval low", f"={sl}-T.INV.2T(0.05,{n_}-2)*{se}", "num3"); r += 1
    b.kv(an, r, 1, "95% interval high", f"={sl}+T.INV.2T(0.05,{n_}-2)*{se}", "num3"); r += 1
    an.write(r, 1, "Coldest winter", b.label)
    an.write_array_formula(r, 2, r, 2, f"{{=MIN(IF({cond},tblWinters[Mean C]))}}", b.numfmt("num", bold=True, font_size=12)); r += 1
    an.write(r, 1, "Warmest winter", b.label)
    an.write_array_formula(r, 2, r, 2, f"{{=MAX(IF({cond},tblWinters[Mean C]))}}", b.numfmt("num", bold=True, font_size=12)); r += 2
    an.write(r, 1, "Series for the chart", b.label); r += 1
    b.header_row(an, r, 1, ["Winter", "Mean °C"]); r += 1
    s0 = r
    yrs = list(range(1951, 2026))
    for i, y in enumerate(yrs):
        an.write(r, 1, y, b.numfmt("year"))
        an.write_formula(r, 2, f'=IFERROR(1/(1/SUMIFS(tblWinters[Mean C],tblWinters[Lake ID],{lid},tblWinters[Winter],B{r + 1})),IF(COUNTIFS(tblWinters[Lake ID],{lid},tblWinters[Winter],B{r + 1})>0,0,NA()))', b.numfmt("num"))
        r += 1
    s1 = r - 1
    r += 1

    an.write(r, 1, "C · Warming across the lakes with a trend", b.h2); r += 1
    for label, fml, kind in [("Lakes with a trend", "=ROWS(tblTrends[Lake ID])", "int"),
                             ("Warming (slope > 0)", '=COUNTIF(tblTrends[Slope C per decade],">0")', "int"),
                             ("Significant warming (95% CI above 0)", '=COUNTIF(tblTrends[Verdict],"warming")', "int"),
                             ("Significant cooling", '=COUNTIF(tblTrends[Verdict],"cooling")', "int"),
                             ("Median warming rate (°C/decade)", "=MEDIAN(tblTrends[Slope C per decade])", "num3"),
                             ("Mean warming rate (°C/decade)", "=AVERAGE(tblTrends[Slope C per decade])", "num3"),
                             ("Abraham's rate percentile (Abraham since 1951, others 1991–2025)", '=PERCENTRANK.INC(tblTrends[Slope C per decade],INDEX(tblTrends[Slope C per decade],MATCH(7243,tblTrends[Lake ID],0)))', "pct"),
                             ("r (warming rate vs latitude)", "=CORREL(tblTrends[Slope C per decade],SUMIFS(tblLakes[Latitude],tblLakes[Lake ID],tblTrends[Lake ID]))", "r")]:
        if "SUMIFS(tblLakes" in fml:
            an.write(r, 1, label, b.label); an.write_array_formula(r, 2, r, 2, "{" + fml + "}", b.numfmt(kind, bold=True, font_size=12))
        else:
            b.kv(an, r, 1, label, fml, kind)
        r += 1
    r += 1
    an.write(r, 1, "Distribution of warming rates (histogram)", b.label); r += 1
    b.header_row(an, r, 1, ["From (°C/decade)", "To", "Lakes"]); r += 1
    h0 = r
    edges = [x / 4 for x in range(-4, 13)]
    for a, z in zip(edges[:-1], edges[1:]):
        an.write(r, 1, a, b.numfmt("num")); an.write(r, 2, z, b.numfmt("num"))
        an.write_formula(r, 3, f'=COUNTIFS(tblTrends[Slope C per decade],">="&B{r + 1},tblTrends[Slope C per decade],"<"&C{r + 1})', b.numfmt("int"))
        an.write_formula(r, 4, f'=TEXT(B{r + 1},"0.00")&" to "&TEXT(C{r + 1},"0.00")', b.f(font_color="#B7B0A2"))
        r += 1
    h1 = r - 1
    an.write(r, 1, "Outside the bins", b.muted); an.write_formula(r, 3, f"=ROWS(tblTrends[Lake ID])-SUM(D{h0 + 1}:D{h1 + 1})", b.numfmt("int")); r += 2

    an.write(r, 1, "D · Lakes in the table by country", b.h2); r += 1
    b.header_row(an, r, 1, ["Country", "Lakes", "Total area km²", "Median ice days", "Reservoirs"]); r += 1
    countries = sorted({L[2] for L in lakes if L[2]})
    for c in countries:
        R = r + 1
        an.write(r, 1, c, b.f())
        an.write_formula(r, 2, f"=COUNTIF(tblLakes[Country],B{R})", b.numfmt("int"))
        an.write_formula(r, 3, f"=SUMIFS(tblLakes[Area km2],tblLakes[Country],B{R})", b.numfmt("int"))
        an.write_formula(r, 4, f'=IFERROR(AGGREGATE(17,6,tblLakes[Ice days]/((tblLakes[Country]=B{R})*(tblLakes[Ice days]<>"")),2),"")', b.numfmt("int"))
        an.write_formula(r, 5, f"=COUNTIFS(tblLakes[Country],B{R},tblLakes[Reservoir],1)", b.numfmt("int"))
        r += 1

    b.title(ch, "Charts", "The first chart follows the lake picked on the Analysis sheet.")
    c1 = b.chart("scatter", title="Winter (Dec–Feb) mean air temperature, selected lake, with linear trend", x_axis={"name": "Winter", "min": 1950, "max": 2026}, y_axis={"name": "°C"}, legend={"none": True})
    c1.add_series({"name": "Winter mean", "categories": f"='Analysis'!$B${s0 + 1}:$B${s1 + 1}", "values": f"='Analysis'!$C${s0 + 1}:$C${s1 + 1}",
                   "marker": {"type": "circle", "size": 5, "fill": {"color": ACCENT}, "border": {"color": "#FFFFFF", "width": 0.5}},
                   "trendline": {"type": "linear", "line": {"color": COPPER, "width": 2}}})
    ch.insert_chart("B4", c1)
    c2 = b.chart("column", title="Warming rates across the lakes with a trend (°C per decade)", legend={"none": True})
    c2.add_series({"name": "Lakes", "categories": f"='Analysis'!$E${h0 + 1}:$E${h1 + 1}", "values": f"='Analysis'!$D${h0 + 1}:$D${h1 + 1}", "fill": {"color": SERIES[1]}, "gap": 10})
    ch.insert_chart("N4", c2)
    c3 = b.chart("line", title="Ice days per year by latitude (LakeTEMP, median and interquartile range)", x_axis={"name": "Latitude band (°)", "interval_unit": 10}, y_axis={"name": "Days"})
    for j, (col, nm) in enumerate([("Ice days P25", "25th percentile"), ("Ice days median", "Median"), ("Ice days P75", "75th percentile")]):
        c3.add_series({"name": nm, "categories": ti.col_range("Latitude band"), "values": ti.col_range(col),
                       "line": {"color": ACCENT if j == 1 else "#8FCFC6", "width": 2.5 if j == 1 else 1, "dash_type": "solid" if j == 1 else "dash"}})
    ch.insert_chart("B23", c3)
    c4 = b.chart("column", title="All HydroLAKES lakes by size (log scale)", legend={"none": True}, y_axis={"log_base": 10, "name": "Lakes"})
    c4.add_series({"name": "Lakes", "categories": ta.col_range("Size class"), "values": ta.col_range("Lakes"), "fill": {"color": ACCENT}, "gap": 40})
    ch.insert_chart("N23", c4)
    c5 = b.chart("column", title="Abraham Lake: monthly air temperature since 1951 (°C)")
    c5.add_series({"name": "Mean", "categories": tm.col_range("Month"), "values": tm.col_range("Mean C"), "fill": {"color": ACCENT}, "gap": 60})
    ch.insert_chart("B42", c5)

    b.step("Extract", "Download HydroLAKES pour points (shapefile) and LakeTEMP", "curl", "data.hydrosheds.org", "raw/day-004-abraham-lake/", U["total"], "README.md")
    b.step("Transform", "Read the shapefile with the DuckDB spatial extension into a lake dimension", "DuckDB SQL", "HydroLAKES_points_v10.shp", "dim_lake.parquet", U["total"], "scripts/day-004/dim_lake.sql")
    b.step("Transform", "LakeTEMP statistics per lake (ice days, dates, monthly means and intervals)", "DuckDB SQL", "LakeTEMP", "laketemp.parquet", None, "scripts/day-004/laketemp.sql")
    b.step("Transform", "Pick the 300 largest lakes", "DuckDB SQL", "dim_lake.parquet", "data/day-004-abraham-lake/top300.json", 300, "scripts/day-004/top300.sql")
    b.step("Extract", "ERA5 daily air temperature per lake, resumable under the free API quota (daily ledger)", "Node.js + Open-Meteo", "archive-api.open-meteo.com", "data/day-004-abraham-lake/winters/*.json", len(S["trends"]) - 1, "scripts/day-004/fetch-winters.mjs")
    b.step("Transform", "Winter means (Dec–Feb, ≥ 89 days) and OLS trends with standard errors", "Node.js / DuckDB", "winters/*.json", "trends", len(S["trends"]), "scripts/day-004/update-trends.mjs")
    b.step("Load", "Bundle lakes, trends, series, LakeTEMP and aggregates with the page", "Node.js + DuckDB", "parquet + JSON", "src/days/day-004-abraham-lake/snapshot.json", len(lakes), "scripts/day-004/snapshot.mjs")
    b.step("Publish", "Typed tables, recomputed trends with t intervals, histograms, checks", "Python (XlsxWriter)", "snapshot.json", "this workbook", len(lakes), "scripts/excel/days/d004.py")
    b.check("Lakes in the table", len(lakes), "=ROWS(tblLakes[Lake ID])")
    b.check("No duplicate lake IDs", 0, "=ROWS(tblLakes[Lake ID])-SUMPRODUCT(1/COUNTIF(tblLakes[Lake ID],tblLakes[Lake ID]))", 0.001)
    b.check("Every lake in the table is named or ≥100 km² (or Abraham)", 0, '=SUMPRODUCT((LEFT(tblLakes[Name],6)="Lake #")*(tblLakes[Area km2]<100)*(tblLakes[Lake ID]<>7243))')
    b.check("Area bins add up to all HydroLAKES lakes", U["total"], "=SUM(tblAreaBins[Lakes])")
    b.check("Continents add up to all HydroLAKES lakes", U["total"], "=SUM(tblContinents[Lakes])")
    b.check("Every trend lake has its winter series", 0, "=SUMPRODUCT(--(COUNTIF(tblWinters[Lake ID],tblTrends[Lake ID])<>tblTrends[Winters]))")
    b.check("Recomputed Abraham slope equals the stored one (°C/decade)", next(x[8] for x in trows if x[0] == 7243),
            "=10*SLOPE(INDEX(tblWinters[Mean C],MATCH(7243,tblWinters[Lake ID],0)):INDEX(tblWinters[Mean C],MATCH(7243,tblWinters[Lake ID],0)+COUNTIF(tblWinters[Lake ID],7243)-1),"
            "INDEX(tblWinters[Winter],MATCH(7243,tblWinters[Lake ID],0)):INDEX(tblWinters[Winter],MATCH(7243,tblWinters[Lake ID],0)+COUNTIF(tblWinters[Lake ID],7243)-1))", 0.001)
    b.check("Abraham ice days (LakeTEMP: 142)", 142, '=INDEX(tblLakes[Ice days],MATCH(7243,tblLakes[Lake ID],0))')
    b.check("Lakes in latitude bands = LakeTEMP lakes with quality ok and ice data", sum(x[1] for x in S["iceByLat"]), "=SUM(tblIceLat[Lakes])", 0,
            f"{S['iceUniverse']['good']:,} lakes pass the quality flag in total")
    b.set_config(cfgMainTable="tblLakes", cfgPivotRows="Country", cfgPivotCols="Reservoir", cfgPivotValue="Area km2")
