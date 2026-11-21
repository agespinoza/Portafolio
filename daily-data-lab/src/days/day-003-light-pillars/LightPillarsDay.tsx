import { useMemo, useState } from "react";
import { useLanguage } from "../../language.jsx";
import { monthNames } from "../locales.js";
import {
  type Obs, type Phenomenon, type RegionId, OBS, PHENOMENA, PH, REGIONS, YEARS, EXCLUDED, CAPTURED_AT, WINDOW,
  summary, uniqueEvents, wilson, isPillar,
} from "./data";
import WorldMap, { VIEWS } from "./WorldMap";
import { YearChart, SeasonChart, StripPlot, Scatter, WX_VARS, type Unit, type WxVar } from "./Charts";
import { RecordCard, Comparator, Catalog, qualityFlags, EV_TEXT } from "./Panels";
import Simulator from "./Simulator";
import { tr, num, fmt1, pct, fmtDate } from "./text";

type EvidenceFilter = "all" | "located" | "A";
const Y0 = YEARS[0], Y1 = YEARS[YEARS.length - 1];

export default function LightPillarsDay() {
  const language: string = useLanguage();
  const months = useMemo(() => monthNames(language) as string[], [language]);
  const [active, setActive] = useState<Phenomenon[]>(PHENOMENA.map((p) => p.id));
  const [yearFrom, setYearFrom] = useState(Y0);
  const [yearTo, setYearTo] = useState(Y1);
  const [month, setMonth] = useState(0);
  const [region, setRegion] = useState<RegionId | "all">("all");
  const [evidence, setEvidence] = useState<EvidenceFilter>("all");
  const [unit, setUnit] = useState<Unit>("photos");
  const [view, setView] = useState("world");
  const [selected, setSelected] = useState<string | null>(null);
  const [wxVar, setWxVar] = useState<WxVar>("t");
  const [align, setAlign] = useState(false);

  const keep = (o: Obs, skip?: "month" | "year" | "region") =>
    o.phenomena.some((p) => active.includes(p)) &&
    (skip === "year" || (o.year >= yearFrom && o.year <= yearTo)) &&
    (skip === "month" || !month || o.month === month) &&
    (skip === "region" || region === "all" || o.region === region) &&
    (evidence === "all" || (evidence === "located" ? o.lat != null : o.evidence === "A"));
  const deps = [active, yearFrom, yearTo, month, region, evidence];
  const rows = useMemo(() => OBS.filter((o) => keep(o)), deps);
  const forYears = useMemo(() => OBS.filter((o) => keep(o, "year")), deps);
  const forMonths = useMemo(() => OBS.filter((o) => keep(o, "month")), deps);
  const forRegions = useMemo(() => OBS.filter((o) => keep(o, "region")), deps);
  const located = rows.filter((o) => o.lat != null);
  const sel = OBS.find((o) => o.id === selected) ?? null;

  const k = rows.filter(isPillar).length;
  const ci = wilson(k, rows.length);
  const czaTimed = rows.filter((o) => o.phenomena.includes("cza") && o.sunElevation != null);
  const czaOk = czaTimed.filter((o) => o.sunElevation! < 32.2).length;
  const wxHour = rows.filter((o) => o.wx?.basis === "hour").length;
  const wxDay = rows.filter((o) => o.wx?.basis === "daymean").length;
  const activeList = PHENOMENA.filter((p) => active.includes(p.id)).map((p) => p.id);

  const togglePh = (id: Phenomenon) => setActive((a) => (a.includes(id) ? (a.length > 1 ? a.filter((x) => x !== id) : a) : [...a, id]));
  const filtersOn = active.length !== PHENOMENA.length || yearFrom !== Y0 || yearTo !== Y1 || month || region !== "all" || evidence !== "all";
  const reset = () => { setActive(PHENOMENA.map((p) => p.id)); setYearFrom(Y0); setYearTo(Y1); setMonth(0); setRegion("all"); setEvidence("all"); };
  const pick = (id: string) => { setSelected(id); setView("world"); document.getElementById("lp-map")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className="viz lp">
      {/* Controls */}
      <div className="controls lp-controls" role="group" aria-label={tr(language, "controlsAria", "Filter the catalog")}>
        <div className="lp-phen">
          <span className="mono">{tr(language, "phenomena", "Phenomena")}</span>
          <div className="lp-phen__opts">
            {PHENOMENA.map((p) => (
              <button key={p.id} type="button" aria-pressed={active.includes(p.id)} className={active.includes(p.id) ? "on" : ""} onClick={() => togglePh(p.id)}>
                <i style={{ background: p.color }} />{tr(language, p.key, p.label)}
              </button>
            ))}
          </div>
        </div>
        <div className="range">
          <span className="mono">{tr(language, "years", "Years")}</span>
          <div className="range__pair">
            <label className="select select--inline"><span className="sr">{tr(language, "from", "From")}</span>
              <select value={yearFrom} onChange={(e) => { const v = Number(e.target.value); setYearFrom(v); if (v > yearTo) setYearTo(v); }}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <span className="range__dash" aria-hidden="true">–</span>
            <label className="select select--inline"><span className="sr">{tr(language, "to", "To")}</span>
              <select value={yearTo} onChange={(e) => { const v = Number(e.target.value); setYearTo(v); if (v < yearFrom) setYearFrom(v); }}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
          </div>
        </div>
        <label className="select"><span className="mono">{tr(language, "month", "Month")}</span>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            <option value={0}>{tr(language, "allMonths", "All months")}</option>
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </label>
        <label className="select"><span className="mono">{tr(language, "region", "Region")}</span>
          <select value={region} onChange={(e) => setRegion(e.target.value as RegionId | "all")}>
            <option value="all">{tr(language, "allRegions", "All regions")}</option>
            {REGIONS.map((r) => <option key={r.id} value={r.id}>{tr(language, r.key, r.label)}</option>)}
          </select>
        </label>
        <Seg label={tr(language, "evidenceFilter", "Evidence")} value={evidence} onChange={setEvidence} options={[
          { value: "all", label: tr(language, "evAll", "All") }, { value: "located", label: tr(language, "evLocated", "Located") }, { value: "A", label: tr(language, "evBest", "Level A") },
        ]} />
        <Seg label={tr(language, "count", "Count")} value={unit} onChange={setUnit} options={[
          { value: "photos", label: tr(language, "unitPhotos", "Photos") }, { value: "events", label: tr(language, "unitEvents", "Events") },
        ]} />
        {filtersOn ? <button type="button" className="gw-reset" onClick={reset}>{tr(language, "clearFilters", "Clear filters")}</button> : null}
      </div>

      {/* Key numbers */}
      <section className="stats lp-stats" aria-label={tr(language, "statsAria", "Key numbers")}>
        <Stat accent label={tr(language, "statPhotos", "Photos in view")} value={num(rows.length, language)}
          note={tr(language, "statPhotosNote", "{ev} events after merging bursts · of {all} dated", { ev: num(uniqueEvents(rows), language), all: num(OBS.length, language) })} />
        <Stat label={tr(language, "statLocated", "With coordinates")} value={rows.length ? pct(located.length / rows.length, language) : "—"}
          note={tr(language, "statLocatedNote", "{n} on the map · the rest have a date only", { n: num(located.length, language) })} />
        <Stat label={tr(language, "statShare", "Pillar share")} value={rows.length ? pct(k / rows.length, language) : "—"}
          note={tr(language, "statShareNote", "{k} pillar photos · 95% CI {lo}–{hi}", { k, lo: pct(ci[0], language), hi: pct(ci[1], language) })} />
        <Stat label={tr(language, "statCza", "Physics check")} value={czaTimed.length ? `${czaOk}/${czaTimed.length}` : "—"}
          note={tr(language, "statCzaNote", "circumzenithal arcs with the Sun below 32.2°, as optics requires")} />
      </section>

      {/* A. Map */}
      <section className="card lp-panel" id="lp-map" aria-labelledby="lp-map-title">
        <div className="card__head">
          <div>
            <p className="mono lp-eyebrow">A · {tr(language, "mapEyebrow", "World map")}</p>
            <h2 id="lp-map-title">{tr(language, "mapTitle", "Where ice-crystal optics have been photographed and shared")}</h2>
            <p className="lp-sub">{tr(language, "mapLead", "Located Wikimedia Commons photos, {from}–{to}. The map shows where people documented displays, not where they happen most.", { from: WINDOW[0].slice(0, 4), to: WINDOW[1].slice(0, 4) })}</p>
          </div>
          <div className="lp-views" role="group" aria-label={tr(language, "mapViews", "Map view")}>
            {VIEWS.map((v) => <button key={v.id} type="button" aria-pressed={view === v.id} className={view === v.id ? "on" : ""} onClick={() => setView(v.id)}>{tr(language, v.key, v.label)}</button>)}
          </div>
        </div>
        <div className="lp-map-grid">
          <WorldMap rows={located} selected={selected} onSelect={setSelected} view={view} language={language} />
          <aside className="lp-side">
            {sel ? <RecordCard o={sel} onClose={() => setSelected(null)} language={language} /> : <MapLegend active={activeList} rows={rows} language={language} />}
          </aside>
        </div>
      </section>

      {/* B. Timeline */}
      <section className="card lp-panel" aria-labelledby="lp-time-title">
        <div className="card__head">
          <div>
            <p className="mono lp-eyebrow">B · {tr(language, "timeEyebrow", "Timeline")}</p>
            <h2 id="lp-time-title">{tr(language, "timeTitle", "{from}–{to}: what was documented each year", { from: Y0, to: Y1 })}</h2>
            <p className="lp-sub">{tr(language, "timeLead", "Counts by capture year. Growth follows digital cameras and Commons uploads, not more frequent displays.")}</p>
          </div>
        </div>
        <YearChart rows={forYears} unit={unit} active={activeList} language={language} />
        <div className="lp-season-head">
          <h3>{tr(language, "seasonTitle", "Seasons by hemisphere")}</h3>
          <label className="lp-toggle">
            <input type="checkbox" checked={align} onChange={(e) => setAlign(e.target.checked)} />
            {tr(language, "alignSeasons", "Align seasons (shift the Southern Hemisphere by six months)")}
          </label>
        </div>
        <SeasonChart rows={forMonths} unit={unit} months={months} align={align} language={language} />
        <p className="notice notice--inline lp-notice" role="note">
          {tr(language, "biasNote", "Observation bias: {n}% of located photos come from the Northern Hemisphere, and most from Europe and North America, where more people photograph and upload. Use shares within a region or month, not raw counts, to compare.", {
            n: Math.round((100 * OBS.filter((o) => o.hemisphere === "N").length) / Math.max(1, OBS.filter((o) => o.hemisphere).length)),
          })}
        </p>
      </section>

      {/* C. Weather */}
      <section className="card lp-panel" aria-labelledby="lp-wx-title">
        <div className="card__head">
          <div>
            <p className="mono lp-eyebrow">C · {tr(language, "wxEyebrow", "Weather at the time")}</p>
            <h2 id="lp-wx-title">{tr(language, "wxTitle", "The air near the ground when each photo was taken")}</h2>
            <p className="lp-sub">{tr(language, "wxLead", "ERA5 reanalysis (Copernicus) matched to the photo's place and hour. It is a gridded model estimate, not a measurement at the camera.")}</p>
          </div>
          <label className="select"><span className="mono">{tr(language, "variable", "Variable")}</span>
            <select value={wxVar} onChange={(e) => setWxVar(e.target.value as WxVar)}>
              {WX_VARS.map((v) => <option key={v.id} value={v.id}>{tr(language, v.key, v.label)}</option>)}
            </select>
          </label>
        </div>
        <Coverage total={rows.length} hour={wxHour} day={wxDay} language={language} />
        <div className="lp-wx-grid">
          <StripPlot rows={rows} variable={wxVar} active={activeList} onPick={pick} language={language} />
          <Scatter rows={rows} active={activeList} onPick={pick} language={language} />
        </div>
      </section>

      {/* D. Simulator */}
      <Simulator language={language} />

      {/* E. Comparator */}
      <section className="card lp-panel" aria-labelledby="lp-cmp-title">
        <div className="card__head">
          <div>
            <p className="mono lp-eyebrow">E · {tr(language, "cmpEyebrow", "Regional comparator")}</p>
            <h2 id="lp-cmp-title">{tr(language, "cmpTitle", "Compare regions side by side")}</h2>
            <p className="lp-sub">{tr(language, "cmpLead", "Located photos only, with the current phenomenon, year, month, and evidence filters. Regions follow the Natural Earth subregions; anything beyond the polar circles counts as polar.")}</p>
          </div>
        </div>
        <Comparator rows={forRegions} language={language} months={months} />
      </section>

      {/* Research questions */}
      <Questions language={language} />

      {/* Catalog */}
      <section className="card lp-panel" aria-labelledby="lp-cat-title">
        <div className="card__head">
          <div>
            <p className="mono lp-eyebrow">{tr(language, "catEyebrow", "Catalog")}</p>
            <h2 id="lp-cat-title">{tr(language, "catTitle", "Every record, with its source")}</h2>
            <p className="lp-sub">{tr(language, "catLead", "Each row links to the original file page with its author and license. Empty cells are missing values, never zeros. CSV opens directly in Excel.")}</p>
          </div>
        </div>
        <Catalog rows={rows} selected={selected} onSelect={pick} language={language} />
      </section>

      <Takeaways language={language} />
      <Quality language={language} />
      <Method language={language} />
    </div>
  );
}

/* ---------- small pieces ---------- */
function Seg<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="seg">
      <span className="mono">{label}</span>
      <div className="seg__opts" role="radiogroup" aria-label={label}>
        {options.map((o) => <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={value === o.value ? "on" : ""} onClick={() => onChange(o.value)}>{o.label}</button>)}
      </div>
    </div>
  );
}

function Stat({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <div className={`stat${accent ? " stat--accent" : ""}`}>
      <span className="mono">{label}</span>
      <strong>{value}</strong>
      <span className="stat__note">{note}</span>
    </div>
  );
}

function MapLegend({ active, rows, language }: { active: Phenomenon[]; rows: Obs[]; language: string }) {
  return (
    <div className="lp-legend">
      <h3>{tr(language, "legendTitle", "How to read the map")}</h3>
      <ul>
        {active.map((p) => {
          const n = rows.filter((o) => o.phenomena.includes(p)).length, m = rows.filter((o) => o.phenomena.includes(p) && o.lat != null).length;
          return <li key={p}><i style={{ background: PH[p].color }} /><span>{tr(language, PH[p].key, PH[p].label)}</span><b>{m}<small> / {n}</small></b></li>;
        })}
      </ul>
      <p className="lp-legend__note">{tr(language, "legendCounts", "Numbers: on the map / in the filtered catalog.")}</p>
      <div className="lp-legend__ev">
        <span><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="currentColor" /></svg> {tr(language, "evA", EV_TEXT.A)}</span>
        <span><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg> {tr(language, "evB", EV_TEXT.B)}</span>
      </div>
      <p className="lp-legend__note">{tr(language, "legendFamilies", "Warm colours reflect light (pillars); cool colours refract it (halos, sun dogs, arcs). The two mechanisms are never pooled in a statistic.")}</p>
      <p className="lp-legend__note">{tr(language, "legendClick", "Click a point to see the photo, its credit and license, and the weather at that hour.")}</p>
    </div>
  );
}

function Coverage({ total, hour, day, language }: { total: number; hour: number; day: number; language: string }) {
  const none = total - hour - day;
  const w = (v: number) => `${total ? (v / total) * 100 : 0}%`;
  return (
    <div className="lp-coverage">
      <div className="lp-coverage__bar" role="img" aria-label={tr(language, "coverageAria", "Weather coverage: {h} hourly, {d} daily mean, {n} none", { h: hour, d: day, n: none })}>
        <i className="h" style={{ width: w(hour) }} /><i className="d" style={{ width: w(day) }} /><i className="n" style={{ width: w(none) }} />
      </div>
      <p>
        <span><i className="h" />{tr(language, "covHour", "ERA5 at the photo's hour")} <b>{num(hour, language)}</b></span>
        <span><i className="d" />{tr(language, "covDay", "daily mean (no time)")} <b>{num(day, language)}</b></span>
        <span><i className="n" />{tr(language, "covNone", "missing (no location)")} <b>{num(none, language)}</b></span>
      </p>
    </div>
  );
}

const QUESTIONS: { q: string; a: string; tag: "lit" | "data" | "hyp" | "sim" }[] = [
  { q: "q1", a: "a1", tag: "lit" }, { q: "q2", a: "a2", tag: "sim" }, { q: "q3", a: "a3", tag: "data" }, { q: "q4", a: "a4", tag: "lit" },
  { q: "q5", a: "a5", tag: "hyp" }, { q: "q6", a: "a6", tag: "lit" }, { q: "q7", a: "a7", tag: "data" }, { q: "q8", a: "a8", tag: "lit" },
];
const Q_EN: Record<string, string> = {
  q1: "What conditions favour light pillars?",
  a1: "Plate-shaped ice crystals that fall with their large faces close to horizontal, in air calm enough to keep them aligned. Pillars from street lights need the crystals low down, typically ice fog or diamond dust in very cold, still air; sun pillars can come from crystals at any height when the Sun is low (Greenler; Tape 1994).",
  q2: "How does crystal orientation matter?",
  a2: "Each face is a mirror, and a tilt of τ turns the reflected ray by 2τ, so the spread of tilts sets the pillar's length. Perfectly flat plates give only a point (or a subsun); a few degrees of wobble draws a column; tumbling crystals give no pillar at all. Try it in the simulator.",
  q3: "What do temperature, wind, and stability do?",
  a3: "In this catalog, the located light-pillar photos all fall on very cold nights (ERA5 near −20 °C), but there are only a handful, so this is a description, not a rule. Strong turbulence is expected to break the alignment; ERA5 cannot resolve the shallow inversions that hold ice fog near the ground.",
  q4: "Why are some pillars multicoloured?",
  a4: "Reflection does not split colours, so each light source draws a pillar in its own colour: sodium lamps orange, LEDs white, signs green or red. A sun pillar takes the reddened colour of the low Sun. Choose ‘Three colours’ in the simulator.",
  q5: "How does light pollution matter?",
  a5: "Artificial pillars need bright ground lights below the crystals, so they are mostly urban or industrial. That suggests more lighting means more visible pillars, but this catalog cannot test it: it has too few light-pillar photos and no lighting data.",
  q6: "How do natural and artificial pillars differ?",
  a6: "The Sun is effectively infinitely far, so its rays arrive parallel and crystals anywhere along the line of sight can contribute. A nearby lamp lights only the crystals in a thin vertical plane between you and it, so its pillar changes with your distance and the height of the crystals (Mallmann, Hock & Greenler 1998).",
  q7: "What geographic patterns can be seen without confusing frequency and documentation?",
  a7: "Raw counts mostly map photographers. Within-sample shares are safer: compare the pillar share of all ice-optics photos between months or regions, and treat small regions as unknown rather than rare.",
  q8: "What limits prediction?",
  a8: "Weather models forecast temperature, humidity, and cloud but not crystal shape or orientation, and ERA5's ~30 km grid misses valley ice fog. There is also no systematic observing network for pillars, so even the climatology is uncertain.",
};

function Questions({ language }: { language: string }) {
  const tagText = { lit: tr(language, "tagLit", "From the literature"), data: tr(language, "tagData", "From this data"), hyp: tr(language, "tagHyp", "Hypothesis"), sim: tr(language, "tagSim", "Simulation") };
  return (
    <section className="card lp-panel" aria-labelledby="lp-q-title">
      <div className="card__head">
        <div>
          <p className="mono lp-eyebrow">{tr(language, "qEyebrow", "Analysis")}</p>
          <h2 id="lp-q-title">{tr(language, "qTitle", "Eight research questions")}</h2>
          <p className="lp-sub">{tr(language, "qLead", "Each answer is tagged by where it comes from. Correlations in this catalog are never read as causes.")}</p>
        </div>
      </div>
      <div className="lp-qs">
        {QUESTIONS.map((x, i) => (
          <details key={x.q} className="lp-q" open={i < 2}>
            <summary><span className="lp-q__n">{i + 1}</span>{tr(language, x.q, Q_EN[x.q])}<span className={`lp-tag lp-tag--${x.tag}`}>{tagText[x.tag]}</span></summary>
            <p>{tr(language, x.a, Q_EN[x.a])}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---------- takeaways, computed from the whole catalog ---------- */
const TAKE = (() => {
  const loc = OBS.filter((o) => o.lat != null);
  const euNa = loc.filter((o) => o.region && ["europe_north", "europe_central", "europe_south", "north_america"].includes(o.region)).length;
  const south = loc.filter((o) => o.hemisphere === "S").length;
  const winter = OBS.filter((o) => [12, 1, 2].includes(o.month)), summer = OBS.filter((o) => [6, 7, 8].includes(o.month));
  const kw = winter.filter(isPillar).length, ks = summer.filter(isPillar).length;
  const lp = OBS.filter((o) => o.phenomena.includes("light_pillar"));
  const lpT = summary(lp.map((o) => o.wx?.t));
  const lpTimed = lp.filter((o) => o.sunElevation != null);
  const halo = summary(OBS.filter((o) => o.phenomena.includes("halo22")).map((o) => o.wx?.t));
  const cza = OBS.filter((o) => o.phenomena.includes("cza") && o.sunElevation != null);
  const timed = OBS.filter((o) => o.sunElevation != null);
  const hard = timed.filter((o) => qualityFlags(o).some((f) => f.hard));
  const soft = timed.filter((o) => qualityFlags(o).length && !qualityFlags(o).some((f) => f.hard));
  const parh = OBS.filter((o) => o.phenomena.includes("parhelion") && o.sunElevation != null);
  const parhSun = summary(parh.map((o) => o.sunElevation));
  const haloSun = summary(OBS.filter((o) => o.phenomena.includes("halo22")).map((o) => o.sunElevation));
  return {
    loc: loc.length, euNa, south, photos: OBS.length, events: uniqueEvents(OBS),
    winter: { k: kw, n: winter.length, ci: wilson(kw, winter.length) }, summer: { k: ks, n: summer.length, ci: wilson(ks, summer.length) },
    lp: { n: lpT.n, ev: uniqueEvents(lp.filter((o) => o.wx?.t != null)), med: lpT.med, min: lpT.min, max: lpT.max, timed: lpTimed.length, night: lpTimed.filter((o) => o.sunElevation! < -6).length },
    haloMed: halo.med, cza: { k: cza.filter((o) => o.sunElevation! < 32.2).length, n: cza.length, max: Math.max(...cza.map((o) => o.sunElevation!)) },
    hard: hard.length, soft: soft.length, timed: timed.length, parhMed: parhSun.med, haloSunMed: haloSun.med,
  };
})();

function Takeaways({ language }: { language: string }) {
  const T = TAKE;
  return (
    <section className="card takeaways lp-takeaways">
      <h2>{tr(language, "takeTitle", "What the data says")}</h2>
      <ul>
        <li><strong>{tr(language, "t1h", "A map of photographers first.")}</strong> {tr(language, "t1", "{p}% of the {n} located photos come from Europe and North America, and only {s} from the Southern Hemisphere. Only {loc}% of all dated photos have coordinates at all.", {
          p: Math.round((100 * T.euNa) / T.loc), n: T.loc, s: T.south, loc: Math.round((100 * T.loc) / T.photos),
        })}</li>
        <li><strong>{tr(language, "t2h", "Bursts inflate counts.")}</strong> {tr(language, "t2", "{photos} photos collapse to {events} events once the same author's shots from the same day and place are merged, so one good display can look like a trend.", { photos: num(T.photos, language), events: num(T.events, language) })}</li>
        <li><strong>{tr(language, "t3h", "Pillars are a winter display.")}</strong> {tr(language, "t3", "In December–February, {w} of ice-optics photos are pillars (95% CI {wl}–{wh}), against {s} in June–August ({sl}–{sh}). Mostly Northern Hemisphere photos; shares compare like with like, so this is not just more winter photography.", {
          w: pct(T.winter.k / T.winter.n, language), wl: pct(T.winter.ci[0], language), wh: pct(T.winter.ci[1], language),
          s: pct(T.summer.k / T.summer.n, language), sl: pct(T.summer.ci[0], language), sh: pct(T.summer.ci[1], language),
        })}</li>
        <li><strong>{tr(language, "t4h", "Light pillars: very cold nights.")}</strong> {tr(language, "t4", "The {n} light-pillar photos with weather ({ev} events) had a median ERA5 temperature of {med} °C (range {min} to {max} °C); all {timed} with a time were taken with the Sun far below the horizon. Too few to generalise, but consistent with low-level ice fog.", {
          n: T.lp.n, ev: T.lp.ev, med: fmt1(T.lp.med, language), min: fmt1(T.lp.min, language), max: fmt1(T.lp.max, language), timed: T.lp.timed,
        })}</li>
        <li><strong>{tr(language, "t5h", "Physics passes a test.")}</strong> {tr(language, "t5", "All {k} of {n} circumzenithal arcs with a time and place were photographed with the Sun below 32.2°, the limit refraction imposes (highest: {max}°). Parhelia sit at a median Sun elevation of {p}°, far below 22° halos ({h}°): consistent with optics, since sun dogs fade as the Sun climbs and vanish above 60.75°, while a 22° halo can form at any Sun height.", {
          k: T.cza.k, n: T.cza.n, max: fmt1(T.cza.max, language), p: fmt1(T.parhMed, language), h: fmt1(T.haloSunMed, language),
        })}</li>
        <li><strong>{tr(language, "t6h", "Camera clocks are the weak link.")}</strong> {tr(language, "t6", "{hard} of {n} timed photos break a hard physical limit (such as a sun dog with the Sun above 60.75°), and {soft} more were taken after dark, so they are lunar displays or have wrong clocks. All stay in the catalog with a ⚠ flag instead of being silently dropped.", { hard: T.hard, soft: T.soft, n: T.timed })}</li>
        <li><strong>{tr(language, "t7h", "Ground weather does not describe cirrus.")}</strong> {tr(language, "t7", "22° halo photos have a median ground temperature of {h} °C: the crystals are kilometres up in cirrus. Surface ERA5 is meaningful for ice fog and diamond dust, not for most halos.", { h: fmt1(T.haloMed, language) })}</li>
      </ul>
    </section>
  );
}

function Quality({ language }: { language: string }) {
  const noCoords = OBS.filter((o) => o.lat == null).length, object = OBS.filter((o) => o.locType === "object").length;
  const offshore = OBS.filter((o) => o.offshore).length, noTime = OBS.filter((o) => !o.time).length;
  const lunarGuess = OBS.filter((o) => o.phenomena.includes("moon_pillar")).length;
  const done = ["impl1", "impl2", "impl3", "impl4", "impl5", "impl6", "impl7"];
  const pending = ["pend1", "pend2", "pend3", "pend4", "pend5", "pend6"];
  return (
    <section className="card lp-panel lp-quality" aria-labelledby="lp-qual-title">
      <div className="card__head">
        <div>
          <p className="mono lp-eyebrow">{tr(language, "qualEyebrow", "Data quality")}</p>
          <h2 id="lp-qual-title">{tr(language, "qualTitle", "Quality, limitations, and what is still missing")}</h2>
        </div>
      </div>
      <div className="lp-qual-grid">
        <div>
          <h3>{tr(language, "qualCounts", "Provenance in numbers")}</h3>
          <ul className="lp-list">
            <li>{tr(language, "qc1", "{total} files found in the Commons categories; {nd} had no readable capture date and {oor} fell outside {from}–{to}, leaving {n}.", { total: num(EXCLUDED.total, language), nd: EXCLUDED.noDate, oor: EXCLUDED.outOfRange, from: WINDOW[0], to: WINDOW[1], n: OBS.length })}</li>
            <li>{tr(language, "qc2", "{n} records have no coordinates and appear only in counts and the table; {o} use the subject's position rather than the camera's.", { n: noCoords, o: object })}</li>
            <li>{tr(language, "qc3", "{n} records have a date but no time, so their weather is a daily mean and their Sun elevation is unknown.", { n: noTime })}</li>
            <li>{tr(language, "qc4", "{n} coastal points fell just outside the 1:50m coastline and were assigned to the nearest country within about 30 km.", { n: offshore })}</li>
            <li>{tr(language, "qc5", "{n} moon-pillar records are inferred from the words ‘moon’ or ‘lunar’ in the title or description; Commons has no moon-pillar category.", { n: lunarGuess })}</li>
          </ul>
          <h3>{tr(language, "qualLevels", "Evidence levels")}</h3>
          <ul className="lp-list">
            <li><span className="lp-ev lp-ev--A">A</span> {tr(language, "evA", EV_TEXT.A)}</li>
            <li><span className="lp-ev lp-ev--B">B</span> {tr(language, "evB", EV_TEXT.B)}</li>
            <li><span className="lp-ev lp-ev--C">C</span> {tr(language, "evC", EV_TEXT.C)}</li>
          </ul>
          <p className="lp-small">{tr(language, "qualVerify", "None of these levels means expert-verified. Phenomenon labels come from Commons volunteers' categories, and each photo can be checked through its link. Ice crystals are inferred from the optical display itself; none were sampled. Visibility is missing for every record because the ERA5 archive used here does not provide it.")}</p>
        </div>
        <div>
          <h3>{tr(language, "implTitle", "Implemented today")}</h3>
          <ul className="lp-list lp-list--ok">{done.map((d) => <li key={d}>{tr(language, d, IMPL_EN[d])}</li>)}</ul>
          <h3>{tr(language, "pendTitle", "Pending or out of scope")}</h3>
          <ul className="lp-list lp-list--todo">{pending.map((d) => <li key={d}>{tr(language, d, IMPL_EN[d])}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
const IMPL_EN: Record<string, string> = {
  impl1: "Catalog of real, linked photographs from Wikimedia Commons with author, license, date, and coordinates.",
  impl2: "Hourly ERA5 weather linked to every located record, and Sun elevation computed for every timed one.",
  impl3: "World map, timeline by year and hemisphere, weather panel, and regional comparator.",
  impl4: "3-D reflection simulator with tilt distribution, light source, observer position, and visibility.",
  impl5: "Downloadable CSV (opens in Excel), GeoJSON, and JSON of the filtered catalog.",
  impl6: "Physical consistency checks that flag doubtful capture times.",
  impl7: "Reproducible snapshot script: scripts/snapshot-light-pillars.mjs.",
  pend1: "Native Excel workbook and PDF report: not produced; the CSV and this page carry the same content.",
  pend2: "NOAA NCEI station data: needs an API token, so ERA5 is used instead.",
  pend3: "Finnish Meteorological Institute open data and NASA APOD: reviewed as sources but not yet merged into the catalog.",
  pend4: "Weather layers on the map and visibility observations.",
  pend5: "Manual expert review of each photo's classification.",
  pend6: "Photos from other archives (Flickr, national weather services, citizen-science networks).",
};

function Method({ language }: { language: string }) {
  const accessed = fmtDate(CAPTURED_AT.slice(0, 10), language);
  const SRC: { inst: string; title: string; url: string; pub: string; cover: string; license: string; limits: string; use: string }[] = [
    { inst: "Wikimedia Commons", title: "Categories: Light pillars, Sun pillars (and by country), Parhelia, 22° halo, Circumzenithal arcs", url: "https://commons.wikimedia.org/wiki/Category:Halo_phenomena", pub: tr(language, "srcContinuous", "continuously updated"), cover: tr(language, "srcGlobal", "global"), license: tr(language, "srcPerFile", "per file (CC BY, CC BY-SA, CC0, public domain)"), limits: tr(language, "srcCommonsLim", "volunteer categories; uneven geography; camera clocks"), use: tr(language, "srcUsed", "used: catalog") },
    { inst: "ECMWF / Copernicus C3S", title: "ERA5 hourly data on single levels", url: "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels", pub: "2018–", cover: tr(language, "srcGlobal", "global"), license: "CC BY 4.0", limits: tr(language, "srcEra5Lim", "~31 km grid; model estimate; no visibility"), use: tr(language, "srcUsedVia", "used via Open-Meteo") },
    { inst: "Open-Meteo", title: "Historical Weather API", url: "https://open-meteo.com/en/docs/historical-weather-api", pub: tr(language, "srcContinuous", "continuously updated"), cover: tr(language, "srcGlobal", "global"), license: "CC BY 4.0", limits: tr(language, "srcOmLim", "reanalysis, not station data"), use: tr(language, "srcUsed2", "used: weather") },
    { inst: "Natural Earth", title: "Admin 0 countries 1:50m v5.1.2; land 1:110m", url: "https://github.com/nvkelso/natural-earth-vector", pub: "2022", cover: tr(language, "srcGlobal", "global"), license: tr(language, "srcPublicDomain", "public domain"), limits: tr(language, "srcNeLim", "generalised coastlines"), use: tr(language, "srcUsed3", "used: countries, map") },
    { inst: "WMO", title: "International Cloud Atlas: halo phenomena", url: "https://cloudatlas.wmo.int/en/halo-phenomena.html", pub: "2017–", cover: tr(language, "srcReference", "reference"), license: "© WMO", limits: "—", use: tr(language, "srcUsedClass", "used: classification") },
    { inst: "NASA", title: "Astronomy Picture of the Day archive", url: "https://apod.nasa.gov/apod/", pub: "1995–", cover: tr(language, "srcCurated", "curated, global"), license: tr(language, "srcApodLic", "images copyrighted individually"), limits: tr(language, "srcApodLim", "no location or weather fields"), use: tr(language, "srcNotUsed", "reviewed, not used as data") },
    { inst: "NOAA NCEI", title: "Climate Data Online", url: "https://www.ncei.noaa.gov/cdo-web/", pub: tr(language, "srcContinuous", "continuously updated"), cover: tr(language, "srcStations", "station network"), license: tr(language, "srcUsGov", "US public domain"), limits: tr(language, "srcNoaaLim", "API token required"), use: tr(language, "srcNotUsed", "reviewed, not used as data") },
    { inst: "Finnish Meteorological Institute", title: "Open data", url: "https://en.ilmatieteenlaitos.fi/open-data", pub: tr(language, "srcContinuous", "continuously updated"), cover: tr(language, "srcFinland", "Finland"), license: "CC BY 4.0", limits: tr(language, "srcFmiLim", "Finland only; not merged yet"), use: tr(language, "srcNotUsed", "reviewed, not used as data") },
  ];
  const REFS = [
    { text: "Hersbach, H., et al. (2020). The ERA5 global reanalysis. Quarterly Journal of the Royal Meteorological Society, 146, 1999–2049.", doi: "10.1002/qj.3803" },
    { text: "Mallmann, A. J., Hock, J. L., & Greenler, R. G. (1998). Comparison of Sun pillars with light pillars from nearby light sources. Applied Optics, 37(9), 1441.", doi: "10.1364/AO.37.001441" },
    { text: "Tape, W. (1994). Atmospheric Halos. Antarctic Research Series, 64. American Geophysical Union.", doi: "10.1029/AR064" },
    { text: "Tape, W., & Moilanen, J. (2006). Atmospheric Halos and the Search for Angle X. American Geophysical Union.", doi: "10.1029/SP058" },
    { text: "Greenler, R. (2020). Rainbows, Halos, and Glories (reprint). SPIE Press.", doi: "10.1117/3.2573017" },
    { text: "Zippenfenig, P. Open-Meteo.com Weather API. Zenodo.", doi: "10.5281/zenodo.7970649" },
  ];
  return (
    <section className="method lp-method">
      <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
      <div className="method__text">
        <p>{tr(language, "method1", "Photos: every file in the listed Wikimedia Commons categories (one level deep, plus the sun-pillar country categories), keeping those with a capture date from the EXIF or the file's information template between {from} and {to}. Countries come from point-in-polygon tests against Natural Earth. Weather: the Open-Meteo archive (ERA5 and ERA5-Land) at the photo's coordinates, at the capture hour in the location's time zone, or as a daily mean without a time. Camera clocks are assumed to show local time. Sun elevation uses the NOAA solar-position equations.", { from: WINDOW[0], to: WINDOW[1] })}</p>
        <p>{tr(language, "method2", "Statistics: shares use 95% Wilson intervals; distributions show medians and interquartile ranges; an event merges photos by the same author on the same day within 25 km. Missing values stay empty. The simulator is an illustrative model, separate from the observational data. Snapshot accessed {date}.", { date: accessed })}</p>
      </div>
      <div className="lp-table-wrap">
        <table className="lp-table lp-sources">
          <thead><tr>
            <th scope="col">{tr(language, "srcInst", "Institution")}</th><th scope="col">{tr(language, "srcTitle", "Title")}</th><th scope="col">{tr(language, "srcPub", "Published")}</th>
            <th scope="col">{tr(language, "srcCover", "Coverage")}</th><th scope="col">{tr(language, "srcLicense", "License")}</th><th scope="col">{tr(language, "srcLimits", "Limitations")}</th><th scope="col">{tr(language, "srcUse", "Use here")}</th>
          </tr></thead>
          <tbody>
            {SRC.map((s) => (
              <tr key={s.url}><td>{s.inst}</td><td><a href={s.url} target="_blank" rel="noopener">{s.title}</a></td><td>{s.pub}</td><td>{s.cover}</td><td>{s.license}</td><td>{s.limits}</td><td>{s.use}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="lp-small">{tr(language, "accessedAll", "All links were checked on {date}.", { date: accessed })}</p>
      <h3>{tr(language, "refsTitle", "References (DOIs checked against Crossref and doi.org)")}</h3>
      <ol className="lp-refs">
        {REFS.map((r) => <li key={r.doi}>{r.text} <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noopener">doi:{r.doi}</a></li>)}
      </ol>
    </section>
  );
}
