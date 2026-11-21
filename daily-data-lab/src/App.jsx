import { useEffect, useState } from "react";
import { LANGUAGES, dayText, getLanguage, languageFromSearch, localeFor, t } from "../../assets/i18n.js";
import { DAYS } from "./days/index.js";
import ContributionCalendar from "./ContributionCalendar.jsx";
import { LAB_INSIGHT, insightText } from "../../assets/daily-data-lab-insights.js";
import { LanguageContext } from "./language.jsx";
import { effectiveTheme, toggleTheme } from "../../assets/theme.js";

const LANGUAGE_NAMES = {
  en: "English",
  es: "Español",
  ja: "日本語",
  it: "Italiano",
  fr: "Français",
};

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

const pad = (n) => String(n).padStart(3, "0");
const fmt = (iso, language) =>
  new Date(iso + "T12:00:00").toLocaleDateString(localeFor(language), { month: "short", day: "numeric", year: "numeric" });

export default function App() {
  const language = getLanguage(languageFromSearch(window.location.search));
  const hash = useHashRoute();
  const match = hash.match(/^#\/day\/(\d+)/);
  const current = match ? DAYS.find((d) => d.day === Number(match[1])) : null;

  useEffect(() => {
    document.documentElement.lang = localeFor(language);
    const title = current
      ? `${t(language, "lab.day", "Day {number}", { number: pad(current.day) })} · ${dayText(language, current.slug, "title", current.title)} | Daily Data Lab`
      : `${t(language, "lab.brand", "Daily Data Lab")} | Alicia Espinoza`;
    document.title = title;
  }, [current, language]);

  function changeLanguage(event) {
    const url = new URL(window.location.href);
    if (event.target.value === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", event.target.value);
    window.location.assign(url.href);
  }

  const portfolioLink = language === "en" ? "../index.html#lab" : `../index.html?lang=${language}#lab`;

  return (
    <LanguageContext.Provider value={language}>
      <header className="topbar">
        <div className="wrap topbar__inner">
          <a className="brand" href="#/" aria-label={t(language, "lab.brand", "Daily Data Lab")}>
            <span className="brand__mark" aria-hidden="true">AE</span>
            <span>{t(language, "lab.brand", "Daily Data Lab")}</span>
          </a>
          <nav className="topbar__actions" aria-label={t(language, "nav.primary", "Primary navigation")}>
            <label className="sr" htmlFor="language-select">{t(language, "nav.language", "Language")}</label>
            <select id="language-select" className="language-select" value={language} onChange={changeLanguage}>
              {LANGUAGES.map((code) => <option key={code} value={code}>{LANGUAGE_NAMES[code]}</option>)}
            </select>
            <ThemeToggle language={language} />
            <a className="topbar__link" href={portfolioLink}>{t(language, "lab.backToPortfolio", "← Portfolio")}</a>
          </nav>
        </div>
      </header>
      <main>
        {current ? <DayPage day={current} language={language} /> : <Gallery language={language} />}
      </main>
      <footer className="foot">
        <div className="wrap foot__inner">
          <span>© {new Date().getFullYear()} Alicia Espinoza</span>
          <span>{t(language, "lab.footer", "One visualization a day · Built with React")}</span>
        </div>
      </footer>
    </LanguageContext.Provider>
  );
}

function Gallery({ language }) {
  const days = [...DAYS].sort((a, b) => b.day - a.day);
  return (
    <section className="wrap gallery">
      <p className="kicker"><span>Lab</span> {t(language, "lab.kicker", "Learning in public")}</p>
      <h1>Daily Data <em>Lab</em></h1>
      <p className="lead">{t(language, "lab.lead", "One small, interactive data visualization a day, each one on a different everyday topic, built with React and public data.")}</p>
      <div className="counter">
        <div><strong>{DAYS.length}</strong><span>{t(language, "lab.daysPublished", "days published")}</span></div>
        <div><strong>{new Set(DAYS.map((d) => d.topic)).size}</strong><span>{t(language, "lab.topics", "topics")}</span></div>
        <div><strong>{fmt(DAYS.reduce((earliest, d) => d.date < earliest.date ? d : earliest, DAYS[0]).date, language)}</strong><span>{t(language, "lab.started", "started")}</span></div>
      </div>
      <ContributionCalendar language={language} />
      <div className="grid">
        {days.map((day) => (
          <a key={day.day} className="tile" href={`#/day/${day.day}`}>
            <div className="tile__top">
              <span className="tile__num">{t(language, "lab.day", "Day {number}", { number: pad(day.day) })}</span>
              <span className="tile__topic">{dayText(language, day.slug, "topic", day.topic)}</span>
            </div>
            <h2>{dayText(language, day.slug, "title", day.title)}</h2>
            <p>{dayText(language, day.slug, "summary", day.summary)}</p>
            <div className="tile__tags">{day.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <span className="tile__cta">{t(language, "lab.openVisualization", "Open visualization")} →</span>
          </a>
        ))}
      </div>
      <CrossDayInsight language={language} />
    </section>
  );
}

function DayPage({ day, language }) {
  const Component = day.component;
  const prev = DAYS.find((d) => d.day === day.day - 1);
  const next = DAYS.find((d) => d.day === day.day + 1);
  return (
    <article className="wrap day">
      <a className="back" href="#/">{t(language, "lab.allDays", "← All days")}</a>
      <p className="kicker">
        <span>{t(language, "lab.day", "Day {number}", { number: pad(day.day) })}</span>
        {" "}{fmt(day.date, language)} · {dayText(language, day.slug, "topic", day.topic)}
      </p>
      <h1>{dayText(language, day.slug, "title", day.title)}</h1>
      <p className="lead">{dayText(language, day.slug, "summary", day.summary)}</p>
      <Component />
      <nav className="pager" aria-label={t(language, "lab.otherDays", "Other days")}>
        {prev
          ? <a href={`#/day/${prev.day}`}>{t(language, "lab.previousDay", "← Day {number}", { number: pad(prev.day) })}</a>
          : <span />}
        {next
          ? <a href={`#/day/${next.day}`}>{t(language, "lab.nextDay", "Day {number} →", { number: pad(next.day) })}</a>
          : <span className="muted">{t(language, "lab.nextComing", "Next day coming soon")}</span>}
      </nav>
    </article>
  );
}

/** Light/dark switch shared with the portfolio; the icon shows the theme you would switch to. */
function ThemeToggle({ language }) {
  const [theme, setThemeState] = useState(() => effectiveTheme());
  const dark = theme === "dark";
  const label = dark ? t(language, "nav.themeToLight", "Switch to light theme") : t(language, "nav.themeToDark", "Switch to dark theme");
  return (
    <button type="button" className="theme-toggle" aria-label={label} title={label} onClick={() => setThemeState(toggleTheme())}>
      <span aria-hidden="true">{dark ? "☀" : "☾"}</span>
    </button>
  );
}

/** How the newest day connects with the earlier ones (assets/daily-data-lab-insights.js). */
function CrossDayInsight({ language }) {
  const T = (key, values) => insightText(language, key, values);
  const threads = [
    { id: "cold", tags: ["data"] },
    { id: "seasons", tags: ["data", "hyp"] },
    { id: "observers", tags: ["data"] },
  ];
  return (
    <section className="insight" aria-labelledby="insight-title">
      <p className="mono insight__eyebrow">{T("eyebrow", { day: pad(LAB_INSIGHT.throughDay) })}</p>
      <h2 id="insight-title">{T("title")}</h2>
      <p className="insight__lead">{T("conclusion")}</p>
      <div className="insight__threads">
        {threads.map((th) => (
          <article key={th.id} className="insight__thread">
            <div className="insight__tags">
              {th.tags.map((tag) => <span key={tag} className={`lp-tag lp-tag--${tag}`}>{T(tag === "data" ? "dataTag" : "hypTag")}</span>)}
            </div>
            <h3>{T(`${th.id}Title`)}</h3>
            <p>{T(th.id)}</p>
            <div className="insight__days">
              {LAB_INSIGHT.days[th.id].map((n) => <a key={n} href={`#/day/${n}`}>{T("day", { n: pad(n) })}</a>)}
            </div>
          </article>
        ))}
      </div>
      <p className="insight__caveat">{T("caveat")}</p>
    </section>
  );
}
