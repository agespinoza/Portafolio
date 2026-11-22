import { useEffect, useState } from "react";
import { LANGUAGES, LANGUAGE_NAMES, dayText, getLanguage, languageFromSearch, localeFor, t } from "../../assets/i18n.js";
import { DAYS } from "./days/index.js";
import StudyArchive from "./StudyArchive.jsx";
import { ShareStudy, StudyNavigation } from "./StudyActions.jsx";
import ContributionCalendar from "./ContributionCalendar.jsx";
import { LAB_INSIGHT, insightText } from "../../assets/daily-data-lab-insights.js";
import { LanguageContext } from "./language.jsx";
import { effectiveTheme, toggleTheme } from "../../assets/theme.js";

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    let frame;
    const moveFocus = (hash) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const heading = document.querySelector(hash === "#/archive" ? "#archive-title" : "main h1");
        if (hash === "#/archive") heading?.scrollIntoView({ block: "start" });
        else window.scrollTo(0, 0);
        heading?.focus({ preventScroll: true });
      });
    };
    const onChange = () => {
      setHash(window.location.hash);
      moveFocus(window.location.hash);
    };
    if (window.location.hash === "#/archive") moveFocus(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onChange);
    };
  }, []);
  return hash;
}

const chronological = [...DAYS].sort((a, b) => a.day - b.day);
const pad = (n) => String(n).padStart(3, "0");
const fmt = (iso, language) =>
  new Date(iso + "T12:00:00").toLocaleDateString(localeFor(language), { month: "short", day: "numeric", year: "numeric" });

export default function App() {
  const language = getLanguage(languageFromSearch(window.location.search));
  const hash = useHashRoute();
  const match = hash.match(/^#\/day\/(\d+)$/);
  const current = match ? DAYS.find((d) => d.day === Number(match[1])) : null;

  useEffect(() => {
    document.documentElement.lang = localeFor(language);
    const title = current
      ? `${t(language, "lab.day", "Day {number}", { number: pad(current.day) })} · ${dayText(language, current.slug, "title", current.title)} | Daily Data Lab`
      : `${t(language, "lab.brand", "Daily Data Lab")} | Alicia Espinoza`;
    document.title = title;
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = current
        ? dayText(language, current.slug, "summary", current.summary)
        : t(language, "lab.lead", "One interactive visualization a day, built with React and public data.");
    }
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
      <a className="skip" href="#main" onClick={(event) => {
        event.preventDefault();
        document.getElementById("main")?.focus();
      }}>{t(language, "site.skip", "Skip to content")}</a>
      <header className="topbar">
        <div className="wrap topbar__inner">
          <a className="brand" href="#/" aria-label={t(language, "lab.brand", "Daily Data Lab")}>
            <span className="brand__mark" aria-hidden="true">AE</span>
            <span>{t(language, "lab.brand", "Daily Data Lab")}</span>
          </a>
          <nav className="topbar__actions" aria-label={t(language, "nav.primary", "Primary navigation")}>
            <label className="sr" htmlFor="language-select">{t(language, "nav.language", "Language")}</label>
            <select id="language-select" className="language-select" value={language} onChange={changeLanguage}>
              {LANGUAGES.map((code) => <option key={code} value={code} lang={localeFor(code)}>{LANGUAGE_NAMES[code]}</option>)}
            </select>
            <ThemeToggle language={language} nightDefault={current?.slug === "light-pillars"} />
            <a className="topbar__link" href={portfolioLink}>{t(language, "lab.backToPortfolio", "← Portfolio")}</a>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {current ? <DayPage key={current.day} day={current} language={language} /> : <Gallery language={language} />}
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
  return (
    <section className="wrap gallery">
      <p className="kicker"><span>Lab</span> {t(language, "lab.kicker", "Learning in public")}</p>
      <h1 tabIndex={-1}>Daily Data <em>Lab</em></h1>
      <p className="lead">{t(language, "lab.lead", "One small, interactive data visualization a day, each one on a different everyday topic, built with React and public data.")}</p>
      <div className="counter">
        <div><strong>{DAYS.length}</strong><span>{t(language, "lab.daysPublished", "days published")}</span></div>
        <div><strong>{new Set(DAYS.map((d) => d.topic)).size}</strong><span>{t(language, "lab.topics", "topics")}</span></div>
        <div><strong>{fmt(DAYS.reduce((earliest, d) => d.date < earliest.date ? d : earliest, DAYS[0]).date, language)}</strong><span>{t(language, "lab.started", "started")}</span></div>
      </div>
      <StudyArchive language={language} />
      <ContributionCalendar language={language} />
      <CrossDayInsight language={language} />
    </section>
  );
}

function DayPage({ day, language }) {
  const Component = day.component;
  const index = chronological.indexOf(day);
  const title = dayText(language, day.slug, "title", day.title);
  const navigation = <StudyNavigation previous={chronological[index - 1]} next={chronological[index + 1]} language={language} />;
  return (
    <article className="wrap day">
      {navigation}
      <p className="kicker">
        <span>{t(language, "lab.day", "Day {number}", { number: pad(day.day) })}</span>
        {" "}{fmt(day.date, language)} · {dayText(language, day.slug, "topic", day.topic)}
      </p>
      <h1 tabIndex={-1}>{title}</h1>
      <p className="lead">{dayText(language, day.slug, "summary", day.summary)}</p>
      <ShareStudy day={day} title={title} language={language} />
      <Component />
      <div className="study-nav-footer">{navigation}</div>
    </article>
  );
}

/** Light/dark switch shared with the portfolio; the icon shows the theme you would switch to. */
function ThemeToggle({ language, nightDefault }) {
  const [, rerender] = useState(0);
  const dark = effectiveTheme(nightDefault) === "dark";
  const label = dark ? t(language, "nav.themeToLight", "Switch to light theme") : t(language, "nav.themeToDark", "Switch to dark theme");
  return (
    <button type="button" className="theme-toggle" aria-label={label} title={label} onClick={() => { toggleTheme(nightDefault); rerender((n) => n + 1); }}>
      <span aria-hidden="true">{dark ? "☀" : "☾"}</span>
    </button>
  );
}

/** How the newest day connects with the earlier ones (assets/daily-data-lab-insights.js). */
function CrossDayInsight({ language }) {
  const T = (key, values) => insightText(language, key, values);
  const threads = LAB_INSIGHT.threads;
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
