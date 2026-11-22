import { facts } from "./facts.js";
import StudyFacts from "../StudyFacts.jsx";
import { useEffect, useMemo, useState } from "react";
import {
  CROSSINGS, LANES, DAY_NAMES, MONTHS, borderNow, fetchLive, fetchToday, fetchHistorical, fetchSnapshot, toGrid, shiftDate,
} from "./api.js";
import { localeFor, t } from "../../../../assets/i18n.js";
import { useLanguage } from "../../language.jsx";
import { formatDate, hourLabel as localHourLabel, monthNames, weekdayNames } from "../locales.js";
import { makeTr } from "../tr.js";
import { MESSAGES } from "./messages.js";
import { BorderQuality, BorderQuestions, BorderSources } from "./Research.tsx";

const tr = makeTr("border", MESSAGES);

const DAYTIME = [6, 22]; // 6 am – 10 pm: hours when both crossings are open
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const STEPS = [
  { max: 15, label: "≤ 15", color: "var(--h1)" },
  { max: 30, label: "16–30", color: "var(--h2)" },
  { max: 45, label: "31–45", color: "var(--h3)" },
  { max: 60, label: "46–60", color: "var(--h4)" },
  { max: 90, label: "61–90", color: "var(--h5)" },
  { max: Infinity, label: "90+", color: "var(--h6)" },
];
// Diverging scale for differences in minutes: negative = the selected option is faster.
const DIFF = [
  { max: -30, label: "≤ −30", color: "var(--dn2)" },
  { max: -10, label: "−30…−10", color: "var(--dn1)" },
  { max: 10, label: "±10", color: "var(--d0)" },
  { max: 30, label: "+10…+30", color: "var(--dp1)" },
  { max: Infinity, label: "> +30", color: "var(--dp2)" },
];
const VIEWS = [
  { value: "wait", key: "viewWait", label: "Average wait" },
  { value: "crossing", key: "viewCrossing", label: "vs. other crossing" },
  { value: "lane", key: "viewLane", label: "vs. standard lane" },
];
const colorFor = (v, mode) => (v == null ? "var(--h0)" : (mode === "wait" ? STEPS : DIFF).find((s) => v <= s.max).color);
const mins = (v, language) => (v == null ? "—" : `${Math.round(v).toLocaleString(localeFor(language))} ${t(language, "border.minuteShort", "min")}`);
const signed = (v, language) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : "±"}${mins(Math.abs(v), language)}`);
const mean = (vs) => (vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null);
const inWindow = (h, [from, to]) => (from <= to ? h >= from && h <= to : h >= from || h <= to);

export default function BorderDay() {
  const language = useLanguage();
  const dayNames = useMemo(() => weekdayNames(language), [language]);
  const months = useMemo(() => monthNames(language), [language]);
  const formatHour = (hour) => localHourLabel(language, hour);
  const now = useMemo(borderNow, []);
  const [crossing, setCrossing] = useState(CROSSINGS[0].id);
  const [laneId, setLaneId] = useState("car");
  const [month, setMonth] = useState(now.month);
  const [planDay, setPlanDay] = useState(now.weekday);
  const [hourFrom, setHourFrom] = useState(DAYTIME[0]);
  const [hourTo, setHourTo] = useState(DAYTIME[1]);
  const [view, setView] = useState("wait");
  const [live, setLive] = useState({ status: "loading" });
  const [today, setToday] = useState({ status: "loading" });
  const [plan, setPlan] = useState({ status: "loading" });
  const [hist, setHist] = useState({ status: "loading" });
  const [snapshot, setSnapshot] = useState(null);
  const [hover, setHover] = useState(null);

  const lane = LANES.find((l) => l.id === laneId);
  const standard = LANES.find((l) => l.id === (lane.id === "ped" ? "ped" : "car"));
  const laneLabel = (item) => t(language, `border.lanes.${item.id}`, item.label);
  const cross = CROSSINGS.find((c) => c.id === crossing);
  const other = CROSSINGS.find((c) => c.id !== crossing);
  const win = [hourFrom, hourTo];
  const laneView = view === "lane" && lane.id !== "car" && lane.id !== "ped" ? "lane" : view === "lane" ? "wait" : view;

  useEffect(() => { fetchSnapshot().then(setSnapshot).catch(() => setSnapshot(null)); }, []);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetchLive().then((d) => alive && setLive({ status: "ok", data: d })).catch(() => alive && setLive({ status: "error" }));
    load();
    const timer = setInterval(load, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  useEffect(() => {
    let alive = true;
    setToday({ status: "loading" });
    fetchToday(crossing, now.iso)
      .then((d) => alive && setToday({ status: "ok", data: d }))
      .catch(() => alive && setToday({ status: "error" }));
    return () => { alive = false; };
  }, [crossing, now.iso]);

  // CBP's typical minimum and maximum for the planned weekday, for both crossings.
  const planIso = shiftDate(now.iso, (planDay - now.weekday + 7) % 7);
  useEffect(() => {
    let alive = true;
    setPlan({ status: "loading" });
    Promise.all(CROSSINGS.map((c) => fetchToday(c.id, planIso)))
      .then((list) => alive && setPlan({ status: "ok", data: Object.fromEntries(CROSSINGS.map((c, i) => [c.id, list[i]])) }))
      .catch(() => alive && setPlan({ status: "error" }));
    return () => { alive = false; };
  }, [planIso]);

  // Historical averages for the month at both crossings, so they can be compared.
  useEffect(() => {
    let alive = true;
    setHist({ status: "loading" });
    Promise.all(CROSSINGS.map((c) => fetchHistorical(c.id, month)
      .then((rows) => { if (!rows.length) throw new Error("empty"); return { rows, live: true }; })
      .catch(() => {
        const rows = snapshot?.historical?.[c.id]?.[month];
        return rows ? { rows, live: false } : null;
      })))
      .then((list) => {
        if (!alive) return;
        if (list.every((x) => !x)) { setHist({ status: "error" }); return; }
        setHist({
          status: "ok",
          rows: Object.fromEntries(CROSSINGS.map((c, i) => [c.id, list[i]?.rows || []])),
          live: list.every((x) => !x || x.live),
        });
      });
    return () => { alive = false; };
  }, [month, snapshot]);

  const grids = useMemo(() => (hist.status === "ok"
    ? Object.fromEntries(CROSSINGS.map((c) => [c.id, { lane: toGrid(hist.rows[c.id], lane.hist), std: toGrid(hist.rows[c.id], standard.hist) }]))
    : null), [hist, lane, standard]);
  const grid = grids?.[crossing].lane;

  // The heatmap's values for the chosen view.
  const shownGrid = useMemo(() => {
    if (!grids) return null;
    if (laneView === "wait") return grid;
    const ref = laneView === "crossing" ? grids[other.id].lane : grids[crossing].std;
    return grid.map((row, d) => row.map((v, h) => (v != null && ref[d][h] != null ? v - ref[d][h] : null)));
  }, [grids, grid, laneView, crossing, other]);

  const insights = useMemo(() => (grid ? computeInsights(grid, planDay, win) : null), [grid, planDay, hourFrom, hourTo]);
  const options = useMemo(() => {
    if (!grids) return [];
    const list = [];
    CROSSINGS.forEach((c) => HOURS.filter((h) => inWindow(h, win)).forEach((h) => {
      const v = grids[c.id].lane[planDay][h];
      const slot = plan.status === "ok" ? plan.data[c.id][lane.graph[0]].find((s) => Number(s.time) === h) : null;
      const max = slot ? Number(slot[`${lane.graph[1]}_max_wait`]) || null : null;
      if (v != null) list.push({ c, h, v, max });
    }));
    return list.sort((a, b) => a.v - b.v || (a.max ?? 0) - (b.max ?? 0));
  }, [grids, planDay, hourFrom, hourTo, plan, lane]);
  const compareStats = useMemo(() => (grids ? computeComparisons(grids, hist.rows[crossing], crossing, other.id, win) : null), [grids, hist, crossing, other, hourFrom, hourTo]);
  const monthly = useMemo(() => {
    const h = snapshot?.historical?.[crossing];
    if (!h) return null;
    return MONTHS.map((_, i) => ({ month: i + 1, value: windowMean(toGrid(h[i + 1] || [], lane.hist), win) }));
  }, [snapshot, crossing, lane, hourFrom, hourTo]);

  const liveFor = (c) => {
    if (live.status !== "ok") return null;
    const port = live.data[c.port];
    const l = pick(port, lane.live);
    if (!port || !l) return null;
    const closed = /closed/i.test(port.port_status || "") || /closed/i.test(l.operational_status || "");
    const delay = l.delay_minutes === "" ? null : Number(l.delay_minutes);
    return { closed, delay, open: Number(l.lanes_open) || 0, maxLanes: Number(pick(port, [lane.live[0], "maximum_lanes"])) || null, updated: l.update_time, hours: port.hours };
  };
  const liveNow = liveFor(cross), liveOther = liveFor(other);
  const todaySlots = today.status === "ok" ? today.data[lane.graph[0]] : null;
  const nowSlot = todaySlots?.find((s) => Number(s.time) === now.hour);
  const nowToday = nowSlot ? Number(nowSlot[`${lane.graph[1]}_today_wait`]) : null;
  const nowTypical = nowSlot ? Number(nowSlot[`${lane.graph[1]}_average_wait`]) : null;
  const todayDrift = useMemo(() => {
    if (!todaySlots) return null;
    const diffs = todaySlots
      .filter((s) => Number(s.time) <= now.hour && s[`${lane.graph[1]}_today_wait`] !== "")
      .map((s) => Number(s[`${lane.graph[1]}_today_wait`]) - Number(s[`${lane.graph[1]}_average_wait`]))
      .filter(Number.isFinite);
    return diffs.length ? { v: mean(diffs), hours: diffs.length } : null;
  }, [todaySlots, lane, now.hour]);

  const liveValue = (x) => (x == null ? (live.status === "loading" ? "…" : "—")
    : x.closed ? tr(language, "closed", "Closed") : mins(x.delay, language));
  const best = options[0];
  const worstInWindow = options.length ? options.reduce((a, b) => (b.v > a.v ? b : a)) : null;
  const dayName = dayNames[planDay];
  const filtersOn = hourFrom !== DAYTIME[0] || hourTo !== DAYTIME[1] || planDay !== now.weekday || view !== "wait" || month !== now.month;
  const reset = () => { setHourFrom(DAYTIME[0]); setHourTo(DAYTIME[1]); setPlanDay(now.weekday); setView("wait"); setMonth(now.month); };
  const legend = laneView === "wait" ? STEPS : DIFF;
  const viewNote = laneView === "crossing"
    ? tr(language, "viewCrossingNote", "Minutes at {a} minus {b}. Teal means {a} is faster.", { a: cross.name, b: other.name })
    : laneView === "lane"
      ? tr(language, "viewLaneNote", "Minutes in {lane} minus the standard lane. Teal means {lane} saves time.", { lane: laneLabel(lane) })
      : null;

  return (
    <div className="viz">
      {/* Controls */}
      <div className="controls" role="group" aria-label={t(language, "border.controlsAria", "Choose crossing and lane")}>
        <Segmented label={t(language, "border.crossing", "Crossing")} value={crossing} onChange={setCrossing}
          options={CROSSINGS.map((c) => ({ value: c.id, label: c.name }))} />
        <Segmented label={t(language, "border.lane", "Lane")} value={laneId} onChange={setLaneId}
          options={LANES.map((item) => ({ value: item.id, label: laneLabel(item) }))} />
        <label className="select">
          <span className="mono">{t(language, "border.month", "Month")}</span>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </label>
        <label className="select">
          <span className="mono">{tr(language, "planDay", "Day")}</span>
          <select value={planDay} onChange={(e) => setPlanDay(Number(e.target.value))}>
            {dayNames.map((d, i) => <option key={d} value={i}>{d}{i === now.weekday ? ` · ${tr(language, "todayShort", "today")}` : ""}</option>)}
          </select>
        </label>
        <div className="range">
          <span className="mono">{tr(language, "hours", "Hours")}</span>
          <div className="range__pair">
            <label className="select select--inline">
              <span className="sr">{tr(language, "hourFrom", "From")}</span>
              <select value={hourFrom} onChange={(e) => setHourFrom(Number(e.target.value))}>
                {HOURS.map((h) => <option key={h} value={h}>{formatHour(h)}</option>)}
              </select>
            </label>
            <span className="range__dash" aria-hidden="true">–</span>
            <label className="select select--inline">
              <span className="sr">{tr(language, "hourTo", "To")}</span>
              <select value={hourTo} onChange={(e) => setHourTo(Number(e.target.value))}>
                {HOURS.map((h) => <option key={h} value={h}>{formatHour(h)}</option>)}
              </select>
            </label>
          </div>
        </div>
        {filtersOn ? <button type="button" className="gw-reset" onClick={reset}>{tr(language, "reset", "Reset")}</button> : null}
      </div>

      {/* Headline numbers */}
      <section className="stats" aria-label={t(language, "border.statsAria", "Key numbers")}>
        <Stat accent label={tr(language, "rightNowAt", "Right now · {name}", { name: cross.name })} value={liveValue(liveNow)}
          note={liveNow
            ? [
              liveNow.closed
                ? tr(language, "hoursNote", "Hours: {hours}", { hours: liveNow.hours })
                : tr(language, "lanesOpenOf", "{open} of {max} lanes open", { open: liveNow.open, max: liveNow.maxLanes ?? "?" }),
              liveOther ? `${other.name}: ${liveValue(liveOther)}` : null,
            ].filter(Boolean).join(" · ")
            : live.status === "error" ? t(language, "border.liveUnavailable", "Live feed unavailable") : t(language, "border.liveLoading", "Loading live feed")} />
        <Stat label={t(language, "border.typicalAt", "Typical at this hour")} value={mins(nowTypical, language)}
          note={nowToday != null && nowTypical
            ? compare(nowToday, nowTypical, language)
            : `${dayNames[now.weekday]} · ${formatHour(now.hour)}`} />
        <Stat label={tr(language, "bestOption", "Best option · {day}", { day: dayName })} value={best ? formatHour(best.h) : "—"}
          note={best ? tr(language, "bestOptionNote", "{crossing} · ~{minutes} · saves {saved} vs. the worst hour", {
            crossing: best.c.name, minutes: mins(best.v, language), saved: mins(worstInWindow.v - best.v, language),
          }) : tr(language, "noHours", "No open hours in this window")} />
        <Stat label={t(language, "border.leastBusyDay", "Least busy day")} value={insights?.bestDay ? dayNames[insights.bestDay.d] : "—"}
          note={insights?.bestDay ? tr(language, "windowAverage", "{minutes} average · {from}–{to}", {
            minutes: mins(insights.bestDay.v, language), from: formatHour(hourFrom), to: formatHour(hourTo),
          }) : ""} />
      </section>

      <StudyFacts language={language} facts={(facts[language] ?? facts.en).map(([title, text]) => ({ title, text }))} />

      {/* Planner */}
      <section className="card">
        <div className="card__head">
          <div>
            <h2>{tr(language, "planTitle", "Best times to cross on {day}", { day: dayName })}</h2>
            <p className="muted">{tr(language, "planDescription", "{lane} · {month} averages for both crossings between {from} and {to}. \"Bad day\" is CBP's typical maximum for that weekday and hour.", {
              lane: laneLabel(lane), month: months[month - 1], from: formatHour(hourFrom), to: formatHour(hourTo),
            })}</p>
          </div>
        </div>
        {!grids ? <p className="muted pad">{t(language, "border.historyLoading", "Loading historical data…")}</p> : (
          <div className="plan">
            <ol className="plan__list">
              {options.slice(0, 6).map((o, i) => (
                <li key={`${o.c.id}-${o.h}`} className={o.c.id === crossing ? "is-sel" : ""}>
                  <span className="plan__rank">{i + 1}</span>
                  <span className="plan__when"><strong>{formatHour(o.h)}</strong><span>{o.c.name}</span></span>
                  <span className="plan__bar"><i style={{ width: `${(o.v / Math.max(worstInWindow.v, 1)) * 100}%`, background: colorFor(o.v, "wait") }} /></span>
                  <span className="plan__val">{mins(o.v, language)}</span>
                  <span className="plan__risk" title={tr(language, "badDayTitle", "Typical maximum (bad day)")}>
                    {o.max != null ? tr(language, "badDay", "bad day {minutes}", { minutes: mins(o.max, language) }) : ""}
                  </span>
                </li>
              ))}
              {!options.length && <li className="muted">{tr(language, "noHours", "No open hours in this window")}</li>}
            </ol>
            <ProfileChart grids={grids} day={planDay} crossing={crossing} win={win} best={best}
              formatHour={formatHour} language={language} />
          </div>
        )}
      </section>

      {/* Heatmap */}
      <section className="card">
        <div className="card__head">
          <div>
            <h2>{laneView === "wait" ? t(language, "border.heatTitle", "Average wait by day and hour") : tr(language, "heatDiffTitle", "Difference by day and hour")}</h2>
            <p className="muted">{cross.name} · {laneLabel(lane)} · {months[month - 1]} {t(language, "border.historicalAverages", "historical averages")}{hist.status === "ok" && !hist.live ? ` ${t(language, "border.savedSnapshot", "(saved snapshot)")}` : ""}</p>
            {viewNote && <p className="muted">{viewNote}</p>}
          </div>
          <div className="card__tools">
            <Segmented label={tr(language, "view", "View")} value={laneView} onChange={setView} small
              options={VIEWS.map((v) => ({ value: v.value, label: tr(language, v.key, v.label), disabled: v.value === "lane" && (lane.id === "car" || lane.id === "ped") }))} />
            <Legend steps={legend} language={language} />
          </div>
        </div>
        {hist.status === "loading" && <p className="muted pad">{t(language, "border.historyLoading", "Loading historical data…")}</p>}
        {hist.status === "error" && <p className="muted pad">{t(language, "border.historyUnavailable", "Historical data is unavailable right now.")}</p>}
        {shownGrid && <Heatmap grid={shownGrid} mode={laneView} win={win} day={planDay} now={month === now.month ? now : null}
          onHover={setHover} dayNames={dayNames} formatHour={formatHour} language={language} />}
        <p className="readout" aria-live="polite">
          {hover
            ? <><strong>{dayNames[hover.d]}, {formatHour(hover.h)}</strong> — {hover.v == null
              ? t(language, "border.closedOrNoData", "closed or no data")
              : laneView === "wait" ? t(language, "border.about", "about {minutes}", { minutes: mins(hover.v, language) }) : signed(hover.v, language)}</>
            : tr(language, "hoverCellWindow", "Hover or focus a cell. The outlined cell is now; hours outside your window are faded.")}
        </p>
      </section>

      <div className="two">
        {/* Today vs typical */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2>{t(language, "border.todayTitle", "Today vs. a typical {day}", { day: dayNames[now.weekday] })}</h2>
              <p className="muted">{cross.name} · {laneLabel(lane)} · {formatDate(language, now.iso, { dateStyle: "medium" })}</p>
            </div>
          </div>
          {today.status === "loading" && <p className="muted pad">{t(language, "border.todayLoading", "Loading today's data…")}</p>}
          {today.status === "error" && <p className="muted pad">{t(language, "border.todayUnavailable", "Today's data is unavailable right now.")}</p>}
          {todaySlots && <TodayChart slots={todaySlots} prefix={lane.graph[1]} hour={now.hour} language={language} formatHour={formatHour} />}
          {todayDrift && (
            <p className="readout">{tr(language, "drift", "Across {hours} reported hours so far, today is running {diff} per hour against the typical {day}.", {
              hours: todayDrift.hours, diff: signed(todayDrift.v, language), day: dayNames[now.weekday],
            })}</p>
          )}
        </section>

        {/* Seasonality */}
        <section className="card">
          <div className="card__head">
            <div>
              <h2>{t(language, "border.busiestMonths", "Busiest months")}</h2>
              <p className="muted">{tr(language, "averageByMonthWindow", "Average wait between {from} and {to}, by month. Click a month to load it.", { from: formatHour(hourFrom), to: formatHour(hourTo) })}</p>
            </div>
          </div>
          {monthly ? <MonthChart data={monthly} current={month} onPick={setMonth} months={months} language={language} /> : <p className="muted pad">{t(language, "border.loading", "Loading…")}</p>}
        </section>
      </div>

      {insights && compareStats && (() => {
        const ms = (monthly || []).filter((m) => m.value != null);
        const wM = ms.length ? ms.reduce((a, b) => (b.value > a.value ? b : a)) : null;
        const bM = ms.length ? ms.reduce((a, b) => (b.value < a.value ? b : a)) : null;
        return (
          <BorderQuestions language={language} v={{
            lane: laneLabel(lane), crossing: cross.name, month: months[month - 1], from: formatHour(hourFrom), to: formatHour(hourTo),
            best: { day: dayNames[insights.best.d], hour: formatHour(insights.best.h), v: mins(insights.best.v, language) },
            worst: { day: dayNames[insights.worst.d], hour: formatHour(insights.worst.h), v: mins(insights.worst.v, language) },
            cmp: compareStats.crossing ? { ...compareStats.crossing, a: mins(compareStats.crossing.a, language), b: mins(compareStats.crossing.b, language) } : null,
            lanes: compareStats.lanes.map((l) => tr(language, "laneShort", "{lane} saves about {saved} ({pct})", {
              lane: laneLabel(LANES.find((x) => x.id === l.id)), saved: mins(l.saved, language), pct: l.pct,
            })).join("; "),
            worstMonth: wM ? { name: months[wM.month - 1], v: mins(wM.value, language) } : undefined,
            bestMonth: bM ? { name: months[bM.month - 1], v: mins(bM.value, language) } : undefined,
            snapshotDate: "",
          }} />
        );
      })()}

      {/* Takeaways */}
      {insights && compareStats && (
        <section className="card takeaways">
          <h2>{t(language, "border.takeawaysTitle", "What the data says")}</h2>
          <ul>
            <li><strong>{t(language, "border.quietestWindow", "Quietest daytime window")}</strong> {dayNames[insights.best.d]} · {formatHour(insights.best.h)} · {t(language, "border.about", "about {minutes}", { minutes: mins(insights.best.v, language) })}.</li>
            <li><strong>{t(language, "border.busiestWindow", "Busiest window")}</strong> {dayNames[insights.worst.d]} · {formatHour(insights.worst.h)} · {t(language, "border.about", "about {minutes}", { minutes: mins(insights.worst.v, language) })}.</li>
            {insights.bestToday && insights.worstToday && (
              <li><strong>{tr(language, "timingHeadline", "Timing beats luck on {day}.", { day: dayName })}</strong> {tr(language, "timingStats", "Leaving at {best} instead of {worst} saves about {saved} at {crossing}.", {
                best: formatHour(insights.bestToday.h), worst: formatHour(insights.worstToday.h),
                saved: mins(insights.worstToday.v - insights.bestToday.v, language), crossing: cross.name,
              })}</li>
            )}
            {compareStats.crossing && (
              <li><strong>{tr(language, "crossingHeadline", "{faster} is usually faster.", { faster: compareStats.crossing.faster })}</strong> {tr(language, "crossingStats", "In the hours both crossings are open, {faster} averages {a} and {slower} {b}. {faster} is quicker in {share} of day-and-hour slots.", {
                faster: compareStats.crossing.faster, slower: compareStats.crossing.slower,
                a: mins(compareStats.crossing.a, language), b: mins(compareStats.crossing.b, language), share: compareStats.crossing.share,
              })}</li>
            )}
            {compareStats.lanes.map((l) => (
              <li key={l.id}><strong>{tr(language, "laneHeadline", "{lane} saves {saved} on average.", { lane: laneLabel(LANES.find((x) => x.id === l.id)), saved: mins(l.saved, language) })}</strong> {tr(language, "laneStats", "That is {pct} less than the standard lane at {crossing}, and up to {peak} at the busiest hour.", {
                pct: l.pct, crossing: cross.name, peak: mins(l.peak, language),
              })}</li>
            ))}
          </ul>
        </section>
      )}

      <BorderQuality language={language} snapshotDate={snapshot ? formatDate(language, snapshot.capturedAt.slice(0, 10), { dateStyle: "medium" }) : "—"} />

      <section className="method lp-method">
        <h2>{t(language, "border.methodTitle", "Method & sources")}</h2>
        <div className="method__text">
          <p>
            {t(language, "border.methodIntro", "Data comes from the U.S. Customs and Border Protection")}{" "}
            <a href="https://bwt.cbp.gov/" rel="noopener">Border Wait Times</a>.{" "}
            {t(language, "border.methodLive", "\"Right now\" uses the live feed (refreshed every five minutes). The heatmap shows CBP's historical average for each weekday and hour of the selected month.")}{" "}
            {t(language, "border.methodToday", "\"Today\" compares the hourly waits reported so far with the typical value for the same weekday.")}{" "}
            {t(language, "border.methodTimezone", "Times are Pacific Time, the local time in Mexicali and Calexico.")}{" "}
            {t(language, "border.methodNorthbound", "Waits are northbound (Mexico → U.S.).")}{" "}
            {t(language, "border.methodSnapshot", "If the live service is unreachable, the page falls back to a snapshot captured on {date}.", {
              date: snapshot ? formatDate(language, snapshot.capturedAt.slice(0, 10), { dateStyle: "medium" }) : "build",
            })}
          </p>
          <p>{tr(language, "methodCaveats", "CBP waits are estimates posted by officers, not measured times, and CBP does not publish how many days each average covers, so small differences (under about 10 minutes) are within normal noise. Hours reported as zero are treated as closed or missing. Differences between crossings or lanes use only the hours where both report a wait. The planner ranks hours by the monthly average and shows CBP's typical maximum for that weekday as a bad-day check.")}</p>
        </div>
        <BorderSources checkedOn={formatDate(language, "2026-11-21", { dateStyle: "medium" })} language={language} />
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */
function pick(obj, path) { return path.reduce((o, k) => (o ? o[k] : null), obj); }

function windowMean(grid, win) {
  const vals = [];
  grid.forEach((row) => row.forEach((v, h) => { if (v != null && inWindow(h, win)) vals.push(v); }));
  return mean(vals);
}

function computeInsights(grid, weekday, win) {
  const cells = [];
  grid.forEach((row, d) => row.forEach((v, h) => { if (v != null && inWindow(h, win)) cells.push({ d, h, v }); }));
  if (!cells.length) return null;
  const byV = [...cells].sort((a, b) => a.v - b.v);
  const day = byV.filter((c) => c.d === weekday);
  const days = DAY_NAMES.map((_, d) => ({ d, v: mean(cells.filter((c) => c.d === d).map((c) => c.v)) ?? Infinity }))
    .sort((a, b) => a.v - b.v);
  return { best: byV[0], worst: byV[byV.length - 1], bestToday: day[0], worstToday: day[day.length - 1], bestDay: days[0] };
}

/** Crossing and lane comparisons for the selected crossing, using only slots where both sides report. */
function computeComparisons(grids, rows, crossing, otherId, win) {
  const pairs = (a, b) => {
    const out = [];
    a.forEach((row, d) => row.forEach((v, h) => { if (v != null && b[d][h] != null && inWindow(h, win)) out.push([v, b[d][h]]); }));
    return out;
  };
  const names = Object.fromEntries(CROSSINGS.map((c) => [c.id, c.name]));
  const cp = pairs(grids[crossing].lane, grids[otherId].lane);
  let crossingStats = null;
  if (cp.length) {
    const a = mean(cp.map((p) => p[0])), b = mean(cp.map((p) => p[1]));
    const selFaster = a <= b;
    const wins = cp.filter(([x, y]) => (selFaster ? x < y : y < x)).length;
    crossingStats = {
      faster: names[selFaster ? crossing : otherId], slower: names[selFaster ? otherId : crossing],
      a: selFaster ? a : b, b: selFaster ? b : a, share: `${Math.round((wins / cp.length) * 100)}%`,
    };
  }
  // SENTRI and Ready Lane against the standard car lane at the selected crossing.
  const std = toGrid(rows, LANES.find((l) => l.id === "car").hist);
  const lanes = ["sentri", "ready"].map((id) => {
    const lp = pairs(toGrid(rows, LANES.find((l) => l.id === id).hist), std);
    if (!lp.length) return null;
    const a = mean(lp.map((p) => p[0])), b = mean(lp.map((p) => p[1]));
    const peak = Math.max(...lp.map(([x, y]) => y - x));
    return { id, saved: b - a, pct: `${Math.round(((b - a) / b) * 100)}%`, peak };
  }).filter((l) => l && l.saved >= 1);
  return { crossing: crossingStats, lanes };
}

function compare(today, typical, language) {
  const diff = today - typical;
  const values = { today: mins(today, language), difference: mins(Math.abs(Math.round(diff)), language) };
  if (Math.abs(diff) < 5) return t(language, "border.compareNormal", "Today: {today}, about normal", values);
  return diff > 0
    ? t(language, "border.compareLonger", "Today: {today}, {difference} longer than usual", values)
    : t(language, "border.compareShorter", "Today: {today}, {difference} shorter than usual", values);
}

/* ---------- components ---------- */
function Segmented({ label, value, onChange, options, small }) {
  return (
    <div className={`seg${small ? " seg--small" : ""}`}>
      <span className="mono">{label}</span>
      <div className="seg__opts" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} disabled={o.disabled}
            className={value === o.value ? "on" : ""} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, note, accent }) {
  return (
    <div className={`stat${accent ? " stat--accent" : ""}`}>
      <span className="mono">{label}</span>
      <strong>{value}</strong>
      <span className="stat__note">{note}</span>
    </div>
  );
}

function Legend({ steps, language }) {
  return (
    <div className="legend" aria-label={t(language, "border.legendAria", "Color scale in minutes")}>
      {steps.map((s) => <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>)}
      <span><i style={{ background: "var(--h0)" }} />{t(language, "border.legendClosed", "Closed")}</span>
    </div>
  );
}

function Heatmap({ grid, mode, win, day, now, onHover, dayNames, formatHour, language }) {
  const cw = 30, ch = 30, gap = 3, left = 92, top = 26;
  const width = left + 24 * (cw + gap), height = top + 7 * (ch + gap);
  return (
    <div className="heat">
      <svg viewBox={`0 0 ${width} ${height}`} role="grid" aria-label={t(language, "border.heatAria", "Average wait in minutes by weekday and hour")}>
        {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
          <text key={h} x={left + h * (cw + gap) + cw / 2} y={14} className="axis" textAnchor="middle">{formatHour(h)}</text>
        ))}
        {grid.map((row, d) => (
          <g key={d} role="row">
            <text x={left - 12} y={top + d * (ch + gap) + ch / 2 + 4} className={`axis${d === day ? " axis--on" : ""}`} textAnchor="end">{dayNames[d].slice(0, 3)}</text>
            {row.map((v, h) => {
              const isNow = now && now.weekday === d && now.hour === h;
              const outside = !inWindow(h, win);
              const label = v == null
                ? t(language, "border.closedOrNoData", "closed or no data")
                : mode === "wait"
                  ? t(language, "border.minuteCount", "{count} minutes", { count: Math.round(v).toLocaleString(localeFor(language)) })
                  : signed(v, language);
              return (
                <rect key={h} role="gridcell" tabIndex={0}
                  aria-label={`${dayNames[d]} ${formatHour(h)}: ${label}`}
                  x={left + h * (cw + gap)} y={top + d * (ch + gap)} width={cw} height={ch} rx={5}
                  fill={colorFor(v, mode)} className={`cell${isNow ? " now" : ""}${outside ? " out" : ""}`}
                  onMouseEnter={() => onHover({ d, h, v })} onFocus={() => onHover({ d, h, v })}
                  onMouseLeave={() => onHover(null)} onBlur={() => onHover(null)} />
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Hourly profile for one weekday at both crossings, with the chosen window shaded. */
function ProfileChart({ grids, day, crossing, win, best, formatHour, language }) {
  const W = 560, H = 230, L = 36, R = 12, T = 14, B = 28;
  const series = CROSSINGS.map((c) => ({ c, vals: grids[c.id].lane[day] }));
  const maxV = Math.max(30, ...series.flatMap((s) => s.vals.filter((v) => v != null)));
  const top = Math.ceil(maxV / 30) * 30;
  const x = (h) => L + (h / 23) * (W - L - R);
  const y = (v) => T + (1 - v / top) * (H - T - B);
  const path = (vals) => {
    let d = "", pen = false;
    vals.forEach((v, h) => {
      if (v == null) { pen = false; return; }
      d += `${pen ? "L" : "M"}${x(h).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };
  const ticks = Array.from({ length: top / 30 + 1 }, (_, i) => i * 30);
  const [from, to] = win;
  const spans = from <= to ? [[from, to]] : [[from, 23], [0, to]];
  return (
    <figure className="chart" tabIndex={0}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={tr(language, "profileAria", "Average wait by hour at both crossings, with the selected hours shaded")}>
        {spans.map(([a, b]) => <rect key={a} x={x(a) - 6} y={T} width={x(b) - x(a) + 12} height={H - T - B} className="win" rx={6} />)}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="grid" />
            <text x={L - 8} y={y(v) + 4} className="axis" textAnchor="end">{v}</text>
          </g>
        ))}
        {[0, 6, 12, 18, 23].map((h) => <text key={h} x={x(h)} y={H - 8} className="axis" textAnchor="middle">{formatHour(h)}</text>)}
        {series.map((s) => <path key={s.c.id} d={path(s.vals)} className={s.c.id === crossing ? "today" : "other"} />)}
        {best && <circle cx={x(best.h)} cy={y(best.v)} r={6} className="dot dot--best" />}
      </svg>
      <figcaption className="keys">
        {series.map((s) => <span key={s.c.id}><i className={s.c.id === crossing ? "k-today" : "k-other"} />{s.c.name}</span>)}
        <span><i className="k-win" />{tr(language, "yourHours", "Your hours")}</span>
        <span><i className="k-best" />{tr(language, "bestPick", "Best pick")}</span>
      </figcaption>
    </figure>
  );
}

function TodayChart({ slots, prefix, hour, language, formatHour }) {
  const W = 560, H = 240, L = 36, R = 12, T = 14, B = 28;
  const pts = Array.from({ length: 24 }, (_, h) => {
    const s = slots.find((x) => Number(x.time) === h) || {};
    const n = (k) => { const v = Number(s[`${prefix}_${k}`]); return Number.isFinite(v) ? v : 0; };
    return { h, today: h <= hour && s[`${prefix}_today_wait`] !== "" ? n("today_wait") : null, avg: n("average_wait"), min: n("min_wait"), max: n("max_wait") };
  });
  const maxV = Math.max(30, ...pts.map((p) => Math.max(p.max, p.today || 0)));
  const top = Math.ceil(maxV / 30) * 30;
  const x = (h) => L + (h / 23) * (W - L - R);
  const y = (v) => T + (1 - v / top) * (H - T - B);
  const line = (key) => pts.filter((p) => p[key] != null).map((p, i) => `${i ? "L" : "M"}${x(p.h)},${y(p[key])}`).join(" ");
  const band = `M${pts.map((p) => `${x(p.h)},${y(p.max)}`).join(" L")} L${[...pts].reverse().map((p) => `${x(p.h)},${y(p.min)}`).join(" L")} Z`;
  const ticks = Array.from({ length: top / 30 + 1 }, (_, i) => i * 30);
  return (
    <figure className="chart" tabIndex={0}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={t(language, "border.chartAria", "Hourly waits today compared with the typical average. Current hour {hour}.", { hour: formatHour(hour) })}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="grid" />
            <text x={L - 8} y={y(v) + 4} className="axis" textAnchor="end">{v}</text>
          </g>
        ))}
        {[0, 6, 12, 18, 23].map((h) => <text key={h} x={x(h)} y={H - 8} className="axis" textAnchor="middle">{formatHour(h)}</text>)}
        <path d={band} className="band" />
        <path d={line("avg")} className="avg" />
        <path d={line("today")} className="today" />
        <line x1={x(hour)} x2={x(hour)} y1={T} y2={H - B} className="nowline" />
        {pts[hour]?.today != null && <circle cx={x(hour)} cy={y(pts[hour].today)} r={5} className="dot" />}
      </svg>
      <figcaption className="keys">
        <span><i className="k-today" />{t(language, "border.today", "Today")}</span>
        <span><i className="k-avg" />{t(language, "border.typicalAverage", "Typical average")}</span>
        <span><i className="k-band" />{t(language, "border.typicalRange", "Typical range")}</span>
        <span className="muted">{t(language, "border.minutes", "Minutes")}</span>
      </figcaption>
    </figure>
  );
}

function MonthChart({ data, current, onPick, months, language }) {
  const max = Math.max(...data.map((d) => d.value || 0), 1);
  const worst = data.reduce((a, b) => ((b.value || 0) > (a.value || 0) ? b : a));
  return (
    <div className="months">
      {data.map((d) => (
        <button key={d.month} type="button" aria-pressed={d.month === current}
          className={`m${d.month === current ? " on" : ""}${d.month === worst.month ? " peak" : ""}`}
          onClick={() => onPick(d.month)} aria-label={t(language, "border.monthAria", "{month}: {minutes} average. Show in heatmap.", {
            month: months[d.month - 1], minutes: mins(d.value, language),
          })}>
          <span className="m__val">{d.value ? Math.round(d.value) : "—"}</span>
          <span className="m__bar" style={{ height: `${((d.value || 0) / max) * 100}%` }} />
          <span className="m__lbl">{months[d.month - 1].slice(0, 3)}</span>
        </button>
      ))}
    </div>
  );
}
