import { useMemo, useState } from "react";
import { useLanguage } from "../../language.jsx";
import {
  type Country, type Group,
  ASSUMPTIONS, BY_INCOME, BY_REGION, BY_SECTOR, CAPTURED_AT, CONFIDENCES, CONFIDENCE_ALL, COUNTRIES, FLI, HIGHLIGHT, INCOMES, KPIS, REGIONS, SECTOR_COLOR,
  confColor, isMeasured, mealsPerDay, ols, pearson,
} from "./data";
import { type BarRow, BarChartCard, DonutCard, LineChartCard, ScatterCard } from "./Charts";
import { DataTable, FoodFacts, KpiCard, cName, confName, incomeName, regionName } from "./Panels";
import { tr, num, pct, fmtDate, mt } from "./text";
import { FoodWasteQuality, FoodWasteQuestions, FoodWasteSources } from "./Research";

const SECTORS = ["household", "foodService", "retail"] as const;
const SECTOR_EN = { household: "Households", foodService: "Food service", retail: "Retail" };
const SEG_COLORS = SECTORS.map((s) => SECTOR_COLOR[s]);
const PRODUCTS: [string, string, string][] = [["ALP", "prodAll", "All products"], ["FRT_VGT", "prodFruit", "Fruits & vegetables"], ["ANMPROD", "prodAnimal", "Animal products"], ["CRL_PUL", "prodCereal", "Cereals & pulses"], ["RT_TBR", "prodRoots", "Roots & tubers"]];
const fmtR = (r: number, language: string) => (Number.isFinite(r) ? r.toLocaleString(language === "es" ? "es-MX" : language, { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : "—");

export default function FoodWasteDay() {
  const language: string = useLanguage();
  const [region, setRegion] = useState<string>("all");
  const [countryId, setCountryId] = useState<string>("");

  const world = region === "all";
  const list = useMemo(() => COUNTRIES.filter((c) => world || c.region === region), [region]);
  // Country filter: any country in the selected region (or the world). Choosing a region clears a country outside it.
  const country = countryId ? list.find((c) => c.iso3 === countryId) ?? null : null;
  const countryOptions = useMemo(() => [...list].sort((a, b) => cName(a, language).localeCompare(cName(b, language), language)), [list, language]);
  const isOn = (iso3: string) => HIGHLIGHT.has(iso3) || iso3 === country?.iso3;
  const pickRegion = (r: string) => { setRegion(r); if (country && r !== "all" && country.region !== r) setCountryId(""); };
  const group: Group | null = world ? null : BY_REGION.find((g) => g.key === region) ?? null;
  const scopeName = world ? tr(language, "world", "World") : regionName(region, language);
  const sName = (k: (typeof SECTORS)[number]) => tr(language, `sector_${k}`, SECTOR_EN[k]);

  // KPIs: the selected country, UNEP world aggregates, or the region's totals over every country UNEP covers there.
  const k = country
    ? { totalMt: country.totalT / 1e6, hhKg: country.householdKgCap, meals: mealsPerDay((country.householdKgCap * country.pop) / 1000), hungry: country.hungryM, countries: 1 }
    : world
      ? { totalMt: KPIS.totalMt, hhKg: KPIS.householdKgCap, meals: KPIS.mealsPerDay, hungry: KPIS.hungryPeopleM as number | null, countries: COUNTRIES.length }
      : { totalMt: group!.totalT / 1e6, hhKg: group!.householdKgCap, meals: group!.mealsPerDay, hungry: group!.hungryM ?? 0, countries: group!.countries };
  const kScope = country ? cName(country, language) : scopeName;

  // Rankings: every country in view, no cut-off. The chart scrolls inside its card and jumps to the selected country.
  const ranked = (key: "householdKgCap" | "totalT") => {
    const sorted = [...list].sort((a, b) => b[key] - a[key]);
    return { rows: sorted, rank: new Map(sorted.map((c, i) => [c.iso3, i + 1])) };
  };
  const byKg = ranked("householdKgCap"), byT = ranked("totalT");
  const kgRows: BarRow[] = byKg.rows.map((c) => ({
    id: c.iso3, label: `${byKg.rank.get(c.iso3)}. ${cName(c, language)}`, segments: [c.householdKgCap], highlight: isOn(c.iso3), faded: !isMeasured(c) && c.confidence !== "Eurostat",
    readout: tr(language, "kgReadout", "{name}: {kg} kg per person a year at home · {conf} confidence", { name: cName(c, language), kg: num(c.householdKgCap, language), conf: confName(c.confidence, language) }),
  }));
  const tRows: BarRow[] = byT.rows.map((c) => {
    const pop = c.pop;
    const seg = [c.householdKgCap * pop, (c.foodServiceKgCap ?? 0) * pop, (c.retailKgCap ?? 0) * pop];
    const scale = c.totalT / (seg.reduce((a, b) => a + b, 0) || 1); // keep UNEP's totals; split by sector shares
    return {
      id: c.iso3, label: `${byT.rank.get(c.iso3)}. ${cName(c, language)}`, segments: seg.map((v) => v * scale), highlight: isOn(c.iso3),
      readout: tr(language, "tReadout", "{name}: {t} Mt a year · households {hh}%, food service {fs}%, retail {rt}%", {
        name: cName(c, language), t: mt(c.totalT, language),
        hh: Math.round((seg[0] / (seg[0] + seg[1] + seg[2])) * 100), fs: Math.round((seg[1] / (seg[0] + seg[1] + seg[2])) * 100), rt: Math.round((seg[2] / (seg[0] + seg[1] + seg[2])) * 100),
      }),
    };
  });

  // Sector donut: world from UNEP, or the region's sums.
  const sectorT = world ? BY_SECTOR.map((s) => s.t) : [group!.householdT, group!.foodServiceT, group!.retailT];
  const sectorTotal = sectorT.reduce((a, b) => a + b, 0);

  // Group bars, in kg per person per sector.
  const groupRows = (groups: Group[], name: (k: string) => string, order?: string[]): BarRow[] =>
    (order ? order.map((k) => groups.find((g) => g.key === k)!).filter(Boolean) : groups.filter((g) => g.key !== "Not classified"))
      .map((g) => {
        const seg = [g.householdT, g.foodServiceT, g.retailT].map((t) => (t * 1000) / g.pop); // kg per person
        return {
          id: g.key, label: name(g.key), segments: seg, highlight: !world && g.key === region,
          readout: tr(language, "groupReadout", "{name}: {kg} kg per person a year (households {hh}, food service {fs}, retail {rt}) · {n} countries", {
            name: name(g.key), kg: num(seg[0] + seg[1] + seg[2], language), hh: num(seg[0], language), fs: num(seg[1], language), rt: num(seg[2], language), n: g.countries,
          }),
        };
      });
  const incomeRows = groupRows(BY_INCOME, (key) => incomeName(key, language), INCOMES);
  const regionRows = groupRows(BY_REGION, (key) => regionName(key, language)).sort((a, b) => b.segments.reduce((x, y) => x + y) - a.segments.reduce((x, y) => x + y));

  // Scatters with Pearson r for all countries and for measured estimates only.
  const fit = (pts: Country[], x: (c: Country) => number | null) => {
    const ok = pts.filter((c) => x(c) != null);
    const xs = ok.map((c) => x(c)!), ys = ok.map((c) => c.householdKgCap);
    return { ...pearson(xs, ys), line: ok.length >= 4 ? ols(xs, ys) : null };
  };
  const tAll = fit(list, (c) => c.tempC), tM = fit(list.filter(isMeasured), (c) => c.tempC);
  const pAll = fit(list, (c) => c.pou), pM = fit(list.filter(isMeasured), (c) => c.pou);
  const point = (c: Country, x: number, xr: string) => ({
    id: c.iso3, label: cName(c, language), x, y: c.householdKgCap, color: isOn(c.iso3) ? "var(--copper)" : confColor(c.confidence),
    measured: isMeasured(c) || c.confidence === "Eurostat", highlight: isOn(c.iso3),
    readout: `${cName(c, language)}: ${num(c.householdKgCap, language)} kg · ${xr} · ${confName(c.confidence, language)}`,
  });
  const fits = (all: typeof tAll, m: typeof tM) => [
    ...(all.line ? [{ ...all.line, label: tr(language, "fitAll", "All, r = {r}", { r: fmtR(all.r, language) }) }] : []),
    ...(m.line ? [{ ...m.line, dashed: true, label: tr(language, "fitMeasured", "Measured only, r = {r}", { r: fmtR(m.r, language) }) }] : []),
  ];
  const confLegend = CONFIDENCES.map((c) => ({ label: confName(c, language), color: confColor(c) }));
  const tempPts = list.filter((c) => c.tempC != null).map((c) => point(c, c.tempC!, `${num(c.tempC!, language, 1)} °C`));
  const pouPts = list.filter((c) => c.pou != null).map((c) => point(c, c.pou!, `${c.pouFloor ? "<2.5" : num(c.pou!, language, 1)}% ${tr(language, "undernourished", "undernourished")}`));
  const tDom: [number, number] = [Math.floor(Math.min(-6, ...tempPts.map((p) => p.x))), Math.ceil(Math.max(30, ...tempPts.map((p) => p.x)))];
  const pDom: [number, number] = [0, Math.ceil(Math.max(20, ...pouPts.map((p) => p.x)) / 10) * 10];

  // Confidence donut over the countries in view.
  const confCounts = CONFIDENCES.map((c) => ({ c, n: list.filter((x) => x.confidence === c).length }));
  const measuredShare = list.length ? list.filter(isMeasured).length / list.length : 0;

  // Takeaways and research values, recomputed from the bundled data.
  const inc = (key: string) => BY_INCOME.find((g) => g.key === key)!;
  const mex = COUNTRIES.find((c) => c.iso3 === "MEX")!, usa = COUNTRIES.find((c) => c.iso3 === "USA")!;
  const allC = { t: fit(COUNTRIES, (c) => c.tempC), tm: fit(COUNTRIES.filter(isMeasured), (c) => c.tempC), p: fit(COUNTRIES, (c) => c.pou), pm: fit(COUNTRIES.filter(isMeasured), (c) => c.pou) };
  const fli = FLI.filter((f) => f.product === "ALP");
  const lossFirst = fli[0], lossLast = fli[fli.length - 1];
  const topMeasured = [...COUNTRIES].filter(isMeasured).sort((a, b) => b.householdKgCap - a.householdKgCap)[0];
  const confAll = Object.fromEntries(CONFIDENCE_ALL.map((c) => [c.key, c.countries]));
  const conf100 = (c: string) => COUNTRIES.filter((x) => x.confidence === c).length;

  return (
    <div className="viz fw">
      {/* Controls: one global filter */}
      <div className="controls" role="group" aria-label={tr(language, "controlsAria", "Filter the dashboard by region")}>
        <label className="select">
          <span className="mono">{tr(language, "region", "Region")}</span>
          <select value={region} onChange={(e) => pickRegion(e.target.value)}>
            <option value="all">{tr(language, "world", "World")}</option>
            {REGIONS.map((r) => <option key={r} value={r}>{regionName(r, language)}</option>)}
          </select>
        </label>
        <label className="select">
          <span className="mono">{tr(language, "country", "Country")}</span>
          <select value={country?.iso3 ?? ""} onChange={(e) => setCountryId(e.target.value)}>
            <option value="">{tr(language, "allCountries", "All countries ({n})", { n: list.length })}</option>
            {countryOptions.map((c) => <option key={c.iso3} value={c.iso3}>{cName(c, language)}</option>)}
          </select>
        </label>
        <p className="muted fw-scope">{tr(language, "scopeNote", "{n} of {all} countries in view. Mexico, the United States and the country you pick are highlighted in copper.", { n: list.length, all: COUNTRIES.length })}</p>
        {(!world || country) && <button type="button" className="gw-reset" onClick={() => { setRegion("all"); setCountryId(""); }}>{tr(language, "reset", "Reset")}</button>}
      </div>

      {/* Key numbers */}
      <section className="stats fw-stats" aria-label={tr(language, "statsAria", "Key numbers for {scope}", { scope: kScope })}>
        <KpiCard accent label={tr(language, "kpiTotal", "Food wasted, 2022")} value={k.totalMt < 1 ? `${num(k.totalMt * 1000, language, k.totalMt < 0.01 ? 1 : 0)} kt` : `${num(k.totalMt, language, k.totalMt < 100 ? 1 : 0)} Mt`}
          note={country ? tr(language, "kpiTotalNoteCountry", "households, food service and retail · {scope}", { scope: kScope }) : tr(language, "kpiTotalNote", "households, food service and retail · {scope}, {n} countries", { scope: kScope, n: k.countries })} />
        <KpiCard label={tr(language, "kpiPct", "Share of consumer food wasted")} value={pct(KPIS.pctWasted, language)}
          note={tr(language, "kpiPctNote", "world: {t} Mt of {c} billion t available (UNEP)", { t: num(KPIS.totalMt, language), c: num(ASSUMPTIONS.consumerFoodT / 1e9, language, 1) })} />
        <KpiCard label={tr(language, "kpiHh", "Wasted at home per person")} value={`${num(k.hhKg, language)} kg`}
          note={tr(language, "kpiHhNote", "a year · {w} kg a week", { w: num(k.hhKg / 52, language, 1) })} />
        <KpiCard label={tr(language, "kpiMeals", "Meals wasted at home per day")} value={k.meals < 1e6 ? num(Math.round(k.meals / 100) * 100, language) : tr(language, "kpiMealsValue", "{n} M", { n: num(k.meals / 1e6, language, k.meals < 1e7 ? 1 : 0) })}
          note={tr(language, "kpiMealsNote", "if {e} is edible and a meal weighs {g} g", { e: pct(ASSUMPTIONS.edibleShare, language), g: ASSUMPTIONS.mealKg * 1000 })} />
        <KpiCard label={tr(language, "kpiHungry", "Undernourished people")} value={k.hungry == null ? "—" : tr(language, "kpiMealsValue", "{n} M", { n: num(k.hungry, language, country && k.hungry < 10 ? 1 : 0) })}
          note={country
            ? (country.pouFloor ? tr(language, "kpiHungryNoteFloor", "under 2.5% of the population (FAO floor)") : country.pou == null ? tr(language, "kpiHungryNoteNone", "no FAOSTAT estimate") : tr(language, "kpiHungryNoteCountry", "{p}% of the population, FAOSTAT 2021–2023", { p: num(country.pou, language, 1) }))
            : world ? tr(language, "kpiHungryNote", "FAOSTAT, 2021–2023 average") : tr(language, "kpiHungryNoteRegion", "at least; countries under 2.5% are not counted")} />
      </section>

      <FoodFacts list={list} mealsPerDay={k.meals} incomeKg={{ hi: inc("High income").householdKgCap, lmi: inc("Lower middle income").householdKgCap }} language={language} />

      <div className="fw-grid">
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "kgTitle", "Who wastes the most at home, per person?")}</h2>
            <p className="muted">{tr(language, "kgSub", "All {n} countries in {scope}, kg per person a year; scroll the chart to see them all. Faded bars are extrapolated (low or very low confidence).", { n: list.length, scope: scopeName })}</p>
          </div></div>
          <BarChartCard rows={kgRows} colors={["var(--fw-s0)"]} scroll focusId={country?.iso3} fmt={(v) => `${num(v, language)} kg`}
            ariaLabel={tr(language, "kgAria", "Household food waste per person, all countries in view")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")} />
        </section>
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "tTitle", "Where the most food is wasted in total")}</h2>
            <p className="muted">{tr(language, "tSub", "All {n} countries in {scope}, million tonnes a year, split by sector; scroll the chart to see them all.", { n: list.length, scope: scopeName })}</p>
          </div></div>
          <BarChartCard rows={tRows} colors={SEG_COLORS} legend={SECTORS.map(sName)} scroll focusId={country?.iso3} fmt={(v) => `${mt(v, language)} Mt`}
            ariaLabel={tr(language, "tAria", "Total food waste by country and sector, all countries in view")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")} />
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "sectorTitle", "Which sector wastes most?")}</h2>
            <p className="muted">{tr(language, "sectorSub", "{scope}, share of tonnes wasted in 2022.", { scope: scopeName })}</p>
          </div></div>
          <DonutCard center={`${num(sectorTotal / 1e6, language)} Mt`} centerNote={scopeName}
            slices={SECTORS.map((s, i) => ({ key: s, label: sName(s), value: sectorT[i], color: SEG_COLORS[i], readout: `${sName(s)}: ${mt(sectorT[i], language)} Mt (${pct(sectorT[i] / sectorTotal, language)})` }))}
            ariaLabel={tr(language, "sectorAria", "Food waste by sector")} hint={tr(language, "donutHint", "Hover or focus a slice to read it.")} />
        </section>
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "confTitle", "How sure are the estimates?")}</h2>
            <p className="muted">{tr(language, "confSub", "UNEP confidence in each household estimate, {n} countries in view. Low and very low are extrapolated from similar countries.", { n: list.length })}</p>
          </div></div>
          <DonutCard center={pct(measuredShare, language)} centerNote={tr(language, "measured", "measured")}
            slices={confCounts.map(({ c, n }) => ({ key: c, label: confName(c, language), value: n, color: confColor(c), readout: `${confName(c, language)}: ${n}` }))}
            ariaLabel={tr(language, "confAria", "Countries by confidence of the household estimate")} hint={tr(language, "donutHint", "Hover or focus a slice to read it.")} />
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "incomeTitle", "Waste per person by income group")}</h2>
            <p className="muted">{tr(language, "incomeSub", "All 228 countries in UNEP's estimates, kg per person a year.")}</p>
          </div></div>
          <BarChartCard rows={incomeRows} colors={SEG_COLORS} legend={SECTORS.map(sName)} fmt={(v) => `${num(v, language)} kg`}
            ariaLabel={tr(language, "incomeAria", "Food waste per person by World Bank income group")} hint={tr(language, "incomeHint", "Low-income averages rest on very few measured countries.")} />
        </section>
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "regionTitle", "Waste per person by region")}</h2>
            <p className="muted">{tr(language, "regionSub", "All 228 countries, kg per person a year. The selected region is highlighted.")}</p>
          </div></div>
          <BarChartCard rows={regionRows} labelWidth={196} colors={SEG_COLORS} legend={SECTORS.map(sName)} fmt={(v) => `${num(v, language)} kg`}
            ariaLabel={tr(language, "regionAria", "Food waste per person by World Bank region")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")} />
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "tempTitle", "Do hotter countries waste more at home?")}</h2>
            <p className="muted">{tr(language, "tempSub", "Household kg per person against mean annual temperature (CRU TS 4.08, 1991–2020). Solid line: all {n}; dashed: measured only ({m}). 95% CI for r: {lo} to {hi} (all), {loM} to {hiM} (measured).", {
              n: tAll.n, m: tM.n, lo: fmtR(tAll.lo, language), hi: fmtR(tAll.hi, language), loM: fmtR(tM.lo, language), hiM: fmtR(tM.hi, language) })}</p>
          </div></div>
          <ScatterCard points={tempPts} fits={fits(tAll, tM)} xDomain={tDom} xLabel={tr(language, "tempAxis", "Mean annual temperature (°C)")} yLabel={tr(language, "hhAxis", "Household kg/person/year")}
            legend={confLegend} ariaLabel={tr(language, "tempAria", "Scatter of household food waste against mean temperature")} hint={tr(language, "scatterHint", "Hollow dots are extrapolated estimates. Hover or focus a dot to read it.")} />
        </section>
        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "pouTitle", "Is more food wasted where more people go hungry?")}</h2>
            <p className="muted">{tr(language, "pouSub", "Household kg per person against prevalence of undernourishment (FAOSTAT, 2021–2023). Values under 2.5% sit at FAO's floor. 95% CI for r: {lo} to {hi} (all), {loM} to {hiM} (measured).", {
              lo: fmtR(pAll.lo, language), hi: fmtR(pAll.hi, language), loM: fmtR(pM.lo, language), hiM: fmtR(pM.hi, language) })}</p>
          </div></div>
          <ScatterCard points={pouPts} fits={fits(pAll, pM)} xDomain={pDom} xLabel={tr(language, "pouAxis", "Undernourished (% of population)")} yLabel={tr(language, "hhAxis", "Household kg/person/year")}
            legend={confLegend} ariaLabel={tr(language, "pouAria", "Scatter of household food waste against undernourishment")} hint={tr(language, "scatterHint", "Hollow dots are extrapolated estimates. Hover or focus a dot to read it.")} />
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "fliTitle", "Food lost before it reaches shops (world)")}</h2>
            <p className="muted">{tr(language, "fliSub", "FAO Food Loss Index, 2015 = 100, by product group. Loss happens from harvest up to retail; waste (above) from retail to the plate. In {y}, {p}% of food was lost.", { y: lossLast.year, p: num(lossLast.lossPct ?? 0, language, 1) })}</p>
          </div></div>
          <LineChartCard baseline={100} yFmt={(v) => num(v, language)}
            series={PRODUCTS.map(([code, key, en], i) => ({
              key: code, label: tr(language, key, en), color: i === 0 ? "var(--ink)" : `var(--fw-l${i})`, bold: i === 0,
              points: FLI.filter((f) => f.product === code).map((f) => [f.year, f.index] as [number, number]),
            }))}
            ariaLabel={tr(language, "fliAria", "FAO Food Loss Index by product group, 2015–2023")} hint={tr(language, "lineHint", "Hover or focus a point to read it.")} />
        </section>
      </div>

      <section className="card">
        <div className="card__head"><div>
          <h2>{tr(language, "tableTitle", "All countries in view")}</h2>
          <p className="muted">{tr(language, "tableSub", "{n} countries in {scope}, kg per person a year (2022).", { n: list.length, scope: scopeName })}</p>
        </div></div>
        <DataTable key={region} rows={list} focus={country?.iso3} language={language} />
      </section>

      <FoodWasteQuestions language={language} v={{
        hh: num(KPIS.householdMt, language), total: num(KPIS.totalMt, language), share: pct(KPIS.householdMt / KPIS.totalMt, language),
        fs: num(KPIS.foodServiceMt, language), rt: num(KPIS.retailMt, language),
        hi: num(inc("High income").householdKgCap, language), umi: num(inc("Upper middle income").householdKgCap, language),
        lmi: num(inc("Lower middle income").householdKgCap, language), li: num(inc("Low income").householdKgCap, language),
        n: allC.t.n, rAll: fmtR(allC.t.r, language), loAll: fmtR(allC.t.lo, language), hiAll: fmtR(allC.t.hi, language),
        nM: allC.tm.n, rM: fmtR(allC.tm.r, language), loM: fmtR(allC.tm.lo, language), hiM: fmtR(allC.tm.hi, language),
        nP: allC.p.n, rP: fmtR(allC.p.r, language), loP: fmtR(allC.p.lo, language), hiP: fmtR(allC.p.hi, language), rPM: fmtR(allC.pm.r, language),
        meals: num(KPIS.mealsPerDay / 1e9, language, 2), hungry: num(KPIS.hungryPeopleM, language, 1),
      }} />

      {/* Takeaways */}
      <section className="card takeaways">
        <h2>{tr(language, "takeawaysTitle", "What the data says")}</h2>
        <ul>
          <li><strong>{tr(language, "t1Head", "{share} of food waste happens at home.", { share: pct(KPIS.householdMt / KPIS.totalMt, language) })}</strong> {tr(language, "t1", "Households wasted {hh} Mt in 2022, {kg} kg per person, against {fs} Mt in food service and {rt} Mt in retail.", {
            hh: num(KPIS.householdMt, language), kg: num(KPIS.householdKgCap, language), fs: num(KPIS.foodServiceMt, language), rt: num(KPIS.retailMt, language) })}</li>
          <li><strong>{tr(language, "t2Head", "Mexico wastes {d} kg more per person at home than the United States.", { d: num(mex.householdKgCap - usa.householdKgCap, language) })}</strong> {tr(language, "t2", "{mex} kg vs {usa} kg a year. Restaurants and canteens in the USA waste more ({usaFs} vs {mexFs} kg per person), but Mexican shops waste {ratio}× as much as American ones ({mexRt} vs {usaRt} kg). In total, the USA wastes {usaT} Mt and Mexico {mexT} Mt.", {
            mex: num(mex.householdKgCap, language), usa: num(usa.householdKgCap, language), usaFs: num(usa.foodServiceKgCap ?? 0, language), mexFs: num(mex.foodServiceKgCap ?? 0, language),
            mexRt: num(mex.retailKgCap ?? 0, language), usaRt: num(usa.retailKgCap ?? 0, language), ratio: num((mex.retailKgCap ?? 0) / (usa.retailKgCap || 1), language, 1),
            usaT: mt(usa.totalT, language), mexT: mt(mex.totalT, language) })}</li>
          <li><strong>{tr(language, "t3Head", "Income barely changes household waste.")}</strong> {tr(language, "t3", "High-income countries average {hi} kg per person; upper-middle {umi}; lower-middle {lmi}. Food waste is not only a rich-world problem.", {
            hi: num(inc("High income").householdKgCap, language), umi: num(inc("Upper middle income").householdKgCap, language), lmi: num(inc("Lower middle income").householdKgCap, language) })}</li>
          <li><strong>{tr(language, "t4Head", "The heat signal shrinks with better data.")}</strong> {tr(language, "t4", "Temperature and household waste correlate at r = {r} across all {n} countries with a temperature, but r = {rm} across the {nm} measured ones. Extrapolated estimates copy their neighbours, which makes regional patterns look stronger.", {
            r: fmtR(allC.t.r, language), n: allC.t.n, rm: fmtR(allC.tm.r, language), nm: allC.tm.n })}</li>
          <li><strong>{tr(language, "t5Head", "Waste and hunger sit side by side.")}</strong> {tr(language, "t5", "The edible share of household waste alone is about {meals} billion meals a day, while {hungry} million people are undernourished. Before shops, another {p}% of food is lost (FAO, {y}); that share has barely moved since {y0} ({p0}%).", {
            meals: num(KPIS.mealsPerDay / 1e9, language, 2), hungry: num(KPIS.hungryPeopleM, language, 1), p: num(lossLast.lossPct ?? 0, language, 1), y: lossLast.year, y0: lossFirst.year, p0: num(lossFirst.lossPct ?? 0, language, 1) })}</li>
          <li><strong>{tr(language, "t6Head", "Few countries are measured well.")}</strong> {tr(language, "t6", "Of 228 countries, {high} have a high-confidence household estimate and {med} a medium one; the highest measured figure here is {top} ({kg} kg).", {
            high: confAll.High ?? 0, med: confAll.Medium ?? 0, top: cName(topMeasured, language), kg: num(topMeasured.householdKgCap, language) })}</li>
        </ul>
      </section>

      <FoodWasteQuality language={language} v={{
        countries: COUNTRIES.length, hh: num(KPIS.householdMt, language, 2), sum: num(KPIS.totalMt * (1 + KPIS.reconstructionGap), language, 1), total: num(KPIS.totalMt, language, 1),
        gap: pct(KPIS.reconstructionGap, language, 2), high: conf100("High"), medium: conf100("Medium"), euro: conf100("Eurostat"), low: conf100("Low"), vlow: conf100("Very low"),
      }} />

      {/* Footer: method, attribution */}
      <section className="method lp-method">
        <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
        <div className="method__text">
          <p>{tr(language, "method1", "Food waste is UNEP's Food Waste Index Report 2024 Level 1 estimate for 2022 (SDG 12.3.1(b)): household figures from the report's Annex 3 for all 228 countries, food service and retail from the UN SDG Global Database. For 27 European countries that database carries Eurostat rows instead, so food service and retail use the Eurostat 2020 values UNEP used. World KPIs are UNEP's published aggregates; region and income totals add up every country UNEP covers.")}</p>
          <p>{tr(language, "method2", "The page includes all 228 countries and territories in UNEP's Annex 3, with no ranking cut-off. Region and income group are the World Bank's current classification; 13 territories outside the World Bank list appear as \"Not classified\" and use the UN population implied by UNEP. Undernourishment is FAOSTAT's 2021–2023 average; temperature is the CRU TS 4.08 1991–2020 mean from the World Bank Climate Change Knowledge Portal. \"Measured\" means UNEP rated the household estimate high or medium confidence; low and very low are extrapolated from countries in the same region and income group. Meals follow UNEP's conservative assumption: 25% of household waste is edible and a meal weighs 420 g. The 19% share compares the world total with 5.5 billion tonnes of food available for consumption (FAOSTAT 2020), as UNEP does.")}</p>
          <p>{tr(language, "method3", "Food waste includes inedible parts (bones, peels, shells). Correlations are across countries and say nothing about causes. Snapshot built {date}.", { date: fmtDate(CAPTURED_AT, language) })}</p>
        </div>
        <p className="method__sources">
          {tr(language, "sources", "Sources")}:{" "}
          <a href="https://digitallibrary.un.org/record/4042857" rel="noopener">UNEP Food Waste Index Report 2024</a> (© UNEP)
          {" · "}<a href="https://unstats.un.org/sdgs/dataportal" rel="noopener">UN SDG Global Database</a>
          {" · "}<a href="https://www.fao.org/faostat/en/#data/FS" rel="noopener">FAOSTAT</a> (FAO, CC BY 4.0)
          {" · "}<a href="https://datatopics.worldbank.org/world-development-indicators/" rel="noopener">World Bank WDI</a> and <a href="https://cckpapi.worldbank.org/cckp/v1/cru-x0.5_climatology_tas_climatology_annual_1991-2020_mean_historical_cru_ts4.08_mean/MEX,USA?_format=json" rel="noopener">CCKP API</a> (CC BY 4.0)
        </p>
        <FoodWasteSources checkedOn={fmtDate("2026-11-23", language)} language={language} />
      </section>
    </div>
  );
}
