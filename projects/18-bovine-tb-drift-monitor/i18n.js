// Language for the Bovine TB Surveillance Monitor. Follows the portfolio convention (?lang=xx, English by default):
// shared site strings from assets/i18n.js win, then this page's messages.js, then the English
// fallback written next to each call.
import { LANGUAGES, LANGUAGE_NAMES, getLanguage, languageFromSearch, localeFor, t } from '../../assets/i18n.js?v=20261122b';
import { MESSAGES } from './messages.js?v=20261122c';

export { LANGUAGES, LANGUAGE_NAMES, localeFor };
export const language = getLanguage(languageFromSearch(window.location.search));
export const locale = localeFor(language);

/** Console string: tr('kpi.share', 'Infected herds', { n: 3 }). */
export const tr = (key, fallback, values) =>
    t(language, `btb.${key}`, MESSAGES[language]?.[key] ?? fallback, values);

/** Shared portfolio string, such as the navigation labels. */
export const site = (key, fallback) => t(language, key, fallback);

/** Adds ?lang= to a portfolio URL so the reader stays in the chosen language. */
export function withLang(href) {
    const [path, hash] = href.split('#');
    const query = language === 'en' ? '' : `?lang=${language}`;
    return `${path}${query}${hash ? `#${hash}` : ''}`;
}

export const num = (value, digits = 0) => Number.isFinite(value)
    ? value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
export const pct = (value, digits = 1) => Number.isFinite(value)
    ? value.toLocaleString(locale, { style: 'percent', minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
export const date = iso => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));

/** Translates every element marked with data-i18n (text) or data-i18n-aria (aria-label). */
export function translatePage() {
    document.documentElement.lang = locale;
    document.title = tr('page.title', document.title);
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = tr('page.description', description.content);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && language !== 'en') canonical.href = `${canonical.href.split('?')[0]}?lang=${language}`;
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
