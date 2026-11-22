import { useState } from "react";
import { dayText, t } from "../../assets/i18n.js";
import { studyUrl } from "../share-url.js";
import { archiveCopy } from "./archive-copy.js";

export function StudyNavigation({ previous, next, language }) {
  const copy = archiveCopy(language);
  return (
    <nav className="study-nav" aria-label={t(language, "lab.otherDays", "Other days")}>
      <a href="#/archive">{copy.archive}</a>
      {[["prev", previous, copy.previous], ["next", next, copy.next]].map(([direction, entry, label]) => {
        if (!entry) return null;
        const title = dayText(language, entry.slug, "title", entry.title);
        return (
          <a key={direction} rel={direction} href={`#/day/${entry.day}`}
            title={title} aria-label={`${label} · ${title}`}>
            {label}
          </a>
        );
      })}
    </nav>
  );
}

export function ShareStudy({ day, title, language }) {
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
      {nativeShare && <button className="study-button" type="button" onClick={share}>{copy.share}</button>}
      <button className="study-button" type="button" onClick={copyLink}>{copy.copy}</button>
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
