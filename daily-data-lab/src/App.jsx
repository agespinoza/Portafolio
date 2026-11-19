import { useEffect, useState } from "react";
import { DAYS } from "./days/index.js";

const PORTFOLIO = "../index.html#lab";

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
const fmt = (iso) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function App() {
  const hash = useHashRoute();
  const match = hash.match(/^#\/day\/(\d+)/);
  const current = match ? DAYS.find((d) => d.day === Number(match[1])) : null;

  useEffect(() => {
    document.title = current
      ? `Day ${pad(current.day)} · ${current.title} | Daily Data Lab`
      : "Daily Data Lab | Alicia Espinoza";
  }, [current]);

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar__inner">
          <a className="brand" href="#/">
            <span className="brand__mark" aria-hidden="true">AE</span>
            <span>Daily Data Lab</span>
          </a>
          <a className="topbar__link" href={PORTFOLIO}>← Portfolio</a>
        </div>
      </header>
      <main>{current ? <DayPage day={current} /> : <Gallery />}</main>
      <footer className="foot">
        <div className="wrap foot__inner">
          <span>© {new Date().getFullYear()} Alicia Espinoza</span>
          <span>One visualization a day · Built with React</span>
        </div>
      </footer>
    </>
  );
}

function Gallery() {
  const days = [...DAYS].sort((a, b) => b.day - a.day);
  return (
    <section className="wrap gallery">
      <p className="kicker"><span>Lab</span> Learning in public</p>
      <h1>
        Daily Data <em>Lab</em>
      </h1>
      <p className="lead">
        One small, interactive data visualization a day, each one on a different everyday topic, built with React and
        public data.
      </p>
      <div className="counter">
        <div><strong>{DAYS.length}</strong><span>days published</span></div>
        <div><strong>{new Set(DAYS.map((d) => d.topic)).size}</strong><span>topics</span></div>
        <div><strong>{fmt(DAYS[0].date)}</strong><span>started</span></div>
      </div>
      <div className="grid">
        {days.map((d) => (
          <a key={d.day} className="tile" href={`#/day/${d.day}`}>
            <div className="tile__top">
              <span className="tile__num">Day {pad(d.day)}</span>
              <span className="tile__topic">{d.topic}</span>
            </div>
            <h2>{d.title}</h2>
            <p>{d.summary}</p>
            <div className="tile__tags">{d.tags.map((t) => <span key={t}>{t}</span>)}</div>
            <span className="tile__cta">Open visualization →</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function DayPage({ day }) {
  const Component = day.component;
  const prev = DAYS.find((d) => d.day === day.day - 1);
  const next = DAYS.find((d) => d.day === day.day + 1);
  return (
    <article className="wrap day">
      <a className="back" href="#/">← All days</a>
      <p className="kicker"><span>Day {pad(day.day)}</span> {fmt(day.date)} · {day.topic}</p>
      <h1>{day.title}</h1>
      <p className="lead">{day.summary}</p>
      <Component />
      <nav className="pager" aria-label="Other days">
        {prev ? <a href={`#/day/${prev.day}`}>← Day {pad(prev.day)}</a> : <span />}
        {next ? <a href={`#/day/${next.day}`}>Day {pad(next.day)} →</a> : <span className="muted">Next day coming soon</span>}
      </nav>
    </article>
  );
}
