import { existsSync } from "node:fs";
import { DAILY_DATA_LAB_DAYS } from "../assets/daily-data-lab-days.js";
import { studyUrl } from "./share-url.js";

const escape = (text) => String(text).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

// Atom feed so readers can follow new days without visiting the site.
function atomFeed(days) {
  const newestFirst = [...days].sort((a, b) => b.day - a.day);
  const labUrl = new URL("../", studyUrl(newestFirst[0].slug)).href;
  const stamp = (day) => `${day.date}T00:00:00Z`;
  const entries = newestFirst.map((day) => `  <entry>
    <title>${escape(`Day ${String(day.day).padStart(3, "0")}: ${day.title}`)}</title>
    <link href="${studyUrl(day.slug)}"/>
    <id>${studyUrl(day.slug)}</id>
    <published>${stamp(day)}</published>
    <updated>${stamp(day)}</updated>
    <category term="${escape(day.topic)}"/>
    <summary>${escape(day.summary)}</summary>
  </entry>`).join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Daily Data Lab</title>
  <subtitle>One small interactive data visualization a day, built with React and public data.</subtitle>
  <link href="${labUrl}"/>
  <link rel="self" type="application/atom+xml" href="${labUrl}feed.xml"/>
  <id>${labUrl}</id>
  <updated>${stamp(newestFirst[0])}</updated>
  <author><name>Alicia Espinoza</name></author>
${entries}
</feed>
`;
}

export const socialPages = {
  name: "lab-social-pages",
  apply: "build",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "feed.xml", source: atomFeed(DAILY_DATA_LAB_DAYS) });
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
