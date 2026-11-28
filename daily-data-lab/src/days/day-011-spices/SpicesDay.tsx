import StudyFacts from "../StudyFacts.jsx";
import { useMemo, useState } from "react";
import { useLanguage } from "../../language.jsx";
import {
  type SpiceId, CAPTURED_AT, CHECKS, COLOR, COUNTRIES, EVENTS, FIRST, FLOW_COVER, FLOW_YEARS, LATEST, MEX_VANILLA, PROD, SPICES, SPICE_IDS, SUMMARY, WORLD, YEARS,
  base1961, producers, tradeOf, traders, usdPerKg, yi,
} from "./data";
import { type BarRow, type Series, BarChartCard, LineChartCard } from "../day-006-food-waste/Charts";
import FlowMap, { VIEWS, cName } from "./FlowMap";
import { CountryProfile, KpiCard, RankingTable, SpiceProfile, Timeline, Treemap, hhiLabel, hhiRows, priceRows, spiceName } from "./Panels";
import { tr, num, pc, usd, tonnes, fmtDate } from "./text";
import { SpiceQuality, SpiceQuestions, SpiceSources } from "./Research";

const pct = (a: number | null | undefined, b: number | null | undefined) => (a != null && b ? (100 * a) / b : null);
const SERIES_TINT = ["var(--ink)", "var(--sp-a)", "var(--sp-b)", "var(--sp-c)", "var(--sp-d)"];

export default function SpicesDay() {
  const language: string = useLanguage();
  const [spice, setSpice] = useState<SpiceId>("pepper");
  const [year, setYear] = useState(LATEST);
  const [view, setView] = useState("world");
  const [history, setHistory] = useState(false);
  const [event, setEvent] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [side, setSide] = useState<"export" | "import">("export");
  const S = SUMMARY[spice];
  const countryOptions = useMemo(() => COUNTRIES.filter((c) => !c.former && SPICE_IDS.some((s) => PROD[s][c.iso3] || tradeOf(s, c.iso3)))
    .map((c) => ({ iso3: c.iso3, name: cName(c.iso3, language) })).sort((a, b) => a.name.localeCompare(b.name, language)), [language]);
  const pickCountry = (iso3: string) => { setCountry(iso3); document.getElementById("sp-map")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const pickEvent = (id: string) => {
    setHistory(true); setEvent(id);
    const e = EVENTS.find((x) => x.id === id);
    if (e) setView(e.places.every(([lon]) => lon < -30) ? "americas" : e.places.every(([lon, lat]) => lon > -15 && lon < 45 && lat > 25) ? "europe" : e.places.some(([lon]) => lon > 45) || e.route.length ? (e.places.some(([lon]) => lon < -15) ? "world" : "indian") : "world");
    document.getElementById("sp-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ---- B. production 1961→ : the world and today's four largest producers ----
  const lineSeries: Series[] = useMemo(() => {
    const top = producers(spice).slice(0, 4).map((p) => p.iso3);
    const world: Series = { key: "world", label: tr(language, "world", "World"), color: SERIES_TINT[0], bold: true,
      points: YEARS.map((y) => [y, (WORLD[spice].prod[yi(y)] ?? 0) / 1000] as [number, number]) };
    return [world, ...top.map((iso3, i) => ({ key: iso3, label: cName(iso3, language), color: SERIES_TINT[i + 1],
      points: YEARS.map((y) => [y, PROD[spice][iso3]?.[yi(y)]] as [number, number | null]).filter((p): p is [number, number] => p[1] != null).map(([y, v]) => [y, v / 1000] as [number, number]) }))];
  }, [spice, language]);

  // ---- vanilla close-up: Mexico, Madagascar, Indonesia ----
  const vanSeries: Series[] = (["MDG", "IDN", "MEX"] as const).map((iso3) => ({
    key: iso3, label: cName(iso3, language), color: iso3 === "MEX" ? "var(--copper)" : iso3 === "MDG" ? "var(--sp-a)" : "var(--sp-c)", bold: iso3 === "MEX",
    points: YEARS.map((y) => [y, PROD.vanilla[iso3]?.[yi(y)]] as [number, number | null]).filter((p): p is [number, number] => p[1] != null),
  }));
  const mexPartners = MEX_VANILLA.filter((m) => m[0] === LATEST).slice(0, 5);

  // ---- values for KPIs, facts, takeaways and research ----
  const A = useMemo(() => {
    const share = (s: SpiceId, iso3: string, y = LATEST) => pct(PROD[s][iso3]?.[yi(y)], WORLD[s].prod[yi(y)]);
    const pep61 = ["IND", "MYS", "IDN"].reduce((a, k) => a + (share("pepper", k, FIRST) ?? 0), 0);
    const pep24 = ["VNM", "IND", "BRA"].reduce((a, k) => a + (share("pepper", k) ?? 0), 0);
    const clove61 = ["MDG", "TZA"].reduce((a, k) => a + (share("cloves", k, FIRST) ?? 0), 0);
    const vanPrice = WORLD.vanilla.exportUsd.map((v, i) => (v != null && WORLD.vanilla.exportT[i] ? v / (WORLD.vanilla.exportT[i]! * 1000) : 0));
    const pk = vanPrice.indexOf(Math.max(...vanPrice));
    const gaps = CHECKS.map((c) => c.gapPct);
    const cover = FLOW_COVER.filter((f) => f.year === LATEST);
    const reex = traders("vanilla", "export").filter((t) => (PROD.vanilla[t.iso3]?.[yi(LATEST)] ?? 0) < t.t * 0.1).slice(0, 3).map((t) => t.iso3);
    const totalT = SPICE_IDS.reduce((a, s) => a + SUMMARY[s].worldTonnes, 0);
    const offT = SPICE_IDS.reduce((a, s) => a + (SUMMARY[s].worldTonnes * SUMMARY[s].officialPct) / 100, 0);
    const high = SPICE_IDS.filter((s) => SUMMARY[s].hhi > 2500);
    const mexX0 = tradeOf("vanilla", "MEX", 2000)?.[0] ?? 0;
    return {
      share, pep61, pep24, clove61, vanPrice, pk, gapMin: Math.min(...gaps), gapMax: Math.max(...gaps), cover, reex, off: (100 * offT) / totalT, high,
      totalUsd: SPICE_IDS.reduce((a, s) => a + SUMMARY[s].exportUsd, 0), mexX0,
      reporters: Math.max(...cover.map((c) => c.reporters)),
    };
  }, []);
  const vanX = SUMMARY.vanilla.exportT, vanP = SUMMARY.vanilla.worldTonnes;
  const vnmPepUsd = tradeOf("pepper", "VNM")?.[1] ?? null;
  const growth = base1961(spice);

  const facts = [
    { title: tr(language, "f1Head", "The world trades more vanilla than it grows"), text: tr(language, "f1", "In {y}, countries reported {x} t of vanilla exports for {p} t harvested: beans are cured, sorted and sold on, so they cross borders more than once. A kilogram is worth about {k} US$, against {c} for dry chillies.", { y: LATEST, x: num(vanX, language), p: num(vanP, language), k: num(SUMMARY.vanilla.usdPerKg, language, 0), c: num(SUMMARY.chillies.usdPerKg, language, 2) }) },
    { title: tr(language, "f2Head", "Black pepper moved to Viet Nam"), text: tr(language, "f2", "In 1961 Viet Nam grew {v61} t of pepper; in {y} it grew {v24} t, {s} of the world's, and sold {u} of it abroad. The old pepper coasts of India, Malaysia and Indonesia grew {old} of the world's pepper in 1961.", { v61: num(PROD.pepper.VNM?.[0] ?? 0, language), v24: num(PROD.pepper.VNM?.[yi(LATEST)] ?? 0, language), y: LATEST, s: pc(A.share("pepper", "VNM"), language), u: usd(vnmPepUsd, language), old: pc(A.pep61, language) }) },
    { title: tr(language, "f3Head", "Mexico gave the world vanilla"), text: tr(language, "f3", "Mexico still grows {t} t of vanilla ({s} of the world, third after Madagascar and Indonesia), but exported only {x} t in {y}. In 1961 it grew {s61}, second only to Madagascar.", { t: num(PROD.vanilla.MEX?.[yi(LATEST)] ?? 0, language), s: pc(A.share("vanilla", "MEX"), language), x: num(tradeOf("vanilla", "MEX")?.[0] ?? 0, language, 1), y: LATEST, s61: pc(A.share("vanilla", "MEX", FIRST), language) }) },
  ];

  const hhi: BarRow[] = hhiRows(language, spice);
  const price: BarRow[] = priceRows(language, spice);
  const rv = {
    y: LATEST, indChil: pc(A.share("chillies", "IND"), language), indSeed: pc(A.share("seeds", "IND"), language), indGin: pc(A.share("ginger", "IND"), language),
    idnClove: pc(A.share("cloves", "IDN"), language), mdgVan: pc(A.share("vanilla", "MDG"), language), vnmPep: pc(A.share("pepper", "VNM"), language),
    high: A.high.length, seedH: num(SUMMARY.seeds.hhi, language), cloveH: num(SUMMARY.cloves.hhi, language), pepH: num(SUMMARY.pepper.hhi, language),
    pep61: pc(A.pep61, language), pep24: pc(A.pep24, language), vnmUsd: usd(vnmPepUsd, language), clove61: pc(A.clove61, language),
    vx: num(vanX, language), vp: num(vanP, language), ratio: num((100 * vanX) / vanP, language), reex: A.reex.map((i) => cName(i, language)).join(", "),
    gapMin: num(A.gapMin, language, 1), gapMax: num(A.gapMax, language, 1),
    v61: num(A.vanPrice[0], language, 1), vpk: num(A.vanPrice[A.pk], language, 0), vpkY: FIRST + A.pk, v24: num(A.vanPrice[yi(LATEST)], language, 1),
    x: num(SUMMARY.vanilla.usdPerKg / SUMMARY.chillies.usdPerKg, language), chil: num(SUMMARY.chillies.usdPerKg, language, 2),
    mex61: pc(A.share("vanilla", "MEX", FIRST), language), mex24: pc(A.share("vanilla", "MEX"), language), mexT: num(PROD.vanilla.MEX?.[yi(LATEST)] ?? 0, language),
    mexX: num(tradeOf("vanilla", "MEX")?.[0] ?? 0, language, 1), mexX0: num(A.mexX0, language, 1),
  };

  return (
    <div className="viz lp fw sp">
      {/* Controls */}
      <div className="controls" role="group" aria-label={tr(language, "controlsAria", "Filter the dashboard")}>
        <div className="lp-phen sp-selector">
          <span className="mono">{tr(language, "spice", "Spice")}</span>
          <div className="lp-phen__opts" role="radiogroup" aria-label={tr(language, "spice", "Spice")}>
            {SPICES.map((s) => (
              <button key={s.id} type="button" role="radio" aria-checked={spice === s.id} className={spice === s.id ? "on" : ""} onClick={() => setSpice(s.id)}>
                <i style={{ background: COLOR[s.id] }} />{spiceName(s.id, language)}
              </button>
            ))}
          </div>
        </div>
        <label className="select">
          <span className="mono">{tr(language, "country", "Country")}</span>
          <select value={country ?? ""} onChange={(e) => setCountry(e.target.value || null)}>
            <option value="">{tr(language, "allCountries", "All countries ({n})", { n: countryOptions.length })}</option>
            {countryOptions.map((c) => <option key={c.iso3} value={c.iso3}>{c.name}</option>)}
          </select>
        </label>
        <div className="seg">
          <span className="mono">{tr(language, "flowYear", "Trade year")}</span>
          <div className="seg__opts" role="radiogroup" aria-label={tr(language, "flowYear", "Trade year")}>
            {FLOW_YEARS.map((y) => <button key={y} type="button" role="radio" aria-checked={year === y} className={year === y ? "on" : ""} onClick={() => setYear(y)}>{y}</button>)}
          </div>
        </div>
        <p className="muted fw-scope">{tr(language, "scopeNote", "Key numbers are for {y}. Black pepper is selected first; Mexico, vanilla's homeland, is highlighted in copper.", { y: LATEST })}</p>
        {(spice !== "pepper" || country || year !== LATEST || history) && <button type="button" className="gw-reset" onClick={() => { setSpice("pepper"); setCountry(null); setYear(LATEST); setHistory(false); setEvent(null); setView("world"); }}>{tr(language, "reset", "Reset")}</button>}
      </div>

      {/* Key numbers */}
      <section className="stats ds-stats sp-stats" aria-label={tr(language, "statsAria", "Key numbers for {s}, {y}", { s: spiceName(spice, language), y: LATEST })}>
        <KpiCard accent label={tr(language, "kpiTonnes", "World production")} value={tonnes(S.worldTonnes, language)}
          note={tr(language, "kpiTonnesNote", "{s} · {y} · {ha} ha harvested", { s: spiceName(spice, language), y: LATEST, ha: num(S.areaHa, language) })} />
        <KpiCard label={tr(language, "kpiExport", "World exports")} value={usd(S.exportUsd, language)}
          note={tr(language, "kpiExportNote", "{t} · imports {m}", { t: tonnes(S.exportT, language), m: usd(S.importUsd, language) })} />
        <KpiCard label={tr(language, "kpiTop", "Top producer")} value={cName(S.topProducer, language)}
          note={tr(language, "kpiTopNote", "{p} of world tonnes · {n} producing countries", { p: pc(S.topProducerShare, language), n: S.producers })} />
        <KpiCard label={tr(language, "kpiHhi", "Supply concentration (HHI)")} value={num(S.hhi, language)}
          note={tr(language, "kpiHhiNote", "{band} · top 3 grow {t}", { band: hhiLabel(S.hhi, language), t: pc(S.top3, language) })} />
        <KpiCard label={tr(language, "kpiGrowth", "Growth since 1961")} value={growth ? `×${num(S.worldTonnes / growth, language, 1)}` : "—"}
          note={tr(language, "kpiGrowthNote", "world tonnes, {y} vs the 1961–63 mean ({b})", { y: LATEST, b: tonnes(growth, language) })} />
        <KpiCard label={tr(language, "kpiImporter", "Top importer")} value={cName(S.topImporter, language)}
          note={tr(language, "kpiImporterNote", "{p} of world import value", { p: pc(S.topImporterShare, language) })} />
        <KpiCard label={tr(language, "kpiUnit", "Export price")} value={`${num(S.usdPerKg, language, 2)} US$/kg`}
          note={tr(language, "kpiUnitNote", "world export value ÷ tonnes · 1961: {p}", { p: num(usdPerKg(spice, FIRST) ?? 0, language, 2) })} />
        <KpiCard label={tr(language, "kpiExporters", "Exporting countries")} value={num(S.exporters, language)}
          note={tr(language, "kpiExportersNote", "with at least 0.01% of world tonnes · export HHI {h}", { h: num(S.exportHhi, language) })} />
      </section>

      <StudyFacts facts={facts} language={language} />

      {/* A. Flow map */}
      <section className="card lp-panel" id="sp-map">
        <div className="card__head">
          <div>
            <p className="mono lp-eyebrow">A · {tr(language, "mapEyebrow", "Flow map")}</p>
            <h2>{tr(language, "mapTitle", "{s}: the 50 largest trade flows, {y}", { s: spiceName(spice, language), y: year })}</h2>
            <p className="lp-sub">{tr(language, "mapLead", "FAOSTAT Detailed trade matrix, as reported by importers. Arcs run from the exporting to the importing country, wider for more dollars. Switch on the historical layer to see the cited events of the 15th–19th centuries.")}</p>
          </div>
          <div className="lp-views" role="group" aria-label={tr(language, "mapViews", "Map view")}>
            {VIEWS.map((v) => <button key={v.id} type="button" aria-pressed={view === v.id} className={view === v.id ? "on" : ""} onClick={() => setView(v.id)}>{tr(language, v.key, v.label)}</button>)}
          </div>
        </div>
        <div className="lp-views ds-layers" role="group" aria-label={tr(language, "layers", "Layers")}>
          <button type="button" aria-pressed={history} className={history ? "on" : ""} onClick={() => { setHistory((h) => !h); if (history) setEvent(null); }}>{tr(language, "layerHistory", "Historic Spice Route")}</button>
        </div>
        <div className="lp-map-grid">
          <FlowMap spice={spice} year={year} view={view} history={history} event={event} onEvent={pickEvent} country={country} onCountry={pickCountry} language={language} />
          <aside className="lp-side">
            {country ? <CountryProfile iso3={country} spice={spice} onClose={() => setCountry(null)} onSpice={setSpice} language={language} />
              : <SpiceProfile spice={spice} onPick={pickCountry} onEvent={pickEvent} language={language} />}
          </aside>
        </div>
      </section>

      <div className="fw-grid">
        {/* B. Production over time */}
        <section className="card lp-panel">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">B · {tr(language, "lineEyebrow", "Since 1961")}</p>
            <h2>{tr(language, "lineTitle", "{s}: world production and today's four largest growers", { s: spiceName(spice, language) })}</h2>
            <p className="lp-sub">{tr(language, "lineLead", "Thousand tonnes a year, FAOSTAT, {a}–{b}. Former states (the USSR, Ethiopia PDR, Sudan before 2011) appear under their own names in the data.", { a: FIRST, b: LATEST })}</p>
          </div></div>
          <LineChartCard series={lineSeries} yFmt={(v) => num(v, language)} xStep={10}
            ariaLabel={tr(language, "lineAria", "Production by year, thousand tonnes")} hint={tr(language, "lineHint", "Hover or focus a point to read it.")} />
        </section>

        {/* C. Concentration */}
        <section className="card lp-panel">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">C · {tr(language, "hhiEyebrow", "Concentration")}</p>
            <h2>{tr(language, "hhiTitle", "How concentrated is supply? HHI by spice, {y}", { y: LATEST })}</h2>
            <p className="lp-sub">{tr(language, "hhiLead", "Herfindahl–Hirschman index of production shares (0–10,000). Above 2,500 a market counts as highly concentrated, below 1,500 as unconcentrated (US merger guidelines, 2010).")}</p>
          </div></div>
          <BarChartCard rows={hhi} colors={["var(--sp-bar)"]} labelWidth={150} fmt={(v) => num(v, language)}
            ariaLabel={tr(language, "hhiAria", "HHI of production by spice")} hint={tr(language, "barHint", "Hover or focus a row to read it.")} />
        </section>

        {/* D. Treemap */}
        <section className="card lp-panel">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">D · {tr(language, "treeEyebrow", "Who grows it")}</p>
            <h2>{tr(language, "treeTitle", "{s}: production by country, {y}", { s: spiceName(spice, language), y: LATEST })}</h2>
            <p className="lp-sub">{tr(language, "treeLead", "The fourteen largest producers and the rest. {o} of these tonnes are official figures; the rest are FAO estimates or imputations.", { o: pc(S.officialPct, language) })}</p>
          </div></div>
          <Treemap spice={spice} focus={country} onPick={pickCountry} language={language} />
        </section>

        {/* E. Prices */}
        <section className="card lp-panel">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">E · {tr(language, "priceEyebrow", "Value")}</p>
            <h2>{tr(language, "priceTitle", "What a kilogram is worth, {y}", { y: LATEST })}</h2>
            <p className="lp-sub">{tr(language, "priceLead", "World export value divided by export tonnes, current US dollars. An average over grades and forms, not a market price.")}</p>
          </div></div>
          <BarChartCard rows={price} colors={["var(--sp-bar)"]} labelWidth={150} fmt={(v) => num(v, language, 2)}
            ariaLabel={tr(language, "priceAria", "Export unit value by spice, US$ per kg")} hint={tr(language, "barHint", "Hover or focus a row to read it.")} />
        </section>

        {/* F. Timeline */}
        <section className="card lp-panel fw-wide">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">F · {tr(language, "histEyebrow", "The historic Spice Route")}</p>
            <h2>{tr(language, "histTitle", "Eight cited moments, 14th–19th centuries")}</h2>
            <p className="lp-sub">{tr(language, "histLead", "Each event says only what its source states, with the part of the source that was read. Click one to see it on the map. Historical quantities appear only when a source gives them.")}</p>
          </div></div>
          <Timeline selected={event} onSelect={pickEvent} language={language} />
        </section>

        {/* G. Vanilla close-up */}
        <section className="card lp-panel fw-wide">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">G · {tr(language, "vanEyebrow", "Close-up")}</p>
            <h2>{tr(language, "vanTitle", "Vanilla: from Papantla to Madagascar")}</h2>
            <p className="lp-sub">{tr(language, "vanLead", "Vanilla production in tonnes, {a}–{b}: Madagascar, Indonesia and Mexico.", { a: FIRST, b: LATEST })}</p>
          </div></div>
          <div className="lp-map-grid">
            <LineChartCard series={vanSeries} yFmt={(v) => num(v, language)} xStep={10}
              ariaLabel={tr(language, "vanAria", "Vanilla production by year, tonnes")} hint={tr(language, "lineHint", "Hover or focus a point to read it.")} />
            <aside className="lp-side">
              <ul className="ds-facts">
                <li>{tr(language, "van1", "Mexico: {t} t in {y}, {s} of the world; {s61} in 1961.", { t: num(PROD.vanilla.MEX?.[yi(LATEST)] ?? 0, language), y: LATEST, s: pc(A.share("vanilla", "MEX"), language), s61: pc(A.share("vanilla", "MEX", FIRST), language) })}</li>
                <li>{tr(language, "van2", "Madagascar exported {t} t worth {v} in {y}.", { t: num(tradeOf("vanilla", "MDG")?.[0] ?? 0, language), v: usd(tradeOf("vanilla", "MDG")?.[1] ?? null, language), y: LATEST })}</li>
                <li>{tr(language, "van3", "Mexico's vanilla buyers in {y}, as reported by them: {list}.", { y: LATEST, list: mexPartners.length ? mexPartners.map((m) => `${cName(m[1], language)} ${usd(m[3], language)}`).join(", ") : "—" })}</li>
                <li>{tr(language, "van4", "Price: {a} US$/kg in 1961, {b} at the {y} peak, {c} in {z} (current dollars).", { a: rv.v61, b: rv.vpk, y: rv.vpkY, c: rv.v24, z: LATEST })}</li>
              </ul>
            </aside>
          </div>
        </section>
      </div>

      {/* H. Ranking */}
      <section className="card lp-panel">
        <div className="card__head">
          <div>
            <p className="mono lp-eyebrow">H · {tr(language, "tableEyebrow", "Ranking")}</p>
            <h2>{side === "export" ? tr(language, "tableTitleX", "{s}: who sells it, {y}", { s: spiceName(spice, language), y: year }) : tr(language, "tableTitleM", "{s}: who buys it, {y}", { s: spiceName(spice, language), y: year })}</h2>
          </div>
          <div className="seg">
            <span className="mono">{tr(language, "side", "Show")}</span>
            <div className="seg__opts" role="radiogroup" aria-label={tr(language, "side", "Show")}>
              {(["export", "import"] as const).map((k) => <button key={k} type="button" role="radio" aria-checked={side === k} className={side === k ? "on" : ""} onClick={() => setSide(k)}>{k === "export" ? tr(language, "exporters", "Exporters") : tr(language, "importers", "Importers")}</button>)}
            </div>
          </div>
        </div>
        <RankingTable key={`${spice}-${side}-${year}`} spice={spice} year={year} side={side} focus={country} onPick={pickCountry} language={language} />
      </section>

      <SpiceQuestions language={language} v={rv} />

      {/* Takeaways */}
      <section className="card takeaways">
        <h2>{tr(language, "takeawaysTitle", "What the data says")}</h2>
        <ul>
          <li><strong>{tr(language, "t1Head", "A few countries grow most spices.")}</strong> {tr(language, "t1", "{h} of eight spice groups are highly concentrated (HHI above 2,500). India alone grows {seed} of seed spices and {chil} of dry chillies; Indonesia {clove} of cloves.", { h: A.high.length, seed: rv.indSeed, chil: rv.indChil, clove: rv.idnClove })}</li>
          <li><strong>{tr(language, "t2Head", "The Spice Route's centre has shifted, not vanished.")}</strong> {tr(language, "t2", "Asia still leads, but pepper's core moved from India, Malaysia and Indonesia ({a} in 1961) to Viet Nam, India and Brazil ({b} in {y}); Guatemala's cardamom now tops the nutmeg, mace and cardamom group.", { a: rv.pep61, b: rv.pep24, y: LATEST })}</li>
          <li><strong>{tr(language, "t3Head", "Trade counts beans twice.")}</strong> {tr(language, "t3", "World vanilla exports are {r}% of world production; Europe and North America re-export what they import. World exports and imports of the same spice differ by {lo} to {hi}%.", { r: rv.ratio, lo: rv.gapMin, hi: rv.gapMax })}</li>
          <li><strong>{tr(language, "t4Head", "Spices are a {v} export business.", { v: usd(A.totalUsd, language) })}</strong> {tr(language, "t4", "The eight groups sold {v} abroad in {y}; chillies, pepper and seed spices are the largest, vanilla the most valuable per kilogram ({k} US$/kg).", { v: usd(A.totalUsd, language), y: LATEST, k: num(SUMMARY.vanilla.usdPerKg, language, 2) })}</li>
          <li><strong>{tr(language, "t5Head", "Mexico grows vanilla but sells little of it.")}</strong> {tr(language, "t5", "{t} t grown, {x} t exported in {y}.", { t: rv.mexT, x: rv.mexX, y: LATEST })}</li>
        </ul>
      </section>

      <SpiceQuality language={language} v={{
        qn: num(SPICE_IDS.reduce((a, s) => a + Object.keys(PROD[s]).length, 0), language), fy: FIRST, y: LATEST, off: pc(A.off, language), vanOff: pc(SUMMARY.vanilla.officialPct, language), cinOff: pc(SUMMARY.cinnamon.officialPct, language),
        gapMin: num(A.gapMin, language, 1), gapMax: num(A.gapMax, language, 1), covMin: num(Math.min(...A.cover.map((c) => c.sharePct)), language), covMax: num(Math.max(...A.cover.map((c) => c.sharePct)), language),
        rep: A.reporters, ev: EVENTS.length,
      }} />

      {/* Footer: method, attribution */}
      <section className="method lp-method">
        <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
        <div className="method__text">
          <p>{tr(language, "method1", "FAOSTAT bulk files (production QCL, trade TCL and the Detailed trade matrix TM) were filtered to eight items: pepper (Piper spp., 687), dry chillies and peppers (689), ginger (720), anise, badian, coriander, cumin, caraway, fennel and juniper (711), nutmeg, mace and cardamoms (702), cinnamon (693), cloves (698) and vanilla (692). Countries are joined through UN M49 codes to ISO3 and to World Bank regions, capitals and population. For every spice, the {y} country sum matches FAOSTAT's World row; 'China' (351) is dropped because it repeats mainland China, Hong Kong, Macao and Taiwan.", { y: LATEST })}</p>
          <p>{tr(language, "method2", "HHI is the sum of squared production shares × 10,000. Unit values are world export value ÷ export tonnes. Flows are importer reports (CIF) for 2000, 2010 and {y}; the map draws the 50 largest by value. Historical events come from scripts/day-011/history.json, each with one verified reference; routes are schematic. Snapshot built {date} with DuckDB.", { y: LATEST, date: fmtDate(CAPTURED_AT, language) })}</p>
          <p>{tr(language, "method3", "Raw spices only: ground, crushed or processed products are separate FAOSTAT items and are not included. Values are current US dollars, not deflated.")}</p>
        </div>
        <p className="method__sources">
          {tr(language, "sources", "Attribution")}:{" "}
          <a href="https://www.fao.org/faostat/en/" rel="noopener">FAO. FAOSTAT</a> (CC BY 4.0)
          {" · "}<a href="https://datatopics.worldbank.org/world-development-indicators/" rel="noopener">World Bank WDI</a> (CC BY 4.0)
          {" · "}<a href="https://unstats.un.org/unsd/methodology/m49/overview/" rel="noopener">UN M49</a>
          {" · "}{tr(language, "historians", "historians cited in the timeline and references")}
        </p>
        <SpiceSources checkedOn={fmtDate("2026-11-28", language)} language={language} />
      </section>
    </div>
  );
}
