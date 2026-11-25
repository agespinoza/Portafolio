// Research articles (#/day/N/article), keyed by day slug. Text in every site language; references are each day's
// DOI-checked list, shared with the day page.
import type { ArticleSet } from "./types";
import { D001 } from "./d001";
import { D002 } from "./d002";
import { D003 } from "./d003";
import { D004 } from "./d004";
import { D005 } from "./d005";
import { D006 } from "./d006";
import { D007 } from "./d007";
import { D008 } from "./d008";
import { REFS as R001 } from "../days/day-001-border/Research";
import { REFS as R002 } from "../days/day-002-glowworms/Research";
import { REFS as R003 } from "../days/day-003-light-pillars/LightPillarsDay";
import { REFS as R004 } from "../days/day-004-abraham-lake/Research";
import { REFS as R005 } from "../days/day-005-endangered-languages/Research";
import { REFS as R006 } from "../days/day-006-food-waste/Research";
import { REFS as R007 } from "../days/day-007-space-debris/Research";
import { REFS as R008 } from "../days/day-008-seed-banks/Research";

export const ARTICLES: Record<string, ArticleSet> = {
  "border-wait-times": D001, "waitomo-glowworms": D002, "light-pillars": D003, "abraham-lake": D004,
  "endangered-languages": D005, "food-waste": D006, "space-debris": D007, "seed-banks": D008,
};
export const REFERENCES: Record<string, { text: string; doi?: string; url?: string }[]> = {
  "border-wait-times": R001, "waitomo-glowworms": R002, "light-pillars": R003, "abraham-lake": R004,
  "endangered-languages": R005, "food-waste": R006, "space-debris": R007, "seed-banks": R008,
};
