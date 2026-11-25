import { useState } from "react";
import { dayText, t } from "../../assets/i18n.js";
import { studyUrl } from "../share-url.js";
import { archiveCopy } from "./archive-copy.js";

const iconPaths = {
  archive: "M4 7h16v13H4z M3 3h18v4H3z M10 11h4",
  prev: "m12 6-6 6 6 6 M6 12h13",
  next: "m12 6 6 6-6 6 M5 12h13",
  share: "M12 15V3m-4 4 4-4 4 4 M7 10H5v10h14V10h-2",
  link: "m10 13 4-4 M8 15l-1 1a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4 0 M16 9l1-1a3 3 0 0 1 4 4l-4 4a3 3 0 0 1-4 0",
  article: "M7 3h7l4 4v14H7z M14 3v4h4 M10 11h5 M10 15h5 M10 19h3",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
};

export function StudyIcon({ name }) {
  return (
    <svg className="study-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function StudyNavigation({ previous, next, language }) {
  const copy = archiveCopy(language);
  return (
    <nav className="study-nav" aria-label={t(language, "lab.otherDays", "Other days")}>
      <a className="study-nav__archive icon-link" href="#/archive" aria-label={copy.archiveLink} title={copy.archiveLink}><StudyIcon name="archive" /></a>
      {[["prev", previous, copy.previous], ["next", next, copy.next]].map(([direction, entry, label]) => {
        if (!entry) return null;
        const title = dayText(language, entry.slug, "title", entry.title);
        return (
          <a key={direction} rel={direction} href={`#/day/${entry.day}`}
            title={title} aria-label={`${label} · ${title}`}>
            {direction === "prev" && <StudyIcon name="prev" />}{label}{direction === "next" && <StudyIcon name="next" />}
          </a>
        );
      })}
    </nav>
  );
}

export function ShareStudy({ day, title, language, extra = null }) {
  const copy = archiveCopy(language);
  const [feedback, setFeedback] = useState("");
  const url = studyUrl(day.slug, language);
  const payload = { title, url };
  const nativeShare = typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(payload));

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("copied");
    } catch {
      setFeedback("manual");
    }
  }

  async function share() {
    try {
      await navigator.share(payload);
    } catch (error) {
      if (error.name !== "AbortError") await copyLink();
    }
  }

  return (
    <div className="study-share">
      {nativeShare && <button className="study-button" type="button" onClick={share}><StudyIcon name="share" />{copy.share}</button>}
      <button className="study-button" type="button" onClick={copyLink}><StudyIcon name="link" />{copy.copy}</button>
      {extra}
      {feedback === "manual" && (
        <input className="study-share__url" aria-label={copy.manual} value={url} readOnly
          onFocus={(event) => event.target.select()} />
      )}
      <p className={feedback ? "study-share__status" : "sr"} role="status">
        {feedback === "manual" ? copy.manual : feedback === "copied" ? copy.copied : ""}
      </p>
    </div>
  );
}
