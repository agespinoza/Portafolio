import BorderDay from "./day-001-border/BorderDay.jsx";

// Add one entry per day. Newest first is handled by the gallery.
export const DAYS = [
  {
    day: 1,
    slug: "border-wait-times",
    date: "2026-11-18",
    title: "When is the best time to cross from Mexicali?",
    summary:
      "Live and historical wait times at the Calexico ports of entry, with the best and worst hours to cross by day of the week.",
    topic: "Mobility",
    tags: ["React", "SVG", "Live API", "CBP data"],
    source: "U.S. Customs and Border Protection",
    component: BorderDay,
  },
];
