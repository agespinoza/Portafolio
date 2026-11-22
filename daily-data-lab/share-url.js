const LAB_URL = "https://agespinoza.github.io/Portafolio/lab/";

export function studyUrl(slug, language = "en") {
  const url = new URL(`studies/${encodeURIComponent(slug)}.html`, LAB_URL);
  if (language !== "en") url.searchParams.set("lang", language);
  return url.href;
}
