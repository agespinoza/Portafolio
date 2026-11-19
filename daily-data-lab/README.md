# Daily Data Lab

One small, interactive data visualization a day, each on a different everyday topic, built with React and public data. The built site is published with the portfolio at [`/lab`](../lab/).

| Day | Topic | Visualization | Data |
| --- | --- | --- | --- |
| 001 | Mobility | [When is the best time to cross from Mexicali?](https://agespinoza.github.io/Portafolio/lab/#/day/1) | U.S. Customs and Border Protection, [Border Wait Times](https://bwt.cbp.gov/) |
| 002 | Nature | [Where do New Zealand's glowworms shine?](https://agespinoza.github.io/Portafolio/lab/index.html#/day/2) | [GBIF.org](https://www.gbif.org/species/1564326) occurrences and [Open-Meteo](https://open-meteo.com/) weather |

## Day 001: When is the best time to cross from Mexicali?

The page shows northbound wait times at the Calexico West and Calexico East ports of entry:

- **Right now:** the current delay and the number of open lanes from CBP's live feed. The page refreshes it every five minutes.
- **Heatmap:** CBP's historical average wait for each weekday and hour of the selected month.
- **Today vs. a typical day:** the hourly waits so far today, compared with the typical average and range for the same weekday.
- **Busiest months:** the average daytime wait (6 am–10 pm) for each month of the year.

You can switch between crossings, lanes (standard, SENTRI, Ready Lane, and pedestrian), and months. All times are Pacific Time. If the live API is unreachable, the page uses a saved snapshot in [`src/days/day-001-border/snapshot.json`](src/days/day-001-border/snapshot.json).

## Day 002: Where do New Zealand's glowworms shine?

The page maps every georeferenced public record of the Waitomo glowworm (*Arachnocampa luminosa*) and compares it with the weather outside the Waitomo Caves:

- **Night-sky map:** records grouped into clusters of about 25 km, drawn as glowing points on a map of New Zealand, with the Waitomo Caves marked.
- **Records by region:** a ranked list. Click a region to highlight it on the map.
- **Seasons outside:** monthly average highs and lows, the coldest and hottest days, humidity, and rain at Waitomo (2021–2025), aligned with glowworm records by month. Click a month to filter the map.
- **Records by year:** how citizen science (iNaturalist) changed the record after 2016.
- **Right now:** live temperature and humidity outside the caves.

You can filter by island, period, and month. Full GBIF records are large (about 2 MB per page), so the map uses the saved snapshot in [`src/days/day-002-glowworms/snapshot.json`](src/days/day-002-glowworms/snapshot.json), and the page checks GBIF's live record count. The climate averages load live from Open-Meteo and fall back to the snapshot. The coastline comes from Natural Earth and is saved in `nz-outline.json`.

## Run locally

Use Node.js 18 or later.

```sh
npm install
npm run dev        # development server at http://localhost:5173
npm run build      # builds into ../lab for GitHub Pages
npm run snapshot   # refreshes the saved CBP data (Day 001)
npm run snapshot:glowworms   # refreshes GBIF records, climate, and the NZ outline (Day 002)
```

## Add a new day

1. Create a folder in `src/days/`, for example `src/days/day-002-topic/`, with a React component.
2. Register it in [`src/days/index.js`](src/days/index.js) with the day number, date, title, summary, topic, and tags.
3. Run `npm run build` and commit both `daily-data-lab/` and `lab/`.
