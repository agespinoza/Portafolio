import { getLanguage, t } from "../../../assets/i18n.js";

/**
 * Translator for one day's strings. Shared site translations (assets/i18n.js) win, then the day's own
 * message file, then the English fallback written next to the call.
 */
export function makeTr(namespace, messages) {
  return (language, key, fallback, values) =>
    t(language, `${namespace}.${key}`, messages[getLanguage(language)]?.[key] ?? fallback, values);
}
