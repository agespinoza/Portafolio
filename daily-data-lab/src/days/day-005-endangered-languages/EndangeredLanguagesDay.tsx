import { useCallback, useMemo, useState } from "react";
import { useLanguage } from "../../language.jsx";
import {
  type Language,
  AES_LEVELS, BY_CODE, CAPTURED_AT, FAMILIES, GLOTTOSCOPE, GRAMBANK, LANGUAGES, MACROAREAS, MIN_FAMILY,
  countryStats, crossTab, familiesOver50, familyStats, isEndangered, isPriority, totals,
} from "./data";
import { type Cell, type ColorBy, CoverageChart, FamilyTreemap, GrammarAtRisk, LanguageMap, RiskDocHeatmap, StackedBarCard, aesName, medName } from "./Charts";
import { LanguageFacts, KpiCard, LanguageList, LanguageProfile, RankingTable } from "./Panels";
import { tr, num, pct, fmtDate, countryName } from "./text";
import { LanguagesQuality, LanguagesQuestions, LanguagesSources } from "./Research";

const GLOBAL = totals(LANGUAGES);
const GLOBAL_FAMS = familyStats(LANGUAGES);
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const share = (list: Language[], f: (l: Language) => boolean) => (list.length ? list.filter(f).length / list.length : 0);
const DEFAULT_CODE = [...LANGUAGES].filter(isPriority).sort((a, b) => b.aes - a.aes || b.med - a.med || a.name.localeCompare(b.name))[0]?.code ?? null;

export default function EndangeredLanguagesDay() {
  const language: string = useLanguage();
  const [macro, setMacro] = useState(-1);
  const [family, setFamily] = useState<number | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [cell, setCell] = useState<Cell>(null);
  const [colorBy, setColorBy] = useState<ColorBy>("aes");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(DEFAULT_CODE);

  // Scope filters (macroarea, family, country); each chart drops the filter it controls so it can still switch it.
  const inMacro = (l: Language) => macro < 0 || l.macro === macro;
  const inFamily = (l: Language) => family == null || l.family === family;
  const inCountry = (l: Language) => country == null || l.countries.includes(country);
  const scope = useMemo(() => LANGUAGES.filter((l) => inMacro(l) && inFamily(l) && inCountry(l)), [macro, family, country]);
  const forBars = useMemo(() => LANGUAGES.filter((l) => inFamily(l) && inCountry(l)), [family, country]);
  const forTree = useMemo(() => LANGUAGES.filter((l) => inMacro(l) && inCountry(l)), [macro, country]);
  const forRank = useMemo(() => LANGUAGES.filter((l) => inMacro(l) && inFamily(l)), [macro, family]);
  const inCell = (l: Language) => !cell || (l.aes === cell.aes && (l.med === cell.med || (cell.med === 4 && l.med < 0)));
  const scopeSet = useMemo(() => new Set(scope), [scope]);
  const match = useCallback((l: Language) => scopeSet.has(l) && inCell(l), [scopeSet, cell]);

  const t = useMemo(() => totals(scope), [scope]);
  const fams = useMemo(() => familyStats(scope), [scope]);
  const over50 = familiesOver50(fams);
  const eligibleFams = fams.filter((f) => f.idx >= 0 && f.living >= MIN_FAMILY).length;
  const matrix = useMemo(() => crossTab(scope), [scope]);
  const countries = useMemo(() => countryStats(forRank), [forRank]);
  const scopeCountries = useMemo(() => countryStats(scope), [scope]);
  const listed = useMemo(() => scope.filter((l) => (cell ? inCell(l) : isPriority(l))), [scope, cell]);
  const lang = selected ? BY_CODE.get(selected) ?? null : null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return LANGUAGES.filter((l) => l.name.toLowerCase().includes(q) || l.code === q || l.iso === q).slice(0, 8);
  }, [query]);
  const pick = (code: string) => { setSelected(code); setQuery(""); };
  const filtersOn = macro >= 0 || family != null || country != null || cell != null;
  const reset = () => { setMacro(-1); setFamily(null); setCountry(null); setCell(null); };
  const scopeName = [
    macro >= 0 ? tr(language, `macro${macro}`, MACROAREAS[macro]) : null,
    family != null ? FAMILIES[family].name : null,
    country ? countryName(country, language) : null,
  ].filter(Boolean).join(" · ") || tr(language, "world", "World");

  // Takeaway numbers, recomputed from the bundled data.
  const macroStats = MACROAREAS.map((m, i) => ({ m, i, ...totals(LANGUAGES.filter((l) => l.macro === i)) }));
  const topPriority = [...macroStats].sort((a, b) => b.priority - a.priority)[0];
  const topExtinct = [...macroStats].sort((a, b) => b.extinct / b.languages - a.extinct / a.languages)[0];
  const gbBy = (a: number) => share(LANGUAGES.filter((l) => l.aes === a), (l) => l.grambank);
  const living = LANGUAGES.filter((l) => l.aes >= 1 && l.aes <= 5);
  const gbLivingMin = Math.min(...AES_LEVELS.slice(0, 5).map(gbBy)), gbLivingMax = Math.max(...AES_LEVELS.slice(0, 5).map(gbBy));
  const priorityYear = median(LANGUAGES.filter((l) => isPriority(l) && l.medYear).map((l) => l.medYear!));
  const otherEndYear = median(LANGUAGES.filter((l) => isEndangered(l) && !isPriority(l) && l.medYear).map((l) => l.medYear!));
  const endPoor = LANGUAGES.filter((l) => isEndangered(l) && (l.med >= 3 || l.med < 0)).length;

  return (
    <div className="viz al el">
      {/* Controls */}
      <div className="controls" role="group" aria-label={tr(language, "controlsAria", "Find a language and filter the dashboard")}>
        <div className="al-search">
          <label className="select">
            <span className="mono">{tr(language, "search", "Language")}</span>
            <input type="search" value={query} placeholder={tr(language, "searchPlaceholder", "Search {count} languages by name, Glottocode, or ISO…", { count: num(LANGUAGES.length, language) })}
              onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && results[0]) pick(results[0].code); }}
              aria-controls={results.length > 0 ? "el-results" : undefined} />
          </label>
          {results.length > 0 && (
            <ul id="el-results" className="al-results">
              {results.map((l) => (
                <li key={l.code}><button type="button" onClick={() => pick(l.code)}>
                  <strong>{l.name}</strong><span>{aesName(l.aes, language)} · {l.code}</span>
                </button></li>
              ))}
            </ul>
          )}
        </div>
        <label className="select">
          <span className="mono">{tr(language, "macroarea", "Macroarea")}</span>
          <select value={macro} onChange={(e) => setMacro(Number(e.target.value))}>
            <option value={-1}>{tr(language, "world", "World")}</option>
            {MACROAREAS.map((m, i) => <option key={m} value={i}>{tr(language, `macro${i}`, m)}</option>)}
          </select>
        </label>
        {filtersOn ? <button type="button" className="gw-reset" onClick={reset}>{tr(language, "reset", "Reset")}</button> : null}
        {(family != null || country != null || cell) && (
          <p className="el-chips" aria-live="polite">
            {family != null && <button type="button" onClick={() => setFamily(null)}>{FAMILIES[family].name} ×</button>}
            {country && <button type="button" onClick={() => setCountry(null)}>{countryName(country, language)} ×</button>}
            {cell && <button type="button" onClick={() => setCell(null)}>{aesName(cell.aes, language)} × {medName(cell.med, language)} ×</button>}
          </p>
        )}
      </div>

      {/* Key numbers */}
      <section className="stats" aria-label={tr(language, "statsAria", "Key numbers for {scope}", { scope: scopeName })}>
        <KpiCard accent label={tr(language, "kpiEndangered", "Endangered languages")} value={num(t.endangered, language)}
          note={tr(language, "kpiEndangeredNote", "threatened to nearly extinct (AES 2–5) · {scope}", { scope: scopeName })} />
        <KpiCard label={tr(language, "kpiShare", "Share of living languages")} value={pct(t.living ? t.endangered / t.living : 0, language)}
          note={tr(language, "kpiShareNote", "{e} of {n} still spoken", { e: num(t.endangered, language), n: num(t.living, language) })} />
        <KpiCard label={tr(language, "kpiExtinct", "Extinct")} value={num(t.extinct, language)}
          note={tr(language, "kpiExtinctNote", "{p} of all {n} languages in Glottolog's list", { p: pct(t.languages ? t.extinct / t.languages : 0, language), n: num(t.languages, language) })} />
        <KpiCard label={tr(language, "kpiFamilies", "Families over 50% endangered")} value={num(over50.length, language)}
          note={tr(language, "kpiFamiliesNote", "of {n} families with ≥ {min} living languages", { n: num(eligibleFams, language), min: MIN_FAMILY })} />
      </section>

      <LanguageFacts list={scope} t={t} countries={scopeCountries} language={language} />

      {/* Map */}
      <section className="card al-sky">
        <div className="card__head">
          <div>
            <h2>{tr(language, "mapTitle", "Where the world's languages are, and how they are doing")}</h2>
            <p className="muted">{tr(language, "mapSub0", "{n} spoken first languages in Glottolog 5.4, one dot per language at its Glottolog point.", { n: num(LANGUAGES.length, language) })}
              {macro >= 0 || family != null || country != null || cell ? " " + tr(language, "mapFaded", "Dots outside the current filter are faded.") : ""}</p>
          </div>
          <div className="seg seg--small">
            <span className="mono">{tr(language, "colorBy", "Color by")}</span>
            <div className="seg__opts" role="radiogroup" aria-label={tr(language, "colorBy", "Color by")}>
              <button type="button" role="radio" aria-checked={colorBy === "aes"} className={colorBy === "aes" ? "on" : ""} onClick={() => setColorBy("aes")}>{tr(language, "colorAes", "Endangerment")}</button>
              <button type="button" role="radio" aria-checked={colorBy === "med"} className={colorBy === "med" ? "on" : ""} onClick={() => setColorBy("med")}>{tr(language, "colorMed", "Description")}</button>
            </div>
          </div>
        </div>
        <LanguageMap list={LANGUAGES} colorBy={colorBy} match={match} selected={lang} onSelect={pick} language={language} />
      </section>

      <div className="two">
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "heatTitle", "Endangered and poorly documented")}</h2>
            <p className="muted">{tr(language, "heatSub", "{scope}: {p} languages are shifting or worse and have no grammar sketch.", { scope: scopeName, p: num(t.priority, language) })}</p>
          </div></div>
          <RiskDocHeatmap matrix={matrix} cell={cell} onCellClick={setCell} language={language} />
        </section>
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "profileTitle", "Language profile")}</h2>
            <p className="muted">{tr(language, "profileSub", "Glottolog 5.4 · AES and MED")}</p>
          </div></div>
          <LanguageProfile lang={lang} language={language} />
        </section>
      </div>

      <div className="two el-two-even">
        <section className="card">
          <div className="card__head"><div>
            <h2>{cell
              ? tr(language, "listCellTitle", "{aes} × {med}", { aes: aesName(cell.aes, language), med: medName(cell.med, language) })
              : tr(language, "listTitle", "Priority languages")}</h2>
            <p className="muted">{tr(language, "listSub", "{n} languages in {scope}, most at risk and least described first.", { n: num(listed.length, language), scope: scopeName })}</p>
          </div></div>
          <LanguageList key={`${scopeName}-${cell?.aes}-${cell?.med}`} list={listed} selected={selected} onSelect={pick} language={language} />
        </section>
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "stackTitle", "Endangerment by macroarea")}</h2>
            <p className="muted">{tr(language, "stackSub", "Share of languages in each status; the number is the total.")}</p>
          </div></div>
          <StackedBarCard list={forBars} active={macro} onSelect={setMacro} language={language} />
        </section>
      </div>

      <section className="card">
        <div className="card__head"><div>
          <h2>{tr(language, "treeTitle", "Which families are most at risk?")}</h2>
          <p className="muted">{tr(language, "treeSub", "The {n} largest families plus isolates and the rest, in {scope}.", { n: 28, scope: macro >= 0 ? tr(language, `macro${macro}`, MACROAREAS[macro]) : tr(language, "world", "World") })}</p>
        </div></div>
        <FamilyTreemap fams={familyStats(forTree)} active={family} onSelect={setFamily} language={language} />
      </section>

      <section className="card">
        <div className="card__head"><div>
          <h2>{tr(language, "rankTitle", "Countries with the most endangered languages")}</h2>
          <p className="muted">{tr(language, "rankSub", "Top 15 in {scope}. Priority = shifting or worse with no grammar sketch.", { scope: macro >= 0 || family != null ? [macro >= 0 ? tr(language, `macro${macro}`, MACROAREAS[macro]) : null, family != null ? FAMILIES[family].name : null].filter(Boolean).join(" · ") : tr(language, "world", "World") })}</p>
        </div></div>
        <RankingTable countries={countries} active={country} onSelect={setCountry} language={language} />
      </section>

      <div className="two">
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "covTitle", "Who makes it into the typology databases?")}</h2>
            <p className="muted">{tr(language, "covSub", "Share of languages coded in Grambank and WALS, by status (world).")}</p>
          </div></div>
          <CoverageChart list={LANGUAGES} language={language} />
        </section>
        <section className="card el-covnote">
          <div className="card__head"><div>
            <h2>{tr(language, "covReadTitle", "Reading the coverage")}</h2>
          </div></div>
          <p className="muted">{tr(language, "covRead", "Grambank codes {gb} of all {n} languages and WALS {wals}. Living languages are covered at similar rates whatever their status; extinct languages are covered least, often because too little was recorded to answer the questions.", {
            gb: pct(share(LANGUAGES, (l) => l.grambank), language), wals: pct(share(LANGUAGES, (l) => l.wals), language), n: num(LANGUAGES.length, language),
          })}</p>
        </section>
      </div>

      <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "gramTitle", "Grammar carried by endangered languages")}</h2>
            <p className="muted">{tr(language, "gramSub", "Grambank feature values found in at least 30 languages, ranked by the share of those languages that are endangered or extinct. Bars: share; lines: 95% interval.")}</p>
          </div></div>
          <GrammarAtRisk language={language} />
      </section>

      <LanguagesQuestions language={language} v={{
        endangered: num(GLOBAL.endangered, language), living: num(GLOBAL.living, language), share: pct(GLOBAL.endangered / GLOBAL.living, language),
        priority: num(GLOBAL.priority, language), topMacro: tr(language, `macro${topPriority.i}`, topPriority.m), topMacroN: num(topPriority.priority, language),
        topMacroShare: pct(topPriority.priority / GLOBAL.priority, language), gbExtinct: pct(gbBy(6), language), gbMin: pct(gbLivingMin, language), gbMax: pct(gbLivingMax, language),
        gbBase: pct(GRAMBANK.baseEndangered, language), gbMajority: num(GRAMBANK.majorityEndangered, language), gbValues: num(GRAMBANK.values, language),
      }} />

      {/* Takeaways */}
      <section className="card takeaways">
        <h2>{tr(language, "takeawaysTitle", "What the data says")}</h2>
        <ul>
          <li><strong>{tr(language, "t1Head", "{share} of living languages are endangered.", { share: pct(GLOBAL.endangered / GLOBAL.living, language) })}</strong> {tr(language, "t1", "Glottolog rates {e} of {n} spoken first languages as threatened, shifting, moribund, or nearly extinct, and {x} more as extinct. Only {safe} are not endangered.", {
            e: num(GLOBAL.endangered, language), n: num(GLOBAL.living, language), x: num(GLOBAL.extinct, language), safe: num(living.filter((l) => l.aes === 1).length, language),
          })}</li>
          <li><strong>{tr(language, "t2Head", "{p} languages are at risk and barely described.", { p: num(GLOBAL.priority, language) })}</strong> {tr(language, "t2", "They are shifting or worse and have no grammar sketch. {macro} holds {n} of them ({share}). Counting threatened languages too, {all} endangered languages lack a grammar sketch.", {
            macro: tr(language, `macro${topPriority.i}`, topPriority.m), n: num(topPriority.priority, language), share: pct(topPriority.priority / GLOBAL.priority, language), all: num(endPoor, language),
          })}</li>
          <li><strong>{tr(language, "t3Head", "{macro} has already lost the most.", { macro: tr(language, `macro${topExtinct.i}`, topExtinct.m) })}</strong> {tr(language, "t3", "{x} of its {n} languages ({share}) are extinct, and {e} of its {living} living languages are endangered.", {
            x: num(topExtinct.extinct, language), n: num(topExtinct.languages, language), share: pct(topExtinct.extinct / topExtinct.languages, language),
            e: num(topExtinct.endangered, language), living: num(topExtinct.living, language),
          })}</li>
          <li><strong>{tr(language, "t4Head", "Typology databases skip the extinct, not the endangered.")}</strong> {tr(language, "t4", "Grambank codes {min}–{max} of living languages at every status, but only {ext} of extinct ones, which are often known from too little material to code.", {
            min: pct(gbLivingMin, language), max: pct(gbLivingMax, language), ext: pct(gbBy(6), language),
          })}</li>
          <li><strong>{tr(language, "t5Head", "Old descriptions.")}</strong> {tr(language, "t5", "For priority languages, the median best description dates from {a}; for other endangered languages, {b}.", { a: priorityYear, b: otherEndYear })}</li>
        </ul>
      </section>

      <LanguagesQuality language={language} v={{
        languages: num(LANGUAGES.length, language), unassessed: num(GLOBAL.unassessed, language),
        scopeAes: num(GLOTTOSCOPE.aes.reduce((a, b) => a + b, 0), language), medWeb: num(GLOTTOSCOPE.med[4], language), medCldf: num(GLOTTOSCOPE.cldfMed[4], language),
        gbLangs: num(GRAMBANK.languages, language), fams: num(GLOBAL_FAMS.filter((f) => f.idx >= 0).length, language),
      }} />

      <section className="method lp-method">
        <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
        <div className="method__text">
          <p>{tr(language, "method1", "The universe is every languoid at level \"language\" with category \"Spoken L1 Language\" in Glottolog 5.4 (7,685), read from the CLDF release with DuckDB. Endangerment is Glottolog's Agglomerated Endangerment Status (AES), which merges ElCat, the UNESCO Atlas, Ethnologue, and later sources into six levels. Documentation is the Most Extensive Description (MED): the longest grammar, sketch, text, or wordlist Glottolog's bibliography links to the language.")}</p>
          <p>{tr(language, "method2", "\"Endangered\" here means AES 2–5 (threatened to nearly extinct); shares use living languages (AES 1–5) as the denominator. \"Priority\" means AES 3–5 and no grammar sketch (MED phonology/texts, wordlist, or nothing). A family counts toward the 50% KPI if it has at least 5 living languages. Intervals are Wilson 95% intervals. Languages with several macroareas keep the first one; languages spoken in several countries count in each.")}</p>
          <p>{tr(language, "method3", "Check: AES counts match GlottoScope on glottolog.org exactly once sign languages are added back ({n} languages). MED counts differ from the GlottoScope page (for example, {web} vs {cldf} \"wordlist or less\"); this page uses the citable CLDF release. Grambank 1.0.3 and WALS 2020.6 are joined by Glottocode. Snapshot built {date}.", {
            n: num(GLOTTOSCOPE.aes.reduce((a, b) => a + b, 0), language), web: num(GLOTTOSCOPE.med[4], language), cldf: num(GLOTTOSCOPE.cldfMed[4], language), date: fmtDate(CAPTURED_AT, language),
          })}</p>
        </div>
        <p className="method__sources">
          {tr(language, "sources", "Sources")}:{" "}
          <a href="https://doi.org/10.5281/zenodo.24101243" rel="noopener">Glottolog 5.4</a> (Hammarström, Forkel, Haspelmath &amp; Bank, CC-BY 4.0)
          {" · "}<a href="https://doi.org/10.5281/zenodo.7844558" rel="noopener">Grambank 1.0.3</a> (Skirgård et al., CC-BY 4.0)
          {" · "}<a href="https://wals.info/" rel="noopener">WALS Online</a> (Dryer &amp; Haspelmath, CC-BY 4.0)
          {" · "}Natural Earth
        </p>
        <LanguagesSources checkedOn={fmtDate("2026-11-22", language)} language={language} />
      </section>
    </div>
  );
}
