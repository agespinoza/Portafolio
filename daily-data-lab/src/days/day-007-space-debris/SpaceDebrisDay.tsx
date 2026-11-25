import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../language.jsx";
import { type Cls, AS_OF, CLASSES, CLS_COLOR, ESA, FIRST_YEAR, KPIS, ORBITS, OWNERS, PARENTS, YEAR_AGO, aggregate, shellsFor, BREAKUPS, CAUSES, CAUSE_COLOR, RCS_CLASSES, RCS_COLOR } from "./data";
import { type LiveDots, type Scale } from "./Globe";
import { GlobeCard } from "./Globe3D";
import { type LiveSet, loadLive, positionsAt } from "./live";
import { type BarRow, BarChartCard, DonutCard, LogBarCard, YearChartCard } from "./Charts";
import { type OwnerStat, DebrisFacts, KpiCard, OwnerTable, causeName, causeShort, clsName, orbitName, ownerName, rcsName } from "./Panels";
import { tr, num, pct, fmtDate, compact } from "./text";
import { SpaceDebrisQuality, SpaceDebrisQuestions, SpaceDebrisSources } from "./Research";

const COLORS = CLASSES.map((c) => CLS_COLOR[c]);
/** Fragmentation events dated in ESA's Space Environment Report 2026 (§5): drawn on the population chart. */
const EVENTS = [{ year: 2007, key: "evFy", en: "Fengyun-1C" }, { year: 2009, key: "evCollision", en: "Iridium–Cosmos collision" }, { year: 2021, key: "evKosmos", en: "Kosmos 1408 ASAT test" }];

export default function SpaceDebrisDay() {
  const language: string = useLanguage();
  const [orbit, setOrbit] = useState<string>("all");
  const [owner, setOwner] = useState<string>("");
  const [scale, setScale] = useState<Scale>("leo");
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  // Live positions (CelesTrak GP + SGP4): loaded only on request, recomputed every 30 s.
  const [mode, setMode] = useState<"shells" | "live">("shells");
  const [liveSet, setLiveSet] = useState<LiveSet | null>(null);
  const [liveDots, setLiveDots] = useState<(LiveDots & { at: Date; ok: number }) | null>(null);
  const [liveState, setLiveState] = useState<"idle" | "loading" | "error">("idle");
  const [liveError, setLiveError] = useState("");
  const pickMode = (m: "shells" | "live") => {
    setMode(m);
    if (m === "live" && !liveSet && liveState !== "loading") {
      setLiveState("loading");
      loadLive().then((set) => { setLiveSet(set); setLiveState("idle"); })
        .catch((e: unknown) => { setLiveError(e instanceof Error ? e.message : String(e)); setLiveState("error"); setMode("shells"); });
    }
  };
  useEffect(() => {
    if (mode !== "live" || !liveSet) return;
    const step = () => { const at = new Date(); const { pos, ok } = positionsAt(liveSet, at); setLiveDots({ pos, cls: liveSet.cls, at, ok }); };
    step();
    const id = window.setInterval(step, 30000);
    return () => window.clearInterval(id);
  }, [mode, liveSet]);

  const all = orbit === "all" && !owner;
  const a = useMemo(() => aggregate({ orbit, owner }), [orbit, owner]);
  const world = useMemo(() => aggregate({ orbit: "all", owner: "" }), []);
  const cName = (c: Cls) => clsName(c, language);
  const scope = [orbit === "all" ? tr(language, "allOrbits", "All Earth orbits") : orbitName(orbit, language), owner ? ownerName(owner) : ""].filter(Boolean).join(" · ");

  // Owner filter: every owner with anything catalogued in the selected orbit class, by objects in orbit.
  const ownerStats: OwnerStat[] = useMemo(() => [...a.byOwner.entries()]
    .map(([w, counts]) => ({ code: OWNERS[w].code, counts, total: counts.reduce((x, y) => x + y, 0) }))
    .sort((x, y) => y.total - x.total), [a]);
  const ownerOptions = [...ownerStats].sort((x, y) => ownerName(x.code).localeCompare(ownerName(y.code), language));
  const pickOrbit = (o: string) => { setOrbit(o); if (owner && o !== "all" && !aggregate({ orbit: o, owner }).tracked) setOwner(""); };

  const readCounts = (vals: number[]) => CLASSES.map((c, i) => (vals[i] ? `${cName(c)} ${num(vals[i], language)}` : "")).filter(Boolean).join(" · ");

  // Altitude profile (LEO, 50 km bins), highest altitude at the top like a sky.
  const altRows: BarRow[] = a.alt.map((vals, i) => ({ id: String(i), km: i * 50, vals })).reverse()
    .map(({ id, km, vals }) => ({
      id, label: `${num(km, language)}–${num(km + 50, language)} km`, segments: vals,
      readout: tr(language, "altReadout", "{lo}–{hi} km: {total} objects · {parts}", { lo: num(km, language), hi: num(km + 50, language), total: num(vals.reduce((x, y) => x + y, 0), language), parts: readCounts(vals) }),
    }))
    .filter((r, i, arr) => r.segments.some((v) => v > 0) || arr.slice(i).some((x) => x.segments.some((v) => v > 0)));
  const peak = (pick: (v: number[]) => number) => a.alt.reduce((best, v, i) => (pick(v) > pick(a.alt[best]) ? i : best), 0);
  const peakActive = peak((v) => v[0]), peakJunk = peak((v) => v[1] + v[2] + v[3] + v[4]);
  const leoCount = a.alt.reduce((s, v) => s + v.reduce((x, y) => x + y, 0), 0);

  // Owners: every owner (no cut-off), stacked by class; the chart scrolls inside its card.
  const ownerRows: BarRow[] = ownerStats.filter((o) => o.total > 0).map((o, i) => ({
    id: o.code, label: `${i + 1}. ${o.code}`, segments: o.counts, highlight: o.code === owner,
    readout: tr(language, "ownerReadout", "{name}: {total} in orbit · {parts} · {junk} junk", { name: ownerName(o.code), total: num(o.total, language), parts: readCounts(o.counts), junk: pct(1 - o.counts[0] / o.total, language) }),
  }));

  // Fragmentation parents: every launch with catalogued debris (no cut-off) in the orbit/owner filter, largest first;
  // pieces still in orbit vs already re-entered. The chart scrolls inside its card.
  const parentRows: BarRow[] = useMemo(() => PARENTS.filter((p) => (orbit === "all" || p.orbit === orbit) && (!owner || p.owner === owner)).map((p, i) => ({
    id: p.launch, label: `${i + 1}. ${p.parent.length > 18 ? `${p.parent.slice(0, 17).trimEnd()}…` : p.parent} (${p.eventYear}, ${causeShort(p.cause, language)})`, segments: [p.inOrbit, p.pieces - p.inOrbit],
    readout: tr(language, "parentReadout2", "{name} ({owner}, launched {launched}): {pieces} debris pieces catalogued, {inOrbit} still in orbit; most entered the catalogue in {year}. Cause: {cause}.", {
      name: p.parent, owner: ownerName(p.owner), launched: p.launched.slice(0, 4), pieces: num(p.pieces, language), inOrbit: num(p.inOrbit, language), year: p.eventYear, cause: causeName(p.cause, language) }),
  })), [orbit, owner, language]);

  // Year series.
  const series = (rows: number[][], keep: Cls[] = CLASSES) => keep.map((c) => ({ key: c, label: cName(c), color: CLS_COLOR[c], values: rows.map((r) => r[CLASSES.indexOf(c)]) }));
  const yearReadout = (verb: string) => (year: number, vals: number[]) => `${year} · ${verb}: ${num(vals.reduce((x, y) => x + y, 0), language)} · ${vals.map((v, i) => `${cName(CLASSES[i])} ${num(v, language)}`).join(" · ")}`;
  const popEnd = a.pop[a.pop.length - 1];
  const debrisPeakYear = FIRST_YEAR + a.pop.reduce((b, v, i) => (v[3] > a.pop[b][3] ? i : b), 0);

  // Orbit donut: objects in orbit by ESA class for the selected owner (or everyone).
  const orbitSlices = ORBITS.map((o, i) => ({ o, n: a.byOrbit[i] })).filter((x) => x.n > 0);
  const orbitTotal = orbitSlices.reduce((s, x) => s + x.n, 0);

  // Takeaways: global numbers recomputed from the bundled data.
  const wDebris = world.inOrbit[3];
  const debrisByOwner = [...world.byOwner.entries()].map(([w, c]) => ({ code: OWNERS[w].code, d: c[3] })).sort((x, y) => y.d - x.d);
  const top3 = debrisByOwner.slice(0, 3), top3Share = top3.reduce((s, x) => s + x.d, 0) / wDebris;
  const parentsInOrbit = PARENTS.slice(0, 10).reduce((s, p) => s + p.inOrbit, 0);
  const pop2000 = world.pop[2000 - FIRST_YEAR].reduce((x, y) => x + y, 0), popNow = world.tracked;
  const wPeakActive = world.alt.reduce((b, v, i) => (v[0] > world.alt[b][0] ? i : b), 0);
  const wPeakJunk = world.alt.reduce((b, v, i) => (v[1] + v[2] + v[3] + v[4] > world.alt[b][1] + world.alt[b][2] + world.alt[b][3] + world.alt[b][4] ? i : b), 0);
  const topParent = PARENTS.filter((p) => (orbit === "all" || p.orbit === orbit) && (!owner || p.owner === owner)).sort((x, y) => y.inOrbit - x.inOrbit)[0];
  // Debris in orbit by break-up cause, largest first, and objects in orbit by kind × radar size.
  const debrisIn = a.causeIn.reduce((x, y) => x + y, 0);
  const causeRows: BarRow[] = CAUSES.map((c, i) => ({ c, i, n: a.causeIn[i], all: a.causeAll[i] })).filter((x) => x.all > 0).sort((x, y) => y.n - x.n)
    .map(({ c, i, n, all }) => ({
      id: c, label: causeName(c, language), segments: CAUSES.map((_, k) => (k === i ? n : 0)), // one slot per cause keeps its color
      readout: tr(language, "causeReadout", "{name}: {n} debris pieces in orbit ({p} of debris here), {all} ever catalogued", { name: causeName(c, language), n: num(n, language), p: pct(n / (debrisIn || 1), language), all: num(all, language) }),
    }));
  const rcsRows: BarRow[] = CLASSES.map((c, i) => ({ c, v: a.rcs[i] })).filter((x) => x.v.some((n) => n > 0)).map(({ c, v }) => {
    const t = v.reduce((x, y) => x + y, 0);
    return { id: c, label: cName(c), segments: v, readout: `${cName(c)}: ${RCS_CLASSES.map((r, k) => `${rcsName(r, language)} ${num(v[k], language)}`).join(" · ")} · ${tr(language, "rcsNoneShare", "{p} without radar size", { p: pct(v[3] / (t || 1), language) })}` };
  });
  const rcsNone = a.rcs.reduce((x, v) => x + v[3], 0), debrisSmall = a.rcs[3][0], debrisSized = a.rcs[3][0] + a.rcs[3][1] + a.rcs[3][2];
  const topCause = causeRows.length ? CAUSES.find((c) => c === causeRows[0].id) ?? null : null;

  // 3-D shell view: objects with orbit data in the filter; densest 50 km shells listed as text.
  const cells = useMemo(() => shellsFor({ orbit, owner }), [orbit, owner]);
  const shown = cells.filter((c) => (scale === "true" || c.alt < 2000) && !hidden.has(c.cls)).reduce((x, c) => x + c.n, 0);
  const densest = a.alt.map((v, i) => ({ i, v, n: v.reduce((x, y) => x + y, 0) })).filter((x) => x.n > 0).sort((x, y) => y.n - x.n).slice(0, 3);
  const toggle = (c: number) => setHidden((h) => { const n = new Set(h); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  const wc = (c: string) => world.causeIn[CAUSES.indexOf(c as never)] ?? 0;
  const wDebrisIn = world.causeIn.reduce((x, y) => x + y, 0);
  const km = (bin: number) => `${num(bin * 50, language)}–${num(bin * 50 + 50, language)} km`;

  return (
    <div className="viz fw sd">
      {/* Controls: orbit class (the global filter) and owner */}
      <div className="controls" role="group" aria-label={tr(language, "controlsAria", "Filter the dashboard by orbit and owner")}>
        <label className="select">
          <span className="mono">{tr(language, "orbit", "Orbit")}</span>
          <select value={orbit} onChange={(e) => pickOrbit(e.target.value)}>
            <option value="all">{tr(language, "allOrbits", "All Earth orbits")}</option>
            {ORBITS.map((o) => <option key={o} value={o}>{o} · {orbitName(o, language)}</option>)}
          </select>
        </label>
        <label className="select">
          <span className="mono">{tr(language, "owner", "Owner")}</span>
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="">{tr(language, "allOwners", "All owners ({n})", { n: ownerOptions.length })}</option>
            {ownerOptions.map((o) => <option key={o.code} value={o.code}>{ownerName(o.code)}</option>)}
          </select>
        </label>
        <p className="muted fw-scope">{tr(language, "scopeNote", "SATCAT as of {date}. Every chart, number and fact below recomputes for the orbit and owner you pick; the owner you pick is highlighted in copper.", { date: fmtDate(AS_OF, language) })}</p>
        {!all && <button type="button" className="gw-reset" onClick={() => { setOrbit("all"); setOwner(""); }}>{tr(language, "reset", "Reset")}</button>}
      </div>

      {/* Key numbers */}
      <section className="stats fw-stats" aria-label={tr(language, "statsAria", "Key numbers for {scope}", { scope })}>
        <KpiCard accent label={tr(language, "kpiTracked", "Tracked objects in orbit")} value={num(a.tracked, language)}
          note={tr(language, "kpiTrackedNote", "{scope} · of {n} ever catalogued", { scope, n: num(a.catalogued, language) })} />
        <KpiCard label={tr(language, "kpiActive", "Active satellites")} value={num(a.active, language)}
          note={tr(language, "kpiActiveNote", "CelesTrak status +, P, B, S or X")} />
        <KpiCard label={tr(language, "kpiJunk", "Share that is junk")} value={a.tracked ? pct(a.junk / a.tracked, language) : "—"}
          note={tr(language, "kpiJunkNote", "{n} dead satellites, rocket bodies, fragments", { n: num(a.junk, language) })} />
        <KpiCard label={tr(language, "kpiEst", "Debris larger than 1 cm")} value={`≈ ${compact(KPIS.est1cmPlus, language)}`}
          note={tr(language, "kpiEstNote", "whole Earth orbit · ESA MASTER model, {date}", { date: fmtDate(ESA.epoch, language) })} />
        <KpiCard label={tr(language, "kpiReentry", "Re-entries in 12 months")} value={num(a.recent, language)}
          note={tr(language, "kpiReentryNote", "{d} intact objects a day · since {date}", { d: num(a.recentIntact / 365, language, 1), date: fmtDate(YEAR_AGO, language) })} />
      </section>

      <DebrisFacts tracked={a.tracked} junk={a.junk} debris={a.inOrbit[3]} recentIntact={a.recentIntact} language={language}
        topParent={topParent && topParent.inOrbit > 0 ? { name: topParent.parent, year: topParent.eventYear, inOrbit: topParent.inOrbit } : null} />

      <section className="card sd-globe-card">
        <div className="card__head"><div>
          <h2>{tr(language, "globeTitle", "Every object in orbit, in 3-D")}</h2>
          <p className="muted">{mode === "live"
            ? tr(language, "globeSubLive", "Real positions right now: each dot is where SGP4 places an object from CelesTrak's latest orbital elements, over a map of the continents. Drag or use the arrow keys to turn the globe; scroll or pinch to zoom. The Earth is lit by the Sun's real position right now.")
            : tr(language, "globeSub", "One dot per object, {scope}, at its real mean altitude and inclination. SATCAT has no position along the orbit, so each dot is spread around its shell: this shows how crowded each height and tilt is, not where anything is now. Drag or use the arrow keys to turn the globe; scroll or pinch to zoom. The Earth is lit by the Sun's real position right now.", { scope })}</p>
        </div></div>
        <div className="sd-globe-controls">
          <div className="seg seg--small">
            <span className="mono">{tr(language, "view", "View")}</span>
            <div className="seg__opts" role="radiogroup" aria-label={tr(language, "view", "View")}>
              {(["shells", "live"] as const).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={mode === k} className={mode === k ? "on" : ""} onClick={() => pickMode(k)}>
                  {k === "shells" ? tr(language, "viewShells", "Catalogue shells") : tr(language, "viewLive", "Live positions")}
                </button>
              ))}
            </div>
          </div>
          <div className="seg seg--small">
            <span className="mono">{tr(language, "scale", "Scale")}</span>
            <div className="seg__opts" role="radiogroup" aria-label={tr(language, "scale", "Scale")}>
              {(["leo", "true"] as Scale[]).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={scale === k} className={scale === k ? "on" : ""} onClick={() => setScale(k)}>
                  {k === "leo" ? tr(language, "scaleLeo", "Low orbit, stretched") : tr(language, "scaleTrue", "True scale, out to GEO")}
                </button>
              ))}
            </div>
          </div>
          <div className="sd-toggles" role="group" aria-label={tr(language, "showKinds", "Show kinds")}>
            {CLASSES.map((c, i) => (
              <button key={c} type="button" aria-pressed={!hidden.has(i)} className={hidden.has(i) ? "" : "on"} onClick={() => toggle(i)}>
                <i style={{ background: CLS_COLOR[c] }} />{cName(c)}
              </button>
            ))}
          </div>
        </div>
        {liveState === "loading" && <p className="notice">{tr(language, "liveLoading", "Loading current orbital elements from CelesTrak…")}</p>}
        {liveState === "error" && <p className="notice">{tr(language, "liveError", "Could not reach CelesTrak ({msg}). Showing the catalogue shells instead.", { msg: liveError })}</p>}
        {mode === "live" && liveSet && <p className="lp-small">{tr(language, "liveNote2", "Live view: every active satellite and the three largest debris clouds CelesTrak still publishes (Fengyun-1C, Cosmos 2251, Iridium 33), {n} objects, propagated with SGP4 in your browser. CelesTrak publishes no current elements for the rest of the junk as one group, so dead satellites and rocket bodies do not appear, and the orbit and owner filters do not apply. Elements downloaded at {time} UTC and kept in this browser for 2 hours, as CelesTrak asks.", {
          n: num(liveSet.recs.length, language), time: new Date(liveSet.fetchedAt).toISOString().slice(0, 16).replace("T", " ") })}</p>}
        <GlobeCard cells={cells} scale={scale} hidden={hidden} live={mode === "live" ? liveDots : null}
          ariaLabel={tr(language, "globeAria", "Globe with {n} objects in orbit drawn as dots by altitude and inclination. Densest shells: {list}.", {
            n: num(shown, language), list: densest.map((d) => `${km(d.i)} (${num(d.n, language)})`).join(", ") })}
          hint={mode === "live" && liveDots
            ? tr(language, "liveHint", "{n} objects where SGP4 puts them at {time} UTC (updated every 30 s). Point at a height to read its shell.", { n: num(liveDots.ok, language), time: liveDots.at.toISOString().slice(11, 19) })
            : scale === "leo"
            ? tr(language, "globeHint", "{n} dots shown. Point at a height to read its shell. In close-up, altitude is stretched about 2.2 times so low orbit is visible.", { n: num(shown, language) })
            : tr(language, "globeHintTrue", "{n} dots shown. Point at a height to read its 1,000 km shell. True scale: low orbit hugs the Earth, the navigation shell sits near 20,200 km and the geostationary ring at 35,786 km. Eccentric orbits are drawn at their mean altitude.", { n: num(shown, language) })}
          shellReadout={(lo, hi, counts) => tr(language, "globeReadout", "{lo}–{hi} km shell: {total} objects · {parts}", {
            lo: num(lo, language), hi: num(hi, language), total: num(counts.reduce((x, y) => x + y, 0), language), parts: readCounts(counts) || "—" })} />
        {mode === "shells" && densest.length > 0 && <p className="lp-small">{tr(language, "globeDensest", "Densest 50 km shells in low orbit here: {list}.", {
          list: densest.map((d) => `${km(d.i)}, ${num(d.n, language)} (${pct(d.v[0] / d.n, language)} ${tr(language, "activeShort", "active")})`).join(" · ") })}</p>}
      </section>

      <div className="fw-grid">
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "typeTitle", "What is up there?")}</h2>
            <p className="muted">{tr(language, "typeSub", "{scope}: tracked objects in orbit by kind.", { scope })}</p>
          </div></div>
          <DonutCard center={a.tracked ? pct(a.junk / a.tracked, language) : "—"} centerNote={tr(language, "junk", "junk")}
            slices={CLASSES.map((c, i) => ({ key: c, label: cName(c), value: a.inOrbit[i], color: COLORS[i], readout: `${cName(c)}: ${num(a.inOrbit[i], language)} (${pct(a.inOrbit[i] / (a.tracked || 1), language, 1)})` }))}
            ariaLabel={tr(language, "typeAria", "Objects in orbit by kind")} hint={tr(language, "donutHint", "Hover or focus a slice to read it.")} />
        </section>
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "orbitTitle", "Which orbits are crowded?")}</h2>
            <p className="muted">{tr(language, "orbitSub", "Objects in orbit by ESA orbit class{owner}. The orbit filter does not apply here.", { owner: owner ? ` · ${ownerName(owner)}` : "" })}</p>
          </div></div>
          <DonutCard center={orbitTotal ? pct((a.byOrbit[ORBITS.indexOf("LEO")] ?? 0) / orbitTotal, language) : "—"} centerNote={tr(language, "inLeo", "in LEO")}
            slices={orbitSlices.map(({ o, n }, i) => ({ key: o, label: `${o} · ${orbitName(o, language)}`, value: n, color: `var(--sd-o${Math.min(i, 6)})`, readout: `${o} · ${orbitName(o, language)}: ${num(n, language)} (${pct(n / orbitTotal, language, 1)})` }))}
            ariaLabel={tr(language, "orbitAria", "Objects in orbit by orbit class")} hint={tr(language, "donutHint", "Hover or focus a slice to read it.")} />
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "altTitle", "Where in low orbit is it concentrated?")}</h2>
            <p className="muted">{leoCount
              ? tr(language, "altSub", "{n} objects in low Earth orbit by mean altitude, (apogee + perigee) / 2, in 50 km bands. Active satellites peak at {a}; junk peaks at {j}.", { n: num(leoCount, language), a: km(peakActive), j: km(peakJunk) })
              : tr(language, "altNone", "Nothing in this selection orbits in low Earth orbit (below 2,000 km).")}</p>
          </div></div>
          {leoCount > 0 && <BarChartCard rows={altRows} colors={COLORS} legend={CLASSES.map(cName)} labelWidth={110} scroll fmt={(v) => num(v, language)}
            ariaLabel={tr(language, "altAria", "Objects in low Earth orbit by altitude band and kind")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")} />}
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "popTitle", "How the crowd built up")}</h2>
            <p className="muted">{tr(language, "popSub", "Objects in orbit at the end of each year, {scope}. Debris counts from the year it entered the catalogue; status (active or dead) is today's, so the teal layer shows today's working satellites by the year they arrived. Debris peaked in {y}.", { scope, y: debrisPeakYear })}</p>
          </div></div>
          <YearChartCard mode="area" from={FIRST_YEAR} series={series(a.pop)} fmt={(v) => compact(v, language)} yearReadout={yearReadout(tr(language, "inOrbitWord", "in orbit"))}
            marks={EVENTS.map((e) => ({ year: e.year, label: tr(language, e.key, e.en) }))}
            ariaLabel={tr(language, "popAria", "Objects in orbit at the end of each year by kind")} hint={tr(language, "yearHint", "Hover or focus a year to read it. Dashed lines: fragmentation events dated by ESA.")} />
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "addTitle", "Objects added to the catalogue each year")}</h2>
            <p className="muted">{tr(language, "addSub", "Every object ever catalogued, {scope}, by the year it entered the catalogue (the launch year for satellites and rocket bodies). Spikes in debris are break-ups.", { scope })}</p>
          </div></div>
          <YearChartCard mode="lines" from={FIRST_YEAR} series={series(a.added, ["active", "inactive", "rocket", "debris"])} fmt={(v) => compact(v, language)} yearReadout={yearReadout(tr(language, "addedWord", "added"))}
            ariaLabel={tr(language, "addAria", "Objects added to the catalogue per year by kind")} hint={tr(language, "yearHint2", "Hover or focus a year to read it.")} />
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "decTitle", "What fell back each year")}</h2>
            <p className="muted">{tr(language, "decSub", "Objects that re-entered the atmosphere, by year, {scope}. {y} is a partial year.", { scope, y: AS_OF.slice(0, 4) })}</p>
          </div></div>
          <YearChartCard mode="columns" from={FIRST_YEAR} series={series(a.decayed)} fmt={(v) => compact(v, language)} yearReadout={yearReadout(tr(language, "decayedWord", "re-entered"))}
            ariaLabel={tr(language, "decAria", "Re-entries per year by kind")} hint={tr(language, "yearHint2", "Hover or focus a year to read it.")} />
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "ownerTitle", "Who owns what is up there?")}</h2>
            <p className="muted">{tr(language, "ownerSub", "All {n} owners with objects in orbit, {scope}, by kind; scroll the chart to see them all.", { n: ownerRows.length, scope: orbit === "all" ? tr(language, "allOrbits", "All Earth orbits") : orbitName(orbit, language) })}</p>
          </div></div>
          <BarChartCard rows={ownerRows} colors={COLORS} legend={CLASSES.map(cName)} labelWidth={90} scroll focusId={owner || undefined} fmt={(v) => num(v, language)}
            ariaLabel={tr(language, "ownerAria", "Objects in orbit by owner and kind, all owners")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")} />
        </section>
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "parentTitle2", "Every debris cloud: {n} launches", { n: num(parentRows.length, language) })}</h2>
            <p className="muted">{tr(language, "parentSub3", "Every launch that left catalogued debris, {scope}, largest first: pieces still in orbit and already re-entered (see the legend). In brackets: the year most pieces entered the catalogue and NASA's assessed cause. Scroll the chart to see them all.", { scope })}</p>
          </div></div>
          {parentRows.length === 0 ? <p className="muted">{tr(language, "parentNone", "No catalogued debris in this selection.")}</p> : <BarChartCard rows={parentRows} colors={["var(--sd-debris)", "var(--sd-debris-pale)"]} legend={[tr(language, "stillUp", "Still in orbit"), tr(language, "reentered", "Re-entered")]} labelWidth={290} scroll fmt={(v) => num(v, language)}
            ariaLabel={tr(language, "parentAria2", "Debris pieces per launch, every launch with catalogued debris")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")} />}
        </section>

        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "causeTitle", "What broke them apart?")}</h2>
            <p className="muted">{debrisIn
              ? tr(language, "causeSub", "{n} debris pieces in orbit, {scope}, by the cause NASA assessed for the break-up of their launch ({b} break-ups to May 2022); later CZ-6A stages follow ESA. Largest here: {top}.", { n: num(debrisIn, language), scope, b: BREAKUPS, top: topCause ? causeName(topCause, language) : "—" })
              : tr(language, "causeNone", "No debris from this selection is still in orbit.")}</p>
          </div></div>
          {causeRows.length > 0 && <BarChartCard rows={causeRows} colors={CAUSES.map((c) => CAUSE_COLOR[c])} labelWidth={200} fmt={(v) => num(v, language)}
            ariaLabel={tr(language, "causeAria", "Debris in orbit by break-up cause")} hint={tr(language, "causeHint", "\"No recorded break-up\" covers pieces from launches with no break-up in NASA's list, such as parts released during launch or deployment and minor events. Hover or focus a bar to read it.")} />}
        </section>
        <section className="card">
          <div className="card__head"><div>
            <h2>{tr(language, "rcsTitle", "How big is the junk on radar?")}</h2>
            <p className="muted">{tr(language, "rcsSub", "Objects in orbit, {scope}, by radar cross-section in the historical NORAD classes. {d} of the sized debris is small (under 0.1 m²). {none} objects ({p}) have no published radar size, mostly satellites launched since 2017.", {
              scope, d: pct(debrisSmall / (debrisSized || 1), language), none: num(rcsNone, language), p: pct(rcsNone / (a.tracked || 1), language) })}</p>
          </div></div>
          {rcsRows.length > 0 && <BarChartCard rows={rcsRows} colors={RCS_CLASSES.map((r) => RCS_COLOR[r])} legend={RCS_CLASSES.map((r) => rcsName(r, language))} labelWidth={130} fmt={(v) => num(v, language)}
            ariaLabel={tr(language, "rcsAria", "Objects in orbit by kind and radar size class")} hint={tr(language, "rcsHint", "Radar cross-section is how big an object looks to radar, not its true size or mass. Hover or focus a bar to read it.")} />}
        </section>

        <section className="card fw-wide">
          <div className="card__head"><div>
            <h2>{tr(language, "sizeTitle", "What we track is the tip of the iceberg")}</h2>
            <p className="muted">{tr(language, "sizeSub", "Logarithmic scale: each grid line is ten times the last. ESA's MASTER model at {date} for the whole Earth orbit, against the public catalogue today.", { date: fmtDate(ESA.epoch, language) })}</p>
          </div></div>
          <LogBarCard fmt={(v) => compact(v, language)} ariaLabel={tr(language, "sizeAria", "Estimated number of objects by size class, log scale")} hint={tr(language, "barHint", "Hover or focus a bar to read it.")}
            rows={[
              { key: "cat", label: tr(language, "sizeCat", "Catalogued (CelesTrak)"), value: KPIS.tracked, color: "var(--sd-active)", readout: tr(language, "sizeCatR", "{n} objects in the public catalogue today, mostly larger than about 10 cm", { n: num(KPIS.tracked, language) }) },
              { key: "gt10", label: "> 10 cm", value: ESA.gt10cm, color: "var(--sd-rocket)", readout: tr(language, "sizeGt10R", "≈ {n} objects larger than 10 cm, including ≈ {a} active satellites (ESA)", { n: num(ESA.gt10cm, language), a: num(ESA.activeInGt10cm, language) }) },
              { key: "1to10", label: "1–10 cm", value: ESA.cm1to10, color: "var(--sd-debris)", readout: tr(language, "size1to10R", "≈ {n} debris objects from 1 to 10 cm (ESA)", { n: compact(ESA.cm1to10, language) }) },
              { key: "mm", label: "1 mm – 1 cm", value: ESA.mm1to1cm, color: "var(--sd-debris-pale)", readout: tr(language, "sizeMmR", "≈ {n} debris objects from 1 mm to 1 cm (ESA)", { n: compact(ESA.mm1to1cm, language) }) },
            ]} />
        </section>
      </div>

      <section className="card">
        <div className="card__head"><div>
          <h2>{tr(language, "tableTitle", "Every owner")}</h2>
          <p className="muted">{tr(language, "tableSub", "{n} owners with objects in orbit, {scope}.", { n: ownerStats.filter((o) => o.total > 0).length, scope: orbit === "all" ? tr(language, "allOrbits", "All Earth orbits") : orbitName(orbit, language) })}</p>
        </div></div>
        <OwnerTable rows={ownerStats.filter((o) => o.total > 0)} focus={owner} onSelect={setOwner} language={language} />
      </section>

      <SpaceDebrisQuestions language={language} v={{
        tracked: num(KPIS.tracked, language), junk: pct(KPIS.pctJunk, language), debris: num(wDebris, language),
        pa: km(wPeakActive), pj: km(wPeakJunk), pop2000: num(pop2000, language), popNow: num(popNow, language), x: num(popNow / pop2000, language, 1),
        top3: top3.map((o) => ownerName(o.code)).join(", "), top3Share: pct(top3Share, language), parents: num(parentsInOrbit, language), parentsShare: pct(parentsInOrbit / wDebris, language),
        reentry: num(KPIS.reentriesIntactLastYear / 365, language, 1),
      }} />

      {/* Takeaways */}
      <section className="card takeaways">
        <h2>{tr(language, "takeawaysTitle", "What the data says")}</h2>
        <ul>
          <li><strong>{tr(language, "t1Head", "Half of what we track in orbit is junk.")}</strong> {tr(language, "t1", "Of {n} catalogued objects in Earth orbit, {a} are active satellites; the other {j} ({p}) are dead satellites, spent rocket bodies, and fragments.", {
            n: num(KPIS.tracked, language), a: num(KPIS.active, language), j: num(KPIS.tracked - KPIS.active, language), p: pct(KPIS.pctJunk, language) })}</li>
          <li><strong>{tr(language, "t2Head", "Working satellites and junk live at different heights.")}</strong> {tr(language, "t2", "In low orbit, active satellites crowd {a} (mega-constellation shells), while junk peaks at {j}, where most of the largest break-ups happened and where the air is too thin to pull pieces down quickly.", { a: km(wPeakActive), j: km(wPeakJunk) })}</li>
          <li><strong>{tr(language, "t3Head", "Three owners left most of the debris.")}</strong> {tr(language, "t3", "{top} account for {s} of the {d} debris fragments in orbit.", { top: top3.map((o) => ownerName(o.code)).join(", "), s: pct(top3Share, language), d: num(wDebris, language) })}</li>
          <li><strong>{tr(language, "t4Head", "A handful of events made a large share of it.")}</strong> {tr(language, "t4", "The ten launches with the most catalogued debris still have {n} pieces in orbit, {s} of all tracked fragments. Fengyun-1C alone, which broke apart in 2007, still has {fy}.", {
            n: num(parentsInOrbit, language), s: pct(parentsInOrbit / wDebris, language), fy: num(PARENTS[0].inOrbit, language) })}</li>
          <li><strong>{tr(language, "t5Head", "The catalogue is a small window.")}</strong> {tr(language, "t5", "ESA's model puts ≈ {gt10} objects above 10 cm, {mid} from 1 to 10 cm and {mm} from 1 mm to 1 cm. The public catalogue lists {n}: the rest cannot be tracked, only estimated.", {
            gt10: num(ESA.gt10cm, language), mid: compact(ESA.cm1to10, language), mm: compact(ESA.mm1to1cm, language), n: num(KPIS.tracked, language) })}</li>
          <li><strong>{tr(language, "t6Head", "Explosions and weapons tests, not accidents, made most of the debris.")}</strong> {tr(language, "t6", "Of {d} debris pieces in orbit, {prop} come from exploding rocket stages and spacecraft, {asat} from anti-satellite tests and {coll} from accidental collisions (NASA's assessed causes, ESA for CZ-6A).", {
            d: num(wDebrisIn, language), prop: pct((wc("propulsion") + wc("battery")) / wDebrisIn, language), asat: pct(wc("asat") / wDebrisIn, language), coll: pct(wc("collision") / wDebrisIn, language) })}</li>
        </ul>
      </section>

      <SpaceDebrisQuality language={language} v={{
        catalogued: num(KPIS.catalogued, language), tracked: num(KPIS.tracked, language), owners: OWNERS.length, asOf: fmtDate(AS_OF, language),
        noElements: num(world.byOrbit[ORBITS.indexOf("UFO")] ?? 0, language), unknown: num(world.inOrbit[4], language), popEnd: num(popEnd.reduce((x, y) => x + y, 0), language),
      }} />

      {/* Footer: method, attribution */}
      <section className="method lp-method">
        <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
        <div className="method__text">
          <p>{tr(language, "method1", "Objects are every entry in CelesTrak's satellite catalogue (SATCAT) that orbits, or once orbited, the Earth, including modules docked to a station; objects sent to the Moon, planets or the Sun are left out. In orbit means no decay date. Active follows CelesTrak's operational status (+, P, B, S or X); every other payload counts as a dead satellite. Mean altitude is (apogee + perigee) / 2. Orbit classes follow ESA's Space Environment Report 2026 (Table 1.2) from each object's latest perigee, apogee and inclination.")}</p>
          <p>{tr(language, "method2", "SATCAT has no cataloguing date, so the year an object entered the catalogue is estimated from its catalogue number: the latest launch date among objects with a lower or equal number. This places Fengyun-1C debris in 2007, the year of the break-up, not 1999, the launch. Debris is grouped into clouds by international designator (one launch); a launch's cloud can mix several events. Size-class estimates are ESA's MASTER model at 1 February 2026, copied from the report; they are not computed from SATCAT. ESA's 2025 report counted about 40,000 objects tracked by surveillance networks, more than the public catalogue lists.")}</p>
          <p>{tr(language, "method4", "Break-up causes come from Table 2.1 of NASA's History of On-orbit Satellite Fragmentations (16th edition, 268 break-ups to 1 May 2022): each debris piece takes the cause of its launch's largest break-up; the two CZ-6A upper stages that broke up later follow ESA's propulsion class; other pieces are \"after NASA's list\" if they entered the catalogue after May 2022, otherwise \"no recorded break-up\". Radar size uses SATCAT's radar cross-section in the historical NORAD classes (below 0.1 m², 0.1–1 m², above 1 m²); no payload launched after April 2017 has a published value. Live positions are computed in the browser from CelesTrak's GP elements with SGP4 (satellite.js); they are model estimates from the latest element sets, not measurements.")}</p>
          <p>{tr(language, "method3", "The public catalogue misses classified objects and most pieces under about 10 cm. Status is a snapshot: a satellite counted as active today may have been launched decades ago. Snapshot of {date}.", { date: fmtDate(AS_OF, language) })}</p>
        </div>
        <p className="method__sources">
          {tr(language, "sources", "Sources")}:{" "}
          <a href="https://celestrak.org/satcat/satcat-format.php" rel="noopener">CelesTrak SATCAT</a> (T.S. Kelso, CelesTrak)
          {" · "}<a href="https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2026" rel="noopener">ESA Space Environment Report 2026</a> (ESA Space Debris Office, MASTER)
          {" · "}<a href="https://ntrs.nasa.gov/citations/20220019160" rel="noopener">NASA History of On-orbit Satellite Fragmentations, 16th ed.</a>
          {" · "}<a href="https://celestrak.org/NORAD/elements/" rel="noopener">CelesTrak GP data</a>
        </p>
        <SpaceDebrisSources checkedOn={fmtDate("2026-11-24", language)} language={language} />
      </section>
    </div>
  );
}
