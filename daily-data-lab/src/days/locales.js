import { localeFor } from "../../../assets/i18n.js";

export function weekdayNames(language) {
  const monday = Date.UTC(2024, 0, 1);
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(localeFor(language), { weekday: "long", timeZone: "UTC" })
      .format(new Date(monday + index * 24 * 60 * 60 * 1000)),
  );
}

export function monthNames(language) {
  return Array.from({ length: 12 }, (_, index) =>
    new Intl.DateTimeFormat(localeFor(language), { month: "long", timeZone: "UTC" })
      .format(new Date(Date.UTC(2024, index, 1))),
  );
}

export function hourLabel(language, hour) {
  return new Intl.DateTimeFormat(localeFor(language), {
    hour: "numeric",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, 1, hour)));
}

export function formatDate(language, iso, options) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return date.toLocaleDateString(localeFor(language), options);
}
