# Alicia Espinoza | Software Engineering Portfolio

I’m a software engineer with experience in enterprise applications, data platforms, and automation across Mexico and the United States. I began my career in public-sector IT in Mexicali, developing internal applications and moving into ERP integration and infrastructure management. While teaching at several universities, I designed courses and hands-on labs that helped students apply technical concepts.

In Arizona, I worked on mining operations software, mortgage workflow automation, and vehicle inspection data platforms. I then developed mission operations software at the University of Arizona Space Institute. In March 2026 I returned to mining operations software, where I work with data scientists to turn pipelines into production applications and support cloud analytics platforms.

## Projects by career stage

| Career stage | Selected demonstration |
| --- | --- |
| Public-sector software and IT operations | [HR–ERP Integration Console](projects/09-employee-erp-integration/) |
| Teaching and quality assurance | [Excel Data Cleaning Lesson](projects/15-excel-data-cleaning-lesson/) |
| Mining systems and mortgage automation | [Copper Mine Operations Console](projects/17-copper-mine-operations/) |
| Vehicle inspection software and data platforms | [Inspection Warehouse Migration](projects/04-inspection-warehouse-migration/) |
| Stakeholder requirements and mission operations | [Satellite Operations Console](projects/02-trajectory-visualization/) |
| Production analytics and MLOps | [Inspection Duration Model Pipeline](projects/16-inspection-model-mlops/) |

The [project roadmap](ROADMAP.md) links all 17 demonstrations and explains how they relate to my experience and training. Each project uses a sample scenario and includes instructions for running or reviewing the demo. The [maintenance guide](docs/MAINTENANCE.md) explains how the site is built, translated and published.

## Continuous learning

Since 2019 I have completed 873 LinkedIn Learning courses and learning paths, with the strongest focus on AI, data, and leadership. The [learning record](LEARNING.md) groups them by skill area and links each area to the projects where I applied it. The professional course list is also available as a [CSV file](learning/linkedin-learning-completed.csv).

| Skill area | Completed |
| --- | ---: |
| AI & Generative AI | 123 |
| Machine Learning & Data Science | 39 |
| Data Engineering & Databases | 34 |
| Analytics, BI & Visualization | 53 |
| Software Engineering | 51 |
| Cloud, DevOps & Infrastructure | 37 |
| Business Analysis, Project & Product Delivery | 76 |
| Leadership, Communication & Teaching | 188 |

## Daily Data Lab

I publish one small interactive visualization a day, each on a different everyday topic, built with React and public data. The first one, [When is the best time to cross from Mexicali?](https://agespinoza.github.io/Portafolio/lab/#/day/1), combines live and historical wait times from U.S. Customs and Border Protection. The source code is in [daily-data-lab](daily-data-lab/).

## Portfolio website

[agespinoza.github.io/Portafolio](https://agespinoza.github.io/Portafolio/) presents my experience, applications, projects, and learning record on a single page. Its Applications section links to the live static demo and provides setup instructions for applications that need a local runtime or backend.

The site includes a responsive navigation menu and a manual language selector for English, Spanish, Japanese, Italian, French, Brazilian Portuguese, and Simplified Chinese. Daily Data Lab's contribution-style calendar uses the publication dates in [`assets/daily-data-lab-days.js`](assets/daily-data-lab-days.js), which is shared with the lab application.

To preview the portfolio locally, serve the repository root (the page uses JavaScript modules):

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## License

The source code is available under the [MIT License](LICENSE). My photo, biographical text, résumé, and learning record are not covered by the license and may not be reused without permission.

[Résumé](https://agespinoza.github.io/Portafolio/resume.html) · [LinkedIn](https://www.linkedin.com/in/achocoza)
