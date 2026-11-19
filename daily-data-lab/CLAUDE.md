# Daily Data Lab: working guide

This folder is Alicia's Daily Data Lab: one small, interactive React visualization a day about a different everyday topic, built on public data. The lab is published with her portfolio at https://agespinoza.github.io/Portafolio/lab/index.html.

## How Alicia works
- She chooses a daily topic, often the same one as the flyer she makes for her family that day. When she names a topic, propose one visualization idea that uses a free public API or dataset, ideally with no API key, and wait for her to confirm before building.
- Write all published content in English. Talk to Alicia in Spanish.
- She is still learning the tools, so give clear step-by-step instructions for anything she has to do herself, such as pushing changes or using Safari or GitHub Desktop.

## Adding a day
1. Create `src/days/day-NNN-<slug>/` with a component such as `Day.jsx`, plus `api.js` when the day fetches data.
2. Register the day in `src/days/index.js` with `day`, `slug`, `date` (YYYY-MM-DD), `title` (a question works well), `summary`, `topic`, `tags`, `source`, and `component`.
3. If the source API can fail, bundle a small JSON snapshot in the day folder and import it, so the page still works offline. Add a refresh script in `scripts/` when it helps. Day 001 shows the pattern in `api.js` and `scripts/snapshot.mjs`.
4. Run `npm run build`. The build writes to `../lab/`, and both `daily-data-lab/` and `lab/` must be committed.
5. Update the day table in `README.md`. When the new day should be featured, also update the Daily Data Lab section in `../index.html`, along with its preview image in `../assets/img/`.

## Rules that prevent past bugs
- Keep the `classic-script` plugin and the IIFE output in `vite.config.js`. Browsers block `type="module"` scripts on `file://`, which made the page blank.
- Make links point to explicit `index.html` files, for example `lab/index.html#/day/2`, not to folders. When opened from disk, folder links show a directory listing.
- Use hash routes (`#/day/N`) because GitHub Pages has no server-side routing.
- Verify the APIs from the browser: check CORS with `curl -H 'Origin: https://agespinoza.github.io'` and look for `access-control-allow-origin`.

## Design
- Match the portfolio's visual language: the tokens are in `src/styles.css`. The fonts are Instrument Serif for headings, Inter for text, and JetBrains Mono for labels. Use the paper/ink/teal/copper palette and keep dark mode working.
- Draw charts as hand-built SVG in React with no chart library. Make them accessible: add `role` and `aria-label`, keep cells focusable, and give a text readout on hover or focus.
- A day page usually includes controls, a row of key numbers, one main chart, one or two supporting charts, a "What the data says" takeaways box, and a "Method & sources" note.

## Privacy
- Never add personal email addresses, phone numbers, street addresses, or personal health, family, or finance details.
- Do not reference Alicia's employer's internal data. Use only public data.
- Commits use the GitHub noreply address that is configured in the repo. Do not change it.

## Testing without a browser
Use jsdom (install it in the session scratchpad, not in this project) to load `../lab/index.html` from `file://` with `window.fetch` mapped to Node's fetch. Check the page both online and with fetch failing.

## Publishing
Alicia pushes from the VS Code terminal with `git push origin main`, because this environment has no GitHub credentials. GitHub Pages deploys from `main` / root within a few minutes.
