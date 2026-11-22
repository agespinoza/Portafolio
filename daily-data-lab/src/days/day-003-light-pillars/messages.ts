// Day 003 translations. English is written next to each call (see text.ts); these files hold the rest.
import { ES } from "./messages.es";
import { FR } from "./messages.fr";
import { IT } from "./messages.it";
import { JA } from "./messages.ja";

import { PT } from "./messages.pt";
import { ZH } from "./messages.zh";

export const MESSAGES: Record<string, Record<string, string>> = { es: ES, fr: FR, it: IT, ja: JA, pt: PT, zh: ZH };
