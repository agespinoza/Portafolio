// Résumé page: renders assets/resume-data.js in the visitor's language (?lang=xx, English by default)
// and shares the portfolio's navigation, language selector and print-to-PDF.
import { languageFromSearch, localeFor, t, projectText } from "./i18n.js?v=20261121a";
import { CERTIFICATIONS, EARLIER, EDUCATION, LINKS, MEXICO_ROLES, PUBLICATIONS, ROLES, SELECTED_PROJECTS, SKILLS, TEXT } from "./resume-data.js?v=20261121a";

const language = languageFromSearch(window.location.search);
const L = TEXT[language] || TEXT.en;
const EN = TEXT.en;
const locale = localeFor(language);

const PROJECT_TITLES = {
  "17-copper-mine-operations": "Copper Mine Operations Console",
  "02-trajectory-visualization": "Satellite Operations Console",
  "09-employee-erp-integration": "HR–ERP Integration Console",
  "16-inspection-model-mlops": "Inspection Duration Model Pipeline",
};
const LIVE = new Set(["17-copper-mine-operations", "02-trajectory-visualization", "09-employee-erp-integration"]);
const REPO = "https://github.com/agespinoza/Portafolio/tree/main/projects/";

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;
    if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  node.append(...children.flat().filter(c => c !== null && c !== undefined && c !== false));
  return node;
}

const withLang = href => {
  if (language === "en") return href;
  const url = new URL(href, window.location.href);
  url.searchParams.set("lang", language);
  return url.pathname.split("/").pop() + url.search + url.hash;
};

const monthYear = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" });
const period = (from, to) => {
  const fmt = v => (v.length === 4 ? v : monthYear.format(new Date(`${v}-01T00:00:00Z`)));
  if (to === from) return fmt(from);
  return `${fmt(from)} – ${to ? fmt(to) : L.present}`;
};

function section(title, ...content) {
  return el("section", { class: "cv__section" }, el("h2", { class: "cv__title" }, title), ...content);
}

function render() {
  document.documentElement.lang = locale;
  document.title = L.title;
  document.getElementById("meta-description").content = L.description;
  document.getElementById("back-link").textContent = L.back;

  const count = window.LEARNING_DATA ? window.LEARNING_DATA.courses.length : 873;
  const external = (href, label) => el("a", { href, rel: "noopener", class: "cv__link" }, label, el("span", { "aria-hidden": "true" }, " ↗"));
  const printButton = el("button", { type: "button", class: "btn btn--small cv__print", title: L.pdfHint }, L.pdf);
  printButton.addEventListener("click", () => window.print());

  const header = el("header", { class: "cv__header" },
    el("div", { class: "cv__identity" },
      el("span", { class: "cv__photo" }, el("img", { src: "assets/img/alicia-espinoza.jpg", alt: "", width: "600", height: "600" })),
      el("div", {},
        el("p", { class: "kicker" }, el("span", {}, L.kicker)),
        el("h1", { class: "cv__name" }, "Alicia Espinoza"),
        el("p", { class: "cv__headline" }, L.headline),
        el("p", { class: "cv__location" }, L.location))),
    el("div", { class: "cv__actions" },
      el("a", { class: "btn btn--small", href: LINKS.linkedin, rel: "noopener" }, "LinkedIn ", el("span", { "aria-hidden": "true" }, "↗")),
      el("a", { class: "btn btn--small btn--ghost", href: LINKS.github, rel: "noopener" }, "GitHub ", el("span", { "aria-hidden": "true" }, "↗")),
      printButton),
    el("p", { class: "cv__print-links" }, `${LINKS.linkedin.replace("https://www.", "")} · ${LINKS.github.replace("https://", "")} · ${LINKS.portfolio.replace("https://", "")}`));

  const experience = ROLES.map(r => {
    const txt = L.roles[r.id] || EN.roles[r.id];
    return el("div", { class: "cv__role" },
      el("div", { class: "cv__role-head" },
        el("h3", {}, txt.role, el("span", { class: "cv__org" }, txt.org || r.org)),
        el("p", { class: "cv__when" }, period(r.from, r.to), el("span", {}, L.places[r.place]))),
      el("ul", {}, txt.bullets.map(b => el("li", {}, b))));
  });

  const earlier = el("ul", { class: "cv__earlier" }, EARLIER.map(e => {
    const [role, org, note] = L.earlier[e.id] || EN.earlier[e.id];
    return el("li", {},
      el("div", { class: "cv__earlier-head" }, el("strong", {}, role), el("span", { class: "cv__org" }, org || e.org), el("span", { class: "cv__when" }, period(e.from, e.to))),
      el("p", {}, note, MEXICO_ROLES.has(e.id) ? el("span", { class: "cv__place" }, ` · ${L.places.mexicali}`) : null));
  }));

  const education = el("ul", { class: "cv__list" }, EDUCATION.map(e => el("li", {},
    el("strong", {}, L.education[e.id] || EN.education[e.id]), el("span", {}, `${e.school} · ${period(e.from, e.to)}`))));

  const skills = el("dl", { class: "cv__skills" }, SKILLS.flatMap(s => [
    el("dt", {}, L.skills[s.id]),
    el("dd", {}, s.items.map(item => el("span", { class: "cv__chip" }, (L.skillItems && L.skillItems[item]) || item))),
  ]));

  const projects = el("ul", { class: "cv__list" }, SELECTED_PROJECTS.map(id => el("li", {},
    el("strong", {}, projectText(language, id, "title", PROJECT_TITLES[id])),
    el("span", {}, external(REPO + id, "GitHub"), LIVE.has(id) ? [" · ", external(withLang(`projects/${id}/index.html`), t(language, "site.liveDemo", "Live demo"))] : null))));

  const aside = el("aside", { class: "cv__aside" },
    section(L.skillsTitle, skills),
    section(L.languagesTitle, el("ul", { class: "cv__list" }, L.languages.map(([name, level]) => el("li", {}, el("strong", {}, name), el("span", {}, level))))),
    section(L.certificationsTitle, el("ul", { class: "cv__list" }, CERTIFICATIONS.map(c => el("li", {}, el("strong", {}, c), el("span", {}, L.certificationsIssuer)))),
      el("p", { class: "cv__note" }, L.learning.replace("{n}", count.toLocaleString(locale)), " ", el("a", { href: withLang("index.html#learning") }, L.learningLink))),
    section(L.publicationsTitle, el("ul", { class: "cv__list" }, PUBLICATIONS.map(p => el("li", {}, el("strong", {}, p))))),
    section(L.projectsTitle, projects));

  const main = el("div", { class: "cv__main" },
    section(L.summaryTitle, el("p", { class: "cv__summary" }, L.summary)),
    section(L.experienceTitle, experience),
    section(L.earlierTitle, earlier),
    section(L.educationTitle, education));

  document.getElementById("cv").replaceChildren(header, el("div", { class: "cv__body" }, main, aside));
}

// ---------- Shared navigation behaviour ----------

function initNav() {
  document.querySelectorAll("[data-i18n]").forEach(node => {
    node.textContent = t(language, node.getAttribute("data-i18n"), node.textContent.trim());
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(node => {
    node.setAttribute("aria-label", t(language, node.getAttribute("data-i18n-aria-label"), node.getAttribute("aria-label") || ""));
  });
  document.querySelectorAll("[data-lang-link]").forEach(link => { link.href = withLang(link.getAttribute("href")); });
  const select = document.getElementById("language-select");
  select.value = language;
  select.addEventListener("change", () => {
    const url = new URL(window.location.href);
    if (select.value === "en") url.searchParams.delete("lang"); else url.searchParams.set("lang", select.value);
    window.location.assign(url.href);
  });
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("primary-links");
  const setOpen = open => {
    toggle.setAttribute("aria-expanded", String(open));
    links.classList.toggle("is-open", open);
    toggle.querySelector(".nav__toggle-label").textContent = t(language, open ? "nav.close" : "nav.menu", open ? "Close menu" : "Menu");
    toggle.querySelector(".nav__toggle-icon").textContent = open ? "×" : "☰";
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); } });
  document.addEventListener("click", e => { if (!nav.contains(e.target) && toggle.getAttribute("aria-expanded") === "true") setOpen(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 640) setOpen(false); });
}

initNav();
render();
