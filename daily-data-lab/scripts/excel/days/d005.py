"""Day 005 · Which languages are endangered and barely documented? (Glottolog 5.4, Grambank, WALS)"""
import json
import os

from book import Book, Col, Meta, SERIES, ACCENT, COPPER

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
S = json.load(open(os.path.join(ROOT, "src/days/day-005-endangered-languages/snapshot.json"), encoding="utf-8"))
SUM = json.load(open(os.path.join(ROOT, "data/day-005-endangered-languages/summary.json"), encoding="utf-8"))
FW = json.load(open(os.path.join(ROOT, "data/day-006-food-waste/day-006.json"), encoding="utf-8"))
NAMES = {c["iso2"]: c["name"] for c in FW["countries"]}
NAMES.update({"TW": "Taiwan", "NF": "Norfolk Island", "NU": "Niue", "PN": "Pitcairn Islands", "CC": "Cocos (Keeling) Islands", "TK": "Tokelau",
              "GS": "South Georgia and the South Sandwich Islands", "AX": "Åland Islands", "SJ": "Svalbard and Jan Mayen", "TF": "French Southern Territories",
              "CX": "Christmas Island", "JE": "Jersey", "IO": "British Indian Ocean Territory", "FK": "Falkland Islands", "UM": "U.S. Minor Outlying Islands",
              "GG": "Guernsey", "VA": "Vatican City", "MS": "Montserrat"})
AES = {0: "Not assessed", 1: "Not endangered", 2: "Threatened", 3: "Shifting", 4: "Moribund", 5: "Nearly extinct", 6: "Extinct"}
MED = {-1: "Nothing linked", 0: "Long grammar", 1: "Grammar", 2: "Grammar sketch", 3: "Phonology or texts", 4: "Wordlist or less"}
G = SUM["global"]

META = Meta(
    day=5, slug="endangered-languages", title="Which languages are endangered and barely documented?",
    question="Which of the world's spoken languages are both endangered and poorly documented, and where are they?",
    summary=f"All {G['languages']:,} spoken first languages in Glottolog 5.4 with their Agglomerated Endangerment Status (AES, six levels) and Most Extensive "
            f"Description (MED, five levels), family, macroarea, countries, and Grambank / WALS coverage. Priority = shifting or worse and no grammar sketch ({G['priority']:,} languages).",
    captured=S["capturedAt"][:10],
    sources=[
        ("Glottolog 5.4 CLDF (languages, AES, MED)", "Max Planck Institute for Evolutionary Anthropology", "https://doi.org/10.5281/zenodo.24101243", "CC BY 4.0", "Every language, status and documentation level"),
        ("Grambank 1.0.3 CLDF", "Grambank consortium", "https://doi.org/10.5281/zenodo.7844558", "CC BY 4.0", "Grammar feature coverage and values"),
        ("WALS Online 2020.6 CLDF", "Max Planck Institute for Evolutionary Anthropology", "https://wals.info/", "CC BY 4.0", "Coverage flag"),
        ("GlottoScope (AES and MED counts)", "Glottolog", "https://glottolog.org/langdoc/status", "CC BY 4.0", "Cross-check of the AES and MED totals"),
    ],
    caveats=[
        "Sign languages are excluded (7,850 languages with them). A language spoken in several countries counts once in each country.",
        "MED counts in the CLDF release differ from the GlottoScope web page; this workbook uses the citable CLDF release (both are on the Pipeline sheet).",
        "Endangered = AES 2–5 (threatened to nearly extinct); living = AES 1–5. Shares use living languages as the base and carry 95% Wilson intervals.",
        "Grambank highlights: the snapshot keeps the 10 feature values with at least 30 carrier languages that the page shows; none is carried only by endangered languages.",
    ],
)


def build(b: Book):
    fams = S["families"]
    rows = []
    for L in S["languages"]:
        ctry = L[7]
        rows.append([L[0], L[1], fams[L[2]][1] if L[2] >= 0 else "Isolate", fams[L[2]][0] if L[2] >= 0 else "", S["macroareas"][L[3]] if L[3] >= 0 else "",
                     L[4], L[5], L[6] or None, ctry or None, len(ctry.split(";")) if ctry else 0, L[8], AES[L[8]], L[9], MED[L[9]], L[10], L[11], L[12], L[13]])
    an = b.sheet("Analysis", "Status × documentation matrix, macroareas and countries recomputed from the language rows, a country profile, documentation age.", ACCENT)
    ch = b.sheet("Charts", "Endangerment by macroarea, the status × documentation matrix, and endangered shares by country.", ACCENT)
    t = b.data_table("Data_Languages", "tblLanguages", "Languages (Glottolog 5.4)", "One row per spoken first language.", [
        Col("Glottocode", "text", "Glottolog identifier"), Col("Name", "text", ""), Col("Family", "text", "Top-level family ('Isolate' when none)"), Col("Family ID", "text", "Glottocode of the family"),
        Col("Macroarea", "text", "Glottolog macroarea"), Col("Latitude", "coord", "", "degrees"), Col("Longitude", "coord", "", "degrees"), Col("ISO 639-3", "text", ""),
        Col("Countries", "text", "ISO 3166 alpha-2 codes, separated by ';'"), Col("Country count", "int", ""),
        Col("AES code", "int", "0 not assessed, 1 not endangered … 6 extinct"), Col("AES status", "text", "Agglomerated Endangerment Status"),
        Col("MED code", "int", "0 long grammar … 4 wordlist or less; −1 nothing linked"), Col("MED level", "text", "Most Extensive Description"),
        Col("MED year", "year", "Year of the most extensive description"), Col("First description year", "year", "Year of the earliest description"),
        Col("In Grambank", "int", "1 = coded in Grambank"), Col("In WALS", "int", "1 = in WALS"),
        Col("Living", "int", "AES 1–5", formula="=IF(AND([@[AES code]]>=1,[@[AES code]]<=5),1,0)"),
        Col("Endangered", "int", "AES 2–5", formula="=IF(AND([@[AES code]]>=2,[@[AES code]]<=5),1,0)"),
        Col("Extinct", "int", "AES 6", formula="=IF([@[AES code]]=6,1,0)"),
        Col("Poorly documented", "int", "No grammar sketch or better (MED ≥ 3 or none)", formula="=IF(OR([@[MED code]]>=3,[@[MED code]]<0),1,0)"),
        Col("Priority", "int", "Shifting or worse (AES 3–5) and poorly documented", formula="=IF(AND([@[AES code]]>=3,[@[AES code]]<=5,[@[Poorly documented]]=1),1,0)"),
        Col("Country key", "text", "Helper for COUNTIFS: ';' + codes + ';'", formula='=";"&[@Countries]&";"'),
        Col("Years since description", "int", "Age of the best description in 2026", formula='=IF([@[MED year]]="","",2026-[@[MED year]])'),
    ], rows, freeze_cols=1)
    tc = b.data_table("Data_Countries", "tblCountries", "Countries", "Snapshot counts per country (a language spoken in several countries counts in each).", [
        Col("Code", "text", "ISO 3166 alpha-2"), Col("Country", "text", ""), Col("Languages", "int", ""), Col("Living", "int", ""), Col("Endangered", "int", ""),
        Col("Extinct", "int", ""), Col("Priority", "int", ""), Col("Unassessed", "int", ""),
        Col("Endangered share", "pct", "Endangered ÷ living", formula='=IF([@Living]>0,[@Endangered]/[@Living],"")'),
        Col("Wilson low", "pct", "95% lower bound", formula='=IF([@Living]>0,([@[Endangered share]]+1.96^2/(2*[@Living])-1.96*SQRT([@[Endangered share]]*(1-[@[Endangered share]])/[@Living]+1.96^2/(4*[@Living]^2)))/(1+1.96^2/[@Living]),"")'),
        Col("Wilson high", "pct", "95% upper bound", formula='=IF([@Living]>0,([@[Endangered share]]+1.96^2/(2*[@Living])+1.96*SQRT([@[Endangered share]]*(1-[@[Endangered share]])/[@Living]+1.96^2/(4*[@Living]^2)))/(1+1.96^2/[@Living]),"")'),
        Col("Endangered recomputed", "int", "COUNTIFS over tblLanguages", formula='=COUNTIFS(tblLanguages[Country key],"*;"&[@Code]&";*",tblLanguages[Endangered],1)')],
        [[c["country"], NAMES.get(c["country"], c["country"]), c["languages"], c["living"], c["endangered"], c["extinct"], c["priority"], c["unassessed"]] for c in SUM["byCountry"]])
    tm = b.data_table("Data_Macroareas", "tblMacroareas", "Macroareas", "Snapshot counts per Glottolog macroarea.", [
        Col("Macroarea", "text", ""), Col("Languages", "int", ""), Col("Living", "int", ""), Col("Endangered", "int", ""), Col("Extinct", "int", ""),
        Col("Priority", "int", ""), Col("Unassessed", "int", ""), Col("Endangered share", "pct", "", formula="=[@Endangered]/[@Living]"),
        Col("Not endangered", "int", "", formula="=[@Living]-[@Endangered]")],
        [[m["macroarea"], m["languages"], m["living"], m["endangered"], m["extinct"], m["priority"], m["unassessed"]] for m in SUM["byMacroarea"]])
    tf = b.data_table("Data_Families", "tblFamilies", "Language families", "Every top-level family in the snapshot, with counts recomputed from tblLanguages.", [
        Col("Family ID", "text", "Glottocode"), Col("Family", "text", ""),
        Col("Languages", "int", "", formula="=COUNTIF(tblLanguages[Family ID],[@[Family ID]])"),
        Col("Endangered", "int", "", formula="=COUNTIFS(tblLanguages[Family ID],[@[Family ID]],tblLanguages[Endangered],1)"),
        Col("Extinct", "int", "", formula="=COUNTIFS(tblLanguages[Family ID],[@[Family ID]],tblLanguages[Extinct],1)"),
        Col("Priority", "int", "", formula="=COUNTIFS(tblLanguages[Family ID],[@[Family ID]],tblLanguages[Priority],1)"),
        Col("Endangered share of living", "pct", "", formula='=IFERROR([@Endangered]/COUNTIFS(tblLanguages[Family ID],[@[Family ID]],tblLanguages[Living],1),"")')],
        [[f[0], f[1]] for f in fams])
    tg = b.data_table("Data_Grambank", "tblGrambank", "Grambank feature values the page highlights", "Values with at least 30 carrier languages; carriers and how many are endangered or extinct.", [
        Col("Feature", "text", "Grambank feature ID"), Col("Value", "text", ""), Col("Question", "text", "", width=70), Col("Carriers", "int", "Languages with this value"),
        Col("Endangered or extinct carriers", "int", ""), Col("Share endangered or extinct", "pct", "", formula="=[@[Endangered or extinct carriers]]/[@Carriers]"),
        Col("Above base rate", "num", "Share minus the base rate of endangered or extinct languages in Grambank", formula=f"=[@[Share endangered or extinct]]-{S['grambank']['baseEndangered']}")],
        [list(x) for x in S["grambank"]["top"]])
    gs = S["glottoscope"]
    tq = b.data_table("Data_GlottoScope", "tblGlottoScope", "Cross-check with GlottoScope", "Counts per level: the GlottoScope web page vs the CLDF release used here.", [
        Col("Measure", "text", ""), Col("Level", "text", ""), Col("GlottoScope", "int", ""), Col("CLDF", "int", ""), Col("Difference", "int", "", formula="=[@CLDF]-[@GlottoScope]")],
        [["AES", AES[i + 1], gs["aes"][i], gs["cldfAes"][i]] for i in range(6)] + [["MED", MED[i], gs["med"][i], gs["cldfMed"][i]] for i in range(5)])

    an.set_column("B:B", 30); an.set_column("C:K", 13)
    b.title(an, "Analysis", "Every number is a COUNTIFS over tblLanguages, so it updates if you edit or filter the language rows.")
    r = 3
    an.write(r, 1, "A · World totals", b.h2); r += 1
    b.header_row(an, r, 1, ["Measure", "Recomputed", "Snapshot", "Match"]); r += 1
    for label, fml, key in [("Languages", "=ROWS(tblLanguages[Glottocode])", "languages"), ("Living", "=SUM(tblLanguages[Living])", "living"),
                            ("Endangered", "=SUM(tblLanguages[Endangered])", "endangered"), ("Extinct", "=SUM(tblLanguages[Extinct])", "extinct"),
                            ("Priority (shifting+ and no grammar sketch)", "=SUM(tblLanguages[Priority])", "priority"),
                            ("Not assessed", "=COUNTIF(tblLanguages[AES code],0)", "unassessed")]:
        an.write(r, 1, label, b.f()); an.write_formula(r, 2, fml, b.numfmt("int", bold=True)); an.write(r, 3, G[key], b.numfmt("int"))
        an.write_formula(r, 4, f'=IF(C{r + 1}=D{r + 1},"✓","✗")', b.f(align="center")); r += 1
    b.kv(an, r, 1, "Endangered share of living languages", f"=C{r - 3}/C{r - 4}", "pct"); r += 2

    an.write(r, 1, "B · Endangerment (rows) × documentation (columns)", b.h2); r += 1
    meds = [0, 1, 2, 3, 4, -1]
    b.header_row(an, r, 1, ["AES \\ MED"] + [MED[m] for m in meds] + ["Total", "Poorly documented"]); r += 1
    x0 = r
    for a in range(0, 7):
        R = r + 1
        an.write(r, 1, AES[a], b.label)
        for j, m in enumerate(meds):
            an.write_formula(r, 2 + j, f"=COUNTIFS(tblLanguages[AES code],{a},tblLanguages[MED code],{m})", b.numfmt("int", align="center"))
        an.write_formula(r, 8, f"=SUM(C{R}:H{R})", b.numfmt("int", bold=True))
        an.write_formula(r, 9, f"=IFERROR((F{R}+G{R}+H{R})/I{R},\"\")", b.numfmt("pct"))
        r += 1
    an.conditional_format(x0, 2, r - 1, 7, {"type": "2_color_scale", "min_color": "#FFFFFF", "max_color": "#DD8F4F"})
    an.write(r, 1, "Total", b.label)
    for j in range(7):
        L = chr(ord("C") + j)
        an.write_formula(r, 2 + j, f"=SUM({L}{x0 + 1}:{L}{r})", b.numfmt("int", bold=True))
    r += 1
    an.write(r, 1, "Priority cell block: rows Shifting to Nearly extinct × columns Phonology or texts, Wordlist or less, Nothing linked.", b.muted); r += 2

    an.write(r, 1, "C · Macroareas, recomputed", b.h2); r += 1
    b.header_row(an, r, 1, ["Macroarea", "Languages", "Living", "Endangered", "Priority", "Share endangered", "95% low", "95% high", "Snapshot endangered"]); r += 1
    m0 = r
    for m in S["macroareas"]:
        R = r + 1
        an.write(r, 1, m, b.f())
        an.write_formula(r, 2, f"=COUNTIF(tblLanguages[Macroarea],B{R})", b.numfmt("int"))
        for j, c in enumerate(["Living", "Endangered", "Priority"]):
            an.write_formula(r, 3 + j, f"=COUNTIFS(tblLanguages[Macroarea],B{R},tblLanguages[{c}],1)", b.numfmt("int"))
        an.write_formula(r, 6, f"=E{R}/D{R}", b.numfmt("pct"))
        for j, s in enumerate("-+"):
            an.write_formula(r, 7 + j, f"=(G{R}+1.96^2/(2*D{R}){s}1.96*SQRT(G{R}*(1-G{R})/D{R}+1.96^2/(4*D{R}^2)))/(1+1.96^2/D{R})", b.numfmt("pct"))
        an.write_formula(r, 9, f"=INDEX(tblMacroareas[Endangered],MATCH(B{R},tblMacroareas[Macroarea],0))", b.numfmt("int"))
        r += 1
    m1 = r - 1
    r += 1

    an.write(r, 1, "D · Country profile", b.h2); r += 1
    names = sorted(NAMES.get(c["country"], c["country"]) for c in SUM["byCountry"])
    b.list_sheet_range("lstCountries", names)
    sel = b.selector(an, r, 1, "Country", "=lstCountries", "Mexico"); r += 1
    code = f'INDEX(tblCountries[Code],MATCH({sel},tblCountries[Country],0))'
    b.kv(an, r, 1, "ISO code", f"={code}", "text"); cc = f"$C${r + 1}"; r += 1
    for label, fml, kind in [("Languages spoken", f'=COUNTIF(tblLanguages[Country key],"*;"&{cc}&";*")', "int"),
                             ("Living", f'=COUNTIFS(tblLanguages[Country key],"*;"&{cc}&";*",tblLanguages[Living],1)', "int"),
                             ("Endangered", f'=COUNTIFS(tblLanguages[Country key],"*;"&{cc}&";*",tblLanguages[Endangered],1)', "int"),
                             ("Extinct", f'=COUNTIFS(tblLanguages[Country key],"*;"&{cc}&";*",tblLanguages[Extinct],1)', "int"),
                             ("Priority", f'=COUNTIFS(tblLanguages[Country key],"*;"&{cc}&";*",tblLanguages[Priority],1)', "int"),
                             ("Endangered share of living", f'=IFERROR(INDEX(tblCountries[Endangered share],MATCH({cc},tblCountries[Code],0)),"")', "pct"),
                             ("95% interval", f'=IFERROR(TEXT(INDEX(tblCountries[Wilson low],MATCH({cc},tblCountries[Code],0)),"0%")&" – "&TEXT(INDEX(tblCountries[Wilson high],MATCH({cc},tblCountries[Code],0)),"0%"),"")', "text"),
                             ("Rank by endangered languages", f'=COUNTIF(tblCountries[Endangered],">"&INDEX(tblCountries[Endangered],MATCH({cc},tblCountries[Code],0)))+1', "int"),
                             ("In Grambank (of its languages)", f'=COUNTIFS(tblLanguages[Country key],"*;"&{cc}&";*",tblLanguages[In Grambank],1)', "int")]:
        b.kv(an, r, 1, label, fml, kind); r += 1
    r += 1

    an.write(r, 1, "E · How old is the best description? (median year, AGGREGATE)", b.h2); r += 1
    b.header_row(an, r, 1, ["Group", "Languages with a year", "Median MED year", "Median first description"]); r += 1
    for label, cond in [("Not endangered", "(tblLanguages[AES code]=1)"), ("Endangered", "(tblLanguages[Endangered]=1)"), ("Priority", "(tblLanguages[Priority]=1)"), ("Extinct", "(tblLanguages[Extinct]=1)")]:
        an.write(r, 1, label, b.f())
        an.write_formula(r, 2, f'=SUMPRODUCT({cond}*(tblLanguages[MED year]<>""))', b.numfmt("int"))
        an.write_formula(r, 3, f'=AGGREGATE(17,6,tblLanguages[MED year]/({cond}*(tblLanguages[MED year]<>"")),2)', b.numfmt("year"))
        an.write_formula(r, 4, f'=AGGREGATE(17,6,tblLanguages[First description year]/({cond}*(tblLanguages[First description year]<>"")),2)', b.numfmt("year"))
        r += 1
    r += 1
    an.write(r, 1, "F · Coverage by grammar databases", b.h2); r += 1
    b.header_row(an, r, 1, ["Group", "Languages", "In Grambank", "Share", "In WALS", "Share"]); r += 1
    for label, col in [("Living, not endangered", "AES code"), ("Endangered", "Endangered"), ("Priority", "Priority")]:
        cnd = "tblLanguages[AES code],1" if col == "AES code" else f"tblLanguages[{col}],1"
        an.write(r, 1, label, b.f())
        an.write_formula(r, 2, f"=COUNTIFS({cnd})", b.numfmt("int"))
        an.write_formula(r, 3, f"=COUNTIFS({cnd},tblLanguages[In Grambank],1)", b.numfmt("int"))
        an.write_formula(r, 4, f"=D{r + 1}/C{r + 1}", b.numfmt("pct"))
        an.write_formula(r, 5, f"=COUNTIFS({cnd},tblLanguages[In WALS],1)", b.numfmt("int"))
        an.write_formula(r, 6, f"=F{r + 1}/C{r + 1}", b.numfmt("pct"))
        r += 1

    b.title(ch, "Charts", "")
    c1 = b.chart("bar", "stacked", title="Living languages by macroarea: endangered vs not", y_axis={"reverse": True, "major_gridlines": {"visible": False}})
    c1.add_series({"name": "Endangered", "categories": tm.col_range("Macroarea"), "values": tm.col_range("Endangered"), "fill": {"color": COPPER}, "gap": 50})
    c1.add_series({"name": "Not endangered", "categories": tm.col_range("Macroarea"), "values": tm.col_range("Not endangered"), "fill": {"color": "#8FCFC6"}})
    ch.insert_chart("B4", c1)
    c2 = b.chart("column", "stacked", title="Documentation level within each endangerment status", width=820)
    for j, m in enumerate(meds):
        L = chr(ord("C") + j)
        c2.add_series({"name": MED[m], "categories": f"='Analysis'!$B${x0 + 1}:$B${x0 + 7}", "values": f"='Analysis'!${L}${x0 + 1}:${L}${x0 + 7}", "fill": {"color": SERIES[j]}, "gap": 50})
    ch.insert_chart("M4", c2)
    c3 = b.chart("scatter", title="Countries: living languages vs share endangered", x_axis={"name": "Living languages (log)", "log_base": 10}, y_axis={"name": "Share endangered", "num_format": "0%"}, legend={"none": True})
    c3.add_series({"name": "Countries", "categories": tc.col_range("Living"), "values": tc.col_range("Endangered share"),
                   "marker": {"type": "circle", "size": 5, "fill": {"color": ACCENT}, "border": {"color": "#FFFFFF", "width": 0.5}}})
    ch.insert_chart("B23", c3)
    c4 = b.chart("column", title="Share endangered by macroarea with 95% Wilson intervals", legend={"none": True}, y_axis={"num_format": "0%"})
    for i in range(m0, m1 + 1):
        an.write_formula(i, 11, f"=I{i + 1}-G{i + 1}", b.numfmt("pct", font_color="#B7B0A2")); an.write_formula(i, 12, f"=G{i + 1}-H{i + 1}", b.numfmt("pct", font_color="#B7B0A2"))
    c4.add_series({"name": "Share", "categories": f"='Analysis'!$B${m0 + 1}:$B${m1 + 1}", "values": f"='Analysis'!$G${m0 + 1}:$G${m1 + 1}", "fill": {"color": ACCENT}, "gap": 60,
                   "y_error_bars": {"type": "custom", "plus_values": f"='Analysis'!$L${m0 + 1}:$L${m1 + 1}", "minus_values": f"='Analysis'!$M${m0 + 1}:$M${m1 + 1}", "line": {"color": "#3D4A5F"}}})
    ch.insert_chart("M23", c4)

    b.step("Extract", "Download Glottolog 5.4 CLDF (Zenodo), Grambank 1.0.3 and WALS 2020.6 CLDF tables", "curl", "zenodo.org, GitHub releases", "raw/day-005-endangered-languages/", None, "README.md")
    b.step("Transform", "Read CLDF languages.csv and values.csv into language, status, feature and coverage tables", "DuckDB SQL", "CLDF CSV", "dim_language / fact_status / fact_features / fact_coverage .parquet", G["languages"], "scripts/day-005/build.sql")
    b.step("Load", "Summaries by macroarea and country; stop if AES counts disagree with GlottoScope", "Node.js + DuckDB", "parquet", "data/day-005-endangered-languages/summary.json + snapshot.json", G["languages"], "scripts/day-005/snapshot.mjs")
    b.step("Publish", "Decode codes to labels, derive flags as formulas, recompute every aggregate, checks", "Python (XlsxWriter)", "snapshot.json + summary.json", "this workbook", G["languages"], "scripts/excel/days/d005.py")
    b.check("Languages", G["languages"], "=ROWS(tblLanguages[Glottocode])")
    b.check("No duplicate glottocodes", 0, "=ROWS(tblLanguages[Glottocode])-SUMPRODUCT(1/COUNTIF(tblLanguages[Glottocode],tblLanguages[Glottocode]))", 0.001)
    b.check("Endangered (AES 2–5) matches the snapshot", G["endangered"], "=SUM(tblLanguages[Endangered])")
    b.check("Priority languages match the snapshot", G["priority"], "=SUM(tblLanguages[Priority])")
    b.check("AES counts equal GlottoScope (sum of absolute differences)", 0, '=SUMPRODUCT(ABS((tblGlottoScope[Measure]="AES")*tblGlottoScope[Difference]))')
    b.check("Macroarea endangered counts recompute exactly", 0, "=SUMPRODUCT(ABS(COUNTIFS(tblLanguages[Macroarea],tblMacroareas[Macroarea],tblLanguages[Endangered],1)-tblMacroareas[Endangered]))")
    b.check("Country endangered counts recompute exactly (all 244)", 0, "=SUMPRODUCT(ABS(tblCountries[Endangered recomputed]-tblCountries[Endangered]))")
    b.check("Family language counts add up to non-isolates", sum(1 for r in rows if r[2] != "Isolate"), "=SUM(tblFamilies[Languages])")
    b.check("No Grambank value is carried only by endangered languages", S["grambank"]["onlyEndangered"], "=COUNTIF(tblGrambank[Share endangered or extinct],1)")
    b.set_config(cfgMainTable="tblLanguages", cfgPivotRows="Macroarea", cfgPivotCols="AES status", cfgPivotValue="Glottocode", cfgPivotFunc="count")
