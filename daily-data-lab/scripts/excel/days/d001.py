"""Day 001 · When is the best time to cross from Mexicali? (CBP historical border wait times)"""
import json
import os

from book import Book, Col, Meta, SERIES, ACCENT, COPPER

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
S = json.load(open(os.path.join(ROOT, "src/days/day-001-border/snapshot.json"), encoding="utf-8"))
CROSS = {"09250302": "Calexico West", "09250301": "Calexico East"}
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
LANES = ["Car standard min", "Car SENTRI min", "Car Ready Lane min", "Pedestrian min"]

META = Meta(
    day=1, slug="border-wait-times", title="When is the best time to cross from Mexicali?",
    question="At which weekday and hour is the northbound wait shortest at Calexico West and Calexico East, by lane and month?",
    summary="U.S. Customs and Border Protection's historical average northbound wait for every weekday and hour of each month, at the two "
            "Calexico ports of entry, for standard car lanes, SENTRI, Ready Lane and pedestrians. All times are Pacific Time.",
    captured=S["capturedAt"][:10],
    sources=[("Border Wait Times, historical averages (historicalwaittimes endpoint)", "U.S. Customs and Border Protection (CBP)", "https://bwt.cbp.gov/",
              "U.S. federal government work, public domain", "Average wait in minutes by port, month, weekday and hour")],
    caveats=[
        "Values are CBP's historical averages for each weekday and hour of a month, not individual crossings; real waits vary around them.",
        "Calexico East is open 6 am–10 pm, so it has no rows for 10 pm–6 am. A 0 can mean a lane was closed or not reported.",
        "CBP reports in minutes; the averages already mix holidays and normal days in each month.",
    ],
)


def build(b: Book):
    rows = []
    for pid, months in S["historical"].items():
        for m, recs in months.items():
            for d, h, car, sentri, ready, ped in recs:
                rows.append([CROSS[pid], pid, int(m), MONTHS[int(m) - 1], d, DAYS[d], h, car, sentri, ready, ped])
    rows.sort(key=lambda r: (r[0] != "Calexico West", r[2], r[4], r[6]))
    an = b.sheet("Analysis", "Pick a crossing, lane and month: weekday × hour heat map, best and worst hours, monthly averages, lane savings.", ACCENT)
    ch = b.sheet("Charts", "Hourly profile by lane and the daytime average for each month.", ACCENT)
    t = b.data_table("Data_Waits", "tblWaits", "Historical wait times", "CBP average northbound wait (minutes) for each crossing, month, weekday and hour.", [
        Col("Crossing", "text", "Port of entry"), Col("Port ID", "text", "CBP port code"), Col("Month", "int", "1–12"), Col("Month name", "text", ""),
        Col("Weekday number", "int", "0 = Monday … 6 = Sunday"), Col("Weekday", "text", ""), Col("Hour", "int", "Hour of day, Pacific Time (0–23)"),
        Col("Car standard min", "int", "Passenger vehicles, standard lanes", "minutes"), Col("Car SENTRI min", "int", "Trusted-traveler lanes", "minutes"),
        Col("Car Ready Lane min", "int", "RFID-document lanes", "minutes"), Col("Pedestrian min", "int", "Pedestrians, standard", "minutes"),
        Col("SENTRI saves min", "int", "Standard minus SENTRI", "minutes", formula="=[@[Car standard min]]-[@[Car SENTRI min]]"),
        Col("Daytime", "int", "1 = 6 am to 10 pm (the hours both crossings are open)", formula="=IF(AND([@Hour]>=6,[@Hour]<=21),1,0)"),
    ], rows, freeze_cols=0)

    b.list_sheet_range("lstCrossings", list(CROSS.values()))
    b.list_sheet_range("lstLanes", LANES)
    b.list_sheet_range("lstMonths", MONTHS)
    an.set_column("B:B", 24); an.set_column("C:C", 18); an.set_column("D:AB", 5.2)
    b.title(an, "Analysis", "Change the yellow cells. Blank cells are hours with no data (the crossing is closed).")
    r = 3
    sel = b.selector(an, r, 1, "Crossing", "=lstCrossings", "Calexico West"); r += 1
    an.write(r, 1, "Lane", b.label); an.write(r, 2, LANES[0], b.input)
    an.data_validation(r, 2, r, 2, {"validate": "list", "source": "=lstLanes"}); lane = f"$C${r + 1}"; r += 1
    an.write(r, 1, "Month", b.label); an.write(r, 2, "December", b.input)
    an.data_validation(r, 2, r, 2, {"validate": "list", "source": "=lstMonths"}); month = f"$C${r + 1}"; r += 1
    an.write(r, 1, "Lane column", b.label); an.write_formula(r, 2, f"=MATCH({lane},lstLanes,0)", b.f()); li = f"$C${r + 1}"
    an.write(r, 3, "(helper: which wait column the formulas read)", b.muted); r += 2
    col = f"INDEX(tblWaits[[Car standard min]:[Pedestrian min]],0,{li})"

    an.write(r, 1, "A · Average wait by weekday and hour (minutes)", b.h2); r += 1
    an.write(r, 1, "Weekday", b.head); an.write(r, 2, "Daytime avg", b.head)
    for h in range(24):
        an.write(r, 3 + h, h, b.head)
    r += 1
    g0 = r
    for d in range(7):
        an.write(r, 1, DAYS[d], b.label)
        an.write_formula(r, 2, f'=IFERROR(AVERAGEIFS({col},tblWaits[Crossing],{sel},tblWaits[Month name],{month},tblWaits[Weekday number],{d},tblWaits[Daytime],1),"")', b.numfmt("num1", bold=True))
        for h in range(24):
            an.write_formula(r, 3 + h, f'=IFERROR(AVERAGEIFS({col},tblWaits[Crossing],{sel},tblWaits[Month name],{month},tblWaits[Weekday number],{d},tblWaits[Hour],{h}),"")', b.numfmt("int", align="center"))
        r += 1
    an.conditional_format(g0, 3, r - 1, 26, {"type": "3_color_scale", "min_color": "#CFE8E4", "mid_color": "#E8C27D", "max_color": "#C4553A"})
    r += 1
    an.write(r, 1, "B · Best and worst hour for each weekday", b.h2); r += 1
    b.header_row(an, r, 1, ["Weekday", "Best hour", "Best wait", "Worst hour", "Worst wait"]); r += 1
    b0 = r
    for d in range(7):
        gr = g0 + d + 1
        rng = f"$D${gr}:$AA${gr}"
        an.write(r, 1, DAYS[d], b.f())
        an.write_formula(r, 2, f'=IFERROR(INDEX($D${g0}:$AA${g0},MATCH(D{r + 1},{rng},0))&":00","")', b.f(align="center"))
        an.write_formula(r, 3, f'=IFERROR(MIN({rng})+0*1/COUNT({rng}),"")', b.numfmt("int"))
        an.write_formula(r, 4, f'=IFERROR(INDEX($D${g0}:$AA${g0},MATCH(F{r + 1},{rng},0))&":00","")', b.f(align="center"))
        an.write_formula(r, 5, f'=IFERROR(MAX({rng})+0*1/COUNT({rng}),"")', b.numfmt("int"))
        r += 1
    r += 1
    b.kv(an, r, 1, "Quietest weekday (daytime)", f'=IFERROR(INDEX(B{g0 + 1}:B{g0 + 7},MATCH(MIN(C{g0 + 1}:C{g0 + 7}),C{g0 + 1}:C{g0 + 7},0)),"")', "text"); r += 1
    b.kv(an, r, 1, "Busiest weekday (daytime)", f'=IFERROR(INDEX(B{g0 + 1}:B{g0 + 7},MATCH(MAX(C{g0 + 1}:C{g0 + 7}),C{g0 + 1}:C{g0 + 7},0)),"")', "text"); r += 1
    b.kv(an, r, 1, "Shortest wait of the month", f"=MIN(D{g0 + 1}:AA{g0 + 7})", "int", "minutes"); r += 1
    b.kv(an, r, 1, "Longest wait of the month", f"=MAX(D{g0 + 1}:AA{g0 + 7})", "int", "minutes"); r += 2

    an.write(r, 1, "C · Daytime average (6 am–10 pm) by month, selected crossing and lane", b.h2); r += 1
    b.header_row(an, r, 1, ["Month", "Avg wait (min)", "vs year avg"]); r += 1
    m0 = r
    for i, mn in enumerate(MONTHS):
        an.write(r, 1, mn, b.f())
        an.write_formula(r, 2, f'=IFERROR(AVERAGEIFS({col},tblWaits[Crossing],{sel},tblWaits[Month],{i + 1},tblWaits[Daytime],1),"")', b.numfmt("num1"))
        an.write_formula(r, 3, f'=IFERROR(C{r + 1}/AVERAGE($C${m0 + 1}:$C${m0 + 12})-1,"")', b.numfmt("pct"))
        r += 1
    an.conditional_format(m0, 2, r - 1, 2, {"type": "data_bar", "bar_color": "#8FCFC6", "bar_solid": True})
    r += 1
    an.write(r, 1, "D · Hourly profile for the selected crossing and month (all weekdays)", b.h2); r += 1
    b.header_row(an, r, 1, ["Hour"] + LANES + ["SENTRI saves"]); r += 1
    p0 = r
    for h in range(24):
        an.write(r, 1, h, b.f(align="center"))
        for j, ln in enumerate(LANES):
            an.write_formula(r, 2 + j, f'=IFERROR(AVERAGEIFS(tblWaits[{ln}],tblWaits[Crossing],{sel},tblWaits[Month name],{month},tblWaits[Hour],$B{r + 1}),NA())', b.numfmt("num1"))
        an.write_formula(r, 6, f'=IFERROR(C{r + 1}-D{r + 1},"")', b.numfmt("num1"))
        r += 1
    r += 1
    an.write(r, 1, "E · The two crossings compared (daytime average over the year, minutes)", b.h2); r += 1
    b.header_row(an, r, 1, ["Lane", "Calexico West", "Calexico East", "East − West"]); r += 1
    for ln in LANES:
        an.write(r, 1, ln, b.f())
        for j, c in enumerate(CROSS.values()):
            an.write_formula(r, 2 + j, f'=AVERAGEIFS(tblWaits[{ln}],tblWaits[Crossing],"{c}",tblWaits[Daytime],1)', b.numfmt("num1"))
        an.write_formula(r, 4, f"=D{r + 1}-C{r + 1}", b.numfmt("num1"))
        r += 1

    b.title(ch, "Charts", "Charts follow the selectors on the Analysis sheet.")
    c1 = b.chart("line", title="Average wait by hour, selected crossing and month (minutes)", x_axis={"name": "Hour (Pacific Time)"}, y_axis={"name": "Minutes"})
    for j, ln in enumerate(LANES):
        L = chr(ord("C") + j)
        c1.add_series({"name": ln.replace(" min", ""), "categories": f"='Analysis'!$B${p0 + 1}:$B${p0 + 24}", "values": f"='Analysis'!${L}${p0 + 1}:${L}${p0 + 24}",
                       "line": {"color": SERIES[j], "width": 2}, "marker": {"type": "none"}})
    ch.insert_chart("B4", c1)
    c2 = b.chart("column", title="Daytime average wait by month, selected crossing and lane (minutes)", legend={"none": True})
    c2.add_series({"name": "Average wait", "categories": f"='Analysis'!$B${m0 + 1}:$B${m0 + 12}", "values": f"='Analysis'!$C${m0 + 1}:$C${m0 + 12}", "fill": {"color": ACCENT}, "gap": 60})
    ch.insert_chart("B23", c2)

    b.step("Extract", "Request CBP historical averages for each port and month (POV / general lanes)", "Node.js fetch", "bwt.cbp.gov/api/historicalwaittimes/{port}/POV/GEN/{month}/7", "snapshot rows", len(rows), "scripts/snapshot.mjs")
    b.step("Load", "Save one fallback snapshot bundled with the page (the page also calls the API live)", "Node.js", "API JSON", "src/days/day-001-border/snapshot.json", len(rows), "scripts/snapshot.mjs")
    b.step("Publish", "Flatten to one row per crossing × month × weekday × hour; build formulas, heat map, checks", "Python (XlsxWriter)", "snapshot.json", "this workbook", len(rows), "scripts/excel/days/d001.py")
    b.check("Rows: 12 months × (West 168 + East 112)", 12 * 280, "=ROWS(tblWaits[Crossing])")
    b.check("Calexico West has 168 rows (7 days × 24 h) per month", 168, '=COUNTIFS(tblWaits[Crossing],"Calexico West")/12')
    b.check("Calexico East has no rows before 6 am or after 9 pm", 0, '=COUNTIFS(tblWaits[Crossing],"Calexico East",tblWaits[Hour],"<6")+COUNTIFS(tblWaits[Crossing],"Calexico East",tblWaits[Hour],">21")')
    b.check("Hours run from 0 to 23", 23, "=MAX(tblWaits[Hour])-MIN(tblWaits[Hour])")
    b.check("Weekdays run from 0 to 6", 6, "=MAX(tblWaits[Weekday number])-MIN(tblWaits[Weekday number])")
    b.check("No negative waits", 0, '=COUNTIF(tblWaits[[Car standard min]:[Pedestrian min]],"<0")')
    b.check("No duplicate crossing × month × weekday × hour", 0, "=ROWS(tblWaits[Crossing])-SUMPRODUCT(1/COUNTIFS(tblWaits[Crossing],tblWaits[Crossing],tblWaits[Month],tblWaits[Month],tblWaits[Weekday number],tblWaits[Weekday number],tblWaits[Hour],tblWaits[Hour]))", 0.001)
    b.set_config(cfgMainTable="tblWaits", cfgPivotRows="Hour", cfgPivotCols="Weekday", cfgPivotValue="Car standard min")
