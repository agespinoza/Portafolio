import { useEffect, useRef } from "react";
import { DAILY_DATA_LAB_DAYS } from "../../assets/daily-data-lab-days.js";
import { getContributionCalendar } from "../../assets/contributions.js";
import { calendarWeekdays, dayText, localeFor, t } from "../../assets/i18n.js";

export default function ContributionCalendar({ language }) {
  const scrollRef = useRef(null);
  const { weeks, count } = getContributionCalendar(DAILY_DATA_LAB_DAYS);
  const weekDays = calendarWeekdays(language);
  const months = [];
  let previousMonth = -1;

  weeks.forEach((week, index) => {
    const firstDate = week[0].date;
    if (firstDate.getMonth() !== previousMonth) {
      months.push({
        index,
        label: firstDate.toLocaleDateString(localeFor(language), { month: "short" }),
      });
      previousMonth = firstDate.getMonth();
    }
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, []);

  return (
    <section className="calendar-card" aria-labelledby="calendar-title">
      <div className="calendar-card__head">
        <h2 id="calendar-title">{t(language, "calendar.title", "Publishing activity")}</h2>
        <span className="mono">
          {t(language, "calendar.description", "{count} days published in the last 12 months", { count })}
        </span>
      </div>
      <div className="contributions-scroll" ref={scrollRef}>
        <div
          className="contributions"
          style={{ "--weeks": weeks.length }}
          role="grid"
          aria-label={t(language, "calendar.aria", "Daily Data Lab publishing calendar")}
        >
          <div className="contributions__layout">
            <div className="contributions__months" aria-hidden="true">
              {months.map(({ index, label }) => (
                <span key={`${index}-${label}`} className="contributions__month" style={{ gridColumn: index + 1 }}>
                  {label}
                </span>
              ))}
            </div>
            <div className="contributions__body">
              <div className="contributions__weekdays" aria-hidden="true">
                {weekDays.map((name) => <span key={name}>{name}</span>)}
              </div>
              <div className="contributions__grid">
                {weeks.flat().map(({ date, iso, entry }) => {
                  const dateLabel = date.toLocaleDateString(localeFor(language), {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                  const title = entry ? dayText(language, entry.slug, "title", entry.title) : "";
                  const label = entry
                    ? `${t(language, "calendar.published", "Published: {title}", { title })} · ${dateLabel}`
                    : `${t(language, "calendar.empty", "No publication")} · ${dateLabel}`;
                  const className = `contributions__day${entry ? " contributions__day--published" : ""}`;
                  return entry ? (
                    <a
                      key={iso}
                      className={className}
                      role="gridcell"
                      href={language === "en" ? `#/day/${entry.day}` : `?lang=${language}#/day/${entry.day}`}
                      aria-label={label}
                      title={label}
                    />
                  ) : (
                    <span key={iso} className={className} role="gridcell" aria-label={label} title={label} />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="contributions-legend" aria-hidden="true">
        <span>{t(language, "calendar.less", "Less")}</span><i /><i />
        <span>{t(language, "calendar.more", "More")}</span>
      </div>
    </section>
  );
}
