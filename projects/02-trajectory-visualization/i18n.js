// Language for the console. Follows the portfolio convention (?lang=xx, English by default):
// shared site strings from assets/i18n.js win, then this page's messages.js, then the English
// fallback written next to each call.
import { LANGUAGES, LANGUAGE_NAMES, getLanguage, languageFromSearch, localeFor, t } from '../../assets/i18n.js?v=20261122b';
import { MESSAGES } from './messages.js?v=20261122b';

export { LANGUAGES, LANGUAGE_NAMES, localeFor };
export const language = getLanguage(languageFromSearch(window.location.search));
export const locale = localeFor(language);

/** Console string: tr('kpi.tracked', 'Spacecraft tracked', { n: 3 }). */
export const tr = (key, fallback, values) =>
    t(language, `console.${key}`, MESSAGES[language]?.[key] ?? fallback, values);

/** Shared portfolio string, such as the navigation labels. */
export const site = (key, fallback) => t(language, key, fallback);

/** Adds ?lang= to a portfolio URL so the reader stays in the chosen language. */
export function withLang(href) {
    const [path, hash] = href.split('#');
    const query = language === 'en' ? '' : `?lang=${language}`;
    return `${path}${query}${hash ? `#${hash}` : ''}`;
}

// ---------- Numbers, dates and durations ----------

export const num = (value, digits = 0) => Number.isFinite(value)
    ? value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
export const signed = (value, digits) => (value >= 0 ? '+' : '−') + num(Math.abs(value), digits);

const format = options => {
    const formatter = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', hourCycle: 'h23', ...options });
    return date => formatter.format(date);
};
const pad = n => String(n).padStart(2, '0');
/** ISO-like timestamp, the same in every language (mission-operations convention). */
export const utcFull = date => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
export const utcTime = date => `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
export const utcHm = date => `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
const dayMonth = format({ month: 'short', day: 'numeric' });
export const utcShort = date => `${dayMonth(date)} ${utcHm(date)}`;
export const utcDay = date => dayMonth(date);
export const tickFormat = date => (date.getUTCHours() === 0 && date.getUTCMinutes() === 0 ? utcDay(date) : utcHm(date));

export function duration(ms) {
    const minutes = Math.round(Math.abs(ms) / 60_000);
    const d = Math.floor(minutes / 1440), h = Math.floor((minutes % 1440) / 60), m = minutes % 60;
    if (d) return tr('dur.dh', '{d} d {h} h', { d, h });
    if (h) return tr('dur.hm', '{h} h {m} m', { h, m: pad(m) });
    return tr('dur.m', '{m} min', { m });
}

/** Translates every element marked with data-i18n (text) or data-i18n-aria (aria-label). */
export function translatePage() {
    document.documentElement.lang = locale;
    document.title = tr('page.title', document.title);
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = tr('page.description', description.content);
    for (const node of document.querySelectorAll('[data-i18n]')) {
        const key = node.dataset.i18n;
        node.textContent = key.startsWith('site:') ? site(key.slice(5), node.textContent.trim()) : tr(key, node.textContent.trim());
    }
    for (const node of document.querySelectorAll('[data-i18n-aria]')) {
        const key = node.dataset.i18nAria;
        const current = node.getAttribute('aria-label') || '';
        node.setAttribute('aria-label', key.startsWith('site:') ? site(key.slice(5), current) : tr(key, current));
    }
    for (const node of document.querySelectorAll('[data-portfolio-link]')) node.href = withLang(node.getAttribute('href'));
}
