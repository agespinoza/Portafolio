import { useMemo, useState } from "react";
import { dayText, localeFor, t } from "../../assets/i18n.js";
import { DAYS } from "./days/index.js";
import { archiveCopy } from "./archive-copy.js";

const PAGE_SIZE = 12;
const DEFAULT_FILTERS = { q: "", topic: "", year: "", order: "" };
const YEARS = [...new Set(DAYS.map(({ date }) => date.slice(0, 4)))].sort().reverse();
const TOPICS = [...new Map(DAYS.map((day) => [day.topic, day])).values()];
const normalize = (text) => text.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "");

function filtersFromUrl() {
  const params = new URLSearchParams(location.search);
  const topic = params.get("topic");
  const year = params.get("year");
  return {
    q: params.get("q") ?? "",
    topic: TOPICS.some((day) => day.topic === topic) ? topic : "",
    year: YEARS.includes(year) ? year : "",
    order: params.get("order") === "oldest" ? "oldest" : "",
  };
}

function replaceUrl(url) {
  // Local file previews still work even when a browser disallows changing their URL.
  try { history.replaceState(history.state, "", url); } catch {}
}

export default function StudyArchive({ language }) {
  const copy = archiveCopy(language);
  const [filters, setFilters] = useState(filtersFromUrl);
  const [limit, setLimit] = useState(() => {
    const limit = Number(new URLSearchParams(location.search).get("limit"));
    return Number.isSafeInteger(limit) ? Math.max(PAGE_SIZE, Math.min(limit, DAYS.length)) : PAGE_SIZE;
  });
  const locale = localeFor(language);
  const entries = useMemo(() => {
    const formatDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });
    return DAYS.map((day) => {
      const title = dayText(language, day.slug, "title", day.title);
      const summary = dayText(language, day.slug, "summary", day.summary);
      const topic = dayText(language, day.slug, "topic", day.topic);
      const tags = day.tags.map((tag) => t(language, `labTags.${tag}`, tag));
      const number = String(day.day).padStart(3, "0");
      const dayLabel = t(language, "lab.day", "Day {number}", { number });
      return { day, title, summary, topic, tags, dayLabel, dateLabel: formatDate.format(new Date(day.date)), search: normalize([
        title, summary, topic, ...tags, day.title, day.summary, day.topic, ...day.tags, day.source, day.date, dayLabel, day.day,
      ].join(" ")) };
    });
  }, [language, locale]);
  const terms = normalize(filters.q.trim()).split(/\s+/).filter(Boolean);
  const found = entries.filter(({ day, search }) =>
    (!filters.topic || day.topic === filters.topic)
    && (!filters.year || day.date.startsWith(filters.year))
    && terms.every((term) => search.includes(term)),
  ).sort((a, b) => (filters.order === "oldest" ? 1 : -1) * (
    a.day.date.localeCompare(b.day.date) || a.day.day - b.day.day
  ));
  const options = TOPICS.map((day) => [day.topic, dayText(language, day.slug, "topic", day.topic)])
    .sort((a, b) => a[1].localeCompare(b[1], locale));
  const visible = found.slice(0, limit);
  // Group the visible studies by month, in the chosen order (newest month first by default).
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const months = [];
  for (const entry of visible) {
    const key = entry.day.date.slice(0, 7);
    if (months[months.length - 1]?.key !== key) months.push({ key, label: monthLabel.format(new Date(`${key}-01T00:00:00Z`)), entries: [] });
    months[months.length - 1].entries.push(entry);
  }
  const count = copy.count.replace("{shown}", visible.length.toLocaleString(locale)).replace("{total}", found.length.toLocaleString(locale));

  function update(next) {
    setFilters(next);
    setLimit(PAGE_SIZE);
    const url = new URL(location.href);
    for (const [name, value] of Object.entries(next)) {
      if (value) url.searchParams.set(name, value);
      else url.searchParams.delete(name);
    }
    url.searchParams.delete("limit");
    replaceUrl(url);
  }

  return (
    <section className="archive" aria-labelledby="archive-title">
      <h2 id="archive-title" tabIndex={-1}>{copy.archive}</h2>
      <form className="archive__filters" role="search" aria-labelledby="archive-title" onSubmit={(event) => event.preventDefault()}>
        <label className="archive__search">
          {copy.search}
          <input type="search" value={filters.q} placeholder={copy.placeholder}
            onChange={(event) => update({ ...filters, q: event.target.value })} />
        </label>
        <label>{copy.topic}
          <select value={filters.topic} onChange={(event) => update({ ...filters, topic: event.target.value })}>
            <option value="">{copy.allTopics}</option>
            {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>{copy.year}
          <select value={filters.year} onChange={(event) => update({ ...filters, year: event.target.value })}>
            <option value="">{copy.allYears}</option>
            {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label>{copy.order}
          <select value={filters.order} onChange={(event) => update({ ...filters, order: event.target.value })}>
            <option value="">{copy.recent}</option>
            <option value="oldest">{copy.oldest}</option>
          </select>
        </label>
      </form>
      <div className="archive__status">
        <p role="status">{found.length ? count : copy.empty}</p>
        {Object.values(filters).some(Boolean) && (
          <button className="archive__clear" type="button" onClick={(event) => {
            event.currentTarget.closest(".archive").querySelector("input").focus();
            update(DEFAULT_FILTERS);
          }}>{copy.clear}</button>
        )}
      </div>
      {months.map((month) => (
        <section key={month.key} aria-labelledby={`archive-month-${month.key}`}>
        <h3 className="archive__month" id={`archive-month-${month.key}`}><time dateTime={month.key}>{month.label}</time></h3>
        <div className="grid">
          {month.entries.map(({ day, title, summary, topic, tags, dayLabel, dateLabel }) => (
            <a key={day.day} className="tile" href={`#/day/${day.day}`}>
              <div className="tile__top">
                <span className="tile__num">{dayLabel}</span>
                <span className="tile__topic">{topic}</span>
              </div>
              <time className="tile__date" dateTime={day.date}>{dateLabel}</time>
              <h4>{title}</h4>
              <p>{summary}</p>
              <div className="tile__tags">{tags.map((tag, index) => <span key={day.tags[index]}>{tag}</span>)}</div>
              <span className="tile__cta">{t(language, "lab.openVisualization", "Open visualization")}</span>
            </a>
          ))}
        </div>
        </section>
      ))}
      {visible.length < found.length && (
        <button type="button" className="study-button archive__more" onClick={() => {
          const nextLimit = limit + PAGE_SIZE;
          setLimit(nextLimit);
          const url = new URL(location.href);
          url.searchParams.set("limit", nextLimit);
          replaceUrl(url);
          requestAnimationFrame(() => document.querySelectorAll(".archive .tile")[limit]?.focus());
        }}>{copy.more}</button>
      )}
    </section>
  );
}
