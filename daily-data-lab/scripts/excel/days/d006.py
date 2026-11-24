"""Day 006 · Where is the world's food wasted, and by whom? (UNEP Food Waste Index Report 2024, year 2022)"""
import json
import os

from book import Book, Col, Meta, SERIES, COPPER, ACCENT

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
S = json.load(open(os.path.join(ROOT, "data/day-006-food-waste/day-006.json"), encoding="utf-8"))

META = Meta(
    day=6, slug="food-waste", title="Where is the world's food wasted, and by whom?",
    question="How much food do homes, restaurants and shops waste in each country, and does it track income, climate or hunger?",
    summary="UNEP's Food Waste Index Report 2024 estimates for 2022, for all 228 countries and territories in its Annex 3, split into households, "
            "food service and retail, joined with FAOSTAT undernourishment, World Bank region, income group and population, and CCKP mean temperature.",
    captured=S["capturedAt"][:10],
    sources=[
        ("Food Waste Index Report 2024 (Annex 3, household estimates)", "UN Environment Programme (UNEP)", "https://digitallibrary.un.org/record/4042857", "© UNEP; reuse with attribution", "Household kg per person and confidence for 228 countries"),
        ("SDG 12.3.1(b) series AG_FOOD_WST, AG_FOOD_WST_PC", "UN Statistics Division, SDG Global Database", "https://unstats.un.org/sdgs/dataportal", "UN data terms (free reuse with attribution)", "Food service and retail tonnes; world aggregates"),
        ("Food Security Indicators; Food Loss Index (SDG 12.3.1(a))", "FAO, FAOSTAT", "https://www.fao.org/faostat/en/#data/FS", "CC BY 4.0", "Undernourishment 2021–2023; food loss index 2015–2023"),
        ("World Development Indicators; country classification", "World Bank", "https://datatopics.worldbank.org/world-development-indicators/", "CC BY 4.0", "Population 2022, region, income group"),
        ("CRU TS 4.08 climatology 1991–2020", "World Bank Climate Change Knowledge Portal", "https://climateknowledgeportal.worldbank.org/", "CC BY 4.0", "Mean annual temperature per country"),
    ],
    caveats=[
        "Food waste includes inedible parts (bones, peels, shells). It is waste from retail to the plate; losses before retail are the FAO Food Loss Index.",
        "Low and very low confidence household figures are extrapolated by UNEP from countries in the same region and income group, not measured.",
        "27 European countries use Eurostat 2020 food service and retail values (as UNEP did), so country totals sum to 0.04% below the world total.",
        "Correlations are across countries and say nothing about causes. Population here is the World Bank's; UNEP's per-person figures use UN population.",
    ],
)


def build(b: Book):
    C = sorted(S["countries"], key=lambda c: -c["householdKgCap"])  # ranked: no cut-off, every country
    meals = lambda kg, pop: kg * pop * S["assumptions"]["edibleShare"] / S["assumptions"]["mealKg"] / 365
    k = S["kpis"]
    b.meta.findings += [
        f"The world wasted {k['totalMt']:,} Mt of food in 2022: households {k['householdMt']} Mt ({k['householdKgCap']} kg per person), food service {k['foodServiceMt']} Mt, retail {k['retailMt']} Mt.",
        "Household waste per person barely changes with income group; temperature correlates weakly, and less so among measured estimates (Analysis sheet, section D).",
    ]

    an = b.sheet("Analysis", "Live analysis: country profile with a drop-down, regions, income groups, correlations with confidence intervals, Mexico vs the USA.", ACCENT)
    ch = b.sheet("Charts", "Every country ranked, the temperature scatter with its fit, regions by sector, sectors, and the food loss index.", ACCENT)

    t = b.data_table("Data_Countries", "tblCountries", "Countries (228)", "One row per country or territory, ranked by household waste per person. UNEP FWI 2024, year 2022.", [
        Col("Rank household", "int", "Rank by household kg per person among all 228 (1 = most)"),
        Col("ISO3", "text", "ISO 3166-1 alpha-3 code"), Col("ISO2", "text", "ISO 3166-1 alpha-2 code"), Col("Country", "text", "World Bank name (UNEP name for territories)"),
        Col("Region", "text", "World Bank region; 'Not classified' for 13 territories outside the World Bank list"), Col("Income group", "text", "World Bank income group (current classification)"),
        Col("Population", "int", "World Bank population 2022 (UN population implied by UNEP for unclassified territories)", "people"),
        Col("Household kg per person", "int", "UNEP household food waste estimate", "kg/person/year"),
        Col("Food service kg per person", "num1", "Restaurants, canteens, hotels", "kg/person/year"),
        Col("Retail kg per person", "num1", "Shops and markets", "kg/person/year"),
        Col("Total tonnes", "int", "Household + food service + retail", "tonnes/year"),
        Col("Confidence", "text", "UNEP confidence in the household estimate: High, Medium, Low, Very low, or Eurostat (unrated)"),
        Col("Eurostat fill", "bool", "1 = food service and retail from Eurostat 2020 (as UNEP used)"),
        Col("Undernourished pct", "num1", "FAOSTAT prevalence of undernourishment, 2021–2023 average; 2.5 when FAO reports '<2.5'", "% of population"),
        Col("Below FAO floor", "bool", "1 = FAO reports '<2.5'"),
        Col("Undernourished million", "num1", "FAOSTAT number of undernourished people (blank when under 2.5%)", "million people"),
        Col("Mean temp C", "num1", "CRU TS 4.08 mean annual temperature, 1991–2020", "°C"),
        Col("Measured", "int", "1 = UNEP confidence High or Medium (not extrapolated)", formula='=IF(OR([@Confidence]="High",[@Confidence]="Medium"),1,0)'),
        Col("Total kg per person", "num1", "Total tonnes per person", "kg/person/year", formula="=[@[Total tonnes]]*1000/[@Population]"),
        Col("Household share", "pct", "Household tonnes as a share of the country total", formula="=[@[Household kg per person]]*[@Population]/1000/[@[Total tonnes]]"),
        Col("Meals wasted per day", "int", "Edible household waste in meals; assumptions asmEdible and asmMealKg on the Analysis sheet", "meals/day",
            formula="=[@[Household kg per person]]*[@Population]*asmEdible/asmMealKg/365"),
    ], [[i + 1, c["iso3"], c["iso2"], c["name"], c["region"], c["incomeGroup"], c["pop"], c["householdKgCap"], c["foodServiceKgCap"], c["retailKgCap"],
         c["totalT"], c["confidence"], int(c["eurostatFill"]), c["pou"], int(c["pouFloor"]), c["hungryM"], c["tempC"]] for i, c in enumerate(C)])

    grp_cols = lambda what: [
        Col(what, "text", f"World Bank {what.lower()}"), Col("Countries", "int", "Countries and territories in UNEP Annex 3"),
        Col("Population", "int", "UN population implied by UNEP", "people"),
        Col("Household t", "int", "Household food waste", "tonnes"), Col("Food service t", "int", "Food service waste", "tonnes"),
        Col("Retail t", "int", "Retail waste", "tonnes"), Col("Total t", "int", "All three sectors", "tonnes"),
        Col("Household kg per person", "num1", "Household tonnes per person", "kg/person/year"),
        Col("Undernourished million", "num1", "Sum over countries with a FAOSTAT number (countries under 2.5% are not counted)", "million"),
        Col("Meals per day", "int", "Edible household waste in meals per day (UNEP assumptions)", "meals/day"),
        Col("Food service kg per person", "num1", "", "kg/person/year", formula="=[@[Food service t]]*1000/[@Population]"),
        Col("Retail kg per person", "num1", "", "kg/person/year", formula="=[@[Retail t]]*1000/[@Population]"),
        Col("Total kg per person", "num1", "", "kg/person/year", formula="=[@[Total t]]*1000/[@Population]"),
    ]
    grp_rows = lambda gs: [[g["key"], g["countries"], g["pop"], g["householdT"], g["foodServiceT"], g["retailT"], g["totalT"], g["householdKgCap"], g["hungryM"], g["mealsPerDay"]] for g in gs]
    regions = sorted(S["byRegion"], key=lambda g: -g["totalT"] / g["pop"])
    tr = b.data_table("Data_Regions", "tblRegions", "Regions", "UNEP totals over every country in each World Bank region (adds up to the world).", grp_cols("Region"), grp_rows(regions))
    order = ["Low income", "Lower middle income", "Upper middle income", "High income", "Not classified"]
    inc = sorted(S["byIncome"], key=lambda g: order.index(g["key"]) if g["key"] in order else 9)
    ti = b.data_table("Data_Income", "tblIncome", "Income groups", "UNEP totals by World Bank income group.", grp_cols("Income group"), grp_rows(inc))
    ts = b.data_table("Data_Sectors", "tblSectors", "Sectors (world)", "UNEP world aggregates by sector, 2022.", [
        Col("Sector", "text", "Households, food service or retail"), Col("Tonnes", "int", "World food waste", "tonnes"), Col("Kg per person", "num1", "World per person", "kg/person/year"),
        Col("Share", "pct", "Share of world food waste", formula="=[@Tonnes]/SUM([Tonnes])")], [[{"household": "Households", "foodService": "Food service", "retail": "Retail"}[s["key"]], s["t"], s["kgCap"]] for s in S["bySector"]])
    tc = b.data_table("Data_Confidence", "tblConfidence", "Confidence of household estimates", "How many of the 228 countries have each UNEP confidence rating.", [
        Col("Confidence", "text", "UNEP rating"), Col("Countries", "int", "Number of countries"), Col("Household tonnes", "int", "Household waste in those countries", "tonnes"),
        Col("Share of countries", "pct", "", formula="=[@Countries]/SUM([Countries])"), Col("Share of household tonnes", "pct", "", formula="=[@[Household tonnes]]/SUM([Household tonnes])")],
        [[c["key"], c["countries"], c["householdT"]] for c in S["confidence"]])
    prod = {"ALP": "All products", "FRT_VGT": "Fruits & vegetables", "ANMPROD": "Animal products", "CRL_PUL": "Cereals & pulses", "RT_TBR": "Roots & tubers"}
    tf = b.data_table("Data_FoodLoss", "tblFoodLoss", "FAO Food Loss Index (world)", "Food lost from harvest up to (not including) retail. Index 2015 = 100.", [
        Col("Year", "year", ""), Col("Product code", "text", "FAO product group code"), Col("Product", "text", "Product group"),
        Col("Index 2015 is 100", "num1", "FAO Food Loss Index", "index"), Col("Loss pct", "num1", "Share of food lost (all products only)", "%")],
        [[f["year"], f["product"], prod.get(f["product"], f["product"]), f["index"], f["lossPct"]] for f in S["foodLossIndex"]])

    # ------------------------------------------------------------ Analysis
    an.set_column("B:B", 30); an.set_column("C:C", 16); an.set_column("D:D", 46); an.set_column("E:K", 14)
    b.title(an, "Analysis", "Everything below is a formula over the data sheets. Change the yellow cells.")
    r = 3
    an.write(r, 1, "A · Assumptions and world figures (UNEP)", b.h2); r += 1
    b.kv(an, r, 1, "Edible share of household waste", S["assumptions"]["edibleShare"], "pct", "UNEP's conservative assumption (FWI 2024, ch. 2.6)")
    an.write(r, 2, S["assumptions"]["edibleShare"], b.input); b.wb.define_name("asmEdible", f"='Analysis'!$C${r + 1}"); r += 1
    b.kv(an, r, 1, "Meal weight (kg)", S["assumptions"]["mealKg"], "num", "UNEP assumption")
    an.write(r, 2, S["assumptions"]["mealKg"], b.input); b.wb.define_name("asmMealKg", f"='Analysis'!$C${r + 1}"); r += 1
    b.kv(an, r, 1, "World food waste (Mt)", k["totalMt"], "num1", "UNEP published aggregate"); b.wb.define_name("wldTotalMt", f"='Analysis'!$C${r + 1}"); r += 1
    b.kv(an, r, 1, "Sum of the 228 countries (Mt)", "=SUM(tblCountries[Total tonnes])/1e6", "num1", "Reconstruction from country rows"); r += 1
    b.kv(an, r, 1, "Gap vs world", f"=C{r}/wldTotalMt-1", "pct", "Eurostat fill for 27 European countries"); r += 1
    b.kv(an, r, 1, "World household kg per person", k["householdKgCap"], "num1", "UNEP"); b.wb.define_name("wldHhKg", f"='Analysis'!$C${r + 1}"); r += 1
    b.kv(an, r, 1, "Share of consumer food wasted", k["pctWasted"], "pct", "World total vs 5.5 billion t available (FAOSTAT 2020), as UNEP does"); r += 1
    b.kv(an, r, 1, "Household meals wasted per day", "=SUM(tblCountries[Meals wasted per day])", "int", "Recomputes with the assumptions above"); r += 1
    b.kv(an, r, 1, "Undernourished people (million)", k["hungryPeopleM"], "num1", "FAOSTAT world, 2021–2023"); r += 2

    an.write(r, 1, "B · Country profile", b.h2); r += 1
    names = sorted(c["name"] for c in C)
    b.list_sheet_range("lstCountries", names)
    sel = b.selector(an, r, 1, "Country", "=lstCountries", "Mexico", "Pick any of the 228 countries"); r += 1
    m = lambda col: f'INDEX(tblCountries[{col}],MATCH({sel},tblCountries[Country],0))'
    prof = [("Region", f"={m('Region')}", "text", ""), ("Income group", f"={m('Income group')}", "text", ""), ("Population", f"={m('Population')}", "int", ""),
            ("Household kg per person", f"={m('[Household kg per person]')}", "int", ""), ("Food service kg per person", f"={m('[Food service kg per person]')}", "num1", ""),
            ("Retail kg per person", f"={m('[Retail kg per person]')}", "num1", ""), ("Total (Mt)", f"={m('[Total tonnes]')}/1e6", "num3", ""),
            ("Confidence", f"={m('Confidence')}", "text", "Low and Very low are extrapolated"),
            ("Rank (household, of 228)", f"=COUNTIF(tblCountries[Household kg per person],\">\"&C{r + 4})+1", "int", "1 = most waste per person"),
            ("Rank within its region", f'=COUNTIFS(tblCountries[Region],C{r + 1},tblCountries[Household kg per person],">"&C{r + 4})+1', "int", ""),
            ("Countries in its region", f'=COUNTIF(tblCountries[Region],C{r + 1})', "int", ""),
            ("Region household kg per person", f'=IFERROR(INDEX(tblRegions[Household kg per person],MATCH(C{r + 1},tblRegions[Region],0)),"")', "num1", "UNEP region total ÷ population"),
            ("Difference vs world (kg)", f"=C{r + 4}-wldHhKg", "num1", "Positive = wastes more at home than the world average"),
            ("Household meals wasted per day", f"={m('[Meals wasted per day]')}", "int", ""),
            ("Undernourished (% of population)", f'=IF({m("[Undernourished pct]")}="","no estimate",{m("[Undernourished pct]")})', "num1", "2.5 = FAO floor ('<2.5')"),
            ("Mean temperature (°C)", f"={m('[Mean temp C]')}", "num1", "")]
    for label, fml, kind, note in prof:
        b.kv(an, r, 1, label, fml, kind, note); r += 1
    r += 1

    an.write(r, 1, "C · Regions: recomputed from the country rows vs UNEP's region totals", b.h2); r += 1
    hdr = ["Region", "Countries", "Total Mt (countries)", "Total Mt (UNEP)", "Difference", "Household kg/person", "Measured share", "Mean temp °C"]
    b.header_row(an, r, 1, hdr); r += 1
    r0 = r
    for g in regions:
        an.write(r, 1, g["key"], b.f())
        an.write_formula(r, 2, f'=COUNTIF(tblCountries[Region],B{r + 1})', b.numfmt("int"))
        an.write_formula(r, 3, f'=SUMIFS(tblCountries[Total tonnes],tblCountries[Region],B{r + 1})/1e6', b.numfmt("num1"))
        an.write_formula(r, 4, f'=INDEX(tblRegions[Total t],MATCH(B{r + 1},tblRegions[Region],0))/1e6', b.numfmt("num1"))
        an.write_formula(r, 5, f"=D{r + 1}-E{r + 1}", b.numfmt("num1"))
        an.write_formula(r, 6, f'=INDEX(tblRegions[Household kg per person],MATCH(B{r + 1},tblRegions[Region],0))', b.numfmt("num1"))
        an.write_formula(r, 7, f'=COUNTIFS(tblCountries[Region],B{r + 1},tblCountries[Measured],1)/C{r + 1}', b.numfmt("pct"))
        an.write_formula(r, 8, f'=IFERROR(AVERAGEIFS(tblCountries[Mean temp C],tblCountries[Region],B{r + 1}),"")', b.numfmt("num1"))
        r += 1
    an.conditional_format(r0, 6, r - 1, 6, {"type": "data_bar", "bar_color": "#8FCFC6", "bar_solid": True})
    r += 1

    an.write(r, 1, "D · Is household waste related to temperature or hunger?", b.h2); r += 1
    an.write(r, 1, "Pearson r with a Fisher-z 95% interval. 'Measured' keeps only High and Medium confidence estimates (array formulas).", b.muted); r += 1
    b.header_row(an, r, 1, ["Pair", "Sample", "n", "r", "95% CI low", "95% CI high", "Slope (kg per unit)", "R²"]); r += 1
    kg, tmp, pou, meas = "tblCountries[Household kg per person]", "tblCountries[Mean temp C]", "tblCountries[Undernourished pct]", "tblCountries[Measured]"
    for label, x in [("Temperature (°C)", tmp), ("Undernourished (%)", pou)]:
        for sample, cond in [("All countries", None), ("Measured only", meas)]:
            an.write(r, 1, label, b.f()); an.write(r, 2, sample, b.f())
            if cond:
                an.write_formula(r, 3, f'=COUNTIFS({x},"<>",{cond},1)', b.numfmt("int"))
                an.write_array_formula(r, 4, r, 4, f'{{=CORREL(IF({cond}=1,IF({x}<>"",{x})),IF({cond}=1,IF({x}<>"",{kg})))}}', b.numfmt("r"))
                an.write_array_formula(r, 7, r, 7, f'{{=SLOPE(IF({cond}=1,IF({x}<>"",{kg})),IF({cond}=1,IF({x}<>"",{x})))}}', b.numfmt("num"))
            else:
                an.write_formula(r, 3, f'=COUNT({x})', b.numfmt("int"))
                an.write_formula(r, 4, f'=CORREL({x},{kg})', b.numfmt("r"))
                an.write_formula(r, 7, f'=SLOPE({kg},{x})', b.numfmt("num"))
            an.write_formula(r, 5, f"=TANH(ATANH(E{r + 1})-1.96/SQRT(D{r + 1}-3))", b.numfmt("r"))
            an.write_formula(r, 6, f"=TANH(ATANH(E{r + 1})+1.96/SQRT(D{r + 1}-3))", b.numfmt("r"))
            an.write_formula(r, 8, f"=E{r + 1}^2", b.numfmt("r"))
            r += 1
    an.write(r, 1, "Reading: the interval for 'measured only' is wider (fewer countries); if it contains 0, the data cannot rule out no relationship.", b.muted); r += 2

    an.write(r, 1, "E · Mexico and the United States", b.h2); r += 1
    b.header_row(an, r, 1, ["Measure", "Mexico", "United States", "Mexico ÷ USA"]); r += 1
    for label, col, kind in [("Household kg per person", "[Household kg per person]", "num1"), ("Food service kg per person", "[Food service kg per person]", "num1"),
                             ("Retail kg per person", "[Retail kg per person]", "num1"), ("Total Mt", "[Total tonnes]", "num3"), ("Rank household (of 228)", "[Rank household]", "int")]:
        an.write(r, 1, label, b.f())
        for j, iso in enumerate(["MEX", "USA"]):
            div = "/1e6" if label == "Total Mt" else ""
            an.write_formula(r, 2 + j, f'=INDEX(tblCountries[{col}],MATCH("{iso}",tblCountries[ISO3],0)){div}', b.numfmt(kind))
        an.write_formula(r, 4, f"=C{r + 1}/D{r + 1}", b.numfmt("num"))
        r += 1
    r += 1

    an.write(r, 1, "F · Food loss index (world): wide view for charts", b.h2); r += 1
    years = sorted({f["year"] for f in S["foodLossIndex"]})
    b.header_row(an, r, 1, ["Year"] + list(prod.values())); r += 1
    fl0 = r
    for y in years:
        an.write(r, 1, y, b.numfmt("year"))
        for j, code in enumerate(prod):
            an.write_formula(r, 2 + j, f'=IFERROR(1/(1/SUMIFS(tblFoodLoss[Index 2015 is 100],tblFoodLoss[Year],$B{r + 1},tblFoodLoss[Product code],"{code}")),NA())', b.numfmt("num1"))
        r += 1
    fl1 = r - 1

    # ------------------------------------------------------------ Charts
    b.title(ch, "Charts", "Native Excel charts: click a chart to see the ranges it reads.")
    c1 = b.chart("bar", title="Household food waste per person, all 228 countries (kg/person/year)", legend={"none": True}, height=max(600, 16 * len(C)), width=640,
                 y_axis={"reverse": True, "num_font": {"size": 7}, "major_gridlines": {"visible": False}}, x_axis={"major_gridlines": {"visible": True, "line": {"color": "#ECE8E0"}}})
    c1.add_series({"name": "Household kg per person", "categories": t.col_range("Country"), "values": t.col_range("Household kg per person"),
                   "fill": {"color": SERIES[0]}, "gap": 40})
    ch.insert_chart("B4", c1)
    c2 = b.chart("scatter", title="Household waste vs mean temperature, with linear fit", x_axis={"name": "Mean annual temperature (°C)"}, y_axis={"name": "Household kg/person/year"}, legend={"none": True})
    c2.add_series({"name": "Countries", "categories": t.col_range("Mean temp C"), "values": t.col_range("Household kg per person"),
                   "marker": {"type": "circle", "size": 5, "fill": {"color": SERIES[0]}, "border": {"color": "#FFFFFF", "width": 0.5}},
                   "trendline": {"type": "linear", "display_equation": True, "display_r_squared": True, "line": {"color": COPPER, "width": 1.5}}})
    ch.insert_chart("L4", c2)
    c3 = b.chart("bar", "stacked", title="Food waste per person by region and sector (kg/person/year)", y_axis={"reverse": True, "major_gridlines": {"visible": False}})
    for i, (col, nm) in enumerate([("Household kg per person", "Households"), ("Food service kg per person", "Food service"), ("Retail kg per person", "Retail")]):
        c3.add_series({"name": nm, "categories": tr.col_range("Region"), "values": tr.col_range(col), "fill": {"color": SERIES[i]}, "gap": 50})
    ch.insert_chart("L23", c3)
    c4 = b.chart("doughnut", title="World food waste by sector, 2022")
    c4.add_series({"name": "Tonnes", "categories": ts.col_range("Sector"), "values": ts.col_range("Tonnes"),
                   "points": [{"fill": {"color": SERIES[i]}} for i in range(3)], "data_labels": {"percentage": True}})
    c4.set_hole_size(55)
    ch.insert_chart("L42", c4, {"x_scale": 0.7, "y_scale": 1})
    c5 = b.chart("line", title="FAO Food Loss Index by product group (2015 = 100)", y_axis={"name": "Index"})
    for j, nm in enumerate(prod.values()):
        L = chr(ord("C") + j)
        c5.add_series({"name": nm, "categories": f"='Analysis'!$B${fl0 + 1}:$B${fl1 + 1}", "values": f"='Analysis'!${L}${fl0 + 1}:${L}${fl1 + 1}",
                       "line": {"color": SERIES[j], "width": 2.5 if j == 0 else 1.5}, "marker": {"type": "circle", "size": 4, "fill": {"color": SERIES[j]}, "border": {"color": "#FFFFFF", "width": 0.5}}})
    ch.insert_chart("L61", c5)
    c6 = b.chart("column", "stacked", title="Food waste per person by income group (kg/person/year)")
    for i, (col, nm) in enumerate([("Household kg per person", "Households"), ("Food service kg per person", "Food service"), ("Retail kg per person", "Retail")]):
        c6.add_series({"name": nm, "categories": ti.col_range("Income group"), "values": ti.col_range(col), "fill": {"color": SERIES[i]}, "gap": 60})
    ch.insert_chart("L80", c6)

    # ------------------------------------------------------------ Pipeline and checks
    b.step("Extract", "Download UN SDG series, UNEP report PDF, FAOSTAT bulk, World Bank API, CCKP API, UNSD M49 table", "curl (shell)", "Public URLs (no keys)", "raw/day-006-food-waste/*", None, "scripts/day-006/fetch.sh")
    b.step("Extract", "Parse the UNEP report's Annex 3 (household estimates) from the PDF text; stop unless it sums to 630.96 Mt", "Python", "fwi2024.pdf text", "unep_annex3_household.csv", 228, "scripts/day-006/annex3.py")
    b.step("Transform", "Join Annex 3 with SDG food service and retail, Eurostat fill, FAOSTAT, World Bank, CCKP by M49 / ISO3", "DuckDB SQL", "raw CSV / JSON", "country.parquet", 228, "scripts/day-006/build.sql")
    b.step("Load", "Aggregate regions, income groups, sectors, confidence, food loss index; stop if world totals differ from UNEP", "Node.js + DuckDB", "country.parquet", "data/day-006-food-waste/day-006.json", len(C), "scripts/day-006/snapshot.mjs")
    b.step("Publish", "Build this workbook: typed tables, formulas, charts, checks, VBA", "Python (XlsxWriter)", "day-006.json", "this workbook", len(C), "scripts/excel/days/d006.py")
    b.check("Countries in the table", 228, "=ROWS(tblCountries[ISO3])")
    b.check("Distinct ISO3 codes (no duplicates)", 228, "=SUMPRODUCT(1/COUNTIF(tblCountries[ISO3],tblCountries[ISO3]))", 0.001)
    b.check("Country totals sum to UNEP world total (Mt, ±0.5%)", k["totalMt"], "=SUM(tblCountries[Total tonnes])/1e6", round(k["totalMt"] * 0.005, 2))
    b.check("Region totals sum to UNEP world total (Mt, ±0.5%)", k["totalMt"], "=SUM(tblRegions[Total t])/1e6", round(k["totalMt"] * 0.005, 2))
    b.check("Income-group totals sum to the region totals (Mt)", 0, "=(SUM(tblIncome[Total t])-SUM(tblRegions[Total t]))/1e6", 0.01)
    b.check("Sector tonnes sum to the world total (Mt)", k["totalMt"], "=SUM(tblSectors[Tonnes])/1e6", 0.1)
    b.check("Countries per region add up to 228", 228, "=SUM(tblRegions[Countries])")
    b.check("Countries per confidence rating add up to 228", 228, "=SUM(tblConfidence[Countries])")
    b.check("No negative household values", 0, '=COUNTIF(tblCountries[Household kg per person],"<0")')
    b.check("Mexico household kg per person (UNEP: 105)", 105, '=INDEX(tblCountries[Household kg per person],MATCH("MEX",tblCountries[ISO3],0))')
    b.check("United States household kg per person (UNEP: 73)", 73, '=INDEX(tblCountries[Household kg per person],MATCH("USA",tblCountries[ISO3],0))')
    b.check("World household meals per day (billion, UNEP assumptions)", round(k["mealsPerDay"] / 1e9, 2), "=SUM(tblRegions[Meals per day])/1e9", 0.02,
            "UNEP population; the country table's Meals column uses World Bank population and follows the Analysis assumptions")
    b.set_config(cfgMainTable="tblCountries", cfgPivotRows="Region", cfgPivotCols="Confidence", cfgPivotValue="Total tonnes")
