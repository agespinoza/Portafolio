import BorderDay from "./day-001-border/BorderDay.jsx";
import GlowwormDay from "./day-002-glowworms/GlowwormDay.jsx";

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
  {
    day: 2,
    slug: "waitomo-glowworms",
    date: "2026-11-19",
    title: "Where do New Zealand's glowworms shine?",
    summary:
      "Every public record of the Waitomo glowworm on a night-sky map of New Zealand, set against the weather outside the caves where the larvae light up the ceilings.",
    topic: "Nature",
    tags: ["React", "SVG map", "GBIF", "Open-Meteo"],
    source: "GBIF.org and Open-Meteo",
    component: GlowwormDay,
  },
];
