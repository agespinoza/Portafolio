import { existsSync } from "node:fs";
import { DAILY_DATA_LAB_DAYS } from "../assets/daily-data-lab-days.js";
import { studyUrl } from "./share-url.js";

const escape = (text) => String(text).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

export const socialPages = {
  name: "lab-social-pages",
  apply: "build",
  generateBundle() {
    for (const day of DAILY_DATA_LAB_DAYS) {
      const canonical = studyUrl(day.slug);
      const socialImage = day.preview?.replace(/\.svg$/, "-social.png");
      const hasPreview = socialImage && existsSync(new URL(`../${socialImage}`, import.meta.url));
      const image = new URL(`../../${hasPreview ? socialImage : "assets/img/alicia-espinoza.jpg"}`, canonical);
      const title = escape(day.title);
      const summary = escape(day.summary);
      const destination = `../index.html#/day/${day.day}`;

      this.emitFile({
        type: "asset",
        fileName: `studies/${day.slug}.html`,
        source: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | Daily Data Lab</title>
  <meta name="description" content="${summary}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Daily Data Lab">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${summary}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image.href}">
  <meta property="og:image:alt" content="${escape(hasPreview ? day.previewAlt : "Alicia Espinoza")}">
  <meta name="twitter:card" content="${hasPreview ? "summary_large_image" : "summary"}">
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>${summary}</p>
    <a href="${destination}">Open the interactive study in Daily Data Lab</a>
  </main>
  <script>
    const study = new URL(${JSON.stringify(destination)}, location.href);
    study.search = location.search;
    location.replace(study.href);
  </script>
</body>
</html>
`,
      });
    }
  },
};
