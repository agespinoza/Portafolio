function toIsoDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getContributionCalendar(entries, through = new Date()) {
  const today = new Date(through.getFullYear(), through.getMonth(), through.getDate());
  const todayIso = toIsoDate(today);
  const published = new Map(
    entries
      .filter((entry) => entry.date <= todayIso)
      .map((entry) => [entry.date, entry]),
  );
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= today) {
    const week = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = new Date(cursor);
      const iso = toIsoDate(date);
      const entry = published.get(iso) || null;
      if (entry) count += 1;
      week.push({ date, iso, entry });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return { weeks, count };
}
