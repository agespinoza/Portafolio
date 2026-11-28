// Day 011 research questions, quality panel, sources, and references (shared layout in ../Research.tsx).
// DOIs checked against Crossref on 2026-11-28 and every abstract read (OpenAlex / Crossref / the open PDF). Claims tied
// to each: O'Rourke & Williamson (2009) abstract (1503 return, major impact of the Cape route on European spice
// markets); their NBER working paper (2005), open text, for the 1497–1499 first passage, Zheng He (1411; 1414–1422)
// and the 1496 Venice galleys (note 4, quoting Friedman 2005); Bulbeck et al. (1998) abstract; Gelderblom, de Jong &
// Jonker (2013) title and abstract; Miske (2025) abstract; Sasikumar (2021) abstract; Kourí (2004) abstract;
// Gaulier & Zignago (2010) abstract (CEPII PDF). Findlay & O'Rourke (2007) has no abstract online and is cited only for
// its subject. Pierre Poivre's 1770 transplant to Mauritius is omitted: no accessible source could be read.
import { makeTr } from "../tr.js";
import { QualityPanel, ResearchQuestions, SourcesAndReferences, type Question, type Reference, type Source } from "../Research";
import { MESSAGES_RESEARCH } from "./messages.research";

export const REFS: Reference[] = [
  { text: "FAO (2025). FAOSTAT: Crops and livestock products (QCL), bulk download of 23 December 2025. Food and Agriculture Organization of the United Nations, Rome. Licence: CC BY 4.0.", url: "https://www.fao.org/faostat/en/#data/QCL" },
  { text: "FAO (2026). FAOSTAT: Trade, crops and livestock products (TCL), and Detailed trade matrix (TM), bulk downloads of 23 July 2026 and 18 December 2025. Licence: CC BY 4.0.", url: "https://www.fao.org/faostat/en/#data/TM" },
  { text: "O'Rourke, K. H., & Williamson, J. G. (2009). Did Vasco da Gama matter for European markets? The Economic History Review, 62(3), 655–684.", doi: "10.1111/j.1468-0289.2009.00468.x" },
  { text: "O'Rourke, K. H., & Williamson, J. G. (2005). Did Vasco da Gama matter for European markets? Testing Frederick Lane's hypotheses fifty years later. NBER Working Paper 11884 (open text used for dates and the 1496 cargo).", doi: "10.3386/w11884" },
  { text: "Bulbeck, D., Reid, A., Tan, L. C., & Wu, Y. (1998). Southeast Asian Exports since the 14th Century: Cloves, Pepper, Coffee, and Sugar. Singapore: Institute of Southeast Asian Studies; Leiden: KITLV Press (Brill edition).", doi: "10.1163/9789004658288" },
  { text: "Findlay, R., & O'Rourke, K. H. (2007). Power and Plenty: Trade, War, and the World Economy in the Second Millennium. Princeton University Press.", doi: "10.1515/9781400831883" },
  { text: "Gaulier, G., & Zignago, S. (2010). BACI: International Trade Database at the Product-Level. The 1994–2007 Version. CEPII Working Paper 2010-23.", doi: "10.2139/ssrn.1994500" },
  { text: "Gelderblom, O., de Jong, A., & Jonker, J. (2013). The formative years of the modern corporation: The Dutch East India Company VOC, 1602–1623. The Journal of Economic History, 73(4), 1050–1076.", doi: "10.1017/S0022050713000879" },
  { text: "Miske, S. J. (2025). Colonisation and cultivation: Nutmeg production, labour and ecology on the Banda Islands before and after the conquest of 1621. Journal of Southeast Asian Studies, 56(1–2), 98–123.", doi: "10.1017/S0022463425100787" },
  { text: "Sasikumar, B. (2021). Nutmeg: origin, diversity, distribution and history. Journal of Spices and Aromatic Crops, 30(2), 131–141.", doi: "10.25081/josac.2021.v30.i2.7250" },
  { text: "Kourí, E. H. (2004). A Pueblo Divided: Business, Property, and Community in Papantla, Mexico. Stanford University Press.", doi: "10.1515/9781503618817" },
  { text: "U.S. Department of Justice & Federal Trade Commission (2010). Horizontal Merger Guidelines, section 5.3 (HHI bands).", url: "https://www.justice.gov/atr/horizontal-merger-guidelines-08192010" },
  { text: "Raasveldt, M., & Mühleisen, H. (2019). DuckDB: an embeddable analytical database. Proceedings of the 2019 International Conference on Management of Data (SIGMOD), 1981–1984.", doi: "10.1145/3299869.3320212" },
];
/** Short citations for the timeline, keyed as in scripts/day-011/history.json. */
export const CITES: Record<string, { short: string; doi?: string; url?: string }> = {
  orw2009: { short: "O'Rourke & Williamson 2009", doi: "10.1111/j.1468-0289.2009.00468.x" },
  orw2005: { short: "O'Rourke & Williamson 2005 (NBER WP 11884)", doi: "10.3386/w11884" },
  bulbeck1998: { short: "Bulbeck, Reid, Tan & Wu 1998", doi: "10.1163/9789004658288" },
  gelderblom2013: { short: "Gelderblom, de Jong & Jonker 2013", doi: "10.1017/S0022050713000879" },
  miske2025: { short: "Miske 2025", doi: "10.1017/S0022463425100787" },
  sasikumar2021: { short: "Sasikumar 2021", doi: "10.25081/josac.2021.v30.i2.7250" },
  kouri2004: { short: "Kourí 2004", doi: "10.1515/9781503618817" },
};

type V = Record<string, string | number>;
export const EN_RESEARCH: Record<string, string> = {
  title: "Six research questions",
  lead: "Each answer is tagged by where it comes from. FAOSTAT measures raw spices by weight and declared value; no correlation here is read as a cause.",
  q1: "Who grows the world's spices today, and how concentrated is supply?",
  a1: "In {y}, India grew {indChil} of dry chillies, {indSeed} of seed spices (cumin, coriander, fennel and others) and {indGin} of ginger; Indonesia {idnClove} of cloves; Madagascar {mdgVan} of vanilla; Viet Nam {vnmPep} of black pepper. By the 2010 US merger-guideline bands, {high} of the eight groups are highly concentrated (HHI above 2,500), led by seed spices ({seedH}) and cloves ({cloveH}); black pepper is the least concentrated ({pepH}).",
  q2: "How does today's map compare with the historic Spice Route?",
  a2: "The cores moved. In 1961, India, Malaysia and Indonesia, the old pepper coasts, grew {pep61} of the world's pepper; in {y} Viet Nam, India and Brazil grow {pep24}, and Viet Nam alone ships {vnmUsd} of it. Cloves came {clove61} from Madagascar and Tanzania in 1961 and are back in Indonesia ({idnClove}), which also imports them. Bulbeck et al. (1998) compiled the long export series that make cloves and pepper the backbone of Southeast Asia's precolonial trade; Miske (2025) describes the VOC's 1621 conquest of Banda to control nutmeg and mace.",
  q3: "Did the sea route round Africa change spice markets?",
  a3: "Yes, according to O'Rourke and Williamson (2009). Comparing pepper and fine-spice prices relative to inflation before and after 1503, the year Vasco da Gama returned from his second voyage, they find that the Voyages of Discovery had a major impact on European spice markets, and they separate monopoly and oligopoly effects of the Cape route. Their working paper quotes a 1496 cargo that reached Venice from Alexandria: 2 million kg of spices, 68% of them pepper.",
  q4: "Why does the world export more vanilla than it grows?",
  a4: "In {y}, countries reported {vx} t of vanilla exports against {vp} t of world production ({ratio}%). Importers such as {reex} sell vanilla on after curing, sorting or packing, so trade counts the same beans more than once; world exports and imports also differ by {gapMin} to {gapMax}% across spices because exports are valued FOB and imports CIF and some countries do not report. Gaulier and Zignago (2010) built BACI to reconcile exactly these mirror flows; this page keeps both sides and shows the gap.",
  q5: "How volatile are spice prices?",
  a5: "Very, for vanilla. Its world export unit value went from {v61} US$/kg in 1961 to a peak of {vpk} in {vpkY} and {v24} in {y}, in current dollars. Across spices in {y}, a kilogram of vanilla is worth about {x} kilograms of dry chillies ({chil} US$/kg). Unit values mix grades and forms, and nominal dollars are not deflated here, so read them as orders of magnitude.",
  q6: "Why did Mexico, vanilla's homeland, fall behind?",
  a6: "A hypothesis, not tested here. Mexico grew {mex61} of the world's vanilla in 1961 (second after Madagascar) and {mex24} in {y} ({mexT} t, third), but reported only {mexX} t of exports in {y} against {mexX0} t in 2000. In the late nineteenth century Papantla's vanilla boom reshaped its land and society (Kourí 2004). Domestic use and prices may play a part; FAOSTAT cannot separate the causes.",
  p1: "FAOSTAT QCL: {qn} country–spice production and area series for the eight items, {fy}–{y}; for every spice the country sum for {y} equals FAOSTAT's World row (the figure a web query returns) within 0.5%; \"China\" (code 351) is dropped because it repeats mainland China, Hong Kong, Macao and Taiwan.",
  p2: "In {y}, {off} of world spice tonnes are official figures; the rest are FAO estimates or imputations, including vanilla ({vanOff} official) and cinnamon ({cinOff}). Burkina Faso's pepper and Guatemala's cardamom are imputed or estimated.",
  p3: "FAOSTAT TCL: world exports and imports in {y} differ by {gapMin}% to {gapMax}% in tonnes across the eight spices (FOB vs CIF valuation, re-exports, non-reporting countries).",
  p4: "Detailed trade matrix: importer-reported flows only (reporter = importer). In {y} they cover {covMin}–{covMax}% of world import value by spice, from {rep} reporting countries; the map draws the 50 largest flows per spice and year.",
  p5: "Historical layer: {ev} events, each with one verified reference and the part of the source read (abstract, title or open text). Routes are schematic lines through the places named, not sailing tracks. Pierre Poivre's 1770 clove and nutmeg transplant to Mauritius was left out: no accessible source could be read.",
  d1: "DuckDB pipeline from the FAOSTAT bulk CSVs (11 GB) to Parquet tables dim_spice, dim_country, fact_production, fact_trade and fact_flows, plus one JSON, with checks against FAOSTAT's World row and the export/import gap.",
  d2: "HHI and top-three share of production for every spice and year since 1961; world export unit values.",
  d3: "Flow map of the 50 largest bilateral flows (2000, 2010, latest) with country nodes, a historical-routes layer and a cited timeline.",
  d4: "Spice and country profiles, a treemap of producers, exporter and importer rankings with grams per person, and a vanilla close-up for Mexico.",
  n1: "DuckDB-WASM in the browser: the JSON is 0.3 MB, so it is not needed today; it would allow free queries over all years of the trade matrix.",
  n2: "Reconciled flows (BACI, from UN Comtrade) for HS 0904–0910, to resolve the export/import mirror gap and include processed spices (ground, crushed).",
  n3: "Real prices: deflate unit values and separate grades (black vs white pepper, cassia vs true cinnamon, nutmeg vs cardamom).",
  n4: "Historical export series (Bulbeck et al. 1998) digitised year by year, to plot the 15th–18th centuries next to FAOSTAT.",
  srcQcl: "production and area, 8 spice items, every country, 1961–2024", srcTcl: "exports and imports, tonnes and US$", srcTm: "bilateral flows by partner, 1986–2024",
  srcWb: "region, capital coordinates, population", srcM49: "M49 → ISO3 country codes", srcHist: "cited historical events",
  limQcl: "raw spices only; 34% of 2024 tonnes estimated or imputed", limTcl: "FOB vs CIF; re-exports", limTm: "importer reports only here", limWb: "territories missing", limM49: "former states coded by hand", limHist: "schematic routes",
  useQcl: "used: KPIs, lines, HHI, treemap", useTcl: "used: KPIs, ranking, prices", useTm: "used: flow map", useWb: "used: map nodes, per person", useM49: "used: country join", useHist: "used: timeline, routes", useSql: "used: data pipeline", useHmg: "used: HHI bands",
};
const tr = makeTr("spicesResearch", MESSAGES_RESEARCH) as (language: string, key: string, fallback: string, values?: V) => string;
const T = (language: string, key: string, values?: V) => tr(language, key, EN_RESEARCH[key], values);

export function SpiceQuestions({ v, language }: { v: V; language: string }) {
  const tags: Question["tag"][] = ["data", "lit", "lit", "data", "data", "hyp"];
  const items: Question[] = tags.map((tag, i) => ({ q: T(language, `q${i + 1}`), a: T(language, `a${i + 1}`, v), tag }));
  return <ResearchQuestions title={T(language, "title")} lead={T(language, "lead")} items={items} language={language} />;
}

export function SpiceQuality({ v, language }: { v: V; language: string }) {
  return (
    <QualityPanel language={language}
      provenance={["p1", "p2", "p3", "p4", "p5"].map((k) => T(language, k, v))}
      done={["d1", "d2", "d3", "d4"].map((k) => T(language, k))}
      pending={["n1", "n2", "n3", "n4"].map((k) => T(language, k))} />
  );
}

export function SpiceSources({ checkedOn, language }: { checkedOn: string; language: string }) {
  const S = (k: string) => T(language, k);
  const sources: Source[] = [
    { inst: "FAO", title: "FAOSTAT: Crops and livestock products (QCL), bulk CSV", url: "https://www.fao.org/faostat/en/#data/QCL", pub: "2025-12-23", cover: S("srcQcl"), license: "CC BY 4.0", limits: S("limQcl"), use: S("useQcl") },
    { inst: "FAO", title: "FAOSTAT: Trade, crops and livestock products (TCL), bulk CSV", url: "https://www.fao.org/faostat/en/#data/TCL", pub: "2026-07-23", cover: S("srcTcl"), license: "CC BY 4.0", limits: S("limTcl"), use: S("useTcl") },
    { inst: "FAO", title: "FAOSTAT: Detailed trade matrix (TM), bulk CSV", url: "https://www.fao.org/faostat/en/#data/TM", pub: "2025-12-18", cover: S("srcTm"), license: "CC BY 4.0", limits: S("limTm"), use: S("useTm") },
    { inst: "World Bank", title: "World Development Indicators API: SP.POP.TOTL; country metadata", url: "https://datatopics.worldbank.org/world-development-indicators/", pub: "2026", cover: S("srcWb"), license: "CC BY 4.0", limits: S("limWb"), use: S("useWb") },
    { inst: "UN Statistics Division", title: "Standard country or area codes for statistical use (M49)", url: "https://unstats.un.org/unsd/methodology/m49/overview/", pub: "2026", cover: S("srcM49"), license: "© United Nations", limits: S("limM49"), use: S("useM49") },
    { inst: "This page", title: "scripts/day-011/history.json (events with their references)", url: "https://github.com/agespinoza/Portafolio/blob/main/daily-data-lab/scripts/day-011/history.json", pub: "2026-11-28", cover: S("srcHist"), license: "MIT", limits: S("limHist"), use: S("useHist") },
    { inst: "US DOJ & FTC", title: "Horizontal Merger Guidelines (2010)", url: "https://www.justice.gov/atr/horizontal-merger-guidelines-08192010", pub: "2010", cover: "—", license: "US public domain", limits: "—", use: S("useHmg") },
    { inst: "DuckDB Foundation", title: "DuckDB 1.4", url: "https://duckdb.org/", pub: "2025", cover: "—", license: "MIT", limits: "—", use: S("useSql") },
  ];
  return <SourcesAndReferences sources={sources} refs={REFS} checkedOn={checkedOn} language={language} />;
}
