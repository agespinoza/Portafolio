// Day 006 · builds data/day-006-food-waste/day-006.json from raw/day-006-food-waste/country.parquet (build.sql)
// and the UN SDG / FAOSTAT aggregates. Run from daily-data-lab/:  npm run data:foodwaste
// Stops if the world totals differ from the published UNEP Food Waste Index Report 2024 figures.
import { mkdirSync, writeFileSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";

const RAW = "raw/day-006-food-waste";
const db = await DuckDBInstance.create(":memory:");
const con = await db.connect();
const rows = async (q) => (await con.runAndReadAll(q)).getRowObjectsJson();
const n = (v, d = 2) => (v == null ? null : Math.round(Number(v) * 10 ** d) / 10 ** d);

// UNEP world aggregates (SDG 12.3.1, FWI 2024, year 2022).
const world = Object.fromEntries((await rows(`
  SELECT a.s, a.t, b.kg FROM
   (SELECT "[Food Waste Sector]" s, Value::DOUBLE t FROM read_csv('${RAW}/AG_FOOD_WST.csv', all_varchar=true)
    WHERE GeoAreaName = 'World' AND Source = 'Food Waste Index Report 2024' AND TimePeriod = '2022') a
  JOIN (SELECT "[Food Waste Sector]" s, Value::DOUBLE kg FROM read_csv('${RAW}/AG_FOOD_WST_PC.csv', all_varchar=true)
    WHERE GeoAreaName = 'World' AND Source = 'Food Waste Index Report 2024' AND TimePeriod = '2022') b USING (s)`)).map((r) => [r.s, { t: Number(r.t), kg: Number(r.kg) }]));

// Published figures (FWI 2024, Executive summary and Chapter 2): 1,052 Mt; household 79 kg/cap and 631 Mt; food service 290 Mt; retail 131 Mt.
const expect = [["ALL", "t", 1052e6, 0.5e6], ["HHS", "kg", 79, 0.5], ["HHS", "t", 631e6, 0.5e6], ["OOHC", "t", 290e6, 0.5e6], ["RTL", "t", 131e6, 0.5e6]];
for (const [s, k, v, tol] of expect) if (Math.abs(world[s][k] - v) > tol) throw new Error(`World ${s} ${k} = ${world[s][k]}, expected ${v}`);
console.log(`✓ UNEP world totals: ${(world.ALL.t / 1e6).toFixed(1)} Mt · household ${world.HHS.kg.toFixed(1)} kg/cap, ${(world.HHS.t / 1e6).toFixed(1)} Mt · food service ${(world.OOHC.t / 1e6).toFixed(1)} Mt · retail ${(world.RTL.t / 1e6).toFixed(1)} Mt`);

// FAOSTAT world number of undernourished people, 2021–2023 (million).
const [{ hungry }] = await rows(`SELECT Value::DOUBLE hungry FROM read_csv('${RAW}/faostat/Food_Security_Data_E_All_Data_(Normalized).csv', all_varchar=true)
  WHERE Area = 'World' AND "Item Code" = '210011' AND Year = '2021-2023'`);

await con.run(`CREATE VIEW c AS SELECT *, hh_t + coalesce(fs_t, 0) + coalesce(rt_t, 0) AS total_t FROM '${RAW}/country.parquet'`);
const [recon] = await rows(`SELECT sum(total_t) t, count(*) n FROM c`);
const gap = Number(recon.t) / world.ALL.t - 1;
if (Math.abs(gap) > 0.005) throw new Error(`Country sum differs from world total by ${(gap * 100).toFixed(2)}%`);
console.log(`✓ ${recon.n} countries sum to ${(Number(recon.t) / 1e6).toFixed(1)} Mt (${(gap * 100).toFixed(2)}% vs world)`);

// Meals: UNEP's conservative assumption (FWI 2024, ch. 2.6): 25% of household food waste is edible, a meal weighs 420 g.
const EDIBLE = 0.25, MEAL_KG = 0.42;
const mealsPerDay = (hhT) => (hhT * 1000 * EDIBLE) / MEAL_KG / 365;

// Every country in UNEP's Annex 3 (228). The 13 territories outside the World Bank list keep region "Not classified"
// and the UN population implied by Annex 3.
const countries = (await rows(`SELECT * FROM c ORDER BY coalesce(pop, pop_un) DESC`)).map((r) => ({
  iso3: r.iso3, iso2: r.iso2, name: r.name, region: r.region ?? "Not classified", incomeGroup: r.income ?? "Not classified", pop: Math.round(Number(r.pop ?? r.pop_un)),
  householdKgCap: n(r.hh_kg, 0), foodServiceKgCap: n((1000 * Number(r.fs_t)) / Number(r.pop_un), 1), retailKgCap: n((1000 * Number(r.rt_t)) / Number(r.pop_un), 1),
  totalT: Math.round(Number(r.total_t)), confidence: r.confidence, eurostatFill: r.eurostat_fill,
  pou: n(r.pou, 1), pouFloor: r.pou_floor ?? false, hungryM: n(r.hungry_m, 1), tempC: n(r.temp_c, 1),
}));

// Groups over all 228 countries in Annex 3, so region and income totals add up to the world.
const group = (col) => rows(`SELECT coalesce(${col}, 'Not classified') k, count(*) countries, sum(pop_un) pop,
  sum(hh_t) hh_t, sum(fs_t) fs_t, sum(rt_t) rt_t, sum(total_t) total_t, sum(hungry_m) hungry_m
  FROM c GROUP BY 1 ORDER BY total_t DESC`);
const shape = (r) => ({
  key: r.k, countries: Number(r.countries), pop: Math.round(Number(r.pop)), householdT: Math.round(Number(r.hh_t)),
  foodServiceT: Math.round(Number(r.fs_t)), retailT: Math.round(Number(r.rt_t)), totalT: Math.round(Number(r.total_t)),
  householdKgCap: n((1000 * Number(r.hh_t)) / Number(r.pop), 1), hungryM: n(r.hungry_m, 1), mealsPerDay: Math.round(mealsPerDay(Number(r.hh_t))),
});
const byRegion = (await group("region")).map(shape);
const byIncome = (await group("income")).map(shape);
const confidence = (await rows(`SELECT confidence k, count(*) n, sum(hh_t) t FROM c GROUP BY 1`)).map((r) => ({ key: r.k, countries: Number(r.n), householdT: Math.round(Number(r.t)) }));

// FAO Food Loss Index (2015 = 100) and food loss percentage, world, by product group.
const fli = await rows(`SELECT i.TimePeriod::INT y, i."[Type of product]" p, i.Value::DOUBLE idx, l.Value::DOUBLE pct
  FROM read_csv('${RAW}/AG_FLS_INDEX.csv', all_varchar=true) i
  LEFT JOIN read_csv('${RAW}/AG_FLS_PCT.csv', all_varchar=true) l
    ON l.GeoAreaName = i.GeoAreaName AND l.TimePeriod = i.TimePeriod AND l."[Type of product]" = i."[Type of product]"
  WHERE i.GeoAreaName = 'World' ORDER BY 2, 1`);
const foodLossIndex = fli.map((r) => ({ year: Number(r.y), product: r.p, index: n(r.idx), lossPct: n(r.pct, 1) }));

const out = {
  source: "UNEP Food Waste Index Report 2024 (SDG 12.3.1 via UN SDG Global Database; Annex 3); FAOSTAT Food Security Indicators and Food Loss Index (CC BY 4.0); World Bank WDI (CC BY 4.0); World Bank CCKP, CRU TS 4.08 (CC BY 4.0)",
  capturedAt: new Date().toISOString(),
  assumptions: { edibleShare: EDIBLE, mealKg: MEAL_KG, consumerFoodT: 5.5e9, pouYears: "2021-2023", tempPeriod: "1991-2020" },
  kpis: {
    totalMt: n(world.ALL.t / 1e6, 1), householdMt: n(world.HHS.t / 1e6, 1), foodServiceMt: n(world.OOHC.t / 1e6, 1), retailMt: n(world.RTL.t / 1e6, 1),
    householdKgCap: n(world.HHS.kg, 1), totalKgCap: n(world.ALL.kg, 1),
    // UNEP compares the total with 5.5 billion tonnes of food available for consumption (FAOSTAT 2020): "as much as 19 per cent".
    pctWasted: n(world.ALL.t / 5.5e9, 3),
    mealsPerDay: Math.round(mealsPerDay(world.HHS.t)), hungryPeopleM: n(hungry, 1),
    reconstructionGap: n(gap, 4),
  },
  bySector: [
    { key: "household", t: Math.round(world.HHS.t), kgCap: n(world.HHS.kg, 1) },
    { key: "foodService", t: Math.round(world.OOHC.t), kgCap: n(world.OOHC.kg, 1) },
    { key: "retail", t: Math.round(world.RTL.t), kgCap: n(world.RTL.kg, 1) },
  ],
  byIncome, byRegion, confidence, foodLossIndex, countries,
};
const dir = "data/day-006-food-waste";
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/day-006.json`, JSON.stringify(out));
const mex = countries.find((c) => c.iso3 === "MEX"), usa = countries.find((c) => c.iso3 === "USA");
console.log(`✓ ${dir}/day-006.json · ${countries.length} countries · meals/day ${(out.kpis.mealsPerDay / 1e9).toFixed(2)} bn · hungry ${hungry} M`);
console.log(`  MEX ${mex.householdKgCap} kg/cap (${mex.confidence}) · USA ${usa.householdKgCap} kg/cap (${usa.confidence})`);
