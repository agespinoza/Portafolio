# Daily Data Lab

One small, interactive data visualization a day, each on a different everyday topic, built with React and public data. The built site is published with the portfolio at [`/lab`](../lab/).

| Day | Topic | Visualization | Data |
| --- | --- | --- | --- |
| 001 | Mobility | [When is the best time to cross from Mexicali?](https://agespinoza.github.io/Portafolio/lab/#/day/1) | U.S. Customs and Border Protection, [Border Wait Times](https://bwt.cbp.gov/) |

## Day 001: When is the best time to cross from Mexicali?

The page shows northbound wait times at the Calexico West and Calexico East ports of entry:

- **Right now:** the current delay and the number of open lanes from CBP's live feed. The page refreshes it every five minutes.
- **Heatmap:** CBP's historical average wait for each weekday and hour of the selected month.
- **Today vs. a typical day:** the hourly waits so far today, compared with the typical average and range for the same weekday.
- **Busiest months:** the average daytime wait (6 am–10 pm) for each month of the year.

You can switch between crossings, lanes (standard, SENTRI, Ready Lane, and pedestrian), and months. All times are Pacific Time. If the live API is unreachable, the page uses a saved snapshot in [`src/days/day-001-border/snapshot.json`](src/days/day-001-border/snapshot.json).

## Run locally

Use Node.js 18 or later.

```sh
npm install
npm run dev        # development server at http://localhost:5173
npm run build      # builds into ../lab for GitHub Pages
npm run snapshot   # refreshes the saved CBP data
```

## Add a new day

1. Create a folder in `src/days/`, for example `src/days/day-002-topic/`, with a React component.
2. Register it in [`src/days/index.js`](src/days/index.js) with the day number, date, title, summary, topic, and tags.
3. Run `npm run build` and commit both `daily-data-lab/` and `lab/`.
