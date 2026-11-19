import BorderDay from "./day-001-border/BorderDay.jsx";
import GlowwormDay from "./day-002-glowworms/GlowwormDay.jsx";
import { DAILY_DATA_LAB_DAYS } from "../../../assets/daily-data-lab-days.js";

const COMPONENTS = {
  "border-wait-times": BorderDay,
  "waitomo-glowworms": GlowwormDay,
};

export const DAYS = DAILY_DATA_LAB_DAYS.map((day) => ({
  ...day,
  component: COMPONENTS[day.slug],
}));
