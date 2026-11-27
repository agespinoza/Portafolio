import StudyFacts from "../StudyFacts.jsx";
import { useMemo, useState } from "react";
import { useLanguage } from "../../language.jsx";
import {
  type Country, type PlaceType, BANDS, CAPTURED_AT, COUNTRIES, GAN, HIGHLIGHT, NATURAL, PLACES, PLACE_TYPES, POP_YEAR, PUBLISHED, RASTER, REGION_IDS,
  TYPE_COLOR, WORLD, bands, cumulative, median, people, weightedPop,
} from "./data";
import { type BarRow, type Series, BarChartCard, LineChartCard, DonutCard } from "../day-006-food-waste/Charts";
import { RangeCard, type RangeRow } from "../day-009-longevity/Charts";
import SkyMap, { type Layers, SkyLegend, VIEWS } from "./SkyMap";
import { CountryProfile, KpiCard, MapSide, PlaceProfile, RankingTable, StarSimulator, bandLabel, cName, regionName, typeLabel } from "./Panels";
import { tr, num, pc, fmtDate, signed, peopleCount } from "./text";
import { DarkSkyQuality, DarkSkyQuestions, DarkSkySources } from "./Research";

const BY_ISO = new Map<string, Country>();
for (const c of COUNTRIES) if (!BY_ISO.has(c.iso3)) BY_ISO.set(c.iso3, c);
const MAIN_VIEWS = VIEWS.filter((v) => v.id !== "azson");
const SERIES_COLOR = { world: "var(--ink)", northAmerica: "var(--ds-l1)", europe: "var(--ds-l2)", arizona: "var(--copper)" } as const;
const T22 = GAN.trends;

export default function DarkSkiesDay() {
  const language: string = useLanguage();
  const [region, setRegion] = useState("all");
  const [countryId, setCountryId] = useState("");
  const [types, setTypes] = useState<PlaceType[]>(PLACE_TYPES);
  const [view, setView] = useState("world");
  const [layers, setLayers] = useState<Layers>({ atlas: true, places: true, gan: false });
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [measure, setMeasure] = useState<"pop" | "area">("pop");

  const world = region === "all";
  const rowsIn = useMemo(() => COUNTRIES.filter((c) => world || c.region === region), [region]);
  const country: Country | null = countryId ? BY_ISO.get(countryId) ?? null : null;
  const countryOptions = useMemo(() => [...new Map(rowsIn.map((c) => [c.iso3, c])).values()].sort((a, b) => cName(a, language).localeCompare(cName(b, language), language)), [rowsIn, language]);
  const scopeName = country ? cName(country, language) : world ? tr(language, "world", "World") : regionName(region, language);
  const isOn = (iso3: string) => HIGHLIGHT.has(iso3) || iso3 === country?.iso3;
  const pickRegion = (r: string) => { setRegion(r); if (country && r !== "all" && country.region !== r) setCountryId(""); };
  const pickCountry = (iso3: string) => { setCountryId(iso3); setPlaceId(null); document.getElementById("ds-map")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const placesIn = useMemo(() => PLACES.filter((p) => types.includes(p.type) && (world || (p.country && BY_ISO.get(p.country)?.region === region)) && (!country || p.country === country.iso3)), [types, region, country]);
  const place = placeId ? PLACES.find((p) => p.id === placeId) ?? null : null;
  const toggleType = (t: PlaceType) => setTypes((a) => (a.includes(t) ? (a.length > 1 ? a.filter((x) => x !== t) : a) : [...a, t]));

  // ---- KPIs: a country, a region (population-weighted) or the world (Falchi's world row) ----
  const scopePct = (i: number) => (country ? country.pop[i] : world ? WORLD.pop[i] : weightedPop(rowsIn, i));
  const scopePeople = (i: number) => {
    if (country) return people(country, i);
    if (world) return (WORLD.population * WORLD.pop[i]) / 100;
    return rowsIn.reduce((a, c) => a + (people(c, i) ?? 0), 0);
  };
  const areaPol = country ? country.area[2] : world ? WORLD.area[2] : null;
  const ganYears = GAN.years.world;
  const ganPerYear = GAN.funnel.kept / ganYears.length;
  const wdKm2 = PLACES.reduce((a, p) => a + (p.areaKm2 ?? 0), 0);
  const kyba = PUBLISHED.kyba2023;

  // ---- B. people (or land) by brightness band, every country in scope ----
  const bandRows: BarRow[] = useMemo(() => {
    const uniq = [...new Map(rowsIn.map((c) => [`${c.iso3}-${c.name}`, c])).values()];
    return uniq.map((c) => ({ c, b: bands(measure === "pop" ? c.pop : c.area) }))
      .sort((x, y) => (y.b[4] + y.b[5]) - (x.b[4] + x.b[5]) || (y.b[3] - x.b[3]) || x.c.name.localeCompare(y.c.name))
      .map(({ c, b }, i) => ({
        id: c.iso3, label: `${i + 1}. ${cName(c, language)}`, segments: b, highlight: isOn(c.iso3),
        readout: tr(language, "bandReadout", "{name}: {list}", { name: cName(c, language), list: b.map((v, k) => `${BANDS[k].short} ${pc(v, language)}`).join(" · ") }),
      }));
  }, [rowsIn, measure, language, country]);

  // ---- C. Globe at Night: yearly mean limiting magnitude, and where observers were ----
  const lmSeries: Series[] = (["world", "northAmerica", "europe", "arizona"] as const).map((k) => ({
    key: k, label: { world: tr(language, "world", "World"), northAmerica: regionName("North America", language), europe: regionName("Europe & Central Asia", language), arizona: "Arizona" }[k],
    color: SERIES_COLOR[k], bold: k === "world", points: GAN.years[k].map((y) => [y.year, y.mean] as [number, number]),
  }));
  const siteSeries: Series[] = [{ key: "site", label: tr(language, "siteSeries", "Observers' sites"), color: "var(--copper)", bold: true, points: ganYears.map((y) => [y.year, (y.atlasMed ?? 0) * 1000] as [number, number]) }];
  const yW = (y: number) => ganYears.find((r) => r.year === y)!;

  // ---- E. rates: satellites, citizen scientists (Kyba 2023) and this page's within-cell estimate ----
  const t = T22;
  const rateRows: RangeRow[] = [
    { id: "s1", label: tr(language, "rateSatArea", "Satellite: lit area"), value: PUBLISHED.kyba2017.area, lo: PUBLISHED.kyba2017.area, hi: PUBLISHED.kyba2017.area, readout: tr(language, "rateSatAreaR", "VIIRS, 2012–2016: Earth's lit outdoor area grew 2.2% a year (Kyba et al. 2017)") },
    { id: "s2", label: tr(language, "rateSatRad", "Satellite: lit areas' radiance"), value: PUBLISHED.kyba2017.radiance, lo: PUBLISHED.kyba2017.radiance, hi: PUBLISHED.kyba2017.radiance, readout: tr(language, "rateSatRadR", "VIIRS, 2012–2016: continuously lit areas brightened 2.2% a year (Kyba et al. 2017)") },
    { id: "k-eu", label: tr(language, "rateEu", "Eyes: Europe"), value: kyba.europe, lo: kyba.europe, hi: kyba.europe, readout: tr(language, "rateEuR", "Globe at Night, 2011–2022: Europe 6.5% a year (Kyba et al. 2023, as reported)") },
    { id: "k-w", label: tr(language, "rateWorld", "Eyes: world"), value: kyba.world, lo: kyba.range[0], hi: kyba.range[1], highlight: true, readout: tr(language, "rateWorldR", "Globe at Night, 2011–2022: 9.6% a year; 7–10% in the abstract (Kyba et al. 2023)") },
    { id: "k-na", label: tr(language, "rateNa", "Eyes: North America"), value: kyba.northAmerica, lo: kyba.northAmerica, hi: kyba.northAmerica, readout: tr(language, "rateNaR", "Globe at Night, 2011–2022: North America 10.4% a year (Kyba et al. 2023, as reported)") },
    ...(["world", "northAmerica", "europe", "usa"] as const).map((k) => ({
      id: `p-${k}`, label: tr(language, `ratePage_${k}`, { world: "This page: world", northAmerica: "This page: North America", europe: "This page: Europe", usa: "This page: United States" }[k]),
      value: t[k].kyba.impliedPct, lo: t[k].kyba.impliedLo, hi: t[k].kyba.impliedHi, faded: true,
      readout: tr(language, "ratePageR", "{scope}, 2011–2022: {s} magnitudes a year within cell × constellation groups ({g} groups) → about {p}% a year (95% CI {lo}–{hi}%)", {
        scope: tr(language, `ratePage_${k}`, k), s: signed(t[k].kyba.slope, language, 3), g: num(t[k].kyba.groups, language), p: num(t[k].kyba.impliedPct, language, 1), lo: num(t[k].kyba.impliedLo, language, 1), hi: num(t[k].kyba.impliedHi, language, 1) }),
    })),
  ];

  // ---- F. certifications (Wikidata) ----
  const cum = useMemo(() => cumulative(PLACES.filter((p) => types.includes(p.type))), [types]);
  const certSeries: Series[] = [
    { key: "total", label: tr(language, "total", "All types"), color: "var(--ink)", bold: true, points: cum.years.map((y, i) => [y, cum.total[i]] as [number, number]) },
    ...types.map((ty) => ({ key: ty, label: typeLabel(ty, language), color: TYPE_COLOR[ty], points: cum.years.map((y, i) => [y, cum.byType[ty][i]] as [number, number]) })),
  ];
  const typeCount = (ty: PlaceType, list = placesIn) => list.filter((p) => p.type === ty).length;
  const slices = PLACE_TYPES.map((ty) => ({ key: ty, label: typeLabel(ty, language), value: typeCount(ty), color: TYPE_COLOR[ty],
    readout: tr(language, "sliceReadout", "{t}: {n} places", { t: typeLabel(ty, language), n: typeCount(ty) }) }));
  const skyByType: BarRow[] = PLACE_TYPES.map((ty) => {
    const v = PLACES.filter((p) => p.type === ty && p.atlas != null).map((p) => p.atlas! * 1000);
    const m = median(v) ?? 0, pol = v.filter((x) => x > 14).length;
    return { id: ty, label: typeLabel(ty, language), segments: [m], readout: tr(language, "skyTypeReadout", "{t}: median {m} μcd/m² at the listed coordinate; {k} of {n} above 14 μcd/m² (light-polluted)", { t: typeLabel(ty, language), m: num(m, language, 1), k: pol, n: v.length }) };
  });

  // ---- values for facts, takeaways and research (whole dataset) ----
  const all = useMemo(() => {
    const big1m = COUNTRIES.filter((c) => (c.pop2015 ?? 0) >= 1e6);
    const darkest = [...big1m].sort((a, b) => b.pop[0] - a.pop[0])[0];
    const allNoNight = big1m.filter((c) => c.pop[5] >= 99);
    const withAtlas = PLACES.filter((p) => p.atlas != null);
    const polluted = withAtlas.filter((p) => p.atlas! > 0.014).length;
    const polBy = Object.fromEntries(PLACE_TYPES.map((ty) => [ty, { k: withAtlas.filter((p) => p.type === ty && p.atlas! > 0.014).length, n: withAtlas.filter((p) => p.type === ty).length }])) as Record<PlaceType, { k: number; n: number }>;
    const comm = median(PLACES.filter((p) => p.type === "community" && p.atlas != null).map((p) => p.atlas! * 1000));
    const park = median(PLACES.filter((p) => p.type === "park" && p.atlas != null).map((p) => p.atlas! * 1000));
    const az = PLACES.filter((p) => p.lon != null && p.lat != null && p.lon >= -118 && p.lon <= -106 && p.lat >= 26 && p.lat <= 38);
    const years = PLACES.filter((p) => p.yearCertified).map((p) => p.yearCertified!);
    const countriesWd = new Set(PLACES.map((p) => p.country).filter(Boolean)).size;
    const lm0late = GAN.lm0.filter((x) => x.year >= 2023);
    return {
      darkest, allNoNight, polluted, polBy, withAtlas: withAtlas.length, comm, park, az, countriesWd, last: Math.max(...years), recent: years.filter((y) => y > 2021).length,
      us: PLACES.filter((p) => p.country === "USA").length, flagstaff: PLACES.find((p) => p.name === "Flagstaff"),
      usa: BY_ISO.get("USA")!, mex: BY_ISO.get("MEX")!, sgp: BY_ISO.get("SGP")!,
      lm0late: Math.min(...lm0late.map((x) => x.share)), lm0lateMax: Math.max(...lm0late.map((x) => x.share)),
    };
  }, []);
  const phx = RASTER.checks.Phoenix, kp = RASTER.checks["Kitt Peak"];
  const noMwPeople = (WORLD.population * WORLD.pop[4]) / 100, polPeople = (WORLD.population * WORLD.pop[2]) / 100;

  const facts = [
    country
      ? { title: tr(language, "f1cHead", "Tonight in {name}", { name: cName(country, language) }), text: tr(language, "f1c", "{p} of people cannot see the Milky Way from home, against {w} worldwide. {a} of the land still has a pristine sky.", { p: pc(country.pop[4], language), w: pc(WORLD.pop[4], language), a: pc(country.area[0], language) }) }
      : { title: tr(language, "f1Head", "One person in three has never seen the Milky Way from home"), text: tr(language, "f1", "In 2015, about {n} lived where light hides it: {mx} of Mexicans and {us} of people in the United States.", { n: peopleCount(noMwPeople, language), mx: pc(all.mex.pop[4], language), us: pc(all.usa.pop[4], language) }) },
    { title: tr(language, "f2Head", "From 250 stars to 100"), text: tr(language, "f2", "If the sky brightens about {r}% a year, as citizen scientists measured, a child who can count 250 stars at birth would see about 100 by their 18th birthday.", { r: num(kyba.world, language, 1) }) },
    { title: tr(language, "f3Head", "Brightest and darkest"), text: tr(language, "f3", "In {sgp}, nobody's eyes can fully adapt to the dark at night. In {dark}, {p} of people still live under a pristine sky.", { sgp: cName(all.sgp, language), dark: cName(all.darkest, language), p: pc(all.darkest.pop[0], language) }) },
  ];

  const kv = (v: number | null) => (v == null ? "—" : pc(v, language));
  return (
    <div className="viz lp fw lg ds">
      {/* Controls */}
      <div className="controls" role="group" aria-label={tr(language, "controlsAria", "Filter the dashboard")}>
        <label className="select">
          <span className="mono">{tr(language, "region", "Region")}</span>
          <select value={region} onChange={(e) => pickRegion(e.target.value)}>
            <option value="all">{tr(language, "world", "World")}</option>
            {REGION_IDS.map((r) => <option key={r} value={r}>{regionName(r, language)}</option>)}
          </select>
        </label>
        <label className="select">
          <span className="mono">{tr(language, "country", "Country")}</span>
          <select value={country?.iso3 ?? ""} onChange={(e) => { setCountryId(e.target.value); setPlaceId(null); }}>
            <option value="">{tr(language, "allCountries", "All countries and territories ({n})", { n: countryOptions.length })}</option>
            {countryOptions.map((c) => <option key={c.iso3} value={c.iso3}>{cName(c, language)}</option>)}
          </select>
        </label>
        <div className="lp-phen">
          <span className="mono">{tr(language, "placeTypes", "Dark-sky place types")}</span>
          <div className="lp-phen__opts">
            {PLACE_TYPES.map((ty) => (
              <button key={ty} type="button" aria-pressed={types.includes(ty)} className={types.includes(ty) ? "on" : ""} onClick={() => toggleType(ty)}>
                <i style={{ background: TYPE_COLOR[ty] }} />{typeLabel(ty, language)}
              </button>
            ))}
          </div>
        </div>
        <p className="muted fw-scope">{tr(language, "scopeNote", "Regions follow the World Bank. Mexico, the United States and the country you pick are highlighted in copper; Arizona–Sonora has its own card.")}</p>
        {(!world || country || types.length !== PLACE_TYPES.length) && <button type="button" className="gw-reset" onClick={() => { setRegion("all"); setCountryId(""); setTypes(PLACE_TYPES); setPlaceId(null); }}>{tr(language, "reset", "Reset")}</button>}
      </div>

      {/* Key numbers */}
      <section className="stats fw-stats ds-stats" aria-label={tr(language, "statsAria", "Key numbers for {scope}", { scope: scopeName })}>
        <KpiCard accent label={tr(language, "kpiPolluted", "People under light-polluted skies")} value={kv(scopePct(2))}
          note={tr(language, "kpiPollutedNote", "about {n} · {scope} · Falchi et al. 2016", { n: peopleCount(scopePeople(2), language), scope: scopeName })} />
        <KpiCard label={tr(language, "kpiNoMw", "Cannot see the Milky Way")} value={kv(scopePct(4))}
          note={tr(language, "kpiNoMwNote", "about {n} · {y} population", { n: peopleCount(scopePeople(4), language), y: POP_YEAR })} />
        <KpiCard label={tr(language, "kpiRate", "Sky brightening per year")} value={`${num(kyba.world, language, 1)}%`}
          note={tr(language, "kpiRateNote", "naked eye, 2011–2022 (Kyba 2023) · satellites ~{s}% · this page {p}%", { s: num(PUBLISHED.kyba2017.radiance, language, 1), p: num(T22.world.kyba.impliedPct, language, 1) })} />
        <KpiCard label={tr(language, "kpiStars", "Stars lost in 18 years")} value={`${kyba.stars[0]} → ${kyba.stars[1]}`}
          note={tr(language, "kpiStarsNote", "a child's sky at that rate (Kyba et al. 2023)")} />
        <KpiCard label={tr(language, "kpiPlaces", "Certified dark-sky places")} value={num(PUBLISHED.darkSky.places, language)}
          note={tr(language, "kpiPlacesNote", "{c} countries · DarkSky {y} · {w} in Wikidata", { c: PUBLISHED.darkSky.countries, y: PUBLISHED.darkSky.asOf, w: PLACES.length })} />
        <KpiCard label={tr(language, "kpiKm2", "Protected dark skies")} value={`${num(PUBLISHED.darkSky.km2, language)} km²`}
          note={tr(language, "kpiKm2Note", "DarkSky {y} · Wikidata areas sum to {w} km²", { y: PUBLISHED.darkSky.asOf, w: num(Math.round(wdKm2 / 1000) * 1000, language) })} />
        <KpiCard label={tr(language, "kpiArea", "Land under light-polluted skies")} value={kv(areaPol)}
          note={areaPol == null ? tr(language, "kpiAreaNoteR", "pick the world or a country (regional land shares need land areas)") : tr(language, "kpiAreaNote", "{scope} · {v} still pristine", { scope: scopeName, v: kv(country ? country.area[0] : WORLD.area[0]) })} />
        <KpiCard label={tr(language, "kpiGan", "Globe at Night reports a year")} value={num(Math.round(ganPerYear / 100) * 100, language)}
          note={tr(language, "kpiGanNote", "usable naked-eye reports, 2011–2025 average ({n} in all)", { n: num(GAN.funnel.kept, language) })} />
      </section>

      <StudyFacts facts={facts} language={language} />

      {/* A. Map */}
      <section className="card lp-panel" id="ds-map">
        <div className="card__head">
          <div>
            <p className="mono lp-eyebrow">A · {tr(language, "mapEyebrow", "Sky map")}</p>
            <h2>{tr(language, "mapTitle", "Where the night is still dark, and where it is protected")}</h2>
            <p className="lp-sub">{tr(language, "mapLead", "The 2015 World Atlas of artificial sky brightness (Falchi et al. 2016), averaged to about 10 km, with certified International Dark Sky Places from Wikidata coloured by type. Click a place, or a country in the table, to open its profile.")}</p>
          </div>
          <div className="lp-views" role="group" aria-label={tr(language, "mapViews", "Map view")}>
            {MAIN_VIEWS.map((v) => <button key={v.id} type="button" aria-pressed={view === v.id} className={view === v.id ? "on" : ""} onClick={() => setView(v.id)}>{tr(language, v.key, v.label)}</button>)}
          </div>
        </div>
        <div className="lp-views ds-layers" role="group" aria-label={tr(language, "layers", "Layers")}>
          {([["atlas", "layerAtlas", "Sky brightness (atlas)"], ["places", "layerPlaces", "Dark-sky places"], ["gan", "layerGan", "Globe at Night reports"]] as const).map(([k, key, en]) => (
            <button key={k} type="button" aria-pressed={layers[k]} className={layers[k] ? "on" : ""} onClick={() => setLayers((l) => ({ ...l, [k]: !l[k] }))}>{tr(language, key, en)}</button>
          ))}
        </div>
        <div className="lp-map-grid">
          <div>
            <SkyMap places={placesIn} view={view} layers={layers} selected={placeId} onSelect={setPlaceId} language={language} />
            <SkyLegend language={language} />
          </div>
          <aside className="lp-side">
            {place ? <PlaceProfile p={place} onClose={() => setPlaceId(null)} language={language} />
              : country ? <CountryProfile c={country} onClose={() => setCountryId("")} language={language} />
              : <MapSide language={language} typeCounts={Object.fromEntries(types.map((ty) => [ty, typeCount(ty, placesIn.filter((p) => p.lat != null))])) as Record<PlaceType, number>} />}
          </aside>
        </div>
      </section>

      <div className="fw-grid">
        {/* B. People by brightness */}
        <section className="card lp-panel">
          <div className="card__head">
            <div>
              <p className="mono lp-eyebrow">B · {tr(language, "bandEyebrow", "Who lives under which sky")}</p>
              <h2>{measure === "pop" ? tr(language, "bandTitlePop", "People by sky brightness, every country") : tr(language, "bandTitleArea", "Land by sky brightness, every country")}</h2>
              <p className="lp-sub">{tr(language, "bandLead", "{scope}: share in each of Falchi's six levels of artificial zenith brightness (μcd/m²), sorted by the share that has lost the Milky Way (the last two colours).", { scope: world ? tr(language, "world", "World") : regionName(region, language) })}</p>
            </div>
            <div className="seg">
              <span className="mono">{tr(language, "measure", "Share of")}</span>
              <div className="seg__opts" role="radiogroup" aria-label={tr(language, "measure", "Share of")}>
                {(["pop", "area"] as const).map((m) => <button key={m} type="button" role="radio" aria-checked={measure === m} className={measure === m ? "on" : ""} onClick={() => setMeasure(m)}>{m === "pop" ? tr(language, "people", "People") : tr(language, "land", "Land")}</button>)}
              </div>
            </div>
          </div>
          <BarChartCard rows={bandRows} colors={BANDS.map((b) => b.color)} legend={BANDS.map((_, i) => bandLabel(i, language))} scroll focusId={country?.iso3} labelWidth={190}
            fmt={(v) => `${num(v, language)}%`} ariaLabel={tr(language, "bandAria", "Share of people or land in each sky-brightness level, by country")} hint={tr(language, "barHint", "Hover or focus a row to read it.")} />
        </section>

        {/* C. Star loss */}
        <section className="card lp-panel">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">C · {tr(language, "lossEyebrow", "Citizen scientists")}</p>
            <h2>{tr(language, "lossTitle", "Faintest star people could see, 2011–2025")}</h2>
            <p className="lp-sub">{tr(language, "lossLead", "Globe at Night: volunteers match the sky to star charts of limiting magnitude 1 (only the brightest stars) to 7 (very dark sky). Yearly means of usable naked-eye reports with clear or nearly clear skies. Higher is darker.")}</p>
          </div></div>
          <LineChartCard series={lmSeries} yFmt={(v) => num(v, language, 1)} xStep={2}
            ariaLabel={tr(language, "lossAria", "Mean limiting magnitude by year")} hint={tr(language, "lineHint", "Hover or focus a point to read it.")} />
          <p className="notice notice--inline lp-notice" role="note">{tr(language, "lossNote", "The raw means hardly fall ({m0} in 2011, {m1} in 2022) because the people reporting moved to darker places. Below: the median artificial brightness, in the 2015 atlas, at the sites of each year's reports. Comparing reports from the same 1° cell and constellation removes that shift: limiting magnitude then fell {s} a year in 2011–2022, about {p}% brighter skies a year (card E).", {
            m0: num(yW(2011).mean, language, 2), m1: num(yW(2022).mean, language, 2), s: signed(T22.world.kyba.slope, language, 3), p: num(T22.world.kyba.impliedPct, language, 1) })}</p>
          <LineChartCard series={siteSeries} yFmt={(v) => num(v, language)} xStep={2}
            ariaLabel={tr(language, "siteAria", "Median atlas brightness at observers' sites by year, μcd/m²")} hint={tr(language, "siteHint", "Artificial brightness at the reporting sites (μcd/m², 2015 atlas). Hover a point.")} />
        </section>

        {/* D. Simulator */}
        <section className="card lp-panel">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">D · {tr(language, "simEyebrow", "Star simulator")}</p>
            <h2>{tr(language, "simTitle", "How many stars will be left?")}</h2>
            <p className="lp-sub">{tr(language, "simLead", "Move the years and pick a brightening rate. The sky starts with 250 visible stars.")}</p>
          </div></div>
          <StarSimulator language={language} rates={[
            { id: "sat", label: tr(language, "rSat", "Satellites {v}%", { v: num(PUBLISHED.kyba2017.radiance, language, 1) }), value: PUBLISHED.kyba2017.radiance },
            { id: "eu", label: tr(language, "rEu", "Europe {v}%", { v: num(kyba.europe, language, 1) }), value: kyba.europe },
            { id: "kyba", label: tr(language, "rWorld", "World {v}%", { v: num(kyba.world, language, 1) }), value: kyba.world },
            { id: "na", label: tr(language, "rNa", "N. America {v}%", { v: num(kyba.northAmerica, language, 1) }), value: kyba.northAmerica },
          ]} />
        </section>

        {/* E. Rates */}
        <section className="card lp-panel">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">E · {tr(language, "rateEyebrow", "Satellites vs eyes")}</p>
            <h2>{tr(language, "rateTitle", "How fast is the night getting brighter?")}</h2>
            <p className="lp-sub">{tr(language, "rateLead", "Percent per year. Satellites (VIIRS) under-count the blue light of white LEDs; human eyes see it. Line: the 7–10% range of Kyba et al. (2023) and this page's 95% intervals.")}</p>
          </div></div>
          <RangeCard rows={rateRows} labelWidth={240} fmt={(v) => `${num(v, language, 1)}%`} refValue={kyba.world} refLabel="9.6%"
            ariaLabel={tr(language, "rateAria", "Sky brightening per year from satellites, citizen scientists and this page")} hint={tr(language, "barHint", "Hover or focus a row to read it.")} />
          <p className="lp-small">{tr(language, "rateNote", "This page: Globe at Night 2011–2022, change in limiting magnitude within cell × constellation groups, turned into brightness with a calibration on the atlas (limiting magnitude = {a} {b}·log10 brightness, R² {r2}). Faded because the calibration is weak; read it as a check on Kyba's figure, not a replacement.", { a: num(GAN.calibration.a, language, 2), b: signed(GAN.calibration.b, language, 2).replace("+", "+ ").replace("−", "− "), r2: num(GAN.calibration.r2, language, 2) })}</p>
        </section>

        {/* F. Certifications */}
        <section className="card lp-panel">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">F · {tr(language, "certEyebrow", "Protection")}</p>
            <h2>{tr(language, "certTitle", "Certified dark-sky places since 2001")}</h2>
            <p className="lp-sub">{tr(language, "certLead", "Cumulative certifications by type, as recorded in Wikidata ({n} places). Wikidata stops being complete around 2021: DarkSky reports {p} places by {y}.", { n: PLACES.length, p: PUBLISHED.darkSky.places, y: PUBLISHED.darkSky.asOf })}</p>
          </div></div>
          <LineChartCard series={certSeries} yFmt={(v) => num(v, language)} xStep={4}
            ariaLabel={tr(language, "certAria", "Cumulative certified dark-sky places by type")} hint={tr(language, "lineHint", "Hover or focus a point to read it.")} />
        </section>

        <section className="card lp-panel">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">G · {tr(language, "typeEyebrow", "Types")}</p>
            <h2>{tr(language, "typeTitle", "Places by type")}</h2>
            <p className="lp-sub">{tr(language, "typeLead", "{scope}, Wikidata. Parks are public land with an exceptional sky; reserves add a populated buffer around a dark core; sanctuaries are the most remote; communities are towns with lighting rules.", { scope: country ? cName(country, language) : world ? tr(language, "world", "World") : regionName(region, language) })}</p>
          </div></div>
          <DonutCard slices={slices} center={num(placesIn.length, language)} centerNote={tr(language, "places", "places")}
            ariaLabel={tr(language, "typeAria", "Certified places by type")} hint={tr(language, "sliceHint", "Hover or focus a slice.")} />
          <div className="card__head ds-sub"><div>
            <p className="mono lp-eyebrow">H · {tr(language, "skyTypeEyebrow", "Protected ≠ dark")}</p>
            <h3>{tr(language, "skyTypeTitle", "How bright is the sky at certified places?")}</h3>
            <p className="lp-sub">{tr(language, "skyTypeLead", "Median artificial brightness (μcd/m², 2015 atlas) at each place's Wikidata coordinate, by type. Above 14 the atlas calls a sky light-polluted; {k} of {n} places are.", { k: all.polluted, n: all.withAtlas })}</p>
          </div></div>
          <BarChartCard rows={skyByType} colors={["var(--ds-b2)"]} labelWidth={120} fmt={(v) => num(v, language, 1)}
            ariaLabel={tr(language, "skyTypeAria", "Median sky brightness at certified places by type")} hint={tr(language, "barHint", "Hover or focus a row to read it.")} />
        </section>

{/* I. Arizona–Sonora */}
        <section className="card lp-panel fw-wide">
          <div className="card__head"><div>
            <p className="mono lp-eyebrow">I · {tr(language, "azEyebrow", "Close-up")}</p>
            <h2>{tr(language, "azTitle", "Arizona–Sonora: one desert, two sides of the border")}</h2>
            <p className="lp-sub">{tr(language, "azLead", "118–106°W, 26–38°N at about 1.8 km. Phoenix glows at {phx} μcd/m² of artificial light, {x}× the natural sky; Kitt Peak National Observatory, about 90 km from Tucson, is at {kp} μcd/m², already {kpp} above natural. Squares: Globe at Night reports.", {
              phx: num(phx * 1000, language), x: num(phx / NATURAL, language), kp: num(kp * 1000, language), kpp: `${num((kp / NATURAL) * 100, language, 1)}%` })}</p>
          </div></div>
          <div className="lp-map-grid">
            <SkyMap places={PLACES} view="azson" layers={{ atlas: true, places: true, gan: true }} selected={placeId} onSelect={(id) => { setPlaceId(id); }} language={language} />
            <aside className="lp-side">
              <ul className="ds-facts">
                <li>{tr(language, "az1", "{n} certified places in this window, all in the United States; Wikidata lists none in Mexico.", { n: all.az.length })}</li>
                <li>{tr(language, "az2", "Flagstaff became the first International Dark Sky Community in {y}.", { y: all.flagstaff?.yearCertified ?? "—" })}</li>
                <li>{tr(language, "az3", "Globe at Night: {az} usable reports from Arizona (median limiting magnitude {azm}) and {son} from northern Sonora ({sonm}); {mx} from all of Mexico.", { az: num(GAN.azson.az, language), azm: num(GAN.azson.azMed, language), son: num(GAN.azson.son, language), sonm: num(GAN.azson.sonMed, language), mx: num(GAN.azson.mex, language) })}</li>
                <li>{tr(language, "az4", "Hermosillo ({h} μcd/m²) is about as bright as Tucson ({t}).", { h: num(RASTER.checks.Hermosillo * 1000, language), t: num(RASTER.checks.Tucson * 1000, language) })}</li>
                <li>{tr(language, "az5", "Mexico: {p} of people under light-polluted skies, {m} without the Milky Way; United States: {up} and {um}.", { p: pc(all.mex.pop[2], language), m: pc(all.mex.pop[4], language), up: pc(all.usa.pop[2], language), um: pc(all.usa.pop[4], language) })}</li>
              </ul>
              {place && place.lon != null && place.lon >= -118 && place.lon <= -106 && place.lat! >= 26 && place.lat! <= 38 && <PlaceProfile p={place} onClose={() => setPlaceId(null)} language={language} />}
            </aside>
          </div>
        </section>
      </div>

      {/* J. Ranking */}
      <section className="card lp-panel">
        <div className="card__head"><div>
          <p className="mono lp-eyebrow">J · {tr(language, "tableEyebrow", "Ranking")}</p>
          <h2>{tr(language, "tableTitle", "Every country and territory")}</h2>
          <p className="lp-sub">{tr(language, "tableSub", "{n} rows in {scope}, from Falchi et al. (2016) Table 2, with places from Wikidata and reports from Globe at Night.", { n: rowsIn.length, scope: world ? tr(language, "world", "World") : regionName(region, language) })}</p>
        </div></div>
        <RankingTable key={region} rows={rowsIn} focus={country?.iso3} onPick={pickCountry} language={language} />
      </section>

      <DarkSkyQuestions language={language} v={{
        polluted: pc(WORLD.pop[2], language), noMw: pc(WORLD.pop[4], language), pPol: peopleCount(polPeople, language), pNoMw: peopleCount(noMwPeople, language), y: POP_YEAR,
        usPol: pc(all.usa.pop[2], language), usNoMw: pc(all.usa.pop[4], language), mxPol: pc(all.mex.pop[2], language), mxNoMw: pc(all.mex.pop[4], language),
        obs: num(kyba.obs, language), k: num(kyba.world, language, 1), eu: num(kyba.europe, language, 1), na: num(kyba.northAmerica, language, 1),
        m0: num(yW(2011).mean, language, 2), m1: num(yW(2022).mean, language, 2), b0: num(yW(2011).atlasMed ?? 0, language, 2), b1: num(yW(2022).atlasMed ?? 0, language, 2),
        s: signed(T22.world.kyba.slope, language, 3), lo: signed(T22.world.kyba.lo, language, 3), hi: signed(T22.world.kyba.hi, language, 3), g: num(T22.world.kyba.groups, language),
        p: num(T22.world.kyba.impliedPct, language, 1), plo: num(T22.world.kyba.impliedLo, language, 1), phi: num(T22.world.kyba.impliedHi, language, 1), r2: num(GAN.calibration.r2, language, 2),
        dsP: PUBLISHED.darkSky.places, dsC: PUBLISHED.darkSky.countries, dsKm: num(PUBLISHED.darkSky.km2, language), dsY: PUBLISHED.darkSky.asOf, wP: PLACES.length, wC: all.countriesWd, us: all.us,
        polPct: `${num((100 * all.polluted) / all.withAtlas, language)}%`, comm: num(all.comm ?? 0, language), park: num(all.park ?? 0, language, 1), pk: all.polBy.park.k, pn: all.polBy.park.n, ck: all.polBy.community.k, cn: all.polBy.community.n,
        azP: all.az.length, y0: all.flagstaff?.yearCertified ?? "—", az: num(GAN.azson.az, language), son: num(GAN.azson.son, language), med: num(GAN.azson.azMed, language),
      }} />

      {/* Takeaways */}
      <section className="card takeaways">
        <h2>{tr(language, "takeawaysTitle", "What the data says")}</h2>
        <ul>
          <li><strong>{tr(language, "t1Head", "Most people live under an artificial sky.")}</strong> {tr(language, "t1", "{p} of the world's people (about {n}) live under light-polluted skies and {m} cannot see the Milky Way from home; only {a} of land is polluted, because people cluster where the lights are.", { p: pc(WORLD.pop[2], language), n: peopleCount(polPeople, language), m: pc(WORLD.pop[4], language), a: pc(WORLD.area[2], language) })}</li>
          <li><strong>{tr(language, "t2Head", "Eyes see the night brightening four times faster than satellites.")}</strong> {tr(language, "t2", "About {k}% a year from naked-eye reports (Kyba et al. 2023) against about {s}% from satellites (Kyba et al. 2017); this page's own reading of the same reports gives {p}% (95% CI {lo}–{hi}%).", { k: num(kyba.world, language, 1), s: num(PUBLISHED.kyba2017.radiance, language, 1), p: num(T22.world.kyba.impliedPct, language, 1), lo: num(T22.world.kyba.impliedLo, language, 1), hi: num(T22.world.kyba.impliedHi, language, 1) })}</li>
          <li><strong>{tr(language, "t3Head", "Raw citizen-science averages hide the loss.")}</strong> {tr(language, "t3", "The people reporting moved to darker sites (median atlas brightness {b0} → {b1} mcd/m², 2011–2022), which offsets the brightening in the yearly means. Comparing like places is what reveals it.", { b0: num(yW(2011).atlasMed ?? 0, language, 2), b1: num(yW(2022).atlasMed ?? 0, language, 2) })}</li>
          <li><strong>{tr(language, "t4Head", "Protection is concentrated, and not always dark.")}</strong> {tr(language, "t4", "{us} of the {n} certified places in Wikidata are in the United States and none in Mexico. At their listed coordinate, {p} sit under skies at least 8% brighter than natural at the zenith: {pk} of {pn} parks, {ck} of {cn} communities, {rk} of {rn} reserves and none of the sanctuaries. A certificate rewards good lighting and a dark core, not a perfect sky everywhere.", {
            us: all.us, n: PLACES.length, p: `${num((100 * all.polluted) / all.withAtlas, language)}%`, pk: all.polBy.park.k, pn: all.polBy.park.n, ck: all.polBy.community.k, cn: all.polBy.community.n, rk: all.polBy.reserve.k, rn: all.polBy.reserve.n })}</li>
          <li><strong>{tr(language, "t5Head", "The border shows in certification, not in the sky.")}</strong> {tr(language, "t5", "Arizona and northern Sonora report the same median limiting magnitude ({m}), and Hermosillo is as bright as Tucson, but all {n} certified places in the window are on the US side.", { m: num(GAN.azson.azMed, language), n: all.az.length })}</li>
        </ul>
      </section>

      <DarkSkyQuality language={language} v={{
        rows: 222, pol: WORLD.pop[2], mw: WORLD.pop[4], area: WORLD.area[2] ?? "—", k: WORLD.reconstructed.countries, y: POP_YEAR, rpol: num(WORLD.reconstructed.gt14, language, 1), rmw: num(WORLD.reconstructed.gt688, language, 1),
        total: num(GAN.funnel.total, language), gan: num(GAN.funnel.gan, language), lm0: num(GAN.funnel.lm0, language), miss: num(GAN.funnel.lmMissing, language), cloudy: num(GAN.funnel.cloudy, language),
        zero: num(GAN.funnel.zero, language), kept: num(GAN.funnel.kept, language), atlas: num(GAN.funnel.withAtlas, language),
        lm0late: `${num(all.lm0late * 100, language)}–${num(all.lm0lateMax * 100, language)}%`, b0: num(yW(2011).atlasMed ?? 0, language, 2), b1: num(yW(2022).atlasMed ?? 0, language, 2),
        n: PLACES.length, coords: PLACES.filter((p) => p.lat != null).length, years: PLACES.filter((p) => p.yearCertified).length, last: all.last, recent: all.recent,
        areas: PLACES.filter((p) => p.areaKm2).length, km: num(Math.round(wdKm2), language), dsKm: num(PUBLISHED.darkSky.km2, language),
        phx: num(phx, language, 2), tuc: num(RASTER.checks.Tucson, language, 2), her: num(RASTER.checks.Hermosillo, language, 2), kp: num(kp, language, 3),
      }} />

      {/* Footer: method, attribution */}
      <section className="method lp-method">
        <h2>{tr(language, "methodTitle", "Method & sources")}</h2>
        <div className="method__text">
          <p>{tr(language, "method1", "Country shares come from Table 2 of Falchi et al. (2016): the percentage of people and of land under artificial zenith sky brightness above 1.7, 14, 87, 688 and 3000 μcd/m², from a light-propagation model fed with VIIRS satellite radiance and calibrated with about 35,000 sky-brightness measurements. Light-polluted means more than 14 μcd/m² (8% above the natural 174); above 688 the Milky Way is no longer visible; above 3000 eyes cannot fully adapt to the dark. People are those shares times the World Bank population for {y}. The map and the point samples use the World Atlas 2015 GeoTIFF (GFZ Data Services), averaged to 1′ and 0.1°.", { y: POP_YEAR })}</p>
          <p>{tr(language, "method2", "Globe at Night reports from 2011 to 2025 are kept when they are naked-eye, give a limiting magnitude of 1–7, have at most a quarter of the sky cloudy and real coordinates. The trend compares reports within the same 1° cell and constellation, with a 1,000-draw bootstrap over those groups; it is converted to a brightness change with a cross-sectional fit of limiting magnitude on the atlas brightness at each report's site. Certified places come from Wikidata (International Dark Sky Parks, Reserves, Sanctuaries and Communities), with the earliest certification year and the largest area recorded. Snapshot built {date} with DuckDB and Python (rasterio).", { date: fmtDate(CAPTURED_AT, language) })}</p>
          <p>{tr(language, "method3", "Licences: Falchi et al. (2016) and the World Atlas 2015 are CC BY-NC 4.0, so this page uses them only non-commercially, with attribution to both the paper and the dataset, and publishes only downsampled images; the 2.9 GB GeoTIFF is not redistributed. Globe at Night is CC BY 4.0, Wikidata CC0, World Bank CC BY 4.0.")}</p>
        </div>
        <p className="method__sources">
          {tr(language, "sources", "Attribution")}:{" "}
          Falchi, F. et al. (2016), <a href="https://doi.org/10.1126/sciadv.1600377" rel="noopener">Science Advances</a> and <a href="https://doi.org/10.5880/GFZ.1.4.2016.001" rel="noopener">GFZ Data Services</a> (CC BY-NC 4.0)
          {" · "}<a href="https://globeatnight.org/maps-data/" rel="noopener">Globe at Night, NSF NOIRLab</a> (CC BY 4.0)
          {" · "}<a href="https://darksky.org/" rel="noopener">DarkSky International</a> (published totals)
          {" · "}<a href="https://www.wikidata.org/" rel="noopener">Wikidata</a> (CC0)
          {" · "}<a href="https://datatopics.worldbank.org/world-development-indicators/" rel="noopener">World Bank WDI</a> (CC BY 4.0)
        </p>
        <DarkSkySources checkedOn={fmtDate("2026-11-27", language)} language={language} />
      </section>
    </div>
  );
}
