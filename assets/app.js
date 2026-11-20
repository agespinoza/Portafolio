import {
  calendarWeekdays,
  dayText,
  getLanguage,
  languageFromSearch,
  localeFor,
  projectText,
  t,
  timelineText,
} from "./i18n.js?v=20261120d";
import { DAILY_DATA_LAB_DAYS } from "./daily-data-lab-days.js?v=20261120d";
import { getContributionCalendar } from "./contributions.js?v=20261120d";

function el(tag, attrs, children) {
  var node = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function (key) {
    if (key === "text") node.textContent = attrs[key];
    else if (key === "class") node.className = attrs[key];
    else node.setAttribute(key, attrs[key]);
  });
  (children || []).forEach(function (child) {
    if (child) node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  });
  return node;
}

function applyLanguage(language) {
  document.documentElement.lang = localeFor(language);
  document.title = t(language, "site.title", document.title);
  var description = document.getElementById("meta-description");
  if (description) description.content = t(language, "site.description", description.content);
  document.querySelectorAll("[data-i18n]").forEach(function (node) {
    node.textContent = t(language, node.getAttribute("data-i18n"), node.textContent.trim());
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
    node.placeholder = t(language, node.getAttribute("data-i18n-placeholder"), node.placeholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(function (node) {
    node.setAttribute("aria-label", t(language, node.getAttribute("data-i18n-aria-label"), node.getAttribute("aria-label") || ""));
  });
  document.querySelectorAll("[data-i18n-alt]").forEach(function (node) {
    node.alt = t(language, node.getAttribute("data-i18n-alt"), node.alt);
  });
  document.querySelectorAll("[data-i18n-content]").forEach(function (node) {
    node.content = t(language, node.getAttribute("data-i18n-content"), node.content);
  });
  var languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.value = language;
    languageSelect.addEventListener("change", function () {
      var url = new URL(window.location.href);
      if (languageSelect.value === "en") url.searchParams.delete("lang");
      else url.searchParams.set("lang", languageSelect.value);
      window.location.assign(url.href);
    });
  }
  document.querySelectorAll("[data-lab-link]").forEach(function (link) {
    var url = new URL(link.getAttribute("href"), window.location.href);
    if (language === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", language);
    link.href = url.href;
  });
}

function renderContributionCalendar(language) {
  var container = document.getElementById("lab-contribution-grid");
  var summary = document.getElementById("lab-calendar-summary");
  if (!container || !summary) return;

  var contributionData = getContributionCalendar(DAILY_DATA_LAB_DAYS);
  var weeks = contributionData.weeks;
  summary.textContent = t(language, "site.calendarDescription", "{count} days published in the last 12 months", { count: contributionData.count });
  var calendar = el("div", {
    class: "contributions",
    role: "grid",
    "aria-label": t(language, "calendar.aria", "Daily Data Lab publishing calendar")
  });
  var monthLabels = el("div", { class: "contributions__months", "aria-hidden": "true" });
  var previousMonth = -1;
  weeks.forEach(function (week, index) {
    var firstDate = week[0].date;
    if (firstDate.getMonth() !== previousMonth) {
      monthLabels.appendChild(el("span", { class: "contributions__month", style: "grid-column: " + (index + 1), text: firstDate.toLocaleDateString(localeFor(language), { month: "short" }) }));
      previousMonth = firstDate.getMonth();
    }
  });
  var weekdays = el("div", { class: "contributions__weekdays", "aria-hidden": "true" });
  var weekdayNames = calendarWeekdays(language);
  [1, 3, 5].forEach(function (index) {
    weekdays.appendChild(el("span", { text: weekdayNames[index] }));
  });
  var grid = el("div", { class: "contributions__grid" });
  weeks.forEach(function (week) {
    week.forEach(function (entry) {
      var label = entry.date.toLocaleDateString(localeFor(language), { year: "numeric", month: "long", day: "numeric" });
      var publishedTitle = entry.entry ? dayText(language, entry.entry.slug, "title", entry.entry.title) : null;
      var cellLabel = entry.entry
        ? t(language, "calendar.published", "Published: {title}", { title: publishedTitle }) + " · " + label
        : t(language, "calendar.empty", "No publication") + " · " + label;
      var cell = entry.entry
        ? el("a", {
          class: "contributions__day contributions__day--published",
          href: "lab/index.html" + (language === "en" ? "" : "?lang=" + language) + "#/day/" + entry.entry.day,
          "aria-label": cellLabel,
          title: cellLabel,
          "data-date": entry.iso
        })
        : el("span", {
          class: "contributions__day",
          "aria-label": cellLabel,
          title: cellLabel,
          "data-date": entry.iso
        });
      grid.appendChild(cell);
    });
  });
  container.textContent = "";
  var body = el("div", { class: "contributions__body" }, [weekdays, grid]);
  container.appendChild(el("div", { class: "contributions__layout" }, [monthLabels, body]));
  container.scrollLeft = container.scrollWidth;
}

(function () {
  "use strict";

  var language = getLanguage(languageFromSearch(window.location.search));
  applyLanguage(language);
  renderContributionCalendar(language);

  var REPO = "https://github.com/agespinoza/Portafolio/tree/main/projects/";

  var PROJECTS = [
    { id: "01-trajectory-etl", title: "Trajectory Data Preparation", area: "data", tech: ["Python", "ETL", "CSV"],
      text: "Validates simulated trajectory points, normalizes timestamps to UTC, removes duplicates, and exports clean data for plotting." },
    { id: "02-trajectory-visualization", title: "Satellite Operations Console", area: "analytics", tech: ["JavaScript", "D3.js", "Three.js", "SGP4", "Python"], demo: true, applicationStatus: "Live demo on this site",
      text: "Tracks 16 NASA and partner satellites from public orbital data, predicts ground-station passes, and validates SGP4 against NASA's ISS ephemeris." },
    { id: "03-inspection-sql-performance", title: "Inspection SQL Performance", area: "data", tech: ["SQL", "SQLite", "Query plans"],
      text: "Reports inspection volume by station and compares query plans with and without an index." },
    { id: "04-inspection-warehouse-migration", title: "Inspection Warehouse Migration", area: "data", tech: ["Python", "SQL", "Star schema"],
      text: "Migrates inspection history into a dimensional model and reconciles totals before committing." },
    { id: "05-inspection-power-bi", title: "Inspection Trends in Power BI", area: "analytics", tech: ["Power BI", "DAX", "PBIP"], applicationStatus: "Requires Power BI Desktop",
      text: "Weekly duration trends and exceptions by station in a version-controlled Power BI project." },
    { id: "06-inspection-statistics-r", title: "Inspection Duration Analysis in R", area: "analytics", tech: ["R", "Statistics"],
      text: "Compares mean inspection durations between stations with a reproducible Welch's t-test." },
    { id: "07-inspection-status-api", title: "Inspection Status API", area: "software", tech: ["Java", "Jakarta EE", "REST", "JavaScript"], applicationStatus: "Requires a Jakarta EE 10 server",
      text: "Looks up a simulated inspection through a Jakarta REST endpoint and a browser interface." },
    { id: "08-mortgage-workflow-automation", title: "Mortgage Workflow Automation", area: "software", tech: ["C#", "ASP.NET Core", "JavaScript"], applicationStatus: "Requires .NET 8",
      text: "Advances a mortgage application through workflow stages and records every transition." },
    { id: "09-employee-erp-integration", title: "HR–ERP Integration Console", area: "data", tech: ["JavaScript", "D3.js", "Data validation", "Automated tests"], demo: true, applicationStatus: "Live demo on this site",
      text: "Validates weekly HR extracts, previews every change before it reaches the ERP, applies approved runs with an audit trail and undo, and reconciles both systems." },
    { id: "10-internal-request-tracker", title: "Internal Request Tracker", area: "software", tech: ["PHP", "SQLite"], applicationStatus: "Requires PHP 8.1 and SQLite",
      text: "Records internal requests and searches their history through a lightweight web application." },
    { id: "11-inspection-workflow-qa", title: "Inspection Workflow QA", area: "software", tech: ["Python", "unittest", "Test plan"],
      text: "Test plan, automated test cases, and a reproducible defect report for an inspection workflow." },
    { id: "12-azure-devops-ci", title: "Azure DevOps Continuous Integration", area: "devops", tech: ["Azure Pipelines", "YAML", "Python"],
      text: "Compiles and tests a Python utility on every push; failures stop the build." },
    { id: "13-office-backup-recovery", title: "Office Backup and Recovery", area: "devops", tech: ["Architecture", "Python", "DR planning"],
      text: "Designs and rehearses recovery for an office file share with a 24-hour RPO and 60-minute RTO." },
    { id: "14-inspection-project-coordination", title: "Inspection Feature Delivery Plan", area: "delivery", tech: ["Requirements", "Acceptance criteria", "Kanban"],
      text: "Turns a feature request into scope, acceptance criteria, tasks, and a sample Kanban board." },
    { id: "15-excel-data-cleaning-lesson", title: "Excel Data Cleaning Lesson", area: "delivery", tech: ["Excel", "Instructional design"],
      text: "A guided lesson, practice workbook, and rubric for cleaning and summarizing inspection data." },
    { id: "16-inspection-model-mlops", title: "Inspection Duration Model Pipeline", area: "ai", tech: ["Python", "MLOps", "Model evaluation"],
      text: "Trains, evaluates, and versions a small regression model against a baseline with a fixed holdout." },
    { id: "17-copper-mine-operations", title: "Copper Mine Operations Console", area: "analytics", tech: ["Python", "Geostatistics", "Optimization", "Machine learning", "D3.js"], demo: true, applicationStatus: "Live demo on this site",
      text: "Follows a fictional open-pit copper mine from drillhole to copper: kriged resource model, pit optimization, haul fleet, plant recovery model, reconciliation, and assay QA/QC." }
  ];

  var AREAS = [
    { id: "all", label: "All" },
    { id: "data", label: "Data engineering" },
    { id: "analytics", label: "Analytics & BI" },
    { id: "software", label: "Software" },
    { id: "devops", label: "DevOps & IT" },
    { id: "ai", label: "AI & MLOps" },
    { id: "delivery", label: "Delivery & teaching" }
  ];

  var TIMELINE = [
    { years: "2002 – 2016", title: "Public-sector software, ERP & IT operations",
      text: "Built internal web and desktop applications in Mexicali, managed IT infrastructure and budgets, and developed ERP and administrative systems.",
      projects: ["13-office-backup-recovery", "09-employee-erp-integration", "10-internal-request-tracker"] },
    { years: "2008 – 2016", title: "Teaching, quality assurance & consulting",
      text: "Designed engineering and technology courses with hands-on labs, and applied formal test criteria and defect documentation as a quality engineer.",
      projects: ["15-excel-data-cleaning-lesson", "11-inspection-workflow-qa"] },
    { years: "2017 – 2019", title: "Mining systems & mortgage automation",
      text: "In 2017, worked on mining operations and business intelligence systems with T-SQL, MDX, and JavaScript, then automated mortgage workflows and ERP improvements.",
      projects: ["17-copper-mine-operations", "08-mortgage-workflow-automation"] },
    { years: "2019 – 2023", title: "Vehicle inspection software & data platforms",
      text: "Developed inspection software, tuned ETL and SQL performance, supported warehouse migrations, and implemented cloud-based continuous integration.",
      projects: ["03-inspection-sql-performance", "04-inspection-warehouse-migration", "05-inspection-power-bi", "06-inspection-statistics-r", "12-azure-devops-ci"] },
    { years: "2023 – 2026", title: "Stakeholder requirements & mission operations",
      text: "Gathered requirements and coordinated delivery as a consultant, then automated mission operations at the University of Arizona Space Institute.",
      projects: ["14-inspection-project-coordination", "01-trajectory-etl", "02-trajectory-visualization", "07-inspection-status-api"] },
    { years: "2026 – Present", title: "Production analytics & AI platforms",
      text: "Back in mining operations software since March 2026, partnering with data scientists to turn pipelines into production applications and supporting cloud analytics platforms, with a focus on MLOps.",
      projects: ["17-copper-mine-operations", "16-inspection-model-mlops"] }
  ];

  var byId = {};
  PROJECTS.forEach(function (p) { byId[p.id] = p; });

  function projectTag(id) {
    var p = byId[id];
    return el("a", { class: "tag", href: REPO + id, rel: "noopener", text: p ? projectText(language, p.id, "title", p.title) : id });
  }

  /* Timeline */
  var tl = document.getElementById("timeline");
  TIMELINE.forEach(function (entry, i) {
    var current = i === TIMELINE.length - 1;
    tl.appendChild(el("li", { class: "tl reveal" }, [
      el("div", { class: "tl__years" }, [entry.years, current ? el("span", { class: "tl__current", text: "● " + t(language, "site.current", "Current") }) : null]),
      el("div", null, [
        el("h3", { text: timelineText(language, i, "title", entry.title) }),
        el("p", { text: timelineText(language, i, "text", entry.text) }),
        el("div", { class: "tl__links" }, entry.projects.map(projectTag))
      ])
    ]));
  });

  /* Projects */
  var grid = document.getElementById("project-grid");
  var filters = document.getElementById("project-filters");
  var areaLabel = {};
  AREAS.forEach(function (a) { areaLabel[a.id] = t(language, "areas." + a.id, a.label); });

  var langQuery = language === "en" ? "" : "?lang=" + language;
  function projectTitle(project) {
    return project.id === "daily-data-lab"
      ? t(language, "site.labTitle", project.title)
      : projectText(language, project.id, "title", project.title);
  }
  function projectDescription(project) {
    return project.id === "daily-data-lab"
      ? t(language, "site.dailyLabDescription", project.text)
      : projectText(language, project.id, "text", project.text);
  }

  function renderProjects(area) {
    grid.textContent = "";
    PROJECTS.filter(function (p) { return area === "all" || p.area === area; }).forEach(function (p) {
      var links = [el("a", { href: REPO + p.id, rel: "noopener", text: t(language, "site.viewProject", "View project") })];
      if (p.demo) links.push(el("a", { class: "demo", href: "projects/" + p.id + "/index.html" + langQuery, text: t(language, "site.liveDemo", "Live demo") }));
      grid.appendChild(el("article", { class: "card" }, [
        el("div", { class: "card__top" }, [
          el("span", { class: "card__num", text: p.id.slice(0, 2) }),
          el("span", { class: "card__area", text: areaLabel[p.area] })
        ]),
        el("h3", { text: projectTitle(p) }),
        el("p", { text: projectDescription(p) }),
        el("div", { class: "card__tech" }, p.tech.map(function (t) { return el("span", { text: t }); })),
        el("div", { class: "card__links" }, links)
      ]));
    });
  }
  var applicationGrid = document.getElementById("application-grid");
  var applications = PROJECTS.filter(function (p) { return p.applicationStatus; });
  applications.push({
    id: "daily-data-lab",
    number: "DL",
    title: "Daily Data Lab",
    area: "analytics",
    tech: ["React", "Public APIs", "Data visualization"],
    text: "A growing collection of interactive visualizations built with public data.",
    applicationStatus: "Live app on this site",
    demoHref: "lab/index.html",
    demoLabel: "Open live app",
    sourceHref: "https://github.com/agespinoza/Portafolio/tree/main/daily-data-lab"
  });
  var statusKeys = {
    "02-trajectory-visualization": ["site.statusLiveDemo", "Live demo on this site"],
    "05-inspection-power-bi": ["site.statusPowerBi", "Requires Power BI Desktop"],
    "07-inspection-status-api": ["site.statusJakarta", "Requires a Jakarta EE 10 server"],
    "08-mortgage-workflow-automation": ["site.statusDotnet", "Requires .NET 8"],
    "09-employee-erp-integration": ["site.statusLiveDemo", "Live demo on this site"],
    "17-copper-mine-operations": ["site.statusLiveDemo", "Live demo on this site"],
    "10-internal-request-tracker": ["site.statusPhp", "Requires PHP 8.1 and SQLite"],
    "daily-data-lab": ["site.statusLiveApp", "Live app on this site"]
  };
  applications.forEach(function (p) {
    var demoHref = p.demoHref || (p.demo ? "projects/" + p.id + "/index.html" : null);
    if (demoHref) demoHref += langQuery;
    var links = [];
    if (demoHref) links.push(el("a", { class: "demo", href: demoHref, text: p.demoLabel ? t(language, "site.openLiveApp", p.demoLabel) : t(language, "site.openLiveDemo", "Open live demo") }));
    links.push(el("a", { href: p.sourceHref || REPO + p.id, rel: "noopener", text: t(language, "site.codeInstructions", "Code & instructions") }));
    var title = projectTitle(p);
    var status = statusKeys[p.id];
    applicationGrid.appendChild(el("article", { class: "card" }, [
      el("div", { class: "card__top" }, [
        el("span", { class: "card__num", text: p.number || p.id.slice(0, 2) }),
        el("span", { class: "card__area", text: areaLabel[p.area] })
      ]),
      el("h3", { text: title }),
      el("p", { text: projectDescription(p) }),
      el("span", { class: "application__status" + (demoHref ? " application__status--live" : ""), text: status ? t(language, status[0], status[1]) : p.applicationStatus }),
      el("div", { class: "card__tech" }, p.tech.map(function (t) { return el("span", { text: t }); })),
      el("div", { class: "card__links" }, links)
    ]));
  });
  AREAS.forEach(function (a, i) {
    var n = a.id === "all" ? PROJECTS.length : PROJECTS.filter(function (p) { return p.area === a.id; }).length;
    var b = el("button", { class: "chip", type: "button", "aria-pressed": i === 0 ? "true" : "false" },
      [areaLabel[a.id], el("span", { class: "chip__n", text: String(n) })]);
    b.addEventListener("click", function () {
      filters.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      renderProjects(a.id);
    });
    filters.appendChild(b);
  });
  renderProjects("all");

  /* Learning */
  var D = window.LEARNING_DATA;
  if (!D) return;
  var courses = D.courses.map(function (c) {
    return { title: c[0], path: !!c[1], instructor: c[2], cat: c[3], date: c[4] };
  });
  var categories = D.categories.map(function (category) {
    return Object.assign({}, category, {
      label: t(language, "learningCategories." + category.id, category.label)
    });
  });
  var catById = {};
  categories.forEach(function (c) { catById[c.id] = c; });
  var byTitle = {};
  courses.forEach(function (c) { if (c.title) byTitle[c.title] = c; });
  // Personal-development areas count toward totals, but their titles are not published.
  var listed = courses.filter(function (c) { return c.title; });

  var paths = courses.filter(function (c) { return c.path; }).length;
  var first = courses.reduce(function (m, c) { return c.date < m ? c.date : m; }, "9999");
  var kpis = [
    [courses.length, t(language, "site.kpiCourses", "courses & learning paths")],
    [paths, t(language, "site.kpiPaths", "learning paths completed")],
    [categories.length, t(language, "site.kpiAreas", "skill areas")],
    [t(language, "site.kpiSince", "Since {year}", { year: first.slice(0, 4) }), t(language, "site.kpiContinuous", "continuous learning")]
  ];
  var kpiBox = document.getElementById("learning-kpis");
  kpis.forEach(function (k) {
    kpiBox.appendChild(el("div", { class: "kpi" }, [
      el("div", { class: "kpi__num", text: String(k[0]) }),
      el("div", { class: "kpi__label", text: k[1] })
    ]));
  });
  document.querySelectorAll('[data-count="total"]').forEach(function (n) { n.textContent = courses.length; });

  // Years chart
  var years = {};
  courses.forEach(function (c) { var y = c.date.slice(0, 4); years[y] = (years[y] || 0) + 1; });
  var yearKeys = Object.keys(years).sort();
  var maxY = Math.max.apply(null, yearKeys.map(function (y) { return years[y]; }));
  var chart = document.getElementById("years-chart");
  chart.setAttribute("aria-label", yearKeys.map(function (y) {
    return t(language, "site.yearCount", "{year}: {count}", { year: y, count: years[y] });
  }).join(", "));
  yearKeys.forEach(function (y, i) {
    var bar = el("div", { class: "yr__bar" });
    bar.style.height = Math.max(2, years[y] / maxY * 100) + "%";
    bar.style.transitionDelay = (i * 70) + "ms";
    chart.appendChild(el("div", { class: "yr" + (years[y] === maxY ? " yr--peak" : "") }, [
      el("span", { class: "yr__val", text: String(years[y]) }), bar, el("span", { class: "yr__lbl", text: y })
    ]));
  });

  // Skill areas
  var areasEl = document.getElementById("areas");
  var maxC = Math.max.apply(null, categories.map(function (c) { return c.count; }));
  var featuredCats = categories.filter(function (c) { return c.featured.length; });
  categories.forEach(function (c) {
    var fill = el("div", { class: "area__fill" });
    fill.style.width = (c.count / maxC * 100) + "%";
    var btn = el("button", { class: "area", type: "button", "aria-pressed": "false", "data-id": c.id }, [
      el("span", { class: "area__name", text: c.label, title: c.label }),
      el("span", { class: "area__track" }, [fill]),
      el("span", { class: "area__n", text: String(c.count) })
    ]);
    btn.addEventListener("click", function () { selectArea(c.id, true); });
    areasEl.appendChild(el("li", null, [btn]));
  });

  var featuredEl = document.getElementById("featured");
  function selectArea(id, scroll) {
    areasEl.querySelectorAll(".area").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-id") === id ? "true" : "false");
    });
    var c = catById[id];
    featuredEl.textContent = "";
    if (c.private) {
      featuredEl.appendChild(el("div", null, [
        el("p", { class: "mono-label", text: t(language, "site.personalDevelopment", "Personal development") }),
        el("h3", { text: c.label }),
        el("p", { class: "featured__meta", text: t(language, "site.percentLearning", "{percent}% of my learning record", { percent: Math.round(c.count / courses.length * 100) }) }),
        el("div", { class: "featured__count", text: String(c.count) }),
        el("p", { class: "mono-label", text: t(language, "site.itemsCompleted", "items completed") })
      ]));
      featuredEl.appendChild(el("div", null, [
        el("p", { class: "featured__meta", text: t(language, "site.personalDevelopmentNote", "These courses support personal growth and are included in the totals. Their titles are kept private.") })
      ]));
      if (scroll && window.innerWidth < 900) featuredEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    var items = c.featured.length ? c.featured.map(function (t) { return byTitle[t]; })
      : courses.filter(function (x) { return x.cat === id; }).slice(0, 8);
    var all = el("button", { class: "btn btn--ghost btn--small", type: "button" }, [t(language, "site.browseAll", "Browse all {count}", { count: c.count }), el("span", { "aria-hidden": "true", text: "→" })]);
    all.addEventListener("click", function () {
      fArea.value = id; fYear.value = ""; q.value = ""; resetAndRender();
      document.getElementById("q").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    var share = Math.round(c.count / courses.length * 100);
    featuredEl.appendChild(el("div", null, [
      el("p", { class: "mono-label", text: t(language, c.featured.length ? "site.featuredTraining" : "site.recentTraining", c.featured.length ? "Featured training" : "Recent training") }),
      el("h3", { text: c.label }),
      el("p", { class: "featured__meta", text: t(language, "site.percentLearning", "{percent}% of my learning record", { percent: share }) }),
      el("div", { class: "featured__count", text: String(c.count) }),
      el("p", { class: "mono-label", text: t(language, "site.itemsCompleted", "items completed") }),
      all
    ]));
    var right = el("div", null, [el("ul", { class: "featured__list" }, items.map(function (x) {
      return el("li", null, [
        x.title,
        x.path ? el("span", { class: "badge", text: t(language, "site.learningPath", "Learning path") }) : null,
        el("small", { text: [x.instructor, x.date.slice(0, 4)].filter(Boolean).join(" · ") })
      ]);
    }))]);
    if (c.projects.length) {
      right.appendChild(el("div", { class: "applied" }, [el("span", { class: "mono-label", text: t(language, "site.appliedIn", "Applied in") })].concat(c.projects.map(projectTag))));
    }
    featuredEl.appendChild(right);
    if (scroll && window.innerWidth < 900) featuredEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (featuredCats.length) selectArea(featuredCats[0].id, false);

  // Table
  var q = document.getElementById("q");
  var fArea = document.getElementById("f-area");
  var fYear = document.getElementById("f-year");
  var rows = document.getElementById("course-rows");
  var countEl = document.getElementById("result-count");
  var moreBtn = document.getElementById("show-more");
  var PAGE = 25, shown = PAGE;

  categories.forEach(function (c) { if (!c.private) fArea.appendChild(el("option", { value: c.id, text: c.label })); });
  yearKeys.slice().reverse().forEach(function (y) { fYear.appendChild(el("option", { value: y, text: y })); });

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(localeFor(language), { year: "numeric", month: "short", day: "numeric" });
  }
  function filtered() {
    var term = q.value.trim().toLowerCase();
    return listed.filter(function (c) {
      return (!fArea.value || c.cat === fArea.value) &&
        (!fYear.value || c.date.slice(0, 4) === fYear.value) &&
        (!term || c.title.toLowerCase().indexOf(term) > -1 || c.instructor.toLowerCase().indexOf(term) > -1);
    });
  }
  function render() {
    var list = filtered();
    rows.textContent = "";
    list.slice(0, shown).forEach(function (c) {
      rows.appendChild(el("tr", null, [
        el("td", null, [c.title, c.path ? el("span", { class: "badge", text: t(language, "site.learningPath", "Learning path") }) : null,
          c.instructor ? el("small", { text: c.instructor }) : null]),
        el("td", { text: catById[c.cat].label }),
        el("td", { text: fmtDate(c.date) })
      ]));
    });
    countEl.textContent = list.length === listed.length
      ? t(language, "site.professionalCourses", "Showing {shown} of {total} professional courses, newest first. Personal-development titles are not listed.", { shown: Math.min(shown, list.length), total: list.length })
      : t(language, list.length === 1 ? "site.matchingOne" : "site.matchingMany", "{count} matching items.", { count: list.length });
    moreBtn.hidden = shown >= list.length;
  }
  function resetAndRender() { shown = PAGE; render(); }
  q.addEventListener("input", resetAndRender);
  fArea.addEventListener("change", resetAndRender);
  fYear.addEventListener("change", resetAndRender);
  moreBtn.addEventListener("click", function () { shown += 50; render(); });
  render();

  document.getElementById("year").textContent = new Date().getFullYear();
  initChrome(language);
})();

/* Navigation state and scroll reveals */
function initChrome(language) {
  var nav = document.getElementById("nav");
  if (!nav || !window.addEventListener) return;
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("primary-links");
  var menuLabel = menuToggle && menuToggle.querySelector(".nav__toggle-label");
  var menuIcon = menuToggle && menuToggle.querySelector(".nav__toggle-icon");
  function setMenuOpen(open) {
    if (!menuToggle || !navLinks) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    navLinks.classList.toggle("is-open", open);
    if (menuLabel) menuLabel.textContent = t(language, open ? "nav.close" : "nav.menu", open ? "Close menu" : "Menu");
    if (menuIcon) menuIcon.textContent = open ? "×" : "☰";
  }
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
    });
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function () { setMenuOpen(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target) && menuToggle.getAttribute("aria-expanded") === "true") setMenuOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 640) setMenuOpen(false);
    });
  }

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-visible"); });
    return;
  }
  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); revealer.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(function (n) { revealer.observe(n); });

  var links = {};
  document.querySelectorAll("[data-nav]").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var a = links[e.target.id];
      if (a && e.isIntersecting) {
        Object.keys(links).forEach(function (k) { links[k].classList.remove("is-active"); });
        a.classList.add("is-active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
}
