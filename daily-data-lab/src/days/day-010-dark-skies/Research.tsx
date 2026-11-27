// Day 010 research questions, quality panel, sources, and references (shared layout in ../Research.tsx).
// DOIs checked against Crossref (papers) and DataCite (the GFZ dataset) on 2026-11-27, and every abstract read. Hölker et al.
// (2010) is a one-page letter with no abstract and is cited only for its title claim. The 9.6% a year, the Europe and North
// America rates and the 250 → 100 stars example of Kyba et al. (2023) are in the paper's text, not its abstract; they were
// checked in two news reports of the paper (Science News, Scientific American), listed in the sources table.
import { makeTr } from "../tr.js";
import { QualityPanel, ResearchQuestions, SourcesAndReferences, type Question, type Reference, type Source } from "../Research";
import { MESSAGES_RESEARCH } from "./messages.research";

export const REFS: Reference[] = [
  { text: "Falchi, F., Cinzano, P., Duriscoe, D., Kyba, C. C. M., Elvidge, C. D., Baugh, K., Portnov, B. A., Rybnikova, N. A., & Furgoni, R. (2016). The new world atlas of artificial night sky brightness. Science Advances, 2(6), e1600377.", doi: "10.1126/sciadv.1600377" },
  { text: "Falchi, F., Cinzano, P., Duriscoe, D., Kyba, C. C. M., Elvidge, C. D., Baugh, K., Portnov, B., Rybnikova, N. A., & Furgoni, R. (2016). Supplement to: The New World Atlas of Artificial Night Sky Brightness. GFZ Data Services (dataset, CC BY-NC 4.0).", doi: "10.5880/GFZ.1.4.2016.001" },
  { text: "Kyba, C. C. M., Kuester, T., Sánchez de Miguel, A., Baugh, K., Jechow, A., Hölker, F., Bennie, J., Elvidge, C. D., Gaston, K. J., & Guanter, L. (2017). Artificially lit surface of Earth at night increasing in radiance and extent. Science Advances, 3(11), e1701528.", doi: "10.1126/sciadv.1701528" },
  { text: "Kyba, C. C. M., Altıntaş, Y. Ö., Walker, C. E., & Newhouse, M. (2023). Citizen scientists report global rapid reductions in the visibility of stars from 2011 to 2022. Science, 379(6629), 265–268.", doi: "10.1126/science.abq7781" },
  { text: "Gaston, K. J., Bennie, J., Davies, T. W., & Hopkins, J. (2013). The ecological impacts of nighttime light pollution: a mechanistic appraisal. Biological Reviews, 88(4), 912–927.", doi: "10.1111/brv.12036" },
  { text: "Hölker, F., Wolter, C., Perkin, E. K., & Tockner, K. (2010). Light pollution as a biodiversity threat. Trends in Ecology & Evolution, 25(12), 681–682.", doi: "10.1016/j.tree.2010.09.007" },
  { text: "Vrandečić, D., & Krötzsch, M. (2014). Wikidata: a free collaborative knowledgebase. Communications of the ACM, 57(10), 78–85.", doi: "10.1145/2629489" },
  { text: "Raasveldt, M., & Mühleisen, H. (2019). DuckDB: an embeddable analytical database. Proceedings of the 2019 International Conference on Management of Data (SIGMOD), 1981–1984.", doi: "10.1145/3299869.3320212" },
];

type V = Record<string, string | number>;
export const EN_RESEARCH: Record<string, string> = {
  title: "Six research questions",
  lead: "Each answer is tagged by where it comes from. Country shares describe where people live, not what any one person sees, and no correlation here is read as a cause.",
  q1: "How many people have lost the night sky?",
  a1: "In the 2015 atlas, {polluted} of the world's people live under light-polluted skies (more than 14 μcd/m² of artificial light, 8% above natural) and {noMw} cannot see the Milky Way from home: about {pPol} and {pNoMw} with the World Bank's {y} population. In the United States the shares are {usPol} and {usNoMw}; in Mexico {mxPol} and {mxNoMw} (Falchi et al. 2016).",
  q2: "How fast are the stars disappearing?",
  a2: "Faster than satellites show. Kyba et al. (2023) used {obs} Globe at Night reports from 2011–2022: the loss of visible stars matches a sky brightening of 7–10% a year ({k}% in their central estimate; {eu}% in Europe, {na}% in North America). Satellites recorded about 2% a year: the lit area of Earth and the radiance of lit areas each grew 2.2% a year in 2012–2016 (Kyba et al. 2017). The authors ascribe the gap to changes in the light's spectrum, which the satellite sensor does not see well, and in the angle at which light leaves the ground.",
  q3: "Does this page's own reading of Globe at Night agree?",
  a3: "Roughly, once the changing observers are taken into account. The yearly mean limiting magnitude barely moves ({m0} in 2011, {m1} in 2022) because reports shifted to darker places: the median atlas brightness at observers' sites fell from {b0} to {b1} mcd/m². Comparing reports within the same 1° cell and constellation, limiting magnitude fell {s} magnitudes a year in 2011–2022 (95% CI {lo} to {hi}, {g} groups). Through a cross-sectional calibration on the atlas, that is about {p}% brighter skies a year (95% CI {plo}–{phi}%), inside Kyba's 7–10%. The calibration is weak (R² {r2}), so read it as a consistency check, not a new estimate.",
  q4: "Where are dark skies protected?",
  a4: "DarkSky International reports {dsP} certified places in {dsC} countries covering about {dsKm} km² ({dsY}). Wikidata lists {wP} of them in {wC} countries, {us} in the United States and none in Mexico. Protection is not the same as darkness: at their Wikidata coordinate, {polPct} of the listed places sit under skies the atlas calls light-polluted (more than 14 μcd/m²), including {ck} of {cn} communities (median {comm} μcd/m²) and {pk} of {pn} parks (median {park} μcd/m²). One coordinate per place is a crude test: large parks and reserves contain darker and brighter corners.",
  q5: "Why does it matter beyond astronomy?",
  a5: "Gaston et al. (2013) describe artificial light as changing natural light regimes in space, in time and across wavelengths, and organisms use light both as a resource and as a source of information, so night lighting can disrupt behaviour, resource use and the structure of ecosystems. Hölker et al. (2010) argued that light pollution should be treated as a threat to biodiversity. This page has no ecological data; the map shows where those pressures would be largest.",
  q6: "Why does Arizona have so many certified places and Sonora none?",
  a6: "A hypothesis, not tested here. Inside the 118–106°W, 26–38°N window, Wikidata lists {azP} certified places, all on the US side, starting with Flagstaff, the first International Dark Sky Community ({y0}). Globe at Night has {az} usable reports from Arizona and {son} from northern Sonora, both with a median limiting magnitude of {med}, so the skies people report are similar; the difference may lie in lighting ordinances, observatories and tourism rather than in the sky itself. Sonora's reports are too few to compare trends.",
  p1: "Falchi et al. (2016), Table 2: {rows} rows (every country and territory, plus the world and the EU). The build stops unless the world row matches the paper's text ({pol}% polluted, {mw}% without the Milky Way, {area}% of land); weighting {k} country rows by World Bank {y} population gives {rpol}% and {rmw}%. The paper prints “2” for the world's land above 3000 μcd/m², more than the 1.2 above 688: treated as a misprint and left empty.",
  p2: "Globe at Night 2011–2025: {total} reports, {gan} naked-eye. Dropped: {lm0} with limiting magnitude 0 (no chart matched), {miss} with none recorded, {cloudy} with more than a quarter of the sky cloudy, {zero} at 0°, 0°. Kept: {kept}; {atlas} fall inside the atlas.",
  p3: "Reports of limiting magnitude 0 jumped from under 1% of clear-sky reports to {lm0late} in 2023–2025, so they are excluded every year. The median atlas brightness at observers' sites fell from {b0} (2011) to {b1} mcd/m² (2022): raw yearly means mix sky change with where people observe.",
  p4: "Wikidata: {n} certified places, {coords} with coordinates, {years} with a certification year (latest {last}; only {recent} after 2021) and {areas} with an area (sum {km} km², against about {dsKm} reported by DarkSky). The 259 / 196,000 km² / 25 countries are DarkSky's published totals, quoted as published.",
  p5: "Atlas raster: 43,200 × 17,406 cells of 30″ averaged to 1′ for point samples and the Arizona–Sonora view, and to 0.1° for the world image. Check points: Phoenix {phx}, Tucson {tuc}, Hermosillo {her}, Kitt Peak {kp} mcd/m² of artificial light.",
  d1: "DuckDB pipeline from Falchi's Table 2 (open XML), Globe at Night CSVs, Wikidata SPARQL and the World Bank API to Parquet tables and one JSON, with checks against the paper.",
  d2: "World Atlas 2015 GeoTIFF processed with rasterio: block averages, the page's Equal Earth projection, palette PNGs (world and Arizona–Sonora), and samples at every place and report.",
  d3: "Globe at Night trend within 1° cell × constellation groups, with a 1,000-draw bootstrap over groups, separating sky change from changes in who reports.",
  d4: "Region, country, place-type, layer and map-view filters; every country listed and sortable; profiles for countries and places.",
  d5: "Star-loss simulator calibrated on the published 250 → 100 example, with satellite, regional and global rates.",
  n1: "DarkSky International's own list of 259 places: darksky.org blocks automated requests, so the 124 places missing from Wikidata (including any in Mexico) are not mapped.",
  n2: "Satellite radiance change per country since 2015 (VIIRS), to set the atlas against a decade of growth.",
  n3: "Kyba et al.'s full model (natural sky, Moon, observer and constellation effects) and Sky Quality Meter readings, for a proper estimate rather than a consistency check.",
  n4: "Ecological data (insects, birds, sea turtles) and health data, to move from where the sky is bright to who is affected.",
  srcFalchi: "% of people and land under six brightness levels, every country", srcAtlas: "artificial zenith brightness, 30″ grid, 2015",
  srcGan: "naked-eye limiting magnitude, 2011–2025", srcWd: "certified International Dark Sky Places", srcWb: "population 2015; regions",
  srcDs: "official totals (places, km², countries)", srcNews: "figures in the text of Kyba et al. 2023",
  limFalchi: "model calibrated on 2014–2015 data; no trend", limAtlas: "VIIRS does not see blue LED light well", limGan: "observers move and change; reported, not measured",
  limWd: "135 of 259 places; few after 2021", limWb: "territories missing", limDs: "not downloadable here; quoted", limNews: "secondary sources",
  useFalchi: "used: KPIs, stacked bars, ranking", useAtlas: "used: map images, samples", useGan: "used: star-loss chart, trend, map squares",
  useWd: "used: map, certifications, types", useWb: "used: people counts, regions", useDs: "used: headline totals", useNews: "used: rate comparison, simulator", useSql: "used: data pipeline",
};
const tr = makeTr("darkskyResearch", MESSAGES_RESEARCH) as (language: string, key: string, fallback: string, values?: V) => string;
const T = (language: string, key: string, values?: V) => tr(language, key, EN_RESEARCH[key], values);

export function DarkSkyQuestions({ v, language }: { v: V; language: string }) {
  const tags: Question["tag"][] = ["data", "lit", "data", "data", "lit", "hyp"];
  const items: Question[] = tags.map((tag, i) => ({ q: T(language, `q${i + 1}`), a: T(language, `a${i + 1}`, v), tag }));
  return <ResearchQuestions title={T(language, "title")} lead={T(language, "lead")} items={items} language={language} />;
}

export function DarkSkyQuality({ v, language }: { v: V; language: string }) {
  return (
    <QualityPanel language={language}
      provenance={["p1", "p2", "p3", "p4", "p5"].map((k) => T(language, k, v))}
      done={["d1", "d2", "d3", "d4", "d5"].map((k) => T(language, k))}
      pending={["n1", "n2", "n3", "n4"].map((k) => T(language, k))} />
  );
}

export function DarkSkySources({ checkedOn, language }: { checkedOn: string; language: string }) {
  const S = (k: string) => T(language, k);
  const sources: Source[] = [
    { inst: "ISTIL, NOAA, NPS, GFZ et al. (Science Advances)", title: "Falchi et al. (2016), Table 2, via Europe PMC open full text", url: "https://europepmc.org/article/PMC/PMC4928945", pub: "2016", cover: S("srcFalchi"), license: "CC BY-NC 4.0", limits: S("limFalchi"), use: S("useFalchi") },
    { inst: "GFZ Data Services", title: "World Atlas 2015 GeoTIFF (World_Atlas_2015.zip, 653 MB)", url: "https://doi.org/10.5880/GFZ.1.4.2016.001", pub: "2016 (v1.1)", cover: S("srcAtlas"), license: "CC BY-NC 4.0", limits: S("limAtlas"), use: S("useAtlas") },
    { inst: "NSF NOIRLab", title: "Globe at Night: maps and data (yearly CSV)", url: "https://globeatnight.org/maps-data/", pub: "2011–2025", cover: S("srcGan"), license: "CC BY 4.0", limits: S("limGan"), use: S("useGan") },
    { inst: "Wikimedia Foundation", title: "Wikidata Query Service (P1435 / P31: International Dark Sky Park, Reserve, Sanctuary, Community)", url: "https://query.wikidata.org/", pub: "2026-11-27", cover: S("srcWd"), license: "CC0", limits: S("limWd"), use: S("useWd") },
    { inst: "World Bank", title: "World Development Indicators: SP.POP.TOTL; country metadata", url: "https://datatopics.worldbank.org/world-development-indicators/", pub: "2026", cover: S("srcWb"), license: "CC BY 4.0", limits: S("limWb"), use: S("useWb") },
    { inst: "DarkSky International", title: "2025 Impact Report (link not machine-checked: the site blocks automated requests)", url: "https://darksky.org/app/uploads/2026/09/2025-Impact-Report-1.pdf", pub: "2026", cover: S("srcDs"), license: "© DarkSky International", limits: S("limDs"), use: S("useDs") },
    { inst: "Science News; Scientific American", title: "Reports on Kyba et al. (2023): 9.6% a year, Europe 6.5%, North America 10.4%, 250 → 100 stars", url: "https://www.sciencenews.org/article/light-pollution-night-sky-bright-citizen-science", pub: "2023", cover: S("srcNews"), license: "©", limits: S("limNews"), use: S("useNews") },
    { inst: "DuckDB Foundation", title: "DuckDB 1.4", url: "https://duckdb.org/", pub: "2025", cover: "—", license: "MIT", limits: "—", use: S("useSql") },
  ];
  return <SourcesAndReferences sources={sources} refs={REFS} checkedOn={checkedOn} language={language} />;
}
