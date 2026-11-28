// Data download for each day: the tables behind the page, as typed Excel sheets built in the browser (src/xlsx.ts).
// A new day adds one entry to EXPORTS that returns its tables from the same data module the page uses; nothing is
// stored in the repository and the file always matches the page's current data.
import type { Sheet } from "./xlsx";
import BORDER from "./days/day-001-border/snapshot.json";
import { CROSSINGS, DAY_NAMES, MONTHS } from "./days/day-001-border/api.js";
import GLOW from "./days/day-002-glowworms/snapshot.json";
import { EFFORT, EFFORT_ISLAND, SIGHTINGS } from "./days/day-002-glowworms/api.js";
import { CSV_COLUMNS, OBS, flat } from "./days/day-003-light-pillars/data";
import { LAKES, LAKETEMP, SERIES, TRENDS, ICE_BY_LAT } from "./days/day-004-abraham-lake/data";
import { AES_LABEL, FAMILIES, LANGUAGES, MACROAREAS, MED_LABEL, isEndangered, isLiving, isPriority } from "./days/day-005-endangered-languages/data";
import { BY_INCOME, BY_REGION, BY_SECTOR, COUNTRIES, FLI } from "./days/day-006-food-waste/data";
import { CAUSES, CLASSES, CUBES, ORBITS, OWNERS, PARENTS, RCS_CLASSES } from "./days/day-007-space-debris/data";
import { BLUE_ZONES, COUNTRIES as LONG_COUNTRIES, RECORD, REGIONS as LONG_REGIONS, TREND, TREND_KEYS, prestonResidual } from "./days/day-009-longevity/data";
import { COUNTRIES as SKY_COUNTRIES, GAN, PLACES as SKY_PLACES, WORLD as SKY_WORLD, bands as skyBands, people as skyPeople } from "./days/day-010-dark-skies/data";
import { BY_ISO as SP_ISO, CHECKS as SP_CHECKS, COUNTRIES as SP_COUNTRIES, EVENTS as SP_EVENTS, FLOWS as SP_FLOWS, FLOW_YEARS as SP_FLOW_YEARS, PROD as SP_PROD, PROD_FLAG as SP_FLAG, SPICES as SP_SPICES, TRADE as SP_TRADE, WORLD as SP_WORLD, YEARS as SP_YEARS, yi as spYi } from "./days/day-011-spices/data";
import { CENTRES, COUNTRIES as SEED_COUNTRIES, CROPS_BY_CONTINENT, CUMULATIVE, DEPOSITORS, EVENTS, GENERA, ORIGIN, TREND as SEED_TREND, WIEWS_CENTRES, backupShare } from "./days/day-008-seed-banks/data";

type Rows = Sheet["rows"];
const sheet = (name: string, columns: string[], rows: Rows): Sheet => ({ name, columns, rows });

export const EXPORTS: Record<string, () => Sheet[]> = {
  "border-wait-times": () => {
    const name = Object.fromEntries(CROSSINGS.map((c) => [c.id, c.name]));
    const rows: Rows = [];
    for (const [port, months] of Object.entries((BORDER as { historical: Record<string, Record<string, number[][]>> }).historical)) {
      for (const [m, recs] of Object.entries(months)) {
        for (const [d, h, car, sentri, ready, ped] of recs) rows.push([name[port] ?? port, port, Number(m), MONTHS[Number(m) - 1], d, DAY_NAMES[d], h, car, sentri, ready, ped]);
      }
    }
    return [sheet("Waits", ["Crossing", "Port ID", "Month", "Month name", "Weekday (0=Mon)", "Weekday", "Hour (Pacific)", "Car standard min", "Car SENTRI min", "Car Ready Lane min", "Pedestrian min"], rows)];
  },

  "waitomo-glowworms": () => {
    const g = GLOW as { climate: { months: Record<string, number>[] } };
    return [
      sheet("Records", ["Latitude", "Longitude", "Year", "Month", "Region", "Island", "Source"],
        SIGHTINGS.map((s) => [s.lat, s.lon, s.year, s.month, s.region, s.island, s.source])),
      sheet("Effort by region", ["Region", "Island", "iNaturalist observations (all species)"],
        Object.entries(EFFORT).map(([r, e]) => [r, EFFORT_ISLAND[r] ?? "", (e as { total: number }).total])),
      sheet("Effort by month", ["Region", "Month", "Observations"],
        Object.entries(EFFORT).flatMap(([r, e]) => Object.entries((e as { month: Record<string, number> }).month).map(([m, n]) => [r, Number(m), n]))),
      sheet("Effort by year", ["Region", "Year", "Observations"],
        Object.entries(EFFORT).flatMap(([r, e]) => Object.entries((e as { year: Record<string, number> }).year).map(([y, n]) => [r, Number(y), n]))),
      sheet("Climate Waitomo", ["Month", "Mean high C", "Mean low C", "Hottest day C", "Coldest day C", "Humidity pct", "Rain mm"],
        g.climate.months.map((m) => [m.month, m.high, m.low, m.max, m.min, m.humidity, m.rain])),
    ];
  },

  "light-pillars": () => [sheet("Photos", CSV_COLUMNS, OBS.map((o) => flat(o) as Rows[number]))],

  "abraham-lake": () => {
    const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const name = (id: number) => LAKES.find((l) => l.id === id)?.name ?? `Lake #${id}`;
    return [
      sheet("Lakes", ["Lake ID", "Name", "Country", "Latitude", "Longitude", "Area km2", "Depth m", "Reservoir", "Elevation m", "Volume mcm",
        "LakeTEMP obs", "Water mean C", "Open-water mean C", "Water max C", "Ice days", "Ice start doy", "Ice end doy", ...MON.map((m) => `Water ${m} C`)],
      LAKES.map((l) => {
        const t = LAKETEMP.get(l.id);
        return [l.id, l.name, l.country, l.lat, l.lon, l.area, l.depth, l.reservoir ? 1 : 0, l.elevation, l.volume,
          t?.nObs, t?.yearMean, t?.openMean, t?.yearMax, t?.iceDays, t?.iceStart, t?.iceEnd, ...MON.map((_, i) => t?.months[i] ?? null)];
      })),
      sheet("Winter trends", ["Lake ID", "Name", "First winter", "Last winter", "Winters", "Winter mean C", "Slope C per decade", "Intercept", "R2", "Slope SE"],
        [...TRENDS.entries()].map(([id, t]) => [id, name(id), t.first, t.last, t.winters, t.mean, t.slope, t.intercept, t.r2, t.se])),
      sheet("Winter means", ["Lake ID", "Name", "Winter (year of January)", "Dec-Feb mean C"],
        [...SERIES.entries()].flatMap(([id, s]) => s.map(([w, m]) => [id, name(id), w, m]))),
      sheet("Ice by latitude", ["Latitude band", "Lakes", "Ice days P25", "Ice days median", "Ice days P75", "Open-water mean C"], ICE_BY_LAT.map((r) => [...r])),
    ];
  },

  "endangered-languages": () => [
    sheet("Languages", ["Glottocode", "Name", "Family", "Macroarea", "Latitude", "Longitude", "ISO 639-3", "Countries", "AES code", "AES status",
      "MED code", "MED level", "MED year", "First description year", "In Grambank", "In WALS", "Living", "Endangered", "Priority"],
    LANGUAGES.map((l) => [l.code, l.name, l.family >= 0 ? FAMILIES[l.family].name : "Isolate", l.macro >= 0 ? MACROAREAS[l.macro] : "",
      l.lat, l.lon, l.iso, l.countries.join(";"), l.aes, AES_LABEL[l.aes][1], l.med, MED_LABEL[l.med][1], l.medYear, l.firstYear,
      l.grambank ? 1 : 0, l.wals ? 1 : 0, isLiving(l) ? 1 : 0, isEndangered(l) ? 1 : 0, isPriority(l) ? 1 : 0])),
  ],

  "food-waste": () => {
    const group = (gs: typeof BY_REGION) => gs.map((g) => [g.key, g.countries, g.pop, g.householdT, g.foodServiceT, g.retailT, g.totalT, g.householdKgCap, g.hungryM, g.mealsPerDay]);
    const gcols = ["Countries", "Population (UN)", "Household t", "Food service t", "Retail t", "Total t", "Household kg per person", "Undernourished million", "Meals per day"];
    return [
      sheet("Countries", ["ISO3", "ISO2", "Country", "Region", "Income group", "Population", "Household kg per person", "Food service kg per person",
        "Retail kg per person", "Total tonnes", "Confidence", "Eurostat fill", "Undernourished pct", "Below FAO floor", "Undernourished million", "Mean temp C"],
      COUNTRIES.map((c) => [c.iso3, c.iso2, c.name, c.region, c.incomeGroup, c.pop, c.householdKgCap, c.foodServiceKgCap, c.retailKgCap, c.totalT,
        c.confidence, c.eurostatFill ? 1 : 0, c.pou, c.pouFloor ? 1 : 0, c.hungryM, c.tempC])),
      sheet("Regions", ["Region", ...gcols], group(BY_REGION)),
      sheet("Income groups", ["Income group", ...gcols], group(BY_INCOME)),
      sheet("Sectors (world)", ["Sector", "Tonnes", "Kg per person"], BY_SECTOR.map((s) => [s.key, s.t, s.kgCap])),
      sheet("Food loss index", ["Year", "Product", "Index (2015 = 100)", "Loss pct"], FLI.map((f) => [f.year, f.product, f.index, f.lossPct])),
    ];
  },

  "space-debris": () => [
    sheet("Objects (cube)", ["Orbit", "Owner code", "Owner", "Kind", "Entry year", "Decay year (blank = in orbit)", "Altitude bin km", "Re-entered last 365 days", "Objects"],
      CUBES.cube.map(([o, w, c, ey, dy, bin, rec, n]) => [ORBITS[o], OWNERS[w].code, OWNERS[w].name, CLASSES[c], ey, dy || null, bin >= 0 ? bin * 50 : null, rec, n])),
    sheet("Debris by cause", ["Orbit", "Owner code", "Cause", "In orbit", "Catalogued"],
      CUBES.causeCube.map(([o, w, c, a, b]) => [ORBITS[o], OWNERS[w].code, CAUSES[c], a, b])),
    sheet("Radar size", ["Orbit", "Owner code", "Kind", "RCS class", "Objects in orbit"],
      CUBES.rcsCube.map(([o, w, c, k, n]) => [ORBITS[o], OWNERS[w].code, CLASSES[c], RCS_CLASSES[k], n])),
    sheet("Fragmentations", ["Launch", "Parent", "Owner", "Orbit", "Pieces catalogued", "Pieces in orbit", "Cause", "Event year", "Launched"],
      PARENTS.map((p) => [p.launch, p.parent, p.owner, p.orbit, p.pieces, p.inOrbit, p.cause, p.eventYear, p.launched])),
  ],
  "seed-banks": () => [
    sheet("Depositors", ["Institute code", "Depositor", "Country", "ISO3", "Continent / group", "International centre", "Regional", "Samples in Svalbard", "Species", "Taxa", "First deposit year", "Deposit events"],
      DEPOSITORS.map((d) => [d.code, d.name, d.country, d.iso3, d.continent, d.center, d.regional, d.samples, d.species, d.taxa, d.firstYear, d.events])),
    sheet("Deposit events", ["Date", "Institute code", "Samples still held", "Samples withdrawn", "Seed boxes", "Species"],
      EVENTS.map((e) => [e.date, e.code, e.samples, e.withdrawn, e.boxes, e.species])),
    sheet("Holdings by year", ["Year", "Deposited", "Accumulated deposits", "Withdrawn", "Held at year end", "Source"],
      CUMULATIVE.map((r) => [r.year, r.deposited, r.accumulated, r.withdrawn, r.holdings, r.source])),
    sheet("Genera", ["Genus", "Common name used", "Seed Portal name", "Samples", "Species", "Most-sampled species", "Its share"], GENERA.map((g) => [g.genus, g.common, g.portalName ?? null, g.samples, g.species, g.topSpecies ?? null, g.topSpeciesShare ?? null])),
    sheet("Genera by continent", ["Depositor continent / group", "Genus", "Samples"], CROPS_BY_CONTINENT.map((c) => [c.continent, c.genus, c.samples])),
    sheet("Origin", ["Continent of origin", "Samples", "Depositors", "Species"], ORIGIN.map((o) => [o.continent, o.samples, o.depositors, o.species])),
    sheet("Countries", ["ISO3", "Country", "Continent", "Subregion", "WIEWS accessions 2024", "Genebanks", "Genera", "Species", "Svalbard samples (national)", "Svalbard depositors", "First deposit", "Svalbard / WIEWS"],
      SEED_COUNTRIES.map((c) => [c.iso3, c.name, c.continent, c.subregion, c.accessions, c.genebanks, c.genera, c.species, c.svalbardSamples, c.svalbardDepositors, c.firstDeposit, backupShare(c)])),
    sheet("Centres", ["Centre", "Regional", "Seed Portal codes", "Svalbard samples", "WIEWS name", "WIEWS accessions 2024"],
      CENTRES.map((c) => [c.center, c.regional, c.codes.join(" "), c.svalbardSamples, c.wiewsName, c.wiewsAccessions])),
    sheet("WIEWS centres", ["Centre", "Kind", "Institute code", "Accessions 2024", "Genebanks", "Genera", "Species"],
      WIEWS_CENTRES.map((c) => [c.name, c.kind, c.instcode, c.accessions, c.genebanks, c.genera, c.species])),
    sheet("WIEWS trend", ["Year", "World", "Africa", "Americas", "Asia", "Europe", "Oceania", "International and regional centres"],
      SEED_TREND.map((r) => [r.year, r.World, r.Africa, r.Americas, r.Asia, r.Europe, r.Oceania, r.International])),
  ],
  longevity: () => [
    sheet("Countries", ["ISO3", "Country or area", "World Bank region", "Income group", "Population 2023", "Life expectancy (UN)", "Women (UN)", "Men (UN)",
      "HALE (WHO)", "HALE lower 95%", "HALE upper 95%", "HALE women", "HALE men", "Life expectancy (WHO)", "Years in less than full health",
      "People aged 100+", "People aged 100+ in 2000", "100+ per 100,000", "GDP per person PPP 2021 $", "GDP year", "Health spending % GDP", "Health spending year", "HALE vs Preston line"],
      LONG_COUNTRIES.map((c) => [c.iso3, c.name, c.region, c.income, c.pop, c.e0, c.e0Female, c.e0Male, c.hale, c.haleLo, c.haleHi, c.haleFemale, c.haleMale, c.whoE0, c.gap,
        c.centenarians, c.centenarians2000, c.centenariansPer100k, c.gdpPc, c.gdpYear, c.healthExpPct, c.healthExpYear, prestonResidual(c)])),
    sheet("Regions", ["World Bank region", "Countries and areas", "Population 2023", "Life expectancy (UN, pop-weighted)", "HALE (WHO, pop-weighted)", "Countries with HALE"],
      LONG_REGIONS.map((r) => [r.region, r.countries, r.pop, r.e0, r.hale, r.countriesWithHale])),
    sheet("Life expectancy 1950-2023", ["Year", "World", ...TREND_KEYS],
      TREND.years.map((y, i) => [y, TREND.world[i], ...TREND_KEYS.map((k) => TREND[k][i])])),
    sheet("Record female e0", ["Year", "Record holder (ISO3, ≥ 1 million people)", "Female life expectancy"], RECORD.map((r) => [r.year, r.iso3, r.e0Female])),
    sheet("Blue zones", ["Area", "Country", "Reference town", "Latitude", "Longitude", "Demographic (ages validated)", "Comparison",
      "Men survival 60s→90s %", "Comparison men %", "Men significance", "Women survival 60s→90s %", "Comparison women %", "Women significance", "Key measure", "DOIs"],
      BLUE_ZONES.map((z) => [z.name, z.iso3, z.town, z.lat, z.lon, z.demographic, z.comparison, z.survival?.m ?? null, z.survival?.mRef ?? null, z.survival?.sigM ?? null,
        z.survival?.f ?? null, z.survival?.fRef ?? null, z.survival?.sigF ?? null, z.extra.note, z.refs.join(" ")])),
  ],
  "dark-skies": () => {
    const lv = ["≤1.7", ">1.7", ">14", ">87", ">688", ">3000"];
    const ex = ["≤1.7", "1.7–14", "14–87", "87–688", "688–3000", ">3000"];
    const yearRows = (Object.keys(GAN.years) as (keyof typeof GAN.years)[]).flatMap((k) => GAN.years[k].map((y) => [k, y.year, y.n, y.mean, y.med, y.p25, y.p75, y.atlasMed == null ? null : y.atlasMed * 1000]));
    const trendRows = (Object.keys(GAN.trends) as (keyof typeof GAN.trends)[]).flatMap((k) => (["all", "kyba"] as const).map((w) => {
      const t = GAN.trends[k][w];
      return [k, `${t.y0}–${t.y1}`, t.slope, t.lo, t.hi, t.groups, t.obs, t.impliedPct, t.impliedLo, t.impliedHi];
    }));
    return [
      sheet("Countries", ["ISO3", "Country or territory (Falchi et al. 2016)", "Territory", "World Bank region", "Population 2015",
        ...lv.map((l) => `% people ${l} μcd/m²`), ...lv.map((l) => `% land ${l} μcd/m²`), ...ex.map((l) => `% people in band ${l}`),
        "People without the Milky Way (2015)", "Dark-sky places (Wikidata)", "Globe at Night reports 2011–2025", "Median limiting magnitude"],
        [...SKY_COUNTRIES.map((c) => [c.iso3, c.name, c.territory, c.region, c.pop2015, ...c.pop, ...c.area, ...skyBands(c.pop), skyPeople(c, 4), c.places, c.gan?.obs ?? null, c.gan?.medLM ?? null]),
          ["WLD", "World (Table 2)", false, "", SKY_WORLD.population, ...SKY_WORLD.pop, ...SKY_WORLD.area, ...skyBands(SKY_WORLD.pop), (SKY_WORLD.population * SKY_WORLD.pop[4]) / 100, SKY_PLACES.length, GAN.funnel.kept, null]]),
      sheet("Dark-sky places", ["Wikidata ID", "Name", "Type", "Also listed as", "Country ISO3", "Country", "Latitude", "Longitude", "Year certified", "Area km²", "Atlas artificial brightness μcd/m²", "Wikidata URL", "Wikipedia"],
        SKY_PLACES.map((p) => [p.id, p.name, p.type, p.otherTypes.join(", "), p.country, p.countryName, p.lat, p.lon, p.yearCertified, p.areaKm2, p.atlas == null ? null : p.atlas * 1000, p.sourceUrl, p.wikipedia])),
      sheet("Globe at Night by year", ["Subset", "Year", "Usable reports", "Mean limiting magnitude", "Median", "25th percentile", "75th percentile", "Median atlas brightness at sites μcd/m²"], yearRows),
      sheet("Globe at Night trends", ["Subset", "Years", "Magnitudes per year (within cell × constellation)", "95% CI low", "95% CI high", "Groups", "Reports", "Implied brightening %/yr", "Implied low", "Implied high"], trendRows),
      sheet("Observation cells 1°", ["Longitude", "Latitude", "Reports", "Median limiting magnitude"], GAN.cells.map((c) => [...c])),
      sheet("Arizona-Sonora cells 0.1°", ["Longitude", "Latitude", "Reports", "Median limiting magnitude", "Reports from Mexico"], GAN.azCells.map((c) => [...c])),
    ];
  },
  spices: () => {
    const name = (iso3: string) => SP_ISO.get(iso3)?.name ?? iso3;
    const prod: Rows = [];
    for (const s of SP_SPICES) for (const [iso3, v] of Object.entries(SP_PROD[s.id])) v.forEach((t, i) => { if (t != null) prod.push([s.id, s.short, iso3, name(iso3), SP_YEARS[i], t, SP_YEARS[i] === SP_YEARS[SP_YEARS.length - 1] ? SP_FLAG[s.id][iso3] ?? "A" : null]); });
    const trade: Rows = [];
    for (const s of SP_SPICES) for (const [y, rows] of Object.entries(SP_TRADE[s.id])) for (const [iso3, r] of Object.entries(rows)) trade.push([s.id, s.short, iso3, name(iso3), Number(y), ...r]);
    const flows: Rows = [];
    for (const s of SP_SPICES) for (const y of SP_FLOW_YEARS) (SP_FLOWS[s.id][y] ?? []).forEach((f, k) => flows.push([s.id, s.short, y, k + 1, f[1], name(f[1]), f[0], name(f[0]), f[2], f[3]]));
    const world: Rows = SP_SPICES.flatMap((s) => SP_YEARS.map((y) => {
      const W = SP_WORLD[s.id], i = spYi(y);
      return [s.id, s.short, y, W.prod[i], W.area[i], W.exportT[i], W.exportUsd[i], W.importT[i], W.importUsd[i], W.exportUsd[i] != null && W.exportT[i] ? W.exportUsd[i]! / (W.exportT[i]! * 1000) : null, W.hhi[i], W.top3[i], W.producers[i]];
    }));
    return [
      sheet("Spices", ["Spice ID", "Short name", "FAOSTAT item", "Item code", "CPC"], SP_SPICES.map((s) => [s.id, s.short, s.name, s.code, s.cpc])),
      sheet("World by year", ["Spice ID", "Spice", "Year", "Production t", "Area harvested ha", "Exports t", "Exports US$", "Imports t", "Imports US$", "Export unit value US$/kg", "HHI of production", "Top-3 share %", "Producing countries"], world),
      sheet("Production", ["Spice ID", "Spice", "ISO3", "Country (FAOSTAT)", "Year", "Production t", "FAOSTAT flag (latest year)"], prod),
      sheet("Trade", ["Spice ID", "Spice", "ISO3", "Country (FAOSTAT)", "Year", "Exports t", "Exports US$", "Imports t", "Imports US$"], trade),
      sheet("Top 50 flows", ["Spice ID", "Spice", "Year", "Rank", "Exporter ISO3", "Exporter", "Importer ISO3", "Importer", "Tonnes (importer report)", "US$ CIF (importer report)"], flows),
      sheet("Countries", ["ISO3", "ISO2", "Name (FAOSTAT)", "World Bank region", "Capital latitude", "Capital longitude", "Population", "Population year", "Former state"],
        SP_COUNTRIES.map((c) => [c.iso3, c.iso2, c.name, c.region, c.lat, c.lon, c.pop, c.popYear, c.former])),
      sheet("Checks", ["Spice ID", "World production t (FAOSTAT World row)", "Sum of countries t", "World exports t", "World imports t", "Export-import gap %", "World exports US$", "World imports US$"],
        SP_CHECKS.map((c) => [c.spiceId, c.worldT, c.sumT, c.worldX, c.worldM, c.gapPct, c.worldXusd, c.worldMusd])),
      sheet("History", ["ID", "When", "Start", "End", "Spice", "Event", "Reference key", "Part of the source read", "Places"],
        SP_EVENTS.map((e) => [e.id, e.when, e.start, e.end, e.spice, e.text, e.ref, e.basis, e.places.map((p) => `${p[2]} (${p[1]}, ${p[0]})`).join("; ")])),
    ];
  },
};
