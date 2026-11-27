import BorderDay from "./day-001-border/BorderDay.jsx";
import GlowwormDay from "./day-002-glowworms/GlowwormDay.jsx";
import LightPillarsDay from "./day-003-light-pillars/LightPillarsDay.tsx";
import AbrahamLakeDay from "./day-004-abraham-lake/AbrahamLakeDay.tsx";
import EndangeredLanguagesDay from "./day-005-endangered-languages/EndangeredLanguagesDay.tsx";
import FoodWasteDay from "./day-006-food-waste/FoodWasteDay.tsx";
import SpaceDebrisDay from "./day-007-space-debris/SpaceDebrisDay.tsx";
import SeedBanksDay from "./day-008-seed-banks/SeedBanksDay.tsx";
import LongevityDay from "./day-009-longevity/LongevityDay.tsx";
import DarkSkiesDay from "./day-010-dark-skies/DarkSkiesDay.tsx";
import { DAILY_DATA_LAB_DAYS } from "../../../assets/daily-data-lab-days.js";

const COMPONENTS = {
  "border-wait-times": BorderDay,
  "waitomo-glowworms": GlowwormDay,
  "light-pillars": LightPillarsDay,
  "abraham-lake": AbrahamLakeDay,
  "endangered-languages": EndangeredLanguagesDay,
  "food-waste": FoodWasteDay,
  "space-debris": SpaceDebrisDay,
  "seed-banks": SeedBanksDay,
  longevity: LongevityDay,
  "dark-skies": DarkSkiesDay,
};

export const DAYS = DAILY_DATA_LAB_DAYS.map((day) => ({
  ...day,
  component: COMPONENTS[day.slug],
}));
