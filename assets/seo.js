// Keeps the canonical URL, og:url and og:locale in step with the language shown, so that each
// ?lang=xx page points at itself and matches the hreflang alternates written in the HTML head.
export function syncLanguageMeta(language, locale) {
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) return;
  const url = new URL(canonical.href);
  url.search = "";
  if (language !== "en") url.searchParams.set("lang", language);
  canonical.href = url.href;
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = url.href;
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.content = locale.replace("-", "_");
}
