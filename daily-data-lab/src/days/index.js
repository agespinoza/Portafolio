import BorderDay from "./day-001-border/BorderDay.jsx";
import GlowwormDay from "./day-002-glowworms/GlowwormDay.jsx";
import LightPillarsDay from "./day-003-light-pillars/LightPillarsDay.tsx";
import AbrahamLakeDay from "./day-004-abraham-lake/AbrahamLakeDay.tsx";
import { DAILY_DATA_LAB_DAYS } from "../../../assets/daily-data-lab-days.js";

const COMPONENTS = {
  "border-wait-times": BorderDay,
  "waitomo-glowworms": GlowwormDay,
  "light-pillars": LightPillarsDay,
  "abraham-lake": AbrahamLakeDay,
};

export const DAYS = DAILY_DATA_LAB_DAYS.map((day) => ({
  ...day,
  component: COMPONENTS[day.slug],
}));
