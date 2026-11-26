import StudyFacts from "../StudyFacts.jsx";
import { useMemo, useState } from "react";
import { useLanguage } from "../../language.jsx";
import {
  type Country, BLUE_ZONES, CAPTURED_AT, COUNTRIES, HIGHLIGHT, KPIS, PRESTON, RECORD, REGION_IDS, REGIONS, SMALL_POP, SPEND, TREND, TREND_KEYS,
  WORLD_SEX_GAP, YEAR, inRegion, ols, prestonResidual, weighted,
} from "./data";
import { type BarRow, type Point, BarChartCard, DivergingBarCard, LineChartCard, RangeCard, ScatterCard } from "./Charts";
import { BlueZonesTable, DataTable, KpiCard, cName, regionName } from "./Panels";
import { tr, num, yrs, pct, fmtDate, signed, usd } from "./text";
import { LongevityQuality, LongevityQuestions, LongevitySources } from "./Research";

const REGION_COLOR: Record<string, string> = Object.fromEntries(REGION_IDS.map((r, i) => [r, `var(--lg-r${i})`]));
const TREND_COLOR: Record<string, string> = { JPN: "var(--lg-l0)", ITA: "var(--lg-l1)", CRI: "var(--lg-l2)", GRC: "var(--lg-l3)", MEX: "var(--lg-l4)", USA: "var(--lg-l5)" };
const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso3, c]));
const HEALTHY = "var(--fw-s0)", UNHEALTHY = "var(--lg-sick)";

export default function LongevityDay() {
  const language: string = useLanguage();
  const [region, setRegion] = useState("all");
  const [countryId, setCountryId] = useState("");

  const world = region === "all";
  const rowsIn = useMemo(() => COUNTRIES.filter((c) => inRegion(region, c)), [region]);
  const country: Country | null = countryId ? rowsIn.find((c) => c.iso3 === countryId) ?? null : null;
  const countryOptions = useMemo(() => [...rowsIn].sort((a, b) => cName(a, language).localeCompare(cName(b, language), language)), [rowsIn, language]);
  const pickRegion = (r: string) => { setRegion(r); if (country && r !== "all" && country.region !== r) setCountryId(""); };
  const scopeName = world ? tr(language, "world", "World") : regionName(region, language);
  const isOn = (iso3: string) => HIGHLIGHT.has(iso3) || iso3 === country?.iso3;
  const nm = (c: Country) => cName(c, language);
  const y1 = (v: number | null) => yrs(v, language);

  // ---- KPIs for the view: a country, a region (population-weighted), or the world (published figures) ----
  const withHale = rowsIn.filter((c) => c.hale != null);
  const haleRanked = useMemo(() => [...withHale].sort((a, b) => b.hale! - a.hale!), [rowsIn]);
  const allHaleRanked = useMemo(() => COUNTRIES.filter((c) => c.hale != null).sort((a, b) => b.hale! - a.hale!), []);
  const regE0 = weighted(rowsIn, (c) => c.e0), regHale = weighted(rowsIn, (c) => c.hale), regWho = weighted(rowsIn.filter((c) => c.hale != null), (c) => c.whoE0);
  const cent = rowsIn.reduce((a, c) => a + (c.centenarians ?? 0), 0), popIn = rowsIn.reduce((a, c) => a + c.pop, 0);
  const kE0 = country ? country.e0 : world ? KPIS.worldE0 : regE0;
  const kHale = country ? country.hale : world ? KPIS.worldHale : regHale;
  const kGap = country ? country.gap : world ? KPIS.gap : regWho != null && regHale != null ? regWho - regHale : null;
  const kCent = country ? country.centenariansPer100k : world ? KPIS.centenariansPer100k : (cent / popIn) * 1e5;
  const top = haleRanked[0];
  const rankOf = (c: Country) => allHaleRanked.findIndex((x) => x.iso3 === c.iso3) + 1;

  // ---- A. HALE with WHO's 95% uncertainty interval, every country with a value ----
  const haleRows = haleRanked.map((c, i) => ({
    id: c.iso3, label: `${i + 1}. ${nm(c)}`, value: c.hale!, lo: c.haleLo!, hi: c.haleHi!, highlight: isOn(c.iso3),
    readout: tr(language, "haleReadout", "{name}: healthy life expectancy {h} years (95% UI {lo}–{hi}) · life expectancy {e} (WHO) · rank {r} of {n}", {
      name: nm(c), h: y1(c.hale), lo: y1(c.haleLo), hi: y1(c.haleHi), e: y1(c.whoE0), r: rankOf(c), n: allHaleRanked.length }),
  }));
  const overlapTop = (() => { const t = allHaleRanked[0]; return allHaleRanked.slice(1, 10).filter((c) => c.haleHi! >= t.haleLo!).length; })();

  // ---- B. healthy years + years in less than full health = WHO life expectancy ----
  const gapRows: BarRow[] = [...withHale].sort((a, b) => b.whoE0! - a.whoE0!).map((c, i) => ({
    id: c.iso3, label: `${i + 1}. ${nm(c)}`, segments: [c.hale!, c.gap!], highlight: isOn(c.iso3),
    readout: tr(language, "gapReadout", "{name}: {e} years of life expectancy (WHO), {h} in full health and {g} in less than full health ({p})", {
      name: nm(c), e: y1(c.whoE0), h: y1(c.hale), g: y1(c.gap), p: pct(c.gap! / c.whoE0!, language) }),
  }));

  // ---- C. female − male life expectancy, around the world gap ----
  const sexRows = [...rowsIn].sort((a, b) => (b.e0Female - b.e0Male) - (a.e0Female - a.e0Male)).map((c) => {
    const g = c.e0Female - c.e0Male;
    return {
      id: c.iso3, label: nm(c), value: g - WORLD_SEX_GAP, highlight: isOn(c.iso3), faded: c.pop < SMALL_POP,
      readout: tr(language, "sexReadout", "{name}: women {f}, men {m} · women live {g} years longer ({d} vs the world's {w})", {
        name: nm(c), f: y1(c.e0Female), m: y1(c.e0Male), g: y1(g), d: signed(g - WORLD_SEX_GAP, language), w: y1(WORLD_SEX_GAP) }),
    };
  });

  // ---- D. life expectancy 1950–2023 ----
  const trendSeries = [
    { key: "world", label: tr(language, "world", "World"), color: "var(--ink)", bold: true, points: TREND.years.map((y, i) => [y, TREND.world[i]] as [number, number]) },
    ...TREND_KEYS.map((k) => ({ key: k, label: nm(BY_ISO.get(k)!), color: TREND_COLOR[k], points: TREND.years.map((y, i) => [y, TREND[k][i]] as [number, number]) })),
    { key: "record", label: tr(language, "serRecord", "Record (women)"), color: "var(--copper)", points: RECORD.map((r) => [r.year, r.e0Female] as [number, number]) },
  ];

  // ---- E. centenarians per 100,000: countries with ≥ 1 million people ranked, small ones below the rule, faded ----
  const centAll = rowsIn.filter((c) => c.centenariansPer100k != null);
  const centBig = centAll.filter((c) => c.pop >= SMALL_POP).sort((a, b) => b.centenariansPer100k! - a.centenariansPer100k!);
  const centSmall = centAll.filter((c) => c.pop < SMALL_POP).sort((a, b) => b.centenariansPer100k! - a.centenariansPer100k!);
  const centRows: BarRow[] = [...centBig, ...centSmall].map((c, i) => ({
    id: c.iso3, label: i < centBig.length ? `${i + 1}. ${nm(c)}` : nm(c), segments: [c.centenariansPer100k!], highlight: isOn(c.iso3), faded: c.pop < SMALL_POP,
    readout: tr(language, "centReadout", "{name}: about {n} people aged 100+ ({r} per 100,000) in {y}; {n0} in 2000{small}", {
      name: nm(c), n: num(c.centenarians!, language), r: num(c.centenariansPer100k!, language, 1), y: YEAR, n0: num(c.centenarians2000 ?? 0, language),
      small: c.pop < SMALL_POP ? tr(language, "smallPop", " · fewer than 1 million people: not ranked") : "" }),
  }));

  // ---- F. regions ----
  const regionRows: BarRow[] = REGIONS.filter((r) => r.region !== "Not classified").map((r) => ({
    id: r.region, label: regionName(r.region, language), segments: [r.e0], highlight: r.region === region,
    readout: tr(language, "regionReadout", "{r}: life expectancy {e} (UN, population-weighted, {n} countries) · HALE {h} (WHO, {nh} countries)", {
      r: regionName(r.region, language), e: y1(r.e0), n: r.countries, h: y1(r.hale), nh: r.countriesWithHale }),
  }));

  // ---- G, H. scatters over every country; the region filter fades the rest ----
  const pt = (c: Country, x: number, extra: string): Point => ({
    id: c.iso3, label: nm(c), x, y: c.hale!, color: REGION_COLOR[c.region], measured: inRegion(region, c), highlight: isOn(c.iso3), readout: `${nm(c)} · ${extra}`,
  });
  const gdpPts = COUNTRIES.filter((c) => c.hale != null && c.gdpPc != null).map((c) => {
    const res = prestonResidual(c)!;
    return pt(c, c.gdpPc!, tr(language, "gdpReadout", "HALE {h} · GDP per person {g} (PPP, {y}) · {d} years vs the line", { h: y1(c.hale), g: usd(c.gdpPc!, language), y: c.gdpYear!, d: signed(res, language) }));
  });
  const spendPts = COUNTRIES.filter((c) => c.hale != null && c.healthExpPct != null).map((c) =>
    pt(c, c.healthExpPct!, tr(language, "spendReadout", "HALE {h} · health spending {s}% of GDP ({y})", { h: y1(c.hale), s: num(c.healthExpPct!, language, 1), y: c.healthExpYear! })));
  const regionLegend = REGION_IDS.filter((r) => r !== "Not classified").map((r) => ({ label: regionName(r, language), color: REGION_COLOR[r] }));
  const haleDom: [number, number] = [Math.floor(Math.min(...allHaleRanked.map((c) => c.hale!)) / 5) * 5, Math.ceil(Math.max(...allHaleRanked.map((c) => c.hale!)) / 5) * 5];
  const spendMax = Math.ceil(Math.max(...spendPts.map((p) => p.x)) / 5) * 5;
  // Fit within the selected region too, so the reader can compare slopes.
  const regFit = useMemo(() => {
    if (world) return null;
    const r = COUNTRIES.filter((c) => c.region === region && c.hale != null && c.gdpPc != null);
    return ols(r.map((c) => Math.log10(c.gdpPc!)), r.map((c) => c.hale!));
  }, [region]);

  // ---- Values for facts, takeaways and research (whole dataset) ----
  const all = useMemo(() => {
    const H = COUNTRIES.filter((c) => c.hale != null);
    const gaps = [...H].sort((a, b) => a.gap! - b.gap!);
    const r = (() => { const f = ols(H.map((c) => c.whoE0!), H.map((c) => c.gap!))!; return Math.sqrt(f.r2) * Math.sign(f.b); })();
    const sex = [...COUNTRIES].sort((a, b) => (a.e0Female - a.e0Male) - (b.e0Female - b.e0Male));
    const big = COUNTRIES.filter((c) => c.pop >= SMALL_POP);
    const e0top = [...big].sort((a, b) => b.e0 - a.e0)[0];
    const unWho = H.map((c) => ({ c, d: Math.abs(c.e0 - c.whoE0!) })).sort((a, b) => b.d - a.d);
    const gdpN = COUNTRIES.filter((c) => c.gdpPc != null), hexpN = COUNTRIES.filter((c) => c.healthExpPct != null);
    const top = H.sort((a, b) => b.hale! - a.hale!)[0];
    return {
      gapMin: gaps[0], gapMax: gaps[gaps.length - 1], r, sexMin: sex[0], sexMax: sex[sex.length - 1], e0top, top,
      unWhoMean: unWho.reduce((a, x) => a + x.d, 0) / unWho.length, unWhoMax: unWho[0],
      gdpN: gdpN.length, gdp22: gdpN.filter((c) => c.gdpYear !== YEAR).length, hexpN: hexpN.length, hexp21: hexpN.filter((c) => c.healthExpYear !== YEAR).length,
      usa: BY_ISO.get("USA")!, jpn: BY_ISO.get("JPN")!, cri: BY_ISO.get("CRI")!, mex: BY_ISO.get("MEX")!,
    };
  }, []);
  const res = (c: Country) => signed(prestonResidual(c)!, language);

  const facts = [
    country
      ? { title: tr(language, "f1cHead", "A baby born in {name}", { name: nm(country) }), text: tr(language, "f1c", "can expect to live {e} years, {d} the world average of {w}{h}.", {
          e: y1(country.e0), d: country.e0 >= KPIS.worldE0 ? tr(language, "above", "{v} years above", { v: y1(country.e0 - KPIS.worldE0) }) : tr(language, "below", "{v} years below", { v: y1(KPIS.worldE0 - country.e0) }), w: y1(KPIS.worldE0),
          h: country.hale != null ? tr(language, "f1cHale", ", about {h} of them in full health", { h: y1(country.hale) }) : "" }) }
      : { title: tr(language, "f1Head", "From 46 to 73 years"), text: tr(language, "f1", "A baby born in {y} can expect to live {e} years on average, against {e0} for a baby born in 1950. The pandemic took the world average from {a} (2019) to {b} (2021) before it recovered.", {
          y: YEAR, e: y1(KPIS.worldE0), e0: y1(KPIS.worldE0_1950), a: y1(KPIS.worldE0_2019), b: y1(KPIS.worldE0_2021) }) },
    { title: tr(language, "f2Head", "Not every year is a healthy one"), text: tr(language, "f2", "Of the {e} years a newborn can expect (WHO), about {g} are lived with some illness or disability: roughly one year in seven.", { e: y1(KPIS.worldWhoE0), g: y1(KPIS.gap) }) },
    { title: tr(language, "f3Head", "Half a million people aged 100+"), text: tr(language, "f3", "The UN estimates {n} people aged 100 or more in {y}, {k} times as many as in 2000. Japan alone has about {jp}.", {
      n: num(Math.round(KPIS.centenarians / 1000) * 1000, language), y: YEAR, k: num(KPIS.centenarians / KPIS.centenarians2000, language, 1), jp: num(Math.round(BY_ISO.get("JPN")!.centenarians! / 1000) * 1000, language) }) },
  ];

  const R0 = RECORD[0], R1 = RECORD[RECORD.length - 1];
  const fmtY = (v: number) => num(v, language);

  return (
    <div className="viz fw lg">
      {/* Controls: one global filter (World Bank region) and a country filter */}
      <div className="controls" role="group" aria-label={tr(language, "controlsAria", "Filter the dashboard by region")}>
        <label className="select">
          <span className="mono">{tr(language, "region", "Region")}</span>
          <select value={region} onChange={(e) => pickRegion(e.target.value)}>
            <option value="all">{tr(language, "world", "World")}</option>
            {REGION_IDS.map((r) => <option key={r} value={r}>{regionName(r, language)}</option>)}
          </select>
        </label>
        <label className="select">
          <span className="mono">{tr(language, "country", "Country")}</span>
          <select value={country?.iso3 ?? ""} onChange={(e) => setCountryId(e.target.value)}>
            <option value="">{tr(language, "allCountries", "All countries and areas ({n})", { n: rowsIn.length })}</option>
            {countryOptions.map((c) => <option key={c.iso3} value={c.iso3}>{nm(c)}</option>)}
          </select>
        </label>
        <p className="muted fw-scope">{tr(language, "scopeNote", "Regions follow the World Bank. Japan, Italy, Costa Rica and Greece (home to four blue zones), Mexico, the United States and the country you pick are highlighted in copper. Country averages are not blue-zone data: see the blue-zones card.")}</p>
        {(!world || country) && <button type="button" className="gw-reset" onClick={() => { setRegion("all"); setCountryId(""); }}>{tr(language, "reset", "Reset")}</button>}
      </div>

      {/* Key numbers */}
      <section className="stats fw-stats" aria-label={tr(language, "statsAria", "Key numbers for {scope}", { scope: country ? nm(country) : scopeName })}>
        <KpiCard accent label={tr(language, "kpiE0", "Life expectancy at birth")} value={y1(kE0)}
          note={country ? tr(language, "kpiE0NoteC", "women {f} · men {m} · UN WPP 2024, {y}", { f: y1(country.e0Female), m: y1(country.e0Male), y: YEAR })
            : world ? tr(language, "kpiE0Note", "women {f} · men {m} · UN WPP 2024, {y}", { f: y1(KPIS.worldE0Female), m: y1(KPIS.worldE0Male), y: YEAR })
            : tr(language, "kpiE0NoteR", "population-weighted, {n} countries and areas · UN WPP 2024", { n: rowsIn.length })} />
        <KpiCard label={tr(language, "kpiHale", "Healthy life expectancy")} value={y1(kHale)}
          note={country ? (country.hale == null ? tr(language, "kpiHaleNone", "not modelled by WHO") : tr(language, "kpiHaleNoteC", "95% UI {lo}–{hi} · rank {r} of {n}", { lo: y1(country.haleLo), hi: y1(country.haleHi), r: rankOf(country), n: allHaleRanked.length }))
            : world ? tr(language, "kpiHaleNote", "95% UI {lo}–{hi} · WHO GHO, {y}", { lo: y1(KPIS.worldHaleLo), hi: y1(KPIS.worldHaleHi), y: YEAR })
            : tr(language, "kpiHaleNoteR", "population-weighted, {n} countries · WHO", { n: withHale.length })} />
        <KpiCard label={tr(language, "kpiGap", "Years in less than full health")} value={y1(kGap)}
          note={tr(language, "kpiGapNote", "WHO life expectancy minus HALE")} />
        <KpiCard label={tr(language, "kpiCent", "People aged 100+ per 100,000")} value={kCent == null ? "—" : num(kCent, language, 1)}
          note={country ? (country.centenarians == null ? "—" : tr(language, "kpiCentNoteC", "about {n} people · UN estimate{small}", { n: num(country.centenarians, language), small: country.pop < SMALL_POP ? tr(language, "kpiSmall", " · small population") : "" }))
            : tr(language, "kpiCentNote", "about {n} people · UN estimate, {y}", { n: num(world ? KPIS.centenarians : cent, language), y: YEAR })} />
        <KpiCard label={tr(language, "kpiTop", "Highest healthy life expectancy")} value={top ? nm(top) : "—"}
          note={top ? tr(language, "kpiTopNote", "{h} years (95% UI {lo}–{hi}) · {scope}", { h: y1(top.hale), lo: y1(top.haleLo), hi: y1(top.haleHi), scope: scopeName }) : "—"} />
      </section>

      <StudyFacts facts={facts} language={language} />

      <div className="fw-grid">
        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "haleTitle", "Where people live the longest in good health")}</h2>
            <p className="muted">{tr(language, "haleSub", "{scope}: healthy life expectancy at birth (HALE), WHO {y}, every country with a value ({n}). The line is WHO's 95% uncertainty interval: {k} of the nine countries after the leader overlap it, so the top of the ranking is a tie, not an order.", {
              scope: scopeName, y: YEAR, n: withHale.length, k: overlapTop })}</p>
          </div></div>
          <RangeCard rows={haleRows} width={980} labelWidth={200} fmt={(v) => num(v, language)} focusId={country?.iso3} refValue={KPIS.worldHale} refLabel={tr(language, "worldRef", "world {v}", { v: y1(KPIS.worldHale) })}
            ariaLabel={tr(language, "haleAria", "Healthy life expectancy by country with uncertainty intervals")} hint={tr(language, "barHint", "Hover or focus a row to read it.")} />
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "gapTitle", "Life expectancy split into healthy and less healthy years")}</h2>
            <p className="muted">{tr(language, "gapSub", "{scope}: WHO life expectancy {y}, as years in full health (teal, HALE) plus years in less than full health (sand). Sorted by life expectancy.", { scope: scopeName, y: YEAR })}</p>
          </div></div>
          <BarChartCard rows={gapRows} colors={[HEALTHY, UNHEALTHY]} legend={[tr(language, "legHealthy", "Healthy years (HALE)"), tr(language, "legUnhealthy", "Years in less than full health")]}
            scroll focusId={country?.iso3} labelWidth={170} fmt={(v) => num(v, language, 1)}
            ariaLabel={tr(language, "gapAria", "Life expectancy split into healthy years and years in less than full health")} hint={tr(language, "barHint", "Hover or focus a row to read it.")} />
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "sexTitle", "How much longer women live")}</h2>
            <p className="muted">{tr(language, "sexSub", "{scope}: women's minus men's life expectancy (UN WPP {y}), drawn around the world gap of {w} years. Right: a larger female advantage than the world's; left: smaller. Women live longer in every country.", { scope: scopeName, y: YEAR, w: y1(WORLD_SEX_GAP) })}</p>
          </div></div>
          <DivergingBarCard rows={sexRows} focusId={country?.iso3} labelWidth={160} fmt={(v) => signed(v, language)}
            legend={[tr(language, "legSmaller", "Smaller gap than the world"), tr(language, "legLarger", "Larger gap than the world")]}
            ariaLabel={tr(language, "sexAria", "Female minus male life expectancy, relative to the world gap")} hint={tr(language, "barHint", "Hover or focus a row to read it.")} />
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "trendTitle", "Life expectancy since 1950")}</h2>
            <p className="muted">{tr(language, "trendSub", "UN WPP 2024 estimates, 1950–{y}: the world, the four blue-zone countries, Mexico and the United States. Copper: the highest female life expectancy of any country with a million people that year, the “best practice” line of Oeppen & Vaupel (2002). It rose {s} months a year, from {r0} ({c0}) to {r1} ({c1}).", {
              y: YEAR, s: num(KPIS.recordSlope * 12, language, 1), r0: y1(R0.e0Female), c0: nm(BY_ISO.get(R0.iso3)!), r1: y1(R1.e0Female), c1: nm(BY_ISO.get(R1.iso3)!) })}</p>
          </div></div>
          <LineChartCard series={trendSeries} yFmt={fmtY} xStep={10}
            ariaLabel={tr(language, "trendAria", "Life expectancy at birth, 1950 to 2023")} hint={tr(language, "lineHint", "Hover or focus a point to read it.")} />
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "centTitle", "Where centenarians are most common")}</h2>
            <p className="muted">{tr(language, "centSub", "{scope}: people aged 100+ per 100,000 (UN WPP model estimates, {y}). Countries with a million people or more are ranked; smaller ones sit below the dashed line, faded, because a few people change their rate a lot.", { scope: scopeName, y: YEAR })}</p>
          </div></div>
          <BarChartCard rows={centRows} colors={["var(--fw-s0)"]} pinnedFrom={centBig.length} scroll focusId={country?.iso3} labelWidth={170} fmt={(v) => num(v, language, 1)}
            ariaLabel={tr(language, "centAria", "Centenarians per 100,000 people by country")} hint={tr(language, "barHint", "Hover or focus a row to read it.")} />
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "regTitle", "Life expectancy by region")}</h2>
            <p className="muted">{tr(language, "regSub", "UN WPP {y}, weighted by population. The region you pick is in copper.", { y: YEAR })}</p>
          </div></div>
          <BarChartCard rows={regionRows} colors={["var(--fw-s0)"]} labelWidth={250} fmt={(v) => num(v, language, 1)}
            ariaLabel={tr(language, "regAria", "Life expectancy by World Bank region")} hint={tr(language, "barHint", "Hover or focus a row to read it.")} />
          <p className="lp-small">{tr(language, "regNote", "{n} territories that the World Bank does not classify (largest: Taiwan) are left out of this chart but kept everywhere else.", { n: REGIONS.find((r) => r.region === "Not classified")?.countries ?? 0 })}</p>
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "prestonTitle", "Richer countries live healthier lives, up to a point")}</h2>
            <p className="muted">{tr(language, "prestonSub", "HALE ({y}) against GDP per person (PPP, constant 2021 dollars, log scale), {n} countries: the Preston curve. The line explains {r2} of the variation; each tenfold rise in income goes with {b} more healthy years. Points far above the line do better than their income predicts.{reg}", {
              y: YEAR, n: PRESTON.n, r2: pct(PRESTON.r2, language), b: y1(PRESTON.b),
              reg: regFit ? tr(language, "prestonReg", " Dashed: the line within {r} ({n} countries, {b} years per tenfold income).", { r: scopeName, n: regFit.n, b: y1(regFit.b) }) : "" })}</p>
          </div></div>
          <ScatterCard points={gdpPts} logX xDomain={[1000, 150000]} xTicks={[1000, 2000, 5000, 10000, 20000, 50000, 100000]} xFmt={(v) => usd(v, language)} yDomain={haleDom}
            fits={[{ a: PRESTON.a, b: PRESTON.b, label: tr(language, "fitAll", "All countries") }, ...(regFit ? [{ a: regFit.a, b: regFit.b, dashed: true, label: scopeName }] : [])]}
            xLabel={tr(language, "gdpAxis", "GDP per person, PPP (log scale)")} yLabel={tr(language, "haleAxis", "Healthy life expectancy (years)")} legend={regionLegend}
            ariaLabel={tr(language, "prestonAria", "Healthy life expectancy against GDP per person")} hint={tr(language, "scatterHint", "Faded dots are outside the selected region. Hover or focus a dot to read it.")} />
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "spendTitle", "Health spending and healthy years")}</h2>
            <p className="muted">{tr(language, "spendSub", "HALE ({y}) against current health spending as a share of GDP (World Bank), {n} countries. The line explains only {r2}: a share of GDP says little about how much is spent per person or how well.", { y: YEAR, n: SPEND.n, r2: pct(SPEND.r2, language) })}</p>
          </div></div>
          <ScatterCard points={spendPts} xDomain={[0, spendMax]} yDomain={haleDom} xFmt={(v) => `${num(v, language)}%`}
            fits={[{ a: SPEND.a, b: SPEND.b, label: tr(language, "fitAll", "All countries") }]}
            xLabel={tr(language, "spendAxis", "Current health spending, % of GDP")} yLabel={tr(language, "haleAxis", "Healthy life expectancy (years)")} legend={regionLegend}
            ariaLabel={tr(language, "spendAria", "Healthy life expectancy against health spending")} hint={tr(language, "scatterHint", "Faded dots are outside the selected region. Hover or focus a dot to read it.")} />
        </section>

        <section className="card fw-wide lg-bzcard">
          <div className="card__head"><div>
            <h2>{tr(language, "bzTitle", "Blue zones: what the studies measured")}</h2>
            <p className="muted">{tr(language, "bzSub", "Four areas where demographers validated unusually long lives, and Loma Linda, often listed with them but measured as a religious cohort. Survival: the share of people in their 60s in the 1970 census found in their 90s in 2000 (birth cohorts 1890–1919), zone · comparison, with the authors' significance stars (Poulain, Herm & Pes 2013, Table 2).")}</p>
          </div></div>
          <p className="notice notice--inline" role="note"><strong>{tr(language, "bzWarnHead", "Country data are not blue-zone data.")}</strong> {tr(language, "bzWarn", "Everything else on this page is a national average for {y}. Blue zones are small areas (Sardinia's has about 40,000 people) measured in people born around 1880–1919. {cri} as a whole ranks {r} of {n} on healthy life expectancy; that says nothing for or against Nicoya.", {
            y: YEAR, cri: nm(all.cri), r: rankOf(all.cri), n: allHaleRanked.length })}</p>
          <BlueZonesTable zones={BLUE_ZONES} language={language} />
          <div className="lg-debate" role="group" aria-label={tr(language, "debateAria", "The scientific debate")}>
            <h3>{tr(language, "debateTitle", "Scientific debate: are the ages real?")}</h3>
            <div className="lg-debate__cols">
              <div>
                <p className="mono lg-debate__side">{tr(language, "debateA", "Sceptical: Newman (2024, preprint)")}</p>
                <ul className="lp-list">
                  <li>{tr(language, "debA1", "In the United States, supercentenarian records fall 69–82% once a state introduces birth certificates.")}</li>
                  <li>{tr(language, "debA2", "Only 18% of exhaustively validated supercentenarians have a birth certificate, and their birthdays cluster on days divisible by five.")}</li>
                  <li>{tr(language, "debA3", "The Sardinian, Okinawan and Ikarian blue zones have low incomes, low literacy and short life expectancy relative to their national averages: patterns he reads as error and fraud.")}</li>
                </ul>
              </div>
              <div>
                <p className="mono lg-debate__side">{tr(language, "debateB", "Response: Austad & Pes (2025)")}</p>
                <ul className="lp-list">
                  <li>{tr(language, "debB1", "Most self-reported claims of extreme age are indeed false; that is why demographers validate them.")}</li>
                  <li>{tr(language, "debB2", "Blue-zone ages were checked by cross-referencing several independent documents, which minimizes fraud, honest mistakes and identity switches between siblings with the same name.")}</li>
                  <li>{tr(language, "debB3", "On that basis, they conclude that the blue-zone age data are valid and reliable.")}</li>
                </ul>
              </div>
            </div>
            <p className="lp-small">{tr(language, "debateNote", "Both sides are summarised from their abstracts; Newman's paper is a preprint (not peer reviewed), the response is peer reviewed. The original studies already rate the evidence unevenly: best in Sardinia, weakest in Ikaria (no birth registers), and not proven for Nicoya by census survival, although a 1990–2011 follow-up found a lower death rate for Nicoyan men. Neither side's claims can be tested with the national data on this page.")}</p>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card__head"><div>
          <h2>{tr(language, "tableTitle", "Every country and area")}</h2>
          <p className="muted">{tr(language, "tableSub", "{n} countries and areas in {scope}, from UN WPP 2024, with WHO and World Bank values where they exist.", { n: rowsIn.length, scope: scopeName })}</p>
        </div></div>
        <DataTable key={region} rows={rowsIn} focus={country?.iso3} language={language} />
      </section>

      <LongevityQuestions language={language} v={{
        top: nm(all.top), y: YEAR, topV: y1(all.top.hale), e0top: nm(all.e0top), e0V: y1(all.e0top.e0), lo: y1(all.top.haleLo), hi: y1(all.top.haleHi),
        n: allHaleRanked.length, r: num(all.r, language, 2), min: y1(all.gapMin.gap), minC: nm(all.gapMin), max: y1(all.gapMax.gap), maxC: nm(all.gapMax),
        r2: pct(PRESTON.r2, language), b: y1(PRESTON.b), usa: nm(all.usa), usaR: y1(Math.abs(prestonResidual(all.usa)!)), jpn: nm(all.jpn), jpnR: y1(prestonResidual(all.jpn)), cri: nm(all.cri), criR: y1(prestonResidual(all.cri)),
        s: num(KPIS.recordSlope * 12, language, 1), r0: y1(R0.e0Female), c0: nm(BY_ISO.get(R0.iso3)!), r1: y1(R1.e0Female), c1: nm(BY_ISO.get(R1.iso3)!),
        sMin: y1(all.sexMin.e0Female - all.sexMin.e0Male), sMinC: nm(all.sexMin), sMax: y1(all.sexMax.e0Female - all.sexMax.e0Male), sMaxC: nm(all.sexMax), w: y1(WORLD_SEX_GAP),
        r2rec: num(KPIS.recordR2, language, 3),
      }} />

      {/* Takeaways */}
      <section className="card takeaways">
        <h2>{tr(language, "takeawaysTitle", "What the data says")}</h2>
        <ul>
          <li><strong>{tr(language, "t1Head", "About {g} of {e} years are lived in less than full health.", { g: y1(KPIS.gap), e: y1(KPIS.worldWhoE0) })}</strong> {tr(language, "t1", "Worldwide (WHO, {y}). Across countries the gap runs from {min} ({minC}) to {max} ({maxC}), and it grows with life expectancy (r = {r}): longer lives bring both healthy and unhealthy years.", {
            y: YEAR, min: y1(all.gapMin.gap), minC: nm(all.gapMin), max: y1(all.gapMax.gap), maxC: nm(all.gapMax), r: num(all.r, language, 2) })}</li>
          <li><strong>{tr(language, "t2Head", "The top of the healthy-life ranking is a tie.")}</strong> {tr(language, "t2", "{top} leads with {h} years (95% UI {lo}–{hi}), but {k} of the next nine countries overlap that interval. Treat the top ten as one group.", {
            top: nm(all.top), h: y1(all.top.hale), lo: y1(all.top.haleLo), hi: y1(all.top.haleHi), k: overlapTop })}</li>
          <li><strong>{tr(language, "t3Head", "Income explains a lot, but not everything.")}</strong> {tr(language, "t3", "GDP per person explains {r2} of the variation in HALE. {usa} lives {u} fewer healthy years than its income predicts, {mex} {m}; {jpn} {j} and {cri} {c} more.", {
            r2: pct(PRESTON.r2, language), usa: nm(all.usa), u: y1(Math.abs(prestonResidual(all.usa)!)), mex: nm(all.mex), m: res(all.mex), jpn: nm(all.jpn), j: y1(prestonResidual(all.jpn)), cri: nm(all.cri), c: y1(prestonResidual(all.cri)) })}</li>
          <li><strong>{tr(language, "t4Head", "Women outlive men everywhere.")}</strong> {tr(language, "t4", "By {w} years worldwide, from {a} in {aC} to {b} in {bC}.", { w: y1(WORLD_SEX_GAP), a: y1(all.sexMin.e0Female - all.sexMin.e0Male), aC: nm(all.sexMin), b: y1(all.sexMax.e0Female - all.sexMax.e0Male), bC: nm(all.sexMax) })}</li>
          <li><strong>{tr(language, "t5Head", "No ceiling in sight yet.")}</strong> {tr(language, "t5", "The record female life expectancy rose {s} months a year since 1950 (R² {r2}), close to the near-linear rise Oeppen & Vaupel (2002) found since 1840.", { s: num(KPIS.recordSlope * 12, language, 1), r2: num(KPIS.recordR2, language, 3) })}</li>
          <li><strong>{tr(language, "t6Head", "Blue zones cannot be judged from country averages.")}</strong> {tr(language, "t6", "They are small areas and old cohorts. Whether their ages are real is a live dispute between Newman (2024) and Austad & Pes (2025); this page shows both and the original measures, not a verdict.")}</li>
        </ul>
      </section>

      <LongevityQuality language={language} v={{
        e0: num(KPIS.worldE0, language, 2), y: YEAR, e24: num(KPIS.worldE0_2024, language, 2), n: KPIS.countries, hale: y1(KPIS.worldHale), lo: y1(KPIS.worldHaleLo), hi: y1(KPIS.worldHaleHi), le: y1(KPIS.worldWhoE0),
        nh: KPIS.countriesWithHale, hw: num(KPIS.haleWeighted, language, 2), d: num(all.unWhoMean, language, 1), maxC: nm(all.unWhoMax.c), max: num(all.unWhoMax.d, language, 1),
        g: all.gdpN, g22: all.gdp22, h: all.hexpN, h21: all.hexp21, c: num(KPIS.centenarians, language), c0: num(KPIS.centenarians2000, language),
      }} />

      {/* Footer: method, attribution */}
      <section className="method lp-method">
        <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
        <div className="method__text">
          <p>{tr(language, "method1", "Life expectancy at birth (period, both sexes and by sex), population and people aged 100+ come from the UN World Population Prospects 2024, medium variant, estimates for {y}; trends cover 1950–{y}. Healthy life expectancy (HALE) and WHO's own life expectancy come from the WHO Global Health Observatory for {y}, with WHO's 95% uncertainty intervals; the years in less than full health are WHO life expectancy minus HALE, so both numbers come from the same model. Regions, GDP per person (PPP, constant 2021 international dollars) and current health spending (% of GDP) come from the World Bank, for {y} or the latest earlier year. Data downloaded on {date} and joined in DuckDB by ISO 3166 code.", { y: YEAR, date: fmtDate(CAPTURED_AT, language) })}</p>
          <p>{tr(language, "method2", "Period life expectancy summarises the death rates of one year; it is not a forecast for any person. Region values are population-weighted with WPP populations. The Preston line is an ordinary least-squares fit of HALE on log10 GDP per person; residuals are descriptive. Centenarian figures are model estimates for the open age group 100+, not counts, and are faded for places with fewer than one million people. Blue-zone numbers are transcribed from the cited papers only and refer to small areas and older birth cohorts: they cannot be compared with the national figures.")}</p>
          <p>{tr(language, "method3", "The page includes every one of the {n} countries and areas in WPP 2024, with no ranking cut-off; WHO models HALE for {nh} of them. The Excel download has every row.", { n: KPIS.countries, nh: KPIS.countriesWithHale })}</p>
        </div>
        <p className="method__sources">
          {tr(language, "sources", "Sources")}:{" "}
          <a href="https://population.un.org/wpp/" rel="noopener">UN DESA, World Population Prospects 2024</a> (CC BY 3.0 IGO)
          {" · "}<a href="https://www.who.int/data/gho" rel="noopener">WHO Global Health Observatory</a>
          {" · "}<a href="https://datatopics.worldbank.org/world-development-indicators/" rel="noopener">World Bank, World Development Indicators</a> (CC BY 4.0)
        </p>
        <LongevitySources checkedOn={fmtDate("2026-11-26", language)} language={language} />
      </section>
    </div>
  );
}
