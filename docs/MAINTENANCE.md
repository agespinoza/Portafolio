# Maintaining the portfolio

This guide explains how the site is put together and how to change it without breaking anything. It is for whoever maintains the repository: me, or an assistant working on my behalf. The site is static and served by GitHub Pages from the `main` branch at the repository root, at https://agespinoza.github.io/Portafolio/.

## Map of the repository

| Path | What it is |
| --- | --- |
| `index.html`, `assets/app.js`, `assets/styles.css` | The portfolio front page. `app.js` holds the list of projects (`PROJECTS`), the career timeline (`TIMELINE`) and the live applications. |
| `assets/i18n.js` | Shared text in Spanish, Japanese, Italian and French. English text is written in the HTML or next to each call. |
| `resume.html`, `assets/resume*.js`, `assets/resume.css` | The résumé page. See [Résumé](#résumé). |
| `projects/NN-name/` | One folder per project, each with its own README. Three of them are live consoles: 02 (satellites), 09 (HR–ERP) and 17 (copper mine). |
| `daily-data-lab/` → `lab/` | Source of the Daily Data Lab (React) and its built output. Both are committed. |
| `learning/`, `LEARNING.md`, `assets/learning-data.js` | The LinkedIn Learning record. |
| `.github/workflows/refresh-orbit-data.yml` | Daily job that refreshes the satellite data and commits it as `github-actions[bot]`. |
| `README.md`, `ROADMAP.md` | The public introduction and the career-to-project map. |

## Run it locally

From the repository root, in the VS Code terminal:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/ in Safari. Add `?lang=es` (or `ja`, `it`, `fr`) to see another language.

## Publish a change

1. **Always get the latest version first.** A bot commit lands on `main` every day. In GitHub Desktop, click **Fetch origin**, then **Pull origin**. In the terminal, run `git pull --ff-only`.
2. Make and check the change locally.
3. **Bump the cache version** of every file you changed (see [Cache versions](#cache-versions)).
4. Commit with a short message that says what changed, then **Push origin**.
5. GitHub Pages publishes in a minute or two. Browsers may keep the old copy for up to 10 minutes. To see the new one in Safari, press **⌥ Option + ⌘ Command + R**, or use a private window.

## Add a project

1. Create `projects/NN-short-name/` with a `README.md`. The README should say what the project shows, the career context, how to run it and what the data is. Use simulated or public data only.
2. Add an entry to `PROJECTS` in `assets/app.js` with `id`, `title`, `area`, `tech` and `text`. For a live demo, add `demo: true` and `applicationStatus`, and add the id to `statusKeys`.
3. Add the id to the matching chapter in `TIMELINE`.
4. Translate the card: add `"NN-short-name": { title, text }` to the `projects` block of each of the 4 languages in `assets/i18n.js`.
5. If it is a live demo, add it to the sentence `site.applicationsIntro`, both in `index.html` (English) and in the 4 languages.
6. **Project count.** The hero number and the Projects intro are computed from `PROJECTS`, so they update by themselves. Two places are plain text and must be edited by hand:
   - the `og:description` meta tag in `index.html` ("N portfolio projects"), which link previews read without running JavaScript;
   - "links all N demonstrations" in `README.md`.
7. Add a row to `ROADMAP.md` and, if it is a highlight, to the career table in `README.md`.
8. Bump the cache versions, rebuild the Data Lab (see below) and publish.

## Translations

- Every visible string exists in 5 languages. English is the fallback and sits in the HTML (`data-i18n="site.key"`) or next to the call in the code. The other 4 languages live in `assets/i18n.js`.
- Placeholders such as `{n}` must appear, with the same names, in every language.
- Each live console has its own `messages.js` and `i18n.js`. Keys that start with `site:` come from the shared `assets/i18n.js`, such as the navigation labels.
- The Daily Data Lab bundle embeds a copy of `assets/i18n.js`. **After any change to that file, rebuild the lab:**

  ```sh
  cd daily-data-lab && npm run build
  ```

  Commit both `daily-data-lab/` and `lab/`.

## Cache versions

GitHub Pages lets browsers cache every file for 10 minutes. Without versions, a browser can mix new HTML with old scripts, and the page breaks. To prevent that, every local stylesheet, script, import and data file is loaded with a version, for example `app.js?v=20261120e`.

- The format is `YYYYMMDD` plus a letter. Use today's date, and move to the next letter for each new publish on the same day.
- Bump **all** the versions of a page together. That includes the front page (`index.html` and the imports in `assets/app.js`), the résumé (`resume.html` and `assets/resume.js`) and each console folder.
- To see every version in use, run `grep -rhoE "v=2026[0-9]+[a-z]" index.html resume.html assets projects/*/ | sort | uniq -c`.

## Résumé

- All the content is in `assets/resume-data.js`. Facts (dates, organisations, technologies, degrees) are in `ROLES`, `EARLIER`, `EDUCATION`, `CERTIFICATIONS`, `PUBLICATIONS` and `SKILLS`. Every visible sentence is in `TEXT`, once per language.
- To add a job, add its facts to `ROLES` (newest first) and its `role`, `org` and `bullets` to `TEXT.<language>.roles` in all 5 languages.
- The **Save as PDF** button opens the print dialog. The print layout is the `@media print` block in `assets/resume.css`.
- The current employer is described by industry, never named (see [Privacy rules](#privacy-rules)).

## Live consoles

| Console | Data | Tests |
| --- | --- | --- |
| 02 Satellite Operations Console | `fetch_data.py`, run daily by the workflow. CelesTrak throttles repeated downloads, so do not re-run it in a loop. | Review in the browser. |
| 09 HR–ERP Integration Console | `node projects/09-employee-erp-integration/generate_data.mjs` | `node --test projects/09-employee-erp-integration/engine.test.mjs` |
| 17 Copper Mine Operations Console | `python3 projects/17-copper-mine-operations/pipeline/build.py` (about a minute, seeded) | `python3 -m unittest discover -s projects/17-copper-mine-operations/tests` and `node --test projects/17-copper-mine-operations/mine.test.mjs` |

When a change alters the number of tests, update the count quoted in that project's README.

## Privacy rules

- **Never name my current employer** anywhere in the repository: pages, translations, READMEs, commit messages or issue text. Describe the current role by its work and industry. Before committing, search the changed files for the name.
- Do not publish a personal email address, phone number, street address or exact town, or anything about health, family or finances. The site links to LinkedIn and GitHub for contact.
- Projects use fictional or public data only, never data, code or documents from an employer. The copper mine console says so in its footer.
- My photo, biographical text, résumé and learning record are not covered by the MIT license.

## Before every publish

- [ ] I pulled the latest `main` first.
- [ ] I checked the page locally, in English and in at least one other language.
- [ ] New text exists in all 5 languages, with matching placeholders.
- [ ] I bumped the cache versions, and rebuilt the lab if `assets/i18n.js` changed.
- [ ] For a new project, I updated the `og:description` and README counts.
- [ ] The tests of any console I touched pass.
- [ ] No employer name and no personal data appear in the changed files.
