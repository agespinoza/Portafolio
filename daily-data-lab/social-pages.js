import { existsSync } from "node:fs";
import { DAILY_DATA_LAB_DAYS } from "../assets/daily-data-lab-days.js";
import { articleUrl, studyUrl } from "./share-url.js";

// Logo card (1200 × 630) used when an article is shared on LinkedIn, and as the fallback for studies.
const SHARE_CARD = "assets/img/share-card.png";
const SHARE_CARD_ALT = "Alicia Espinoza logo: the letters ae inside a teal orbit, with the text Daily Data Lab, Research.";

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

// A tiny static page with Open Graph tags (read by LinkedIn, which ignores hash routes) that redirects
// visitors to the interactive page, keeping ?lang=.
function sharePage({ canonical, title, summary, image, imageAlt, destination, link, published }) {
  const imageUrl = new URL(`../../${image}`, canonical).href;
  const isCard = image === SHARE_CARD;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)} | Daily Data Lab</title>
  <meta name="description" content="${escape(summary)}">
  <meta name="author" content="Alicia Espinoza">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/svg+xml" href="../../assets/img/logo.svg">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Daily Data Lab · Alicia Espinoza">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(summary)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:type" content="image/png">${isCard ? `
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">` : ""}
  <meta property="og:image:alt" content="${escape(imageAlt)}">${published ? `
  <meta property="article:published_time" content="${published}">
  <meta property="article:author" content="Alicia Espinoza">` : ""}
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <main>
    <h1>${escape(title)}</h1>
    <p>${escape(summary)}</p>
    <a href="${destination}">${link}</a>
  </main>
  <script>
    const target = new URL(${JSON.stringify(destination)}, location.href);
    target.search = location.search;
    location.replace(target.href);
  </script>
</body>
</html>
`;
}

export const socialPages = {
  name: "lab-social-pages",
  apply: "build",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "feed.xml", source: atomFeed(DAILY_DATA_LAB_DAYS) });
    for (const day of DAILY_DATA_LAB_DAYS) {
      const socialImage = day.preview?.replace(/\.svg$/, "-social.png");
      const hasPreview = socialImage && existsSync(new URL(`../${socialImage}`, import.meta.url));
      this.emitFile({ type: "asset", fileName: `studies/${day.slug}.html`, source: sharePage({
        canonical: studyUrl(day.slug), title: day.title, summary: day.summary,
        image: hasPreview ? socialImage : SHARE_CARD, imageAlt: hasPreview ? day.previewAlt : SHARE_CARD_ALT,
        destination: `../index.html#/day/${day.day}`, link: "Open the interactive study in Daily Data Lab",
      }) });

      const article = `./src/articles/d${String(day.day).padStart(3, "0")}.ts`;
      if (!existsSync(new URL(article, import.meta.url))) continue;
      this.emitFile({ type: "asset", fileName: `studies/${day.slug}-article.html`, source: sharePage({
        canonical: articleUrl(day.slug), title: `${day.title} | Research article`, summary: day.summary,
        image: SHARE_CARD, imageAlt: SHARE_CARD_ALT, published: day.date,
        destination: `../index.html#/day/${day.day}/article`, link: "Read the research article in Daily Data Lab",
      }) });
    }
  },
};
