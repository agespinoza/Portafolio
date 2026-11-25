const LAB_URL = "https://agespinoza.github.io/Portafolio/lab/";

export function studyUrl(slug, language = "en") {
  const url = new URL(`studies/${encodeURIComponent(slug)}.html`, LAB_URL);
  if (language !== "en") url.searchParams.set("lang", language);
  return url.href;
}

// Share page for a day's research article. It carries the logo card as og:image (LinkedIn preview)
// and redirects visitors to #/day/N/article.
export function articleUrl(slug, language = "en") {
  const url = new URL(`studies/${encodeURIComponent(slug)}-article.html`, LAB_URL);
  if (language !== "en") url.searchParams.set("lang", language);
  return url.href;
}

export const linkedInShareUrl = (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
