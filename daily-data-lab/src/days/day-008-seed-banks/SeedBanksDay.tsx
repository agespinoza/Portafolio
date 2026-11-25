import StudyFacts from "../StudyFacts.jsx";
import { useMemo, useState } from "react";
import { useLanguage } from "../../language.jsx";
import {
  type Continent, type Country, type Scope,
  CAPTURED_AT, CENTRES, CONTINENTS, COUNTRIES, CUMULATIVE, DEPOSITORS, EVENTS, GENERA, HIGHLIGHT, KPIS, ORIGIN, REC, TREND,
  backupShare, cropsFor, generaFor, hhi, inScope, median,
} from "./data";
import { type BarRow, BarChartCard, ColumnChartCard, DonutCard, LineChartCard, ParetoCard } from "./Charts";
import { DataTable, KpiCard, cName, continentName } from "./Panels";
import { tr, num, pct, fmtDate, compact } from "./text";
import { SeedQuality, SeedQuestions, SeedSources } from "./Research";

const ORIGIN_COLORS: Record<string, string> = {
  Asia: "var(--sb-o0)", "North America": "var(--sb-o1)", Africa: "var(--sb-o2)", Europe: "var(--sb-o3)",
  "South America": "var(--sb-o4)", Oceania: "var(--sb-o5)", Unknown: "var(--sb-o6)", Antarctica: "var(--sb-o6)",
};
const NAT = "var(--fw-s0)", INTL = "var(--fw-s2)", MISSING = "var(--sb-gap)";

export default function SeedBanksDay() {
  const language: string = useLanguage();
  const [scope, setScope] = useState<Scope>("all");
  const [countryId, setCountryId] = useState("");

  const world = scope === "all";
  const countriesIn = useMemo(() => COUNTRIES.filter((c) => inScope(scope, c.continent)), [scope]);
  const country: Country | null = countryId ? countriesIn.find((c) => c.iso3 === countryId) ?? null : null;
  const countryOptions = useMemo(() => [...countriesIn].sort((a, b) => cName(a, language).localeCompare(cName(b, language), language)), [countriesIn, language]);
  const pickScope = (s: Scope) => { setScope(s); if (country && s !== "all" && country.continent !== s) setCountryId(""); };
  const scopeName = world ? tr(language, "world", "World") : continentName(scope, language);
  const isOn = (iso3: string) => HIGHLIGHT.has(iso3) || iso3 === country?.iso3;

  // Depositors in view: the continent (international centres form their own group), or a country's national institutes.
  const deps = useMemo(() => DEPOSITORS.filter((d) => (country ? !d.center && d.iso3 === country.iso3 : inScope(scope, d.continent))), [scope, country]);
  const depCodes = useMemo(() => new Set(deps.map((d) => d.code)), [deps]);
  const events = useMemo(() => EVENTS.filter((e) => depCodes.has(e.code)), [depCodes]);
  const samples = deps.reduce((a, d) => a + d.samples, 0);
  const crops = useMemo(() => (country ? [] : cropsFor(scope)), [scope, country]);
  const trendKey: keyof (typeof TREND)[number] = world ? "World" : (scope as Continent);
  const exSitu = country ? country.accessions : TREND[TREND.length - 1][trendKey];
  const wiewsIn = countriesIn.filter((c) => c.accessions);
  const backedIn = countriesIn.filter((c) => c.svalbardDepositors > 0);
  const wiewsBacked = wiewsIn.filter((c) => c.svalbardDepositors > 0);

  // ---- A. cumulative holdings ----
  const years = Array.from({ length: 2026 - 2008 + 1 }, (_, i) => 2008 + i);
  const byYear = (rows: typeof events, f: (e: (typeof events)[number]) => number) => years.map((y) => rows.filter((e) => e.date.startsWith(String(y))).reduce((a, e) => a + f(e), 0));
  const heldByDepositYear = byYear(events, (e) => e.samples);
  let run = 0;
  const heldCum = heldByDepositYear.map((v) => (run += v));
  const cumSeries = world
    ? [
        { key: "hold", label: tr(language, "serHoldings", "Held at year end"), color: "var(--ink)", bold: true, points: CUMULATIVE.map((r) => [r.year, r.holdings / 1e3] as [number, number]) },
        { key: "acc", label: tr(language, "serAccumulated", "Deposited, all time"), color: "var(--fw-s0)", points: CUMULATIVE.filter((r) => r.accumulated != null).map((r) => [r.year, r.accumulated! / 1e3] as [number, number]) },
      ]
    : [{ key: "held", label: tr(language, "serHeldScope", "Still held"), color: "var(--ink)", bold: true, points: years.map((y, i) => [y, heldCum[i] / 1e3] as [number, number]) }];

  // ---- B. deposits per opening ----
  const openings = useMemo(() => [...new Set(EVENTS.map((e) => e.date))].sort(), []);
  let lastYear = "";
  const openingCols = openings.map((d) => {
    const ev = events.filter((e) => e.date === d);
    const v = ev.reduce((a, e) => a + e.samples, 0), w = ev.reduce((a, e) => a + e.withdrawn, 0);
    const y = d.slice(0, 4), tick = y !== lastYear && Number(y) % 3 === 2 ? y : undefined;
    lastYear = y;
    return {
      id: d, label: d, value: v, neg: w, tick,
      readout: tr(language, "openingReadout", "{date}: {n} samples still held from {k} depositors{w}", {
        date: fmtDate(d, language), n: num(v, language), k: ev.filter((e) => e.samples > 0).length,
        w: w ? tr(language, "openingWithdrawn", " · {w} withdrawn", { w: num(w, language) }) : "",
      }),
    };
  });

  // ---- C. depositors ----
  const ranked = [...deps].sort((a, b) => b.samples - a.samples);
  const depRows: BarRow[] = ranked.slice(0, 20).map((d, i) => ({
    id: d.code, label: `${i + 1}. ${d.center ? (DEPOSITORS.filter((x) => x.center === d.center).length > 1 ? `${d.center} (${d.country})` : d.center) : short(d.name)}`, segments: d.center ? [0, d.samples] : [d.samples, 0], highlight: HIGHLIGHT.has(d.iso3) && !d.center,
    readout: tr(language, "depReadout", "{name} ({code}, {country}): {n} samples, {s} species · {share} of the view · first deposit {y}", {
      name: d.name, code: d.code, country: d.country, n: num(d.samples, language), s: num(d.species, language), share: pct(d.samples / (samples || 1), language, 1), y: d.firstYear,
    }),
  }));
  const top5 = ranked.slice(0, 5).reduce((a, d) => a + d.samples, 0);

  // ---- D. crops ----
  const cropTotal = crops.reduce((a, g) => a + g.samples, 0);
  const cropRows: BarRow[] = crops.slice(0, 20).map((g, i) => ({
    id: g.genus, label: `${i + 1}. ${g.common === g.genus ? g.genus : `${g.common} (${g.genus})`}`, segments: [g.samples],
    readout: tr(language, "cropReadout", "{common} (genus {genus}): {n} samples, {share} of the view", { common: g.common, genus: g.genus, n: num(g.samples, language), share: pct(g.samples / (cropTotal || 1), language, 1) }),
  }));

  // ---- F. WIEWS countries with their Svalbard backup ----
  const wiewsRanked = [...wiewsIn].sort((a, b) => b.accessions! - a.accessions!);
  const countryRows: BarRow[] = wiewsRanked.map((c, i) => {
    const backed = Math.min(c.svalbardSamples, c.accessions!), s = backupShare(c)!;
    return {
      id: c.iso3, label: `${i + 1}. ${cName(c, language)}`, segments: [backed, c.accessions! - backed], highlight: isOn(c.iso3),
      readout: tr(language, "ctyReadout", "{name}: {acc} accessions in {b} genebanks (WIEWS 2024) · {sv} samples in Svalbard from national institutes ({share})", {
        name: cName(c, language), acc: num(c.accessions!, language), b: c.genebanks ?? 0, sv: num(c.svalbardSamples, language), share: s > 1 ? `>${pct(1, language)}` : pct(s, language, s > 0 && s < 0.1 ? 1 : 0),
      }),
    };
  });

  // ---- G. WIEWS trend ----
  const trendSeries = [
    { key: "World", label: tr(language, "world", "World"), color: "var(--ink)", bold: true, points: TREND.map((r) => [r.year, r.World / 1e6] as [number, number]) },
    ...(world ? ["International"] as Continent[] : [scope as Continent]).map((k) => ({ key: k, label: continentName(k, language), color: "var(--fw-s0)", points: TREND.map((r) => [r.year, r[k] / 1e6] as [number, number]) })),
  ];

  // ---- I. new depositors per year ----
  const newCols = years.map((y) => {
    const n = deps.filter((d) => d.firstYear === y);
    return {
      id: String(y), label: String(y), value: n.length, tick: y % 2 === 0 ? String(y) : undefined,
      readout: tr(language, "newReadout", "{y}: {n} new depositors{list}", { y, n: n.length, list: n.length && n.length <= 4 ? ` · ${n.map((d) => d.center ?? d.country).join(", ")}` : "" }),
    };
  });

  // ---- J. international centres: Svalbard vs their own WIEWS holdings ----
  const centreRows: BarRow[] = CENTRES.filter((c) => c.wiewsAccessions).map((c) => {
    const backed = Math.min(c.svalbardSamples, c.wiewsAccessions!), s = c.svalbardSamples / c.wiewsAccessions!;
    return {
      id: c.center, label: c.center, segments: [backed, c.wiewsAccessions! - backed],
      readout: tr(language, "centreReadout", "{c}: {sv} samples in Svalbard, {w} accessions in WIEWS 2024 ({s})", { c: c.center, sv: num(c.svalbardSamples, language), w: num(c.wiewsAccessions!, language), s: s > 1 ? `>${pct(1, language)}` : pct(s, language) }),
    };
  });

  // ---- Values for facts, takeaways and research (whole dataset) ----
  const all = useMemo(() => {
    const top = [...DEPOSITORS].sort((a, b) => b.samples - a.samples);
    const intl = DEPOSITORS.filter((d) => d.center && !d.regional).reduce((a, d) => a + d.samples, 0);
    const w = COUNTRIES.filter((c) => c.accessions);
    const backed = w.filter((c) => c.svalbardDepositors > 0);
    const shares = backed.map((c) => backupShare(c)!);
    const noBackup = w.filter((c) => c.svalbardDepositors === 0).sort((a, b) => b.accessions! - a.accessions!);
    const covered = w.reduce((a, c) => a + Math.min(c.svalbardSamples, c.accessions!), 0) / w.reduce((a, c) => a + c.accessions!, 0);
    const icarda = CUMULATIVE.filter((r) => [2015, 2017, 2019].includes(r.year)).reduce((a, r) => a + (r.withdrawn ?? 0), 0);
    const notInWiews = COUNTRIES.filter((c) => !c.accessions).sort((a, b) => b.svalbardSamples - a.svalbardSamples);
    const peak = [...CUMULATIVE].filter((r) => r.year > 2008 && r.year < 2026).sort((a, b) => b.deposited - a.deposited)[0];
    const recentNew = DEPOSITORS.filter((d) => d.firstYear >= 2024).length, firstNew = DEPOSITORS.filter((d) => d.firstYear <= 2010).length;
    const since2012 = CUMULATIVE.filter((r) => r.year >= 2012 && r.year <= 2025).map((r) => r.deposited);
    return {
      top5: top.slice(0, 5).reduce((a, d) => a + d.samples, 0) / KPIS.svalbardSamples, top5names: top.slice(0, 5).map((d) => d.center ?? d.name),
      intl: intl / KPIS.svalbardSamples, nIntl: DEPOSITORS.filter((d) => d.center && !d.regional).length,
      g50: generaFor(0.5, GENERA), g80: generaFor(0.8, GENERA), g90: generaFor(0.9, GENERA), wheatRice: (GENERA[0].samples + GENERA[1].samples) / KPIS.svalbardSamples,
      hhiCrops: hhi(GENERA.map((g) => g.samples)), hhiDeps: hhi(DEPOSITORS.map((d) => d.samples)),
      wiews: w.length, backed: backed.length, medShare: median(shares), over: backed.filter((c) => backupShare(c)! > 1), covered,
      noBackup, icarda, notInWiews, peak, recentNew, firstNew, depLo: Math.min(...since2012), depHi: Math.max(...since2012),
      mex: COUNTRIES.find((c) => c.iso3 === "MEX")!, usa: COUNTRIES.find((c) => c.iso3 === "USA")!,
      cimmyt: CENTRES.find((c) => c.center === "CIMMYT")!, ratio: KPIS.svalbardSamples / KPIS.globalExSituAccessions,
    };
  }, []);

  // Family mode: three plain facts, recomputed for the view.
  const facts = [
    country
      ? { title: tr(language, "f1cHead", "{name} in the vault", { name: cName(country, language) }), text: country.svalbardSamples
          ? tr(language, "f1c", "National genebanks of {name} keep {sv} seed samples in Svalbard, against {acc} accessions they report to FAO.", { name: cName(country, language), sv: num(country.svalbardSamples, language), acc: country.accessions == null ? "—" : num(country.accessions, language) })
          : tr(language, "f1cNone", "No national genebank of {name} has sent seeds to Svalbard yet, although they report {acc} accessions to FAO.", { name: cName(country, language), acc: country.accessions == null ? "—" : num(country.accessions, language) }) }
      : crops.length > 1
        ? { title: tr(language, "f1Head", "Two crops lead"), text: world ? tr(language, "f1w", "About {p} of all the seed samples in Svalbard are {a} or {b}.", { p: pct((crops[0].samples + crops[1].samples) / (cropTotal || 1), language), a: crops[0].common.toLowerCase(), b: crops[1].common.toLowerCase() }) : tr(language, "f1", "In {scope}, about {p} of the seed samples in Svalbard are {a} or {b}.", { scope: scopeName, p: pct((crops[0].samples + crops[1].samples) / (cropTotal || 1), language), a: crops[0].common.toLowerCase(), b: crops[1].common.toLowerCase() }) }
        : null,
    { title: tr(language, "f2Head", "A back-up that was used"), text: tr(language, "f2", "When war forced the ICARDA genebank out of Aleppo, Syria, it took {n} of its own samples back out of Svalbard (2015–2019) to rebuild its collection in Lebanon and Morocco.", { n: num(all.icarda, language) }) },
    { title: tr(language, "f3Head", "One spare for every four"), text: tr(language, "f3", "Svalbard holds {sv} samples; the world's genebanks report {acc} accessions to FAO. That is about one spare copy for every {k}, and many genebank accessions are themselves duplicates.", { sv: compact(KPIS.svalbardSamples, language), acc: compact(KPIS.globalExSituAccessions, language), k: num(1 / all.ratio, language, 1) }) },
  ].filter((f): f is { title: string; text: string } => !!f);

  const bShare = country ? backupShare(country) : null;
  const ctyNote = (n: number) => tr(language, "kpiCountriesNote", "with a national depositor · {w} of {all} countries reporting to WIEWS", { w: wiewsBacked.length, all: wiewsIn.length, n });

  return (
    <div className="viz fw sb">
      {/* Controls: one global filter (continent of the depositor) and a country filter */}
      <div className="controls" role="group" aria-label={tr(language, "controlsAria", "Filter the dashboard by continent")}>
        <label className="select">
          <span className="mono">{tr(language, "continent", "Continent")}</span>
          <select value={scope} onChange={(e) => pickScope(e.target.value as Scope)}>
            <option value="all">{tr(language, "world", "World")}</option>
            {CONTINENTS.map((c) => <option key={c} value={c}>{continentName(c, language)}</option>)}
          </select>
        </label>
        <label className="select">
          <span className="mono">{tr(language, "country", "Country")}</span>
          <select value={country?.iso3 ?? ""} onChange={(e) => setCountryId(e.target.value)} disabled={scope === "International"}>
            <option value="">{tr(language, "allCountries", "All countries ({n})", { n: countriesIn.length })}</option>
            {countryOptions.map((c) => <option key={c.iso3} value={c.iso3}>{cName(c, language)}</option>)}
          </select>
        </label>
        <p className="muted fw-scope">{tr(language, "scopeNote", "The continent is where the depositing genebank is; international centres (CGIAR and regional genebanks) form their own group, as in FAO WIEWS. Mexico, the United States and the country you pick are highlighted in copper.")}</p>
        {(!world || country) && <button type="button" className="gw-reset" onClick={() => { setScope("all"); setCountryId(""); }}>{tr(language, "reset", "Reset")}</button>}
      </div>

      {/* Key numbers */}
      <section className="stats fw-stats" aria-label={tr(language, "statsAria", "Key numbers for {scope}", { scope: country ? cName(country, language) : scopeName })}>
        <KpiCard accent label={tr(language, "kpiSamples", "Seed samples in Svalbard")} value={num(country ? country.svalbardSamples : samples, language)}
          note={world && !country ? tr(language, "kpiSamplesNote", "Seed Portal, {date}; seedvault.no shows {w}", { date: fmtDate(CAPTURED_AT, language), w: num(REC.websiteSamples, language) })
            : tr(language, "kpiSamplesNoteScope", "{p} of the vault", { p: pct((country ? country.svalbardSamples : samples) / KPIS.svalbardSamples, language, 1) })} />
        <KpiCard label={tr(language, "kpiDepositors", "Depositors")} value={num(country ? country.svalbardDepositors : deps.length, language)}
          note={tr(language, "kpiDepositorsNote", "genebanks with seeds in the vault · of {n} in total", { n: KPIS.depositors })} />
        <KpiCard label={world && !country ? tr(language, "kpiSpecies", "Species") : country ? tr(language, "kpiGeneraW", "Genera in national genebanks") : tr(language, "kpiGenera", "Crop genera")}
          value={world && !country ? num(KPIS.species, language) : country ? (country.genera == null ? "—" : num(country.genera, language)) : num(crops.filter((g) => g.samples > 0).length, language)}
          note={world && !country ? tr(language, "kpiSpeciesNote", "in {g} genera; {n} genera hold half the samples", { g: num(KPIS.genera, language), n: all.g50 })
            : country ? tr(language, "kpiGeneraWNote", "FAO WIEWS 2024") : tr(language, "kpiGeneraNote", "{n} hold half of these samples", { n: generaFor(0.5, crops) })} />
        <KpiCard label={tr(language, "kpiExSitu", "Accessions in genebanks")} value={exSitu == null ? "—" : compact(exSitu, language)}
          note={country ? (country.accessions == null ? tr(language, "kpiExSituNone", "not reported to FAO WIEWS for 2024") : tr(language, "kpiExSituCountry", "{b} genebanks · FAO WIEWS 2024", { b: country.genebanks ?? 0 }))
            : tr(language, "kpiExSituNote", "{scope} · FAO WIEWS, SDG 2.5.1.a, {y}", { scope: scopeName, y: KPIS.globalYear })} />
        <KpiCard label={country ? tr(language, "kpiShare", "Svalbard ÷ WIEWS") : tr(language, "kpiCountries", "Countries backed up")}
          value={country ? (bShare == null ? "—" : bShare > 1 ? `>${pct(1, language)}` : pct(bShare, language, bShare > 0 && bShare < 0.1 ? 1 : 0)) : scope === "International" ? "—" : num(backedIn.length, language)}
          note={country ? tr(language, "kpiShareNote", "samples in Svalbard per national accession; counts are not matched one to one") : scope === "International" ? tr(language, "kpiCountriesIntl", "centres are not countries") : ctyNote(backedIn.length)} />
      </section>

      <StudyFacts facts={facts} language={language} />

      <div className="fw-grid">
        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "cumTitle", "How the vault filled up")}</h2>
            <p className="muted">{world && !country
              ? tr(language, "cumSub", "Thousands of samples. “Held” is NordGen's year-end count (Annual Progress Report 2025) and, for 2026, the Seed Portal today; the gap to “deposited” is withdrawals, almost all by ICARDA in 2015–2019.")
              : tr(language, "cumSub2", "{scope}: thousands of samples still in the vault, by the year they were deposited (Seed Portal). Withdrawn samples are not counted.", { scope: country ? cName(country, language) : scopeName })}</p>
          </div></div>
          <LineChartCard series={cumSeries} yFmt={(v) => num(Math.abs(v) < 1e-9 ? 0 : v, language)} xStep={2} baseline={0}
            ariaLabel={tr(language, "cumAria", "Seed samples held in Svalbard, 2008–2026")} hint={tr(language, "lineHint", "Hover or focus a point to read it.")} />
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "evTitle", "Every opening of the vault")}</h2>
            <p className="muted">{tr(language, "evSub", "{n} deposit dates since 2008. Bars above the line: samples deposited that day and still held; below: samples withdrawn.", { n: openings.length })}</p>
          </div></div>
          <ColumnChartCard cols={openingCols} fmt={(v) => compact(v, language)}
            legend={[{ label: tr(language, "legDeposited", "Deposited, still held"), color: "var(--fw-s0)" }, { label: tr(language, "legWithdrawn", "Withdrawn"), color: "var(--sb-neg)" }]}
            ariaLabel={tr(language, "evAria", "Samples deposited per opening of the Svalbard Global Seed Vault")} hint={tr(language, "colHint", "Hover or focus a bar to read it.")} />
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "depTitle", "Who deposits: the 20 largest")}</h2>
            <p className="muted">{tr(language, "depSub", "{scope}: of {n} depositors, the top 5 hold {p} of the samples.", { scope: country ? cName(country, language) : scopeName, n: deps.length, p: pct(top5 / (samples || 1), language) })}</p>
          </div></div>
          <BarChartCard rows={depRows} colors={[NAT, INTL]} legend={[tr(language, "legNational", "National genebank"), tr(language, "legIntl", "International or regional centre")]} labelWidth={236} fmt={(v) => compact(v, language)}
            ariaLabel={tr(language, "depAria", "Largest depositors by samples in Svalbard")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")} />
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "cropTitle", "Which crops: the 20 largest")}</h2>
            <p className="muted">{country ? tr(language, "cropSubCountry", "Crop detail is by continent; pick a continent to see it.") : tr(language, "cropSub", "{scope}: samples by genus, with the Seed Portal's common name.", { scope: scopeName })}</p>
          </div></div>
          {cropRows.length ? <BarChartCard rows={cropRows} colors={["var(--fw-s0)"]} labelWidth={236} fmt={(v) => compact(v, language)}
            ariaLabel={tr(language, "cropAria", "Largest crop genera by samples in Svalbard")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")} /> : null}
          {cropRows.length ? <p className="lp-small">{tr(language, "nameNote", "Names are the Seed Portal's, except where one species holds at least 90% of a genus: then the genus takes that crop's name (Pennisetum → pearl millet, Cicer → chickpea, Eleusine → finger millet, Cajanus → pigeon pea).")}</p> : null}
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "originTitle", "Where the seeds were collected")}</h2>
            <p className="muted">{tr(language, "originSub", "Whole vault, by continent of origin of each sample (not of the depositor). This chart does not change with the filter.")}</p>
          </div></div>
          <DonutCard center={compact(KPIS.svalbardSamples, language)} centerNote={tr(language, "samples", "samples")}
            slices={ORIGIN.filter((o) => o.samples > 100).map((o) => ({ key: o.continent, label: tr(language, `orig_${o.continent.replace(/\s/g, "")}`, o.continent), value: o.samples, color: ORIGIN_COLORS[o.continent],
              readout: tr(language, "originReadout", "{c}: {n} samples of {s} species from {d} depositors", { c: tr(language, `orig_${o.continent.replace(/\s/g, "")}`, o.continent), n: num(o.samples, language), s: num(o.species, language), d: o.depositors }) }))}
            ariaLabel={tr(language, "originAria", "Svalbard samples by continent of origin")} hint={tr(language, "donutHint", "Hover or focus a slice to read it.")} />
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "newTitle", "New depositors each year")}</h2>
            <p className="muted">{tr(language, "newSub", "{scope}: year of each genebank's first deposit. {n} joined in 2024–2026.", { scope: country ? cName(country, language) : scopeName, n: deps.filter((d) => d.firstYear >= 2024).length })}</p>
          </div></div>
          <ColumnChartCard cols={newCols} fmt={(v) => num(v, language)}
            ariaLabel={tr(language, "newAria", "New depositors per year")} hint={tr(language, "colHint", "Hover or focus a bar to read it.")} />
        </section>

        {!country && crops.length > 0 && (
          <section className="card fw-wide">
            <div className="card__head"><div>
              <h2>{tr(language, "paretoTitle", "How concentrated is the diversity?")}</h2>
              <p className="muted">{tr(language, "paretoSub", "{scope}: share of samples in each of the 30 largest genera (bars) and cumulative share (line). {a} genera hold 50%, {b} hold 80% and {c} hold 90% of {n} genera.", {
                scope: scopeName, a: generaFor(0.5, crops), b: generaFor(0.8, crops), c: generaFor(0.9, crops), n: num(crops.length, language) })}</p>
            </div></div>
            <ParetoCard total={cropTotal} pct={(v) => pct(v, language)}
              items={crops.map((g) => ({ id: g.genus, label: g.common === g.genus ? g.genus : g.common, value: g.samples, readout: `${g.common} (${g.genus}): ${num(g.samples, language)} · ${pct(g.samples / (cropTotal || 1), language, 1)}` }))}
              ariaLabel={tr(language, "paretoAria", "Pareto chart of samples by crop genus")} hint={tr(language, "paretoHint", "Dashed lines: 50%, 80% and 90%. Hover or focus a bar to read it.")} />
          </section>
        )}

        {scope !== "International" && (
          <section className="card">
            <div className="card__head"><div>
              <h2>{tr(language, "ctyTitle", "Every country's genebanks, and how much is in Svalbard")}</h2>
              <p className="muted">{tr(language, "ctySub", "All {n} countries in {scope} that report to FAO WIEWS (2024), by accessions; the teal part is the size of the national Svalbard deposit, capped at the WIEWS total. Scroll the chart to see them all. Median ratio among backed-up countries: {m}.", {
                n: wiewsIn.length, scope: scopeName, m: pct(median(wiewsBacked.map((c) => backupShare(c)!)), language) })}</p>
            </div></div>
            <BarChartCard rows={countryRows} colors={[NAT, MISSING]} legend={[tr(language, "legBacked", "Matched by Svalbard samples"), tr(language, "legNotBacked", "No Svalbard counterpart")]} scroll focusId={country?.iso3} labelWidth={196}
              fmt={(v) => compact(v, language)} ariaLabel={tr(language, "ctyAria", "Genebank accessions by country with their Svalbard backups")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")} />
          </section>
        )}


        {(world || scope === "International") && !country && (
          <section className="card">
            <div className="card__head"><div>
              <h2>{tr(language, "centreTitle", "International centres: their genebank and their backup")}</h2>
              <p className="muted">{tr(language, "centreSub", "Accessions each centre reports to FAO WIEWS (2024); teal is matched by its samples in Svalbard.")}</p>
            </div></div>
            <BarChartCard rows={centreRows} colors={[NAT, MISSING]} labelWidth={160} fmt={(v) => compact(v, language)}
              ariaLabel={tr(language, "centreAria", "International centres: WIEWS accessions and Svalbard samples")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")} />
          </section>
        )}

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "trendTitle", "The world's genebanks, 1995–2024")}</h2>
            <p className="muted">{tr(language, "trendSub", "Millions of accessions reported for SDG 2.5.1.a (FAO WIEWS). Years before 2010 are sparse.")}</p>
          </div></div>
          <LineChartCard series={trendSeries} yFmt={(v) => num(Math.abs(v) < 1e-9 ? 0 : v, language, 1)} xStep={5} baseline={0}
            ariaLabel={tr(language, "trendAria", "Ex situ accessions in genebanks, 1995–2024")} hint={tr(language, "lineHint", "Hover or focus a point to read it.")} />
        </section>
      </div>

      {scope !== "International" && (
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "tableTitle", "All countries in view")}</h2>
            <p className="muted">{tr(language, "tableSub", "{n} countries in {scope}: every country reporting to FAO WIEWS for 2024 and every country with a national depositor in Svalbard.", { n: countriesIn.length, scope: scopeName })}</p>
          </div></div>
          <DataTable key={scope} rows={countriesIn} focus={country?.iso3} language={language} />
        </section>
      )}

      <SeedQuestions language={language} v={{
        top5: pct(all.top5, language), names: all.top5names.join(", "), intl: pct(all.intl, language), nIntl: all.nIntl,
        g50: all.g50, g80: all.g80, nGen: num(KPIS.genera, language), wr: pct(all.wheatRice, language),
        backed: all.backed, wiews: all.wiews, med: pct(all.medShare, language), covered: pct(all.covered, language),
        nb1: cName(all.noBackup[0], language), nb1a: num(all.noBackup[0].accessions!, language), nb2: cName(all.noBackup[1], language), nb3: cName(all.noBackup[2], language),
        cim: num(all.cimmyt.svalbardSamples, language), cimW: num(all.cimmyt.wiewsAccessions!, language),
        sv: num(KPIS.svalbardSamples, language), glob: num(KPIS.globalExSituAccessions, language),
        icarda: num(all.icarda, language), recent: all.recentNew,
      }} />

      {/* Takeaways */}
      <section className="card takeaways">
        <h2>{tr(language, "takeawaysTitle", "What the data says")}</h2>
        <ul>
          <li><strong>{tr(language, "t1Head", "Five depositors hold {p} of the vault.", { p: pct(all.top5, language) })}</strong> {tr(language, "t1", "{names}. The {n} international centres together deposited {i} of all samples, more than every national genebank combined.", { names: all.top5names.join(", "), n: all.nIntl, i: pct(all.intl, language) })}</li>
          <li><strong>{tr(language, "t2Head", "A few crops dominate.")}</strong> {tr(language, "t2", "Of {n} genera, {a} hold half of the samples and {b} hold 80%; wheat and rice alone are {wr}. The other {rest} genera share the remaining 20%.", { n: num(KPIS.genera, language), a: all.g50, b: all.g80, wr: pct(all.wheatRice, language), rest: num(KPIS.genera - all.g80, language) })}</li>
          <li><strong>{tr(language, "t3Head", "Most national collections are thinly backed up.")}</strong> {tr(language, "t3", "{b} of the {w} countries reporting to FAO WIEWS have a national depositor in Svalbard; the median ratio of Svalbard samples to WIEWS accessions among them is {m}, and across all {w} countries the Svalbard deposits match about {c} of national accessions.", { b: all.backed, w: all.wiews, m: pct(all.medShare, language), c: pct(all.covered, language) })}</li>
          <li><strong>{tr(language, "t4Head", "Mexico: a big backup, but not of its national banks.")}</strong> {tr(language, "t4", "CIMMYT, the international maize and wheat centre near Mexico City, keeps {cim} samples in Svalbard against {cimW} accessions at home. Mexico's national genebanks report {mex} accessions to FAO and have deposited none; national genebanks in the United States have {usa}.", {
            cim: num(all.cimmyt.svalbardSamples, language), cimW: num(all.cimmyt.wiewsAccessions!, language), mex: num(all.mex.accessions!, language), usa: num(all.usa.svalbardSamples, language) })}</li>
          <li><strong>{tr(language, "t5Head", "Deposits slowed, depositors multiplied.")}</strong> {tr(language, "t5", "After the first big year ({y0}: {d0} samples), yearly deposits have ranged from {lo} to {hi} since 2012. But {r} genebanks made their first deposit in 2024–2026, against {r0} in the vault's first three years.", {
            y0: CUMULATIVE[0].year, d0: num(CUMULATIVE[0].deposited, language), lo: num(all.depLo, language), hi: num(all.depHi, language), r: all.recentNew, r0: all.firstNew })}</li>
          <li><strong>{tr(language, "t6Head", "Not every genebank reports to FAO.")}</strong> {tr(language, "t6", "{n} countries have seeds in Svalbard but no 2024 WIEWS figure, led by {a} ({an} samples) and {b}.", { n: all.notInWiews.length, a: cName(all.notInWiews[0], language), an: num(all.notInWiews[0].svalbardSamples, language), b: cName(all.notInWiews[1], language) })}</li>
        </ul>
      </section>

      <SeedQuality language={language} v={{
        portal: num(REC.portalSamples, language), web: num(REC.websiteSamples, language), gap: num(REC.portalSamples - REC.websiteSamples, language),
        end25: num(REC.reportEnd2025Holdings, language), d26: num(REC.deposits2026, language), acc: num(REC.reportAccumulated, language), wd: num(REC.reportWithdrawn, language),
        dash: num(REC.wiewsTotal2024Dashboard, language), trend: num(REC.wiewsTotal2024Trend, language), over: all.over.length, overNames: all.over.map((c) => cName(c, language)).join(", "),
        notIn: all.notInWiews.length,
      }} />

      {/* Footer: method, attribution */}
      <section className="method lp-method">
        <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
        <div className="method__text">
          <p>{tr(language, "method1", "Svalbard: the public exports of the Seed Portal run by NordGen (depositors, deposit events, depositor × date × crop, depositor × genus, genera, species, continent of origin), downloaded on {date}. A sample is one seed accession that a genebank sends as a safety duplicate; it stays the depositor's property. Counts are current holdings: samples withdrawn later no longer count for the day they arrived. Year-end holdings for 2008–2025 come from Table 5 of NordGen's Annual Progress Report 2025; the build stops unless the Portal total equals the report's end-2025 holdings plus the 2026 deposits.", { date: fmtDate(CAPTURED_AT, language) })}</p>
          <p>{tr(language, "method2", "Genebanks: FAO WIEWS holdings for SDG indicator 2.5.1.a (accessions conserved in medium- or long-term facilities), 2024, by country and for 17 international and regional centres, and the 1995–2024 series. WIEWS also compiles records from Genesys and EURISCO, which keep their own terms of use. Svalbard holds only seeds that tolerate drying and freezing; WIEWS also counts field, in vitro and cryopreserved collections, so the Svalbard ÷ WIEWS ratio is a rough indicator of duplication, not a match of individual accessions. International centres are kept apart from host countries in both sources. Continents follow the UN M49 regions.")}</p>
          <p>{tr(language, "method3", "The page includes every depositor and every country in both sources, with no ranking cut-off in the country chart and table; the depositor and crop charts show the 20 largest, and the Excel download has every row.")}</p>
        </div>
        <p className="method__sources">
          {tr(language, "sources", "Sources")}:{" "}
          <a href="https://seedvault.nordgen.org/" rel="noopener">Svalbard Global Seed Vault Seed Portal</a> (NordGen)
          {" · "}<a href="https://www.nordgen.org/our-work/svalbard-global-seed-vault/annual-progress-reports/" rel="noopener">NordGen Annual Progress Reports</a>
          {" · "}<a href="https://www.fao.org/wiews/data/ex-situ/overview/en" rel="noopener">FAO WIEWS, SDG 2.5.1.a</a> (© FAO)
          {" · "}<a href="https://www.croptrust.org/work/svalbard-global-seed-vault/" rel="noopener">Crop Trust</a>, {tr(language, "cropTrust", "partner in the Seed Vault with Norway and NordGen")}
        </p>
        <SeedSources checkedOn={fmtDate("2026-11-25", language)} language={language} />
      </section>
    </div>
  );
}

/** Long institute names shortened for chart axes; the readout keeps the full name. */
function short(name: string): string {
  return name.length > 26 ? `${name.slice(0, 25).trimEnd()}…` : name;
}
