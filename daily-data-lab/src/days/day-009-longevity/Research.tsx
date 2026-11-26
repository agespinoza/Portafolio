// Day 009 research questions, quality panel, sources, and references (shared layout in ../Research.tsx).
// DOIs checked against Crossref and doi.org on 2026-11-26. Abstracts read (Crossref, PubMed, bioRxiv) or, for the two
// Vienna Yearbook papers, the full text; Oeppen & Vaupel (2002) and Preston (1975) have no abstract and are cited only
// for their central, widely reported result.
import { makeTr } from "../tr.js";
import { QualityPanel, ResearchQuestions, SourcesAndReferences, type Question, type Reference, type Source } from "../Research";
import { MESSAGES_RESEARCH } from "./messages.research";

export const REFS: Reference[] = [
  { text: "Oeppen, J., & Vaupel, J. W. (2002). Broken limits to life expectancy. Science, 296(5570), 1029–1031.", doi: "10.1126/science.1069675" },
  { text: "Preston, S. H. (1975). The changing relation between mortality and level of economic development. Population Studies, 29(2), 231–248.", doi: "10.1080/00324728.1975.10410201" },
  { text: "Poulain, M., Pes, G. M., Grasland, C., Carru, C., Ferrucci, L., Baggio, G., Franceschi, C., & Deiana, L. (2004). Identification of a geographic area characterized by extreme longevity in the Sardinia island: the AKEA study. Experimental Gerontology, 39(9), 1423–1429.", doi: "10.1016/j.exger.2004.06.016" },
  { text: "Willcox, B. J., Willcox, D. C., Todoriki, H., Fujiyoshi, A., Yano, K., He, Q., Curb, J. D., & Suzuki, M. (2007). Caloric restriction, the traditional Okinawan diet, and healthy aging. Annals of the New York Academy of Sciences, 1114, 434–455.", doi: "10.1196/annals.1396.037" },
  { text: "Rosero-Bixby, L. (2008). The exceptionally high life expectancy of Costa Rican nonagenarians. Demography, 45(3), 673–691.", doi: "10.1353/dem.0.0011" },
  { text: "Poulain, M., Herm, A., & Pes, G. (2013). The Blue Zones: areas of exceptional longevity around the world. Vienna Yearbook of Population Research, 11, 87–108.", doi: "10.1553/populationyearbook2013s87" },
  { text: "Rosero-Bixby, L., Dow, W. H., & Rehkopf, D. H. (2013). The Nicoya region of Costa Rica: a high longevity island for elderly males. Vienna Yearbook of Population Research, 11, 109–136.", doi: "10.1553/populationyearbook2013s109" },
  { text: "Panagiotakos, D. B., Chrysohoou, C., Siasos, G., Zisimos, K., Skoumas, J., Pitsavos, C., & Stefanadis, C. (2011). Sociodemographic and lifestyle statistics of oldest old people (>80 years) living in Ikaria island: the Ikaria study. Cardiology Research and Practice, 2011, 679187.", doi: "10.4061/2011/679187" },
  { text: "Fraser, G. E., & Shavlik, D. J. (2001). Ten years of life: is it a matter of choice? Archives of Internal Medicine, 161(13), 1645–1652.", doi: "10.1001/archinte.161.13.1645" },
  { text: "Newman, S. J. (2024). Supercentenarian and remarkable age records exhibit patterns indicative of clerical errors and pension fraud. bioRxiv 704080, version 3 (14 March 2024; first posted 2019, version 4 on 3 November 2025). Preprint, not peer reviewed.", doi: "10.1101/704080" },
  { text: "Austad, S. N., & Pes, G. M. (2025). The validity of Blue Zones demography: a response to critiques. The Gerontologist, 65(12), gnaf246.", doi: "10.1093/geront/gnaf246" },
  { text: "Raasveldt, M., & Mühleisen, H. (2019). DuckDB: an embeddable analytical database. Proceedings of the 2019 International Conference on Management of Data (SIGMOD), 1981–1984.", doi: "10.1145/3299869.3320212" },
];

type V = Record<string, string | number>;
export const EN_RESEARCH: Record<string, string> = {
  title: "Six research questions",
  lead: "Each answer is tagged by where it comes from. Country averages describe populations, not individuals, and no correlation here is read as a cause.",
  q1: "Where do people live longest and healthiest?",
  a1: "{top} has the highest healthy life expectancy (HALE) in {y}, {topV} years, and {e0top} has the highest life expectancy, {e0V}. But WHO's 95% uncertainty intervals for the top ten HALE countries all overlap the leader's ({lo}–{hi}), so the order among them is not established by this data.",
  q2: "Do more years of life mean more healthy years?",
  a2: "Mostly yes, but not one for one. Across {n} countries, years in less than full health rise with life expectancy (r = {r}); they range from {min} ({minC}) to {max} ({maxC}). Living longer adds healthy years and also years with illness or disability.",
  q3: "How much does income explain? (the Preston curve)",
  a3: "Preston (1975) described life expectancy rising steeply with income in poor countries and flattening in rich ones. On a log scale, GDP per person explains {r2} of the variation in HALE across {n} countries: ten times the income goes with {b} more healthy years. The residuals matter: {usa} is {usaR} years below the line, {jpn} {jpnR} above and {cri} {criR} above.",
  q4: "Do blue zones survive age validation?",
  a4: "Disputed. Newman (2024, a preprint) finds that in the United States supercentenarian records fall 69–82% once birth certificates are introduced, and that the Sardinian, Okinawan and Ikarian blue zones have low incomes and short life expectancy relative to their national averages, which he reads as a sign of error and fraud. Austad & Pes (2025) reply that blue-zone ages were validated by cross-checking several independent documents and that the data are valid. Even the original studies rate the evidence unevenly: strongest in Sardinia, weakest in Ikaria, and not proven for Nicoya by census survival (Poulain, Herm & Pes 2013), although a follow-up of 16,300 elderly Costa Ricans found death rates 20% lower for Nicoyan men (Rosero-Bixby, Dow & Rehkopf 2013). Country averages on this page cannot settle the question.",
  q5: "Is there a ceiling to life expectancy?",
  a5: "Oeppen & Vaupel (2002) showed that record female life expectancy rose almost linearly for 160 years and broke every proposed limit. In WPP 2024, the highest female life expectancy of any country with a million people rose {s} months per year from 1950 to 2023 (R² {r2rec}, excluding 2020–2022), from {r0} ({c0}, 1950) to {r1} ({c1}, {y}).",
  q6: "Why does the female advantage vary so much?",
  a6: "Women outlive men in every country here, by {sMin} years ({sMinC}) to {sMax} ({sMaxC}); the world gap is {w}. A hypothesis, not tested here: large gaps track male-specific risks such as smoking, alcohol, violence and war, and small gaps high maternal mortality.",
  p1: "UN WPP 2024 world life expectancy: {e0} in {y} (published 73.2) and {e24} in 2024 (published 73.3); the build stops otherwise. Every one of {n} countries and areas is kept.",
  p2: "WHO GHO {y}: global HALE {hale} (95% UI {lo}–{hi}) and life expectancy {le}; the build stops unless both match. {nh} countries have HALE; their population-weighted mean with WPP populations is {hw}, because WHO weights with its own population estimates.",
  p3: "UN and WHO life expectancies differ by {d} years on average across the {nh} countries (largest: {maxC}, {max} years), so HALE is compared only with WHO's own life expectancy.",
  p4: "World Bank WDI: GDP per person (PPP, constant 2021 $) for {g} countries ({g22} use 2022) and health spending for {h} ({h21} use 2021).",
  p5: "Centenarians are WPP model estimates for the open age group 100+, not registered counts: {c} worldwide in {y}, against {c0} in 2000.",
  d1: "DuckDB pipeline from WPP 2024 CSVs, the WHO GHO OData API and the World Bank API to one JSON.",
  d2: "Checks against published world figures (WPP and WHO) and a population-weighted reconstruction of global HALE.",
  d3: "Region and country filters recompute KPIs, rankings, scatter highlights and facts; every country is listed, none cut.",
  d4: "WHO's 95% uncertainty intervals drawn for every HALE value; small populations faded and ranked apart for centenarians.",
  d5: "Blue zones transcribed only from the cited papers, with both sides of the age-validation debate.",
  n1: "Sub-national life tables for the blue-zone areas (national statistical offices), to compare the zones with their own countries today.",
  n2: "Validated supercentenarian databases, to test Newman's predictors with age-verified cases only.",
  n3: "HALE by sex and its trend since 2000, to see whether healthy years grew as fast as total years.",
  n4: "Human Mortality Database cohort tables, to compare cohorts instead of period life expectancy.",
  srcWpp: "e0 by sex 1950–2023; population by age (100+)", srcWho: "HALE and life expectancy 2000–2023, with intervals", srcWb: "region; GDP per person (PPP); health spending",
  srcLit: "blue-zone measures and the validation debate",
  limWpp: "modelled estimates; open age group 100+", limWho: "member states only; modelled, wide intervals", limWb: "income and spending missing for some territories",
  limLit: "regional, older cohorts; not comparable with country data",
  useWpp: "used: e0, trends, centenarians, populations", useWho: "used: HALE, gap, uncertainty", useWb: "used: regions, scatters", useLit: "used: blue-zones table, debate", useSql: "used: data pipeline",
};
const tr = makeTr("longevityResearch", MESSAGES_RESEARCH) as (language: string, key: string, fallback: string, values?: V) => string;
const T = (language: string, key: string, values?: V) => tr(language, key, EN_RESEARCH[key], values);

export function LongevityQuestions({ v, language }: { v: V; language: string }) {
  const tags: Question["tag"][] = ["data", "data", "lit", "lit", "lit", "hyp"];
  const items: Question[] = tags.map((tag, i) => ({ q: T(language, `q${i + 1}`), a: T(language, `a${i + 1}`, v), tag }));
  return <ResearchQuestions title={T(language, "title")} lead={T(language, "lead")} items={items} language={language} />;
}

export function LongevityQuality({ v, language }: { v: V; language: string }) {
  return (
    <QualityPanel language={language}
      provenance={["p1", "p2", "p3", "p4", "p5"].map((k) => T(language, k, v))}
      done={["d1", "d2", "d3", "d4", "d5"].map((k) => T(language, k))}
      pending={["n1", "n2", "n3", "n4"].map((k) => T(language, k))} />
  );
}

export function LongevitySources({ checkedOn, language }: { checkedOn: string; language: string }) {
  const S = (k: string) => T(language, k);
  const sources: Source[] = [
    { inst: "UN DESA, Population Division", title: "World Population Prospects 2024 (CSV, medium variant)", url: "https://population.un.org/wpp/", pub: "2024", cover: S("srcWpp"), license: "CC BY 3.0 IGO", limits: S("limWpp"), use: S("useWpp") },
    { inst: "World Health Organization", title: "Global Health Observatory: WHOSIS_000002 (HALE) and WHOSIS_000001 (life expectancy)", url: "https://www.who.int/data/gho/data/indicators/indicator-details/GHO/gho-ghe-hale-healthy-life-expectancy-at-birth", pub: "2026", cover: S("srcWho"), license: "CC BY-NC-SA 3.0 IGO", limits: S("limWho"), use: S("useWho") },
    { inst: "World Bank", title: "World Development Indicators: NY.GDP.PCAP.PP.KD, SH.XPD.CHEX.GD.ZS", url: "https://datatopics.worldbank.org/world-development-indicators/", pub: "2026-11-11", cover: S("srcWb"), license: "CC BY 4.0", limits: S("limWb"), use: S("useWb") },
    { inst: "Vienna Yearbook of Population Research", title: "Poulain, Herm & Pes (2013); Rosero-Bixby, Dow & Rehkopf (2013)", url: "https://doi.org/10.1553/populationyearbook2013s87", pub: "2013", cover: S("srcLit"), license: "open access", limits: S("limLit"), use: S("useLit") },
    { inst: "DuckDB Foundation", title: "DuckDB 1.4", url: "https://duckdb.org/", pub: "2025", cover: "—", license: "MIT", limits: "—", use: S("useSql") },
  ];
  return <SourcesAndReferences sources={sources} refs={REFS} checkedOn={checkedOn} language={language} />;
}
