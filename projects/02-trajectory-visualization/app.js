import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm';
import {
    makeSatellite, stateAt, sunAt, inEclipse, footprintRadiusDeg, observe, predictPasses, sampleTrack, compareWithOem,
} from './orbit.js?v=20261121a';
import {
    REGIMES, REGIME_LABEL, regimeColor, symbolPath, utcFull, utcShort, utcTime, utcHm,
    timeSeries, contactPlan, createMap, skyPlot, regimeChart,
} from './charts.js?v=20261121a';
import { landMask, landDots, globeTexture } from './earth.js?v=20261121a';
import { LANGUAGES, LANGUAGE_NAMES, language, tr, site, num, signed, duration, translatePage } from './i18n.js?v=20261121a';

const LAND_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json';
const CELESTRAK = norad => `https://celestrak.org/NORAD/elements/gp.php?CATNR=${norad}&FORMAT=tle`;
const CACHE_KEY = 'orbitConsole.elements.v1';
const CACHE_MS = 2 * 3_600_000;          // CelesTrak asks for at most one download per two hours
const STALE_MS = 24 * 3_600_000;         // refresh automatically when the newest data is older than this
const MINUTE = 60_000, HOUR = 3_600_000;

const STATIONS = [
    { id: 'tucson', name: 'Tucson, Arizona (University of Arizona)', short: 'Tucson', lat: 32.2319, lon: -110.9501, altKm: 0.73 },
    { id: 'goddard', name: 'NASA Goddard, Greenbelt, Maryland', short: 'Goddard', lat: 38.9926, lon: -76.8521, altKm: 0.05 },
    { id: 'wallops', name: 'NASA Wallops, Virginia', short: 'Wallops', lat: 37.9402, lon: -75.4664, altKm: 0.01 },
    { id: 'whitesands', name: 'White Sands Complex, New Mexico', short: 'White Sands', lat: 32.5007, lon: -106.6086, altKm: 1.45 },
    { id: 'svalbard', name: 'Svalbard Satellite Station, Norway', short: 'Svalbard', lat: 78.2297, lon: 15.4075, altKm: 0.5 },
    { id: 'mcmurdo', name: 'McMurdo Ground Station, Antarctica', short: 'McMurdo', lat: -77.8391, lon: 166.6671, altKm: 0.1 },
    { id: 'canberra', name: 'Canberra Deep Space Complex, Australia', short: 'Canberra', lat: -35.4014, lon: 148.9817, altKm: 0.69 },
].map(s => ({ ...s, name: tr(`station.${s.id}`, s.name) }));

const $ = selector => document.querySelector(selector);
const el = (tag, props = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (key === 'class') node.className = value;
        else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value);
    }
    node.append(...children.filter(child => child !== null && child !== undefined));
    return node;
};
const svgIcon = (d, fill) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '-6 -6 12 12');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', fill);
    svg.append(path);
    return svg;
};
const icon = regime => svgIcon(symbolPath(regime, 56), regimeColor(regime));
const badge = (level, text) => el('span', { class: `badge badge--${level}` }, text);
const ageLevel = days => days < 3 ? 'good' : days < 7 ? 'warning' : 'critical';
const days = value => tr('unit.days', '{n} d', { n: value });
const sunlit = dark => (dark ? badge('eclipse', tr('light.eclipse', 'Eclipse')) : badge('sun', tr('light.sunlit', 'Sunlit')));

const state = {
    sats: [], selectedId: 25544, stationId: 'tucson', mask: 10, horizonH: 24,
    mode: 'live', speed: 60, simMs: Date.now(), lastTick: performance.now(),
    source: null, contextMs: null, fleetMs: null, fleetPasses: new Map(), selectedPass: 0, validation: null,
};
const station = () => STATIONS.find(s => s.id === state.stationId);
const selected = () => state.sats.find(s => s.norad === state.selectedId) || state.sats[0];
const passesOf = norad => state.fleetPasses.get(norad) || [];

// ---------- Navigation (same behaviour as the portfolio) ----------

function initNav() {
    const select = $('#language-select');
    select.replaceChildren(...LANGUAGES.map(code => el('option', { value: code }, LANGUAGE_NAMES[code])));
    select.value = language;
    select.addEventListener('change', () => {
        const url = new URL(window.location.href);
        if (select.value === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', select.value);
        window.location.assign(url.href);
    });
    const toggle = $('#nav-toggle');
    const links = $('#primary-links');
    const label = toggle.querySelector('.nav__toggle-label');
    const iconNode = toggle.querySelector('.nav__toggle-icon');
    const setOpen = open => {
        toggle.setAttribute('aria-expanded', String(open));
        links.classList.toggle('is-open', open);
        label.textContent = open ? site('nav.close', 'Close menu') : site('nav.menu', 'Menu');
        iconNode.textContent = open ? '×' : '☰';
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', event => {
        if (!$('#nav').contains(event.target) && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 960) setOpen(false); });
}

// ---------- Data ----------

function tleChecksum(line) {
    let sum = 0;
    for (const c of line.slice(0, 68)) sum += c === '-' ? 1 : /\d/.test(c) ? Number(c) : 0;
    return sum % 10;
}

function validTle(norad, line1, line2) {
    return [line1, line2].every((line, i) => line.length === 69 && line.startsWith(`${i + 1} `) && tleChecksum(line) === Number(line[68]))
        && Number(line1.slice(2, 7)) === norad && Number(line2.slice(2, 7)) === norad;
}

function readCache() {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        return cached && Array.isArray(cached.sets) ? cached : null;
    } catch { return null; }
}

function writeCache(value) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

/** One request at a time: CelesTrak rejects bursts of parallel requests. */
async function downloadLive(catalog) {
    const sets = [];
    for (const [index, meta] of catalog.entries()) {
        setStatus('neutral', tr('data.downloading', 'Downloading element sets from CelesTrak… {i}/{n}', { i: index + 1, n: catalog.length }));
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10_000);
        try {
            const response = await fetch(CELESTRAK(meta.norad), { signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const lines = (await response.text()).split(/\r?\n/).map(line => line.trimEnd()).filter(Boolean);
            if (lines.length < 3 || !validTle(meta.norad, lines[1], lines[2])) throw new Error('invalid element set');
            sets.push({ norad: meta.norad, line1: lines[1], line2: lines[2] });
        } catch (error) {
            console.warn(`${meta.name}: keeping bundled elements (${error.message})`);
            if (index === 0 && !sets.length) break;  // service unreachable or throttling: stop early
        } finally { clearTimeout(timer); }
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    return sets;
}

function buildFleet(catalog, overrides) {
    const lines = new Map(overrides.map(set => [set.norad, set]));
    const sats = [];
    for (const meta of catalog) {
        const set = lines.get(meta.norad) || meta;
        const localized = {
            ...meta,
            mission: tr(`mission.${meta.norad}`, meta.mission),
            agency: tr(`agency.${meta.norad}`, meta.agency),
        };
        try { sats.push(makeSatellite({ ...localized, line1: set.line1, line2: set.line2 })); } catch (error) { console.warn(error); }
    }
    return sats;
}

async function loadElements({ force = false } = {}) {
    const snapshot = await (await fetch('data/elements.json')).json();
    const catalog = snapshot.satellites;
    let overrides = [];
    let source = { kind: 'snapshot', fetchedMs: Date.parse(snapshot.generatedUtc) };
    const cached = readCache();
    if (cached && cached.fetchedMs > source.fetchedMs) {
        overrides = cached.sets;
        source = { kind: 'cache', fetchedMs: cached.fetchedMs };
    }
    const cacheFresh = cached && Date.now() - cached.fetchedMs < CACHE_MS;
    if ((force && !cacheFresh) || Date.now() - source.fetchedMs > STALE_MS) {
        try {
            const live = await downloadLive(catalog);
            if (live.length) {
                overrides = live;
                source = { kind: 'live', fetchedMs: Date.now(), count: live.length, total: catalog.length };
                writeCache({ fetchedMs: source.fetchedMs, sets: live });
            }
        } catch (error) { console.warn('Live refresh failed', error); }
    }
    state.sats = buildFleet(catalog, overrides);
    state.source = source;
    state.contextMs = state.fleetMs = null;
    renderDataStatus(cacheFresh && force);
}

function setStatus(level, text) {
    $('#data-status').replaceChildren(badge(level, text));
}

function oldestAgeDays() {
    return Math.max(...state.sats.map(s => (Date.now() - s.elements.epoch.getTime()) / 86_400_000));
}

function renderDataStatus(throttled = false) {
    const oldest = oldestAgeDays();
    const origin = {
        snapshot: tr('data.snapshot', 'Daily snapshot'),
        cache: tr('data.cache', 'CelesTrak (cached)'),
        live: tr('data.live', 'CelesTrak (live)'),
    }[state.source.kind];
    let text = tr('data.status', '{origin}, retrieved {date} UTC · oldest epoch {age}', { origin, date: utcShort(new Date(state.source.fetchedMs)), age: days(num(oldest, 1)) });
    if (state.source.kind === 'live' && state.source.count < state.source.total) text += ` · ${tr('data.partial', '{n}/{total} refreshed', { n: state.source.count, total: state.source.total })}`;
    if (throttled) text += ` · ${tr('data.throttled', 'refresh limited to once per 2 h')}`;
    setStatus(ageLevel(oldest), text);
}

// ---------- Rendering ----------

let map, globe, regimes, altitudeChart, planChart, passChart;

function buildLegends() {
    const present = REGIMES.filter(regime => state.sats.some(s => s.regime === regime));
    const items = () => present.map(regime => el('li', {}, icon(regime), REGIME_LABEL[regime]));
    const stationLabel = tr('legend.station', 'Ground station');
    $('#regime-legend').replaceChildren(...items());
    $('#globe-legend').replaceChildren(...items(), el('li', {}, svgIcon('M-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0', 'var(--ink)'), stationLabel));
    $('#map-legend').replaceChildren(...items(), el('li', {}, svgIcon('M0,-5L5,4H-5Z', 'var(--ink)'), stationLabel),
        el('li', {}, svgIcon('M-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0', '#f7d58a'), tr('legend.subsolar', 'Subsolar point')));
}

function buildSelectors() {
    $('#satellite').replaceChildren(...state.sats.map(sat => el('option', { value: sat.norad }, sat.name)));
    $('#satellite').value = state.selectedId;
    $('#station').replaceChildren(...STATIONS.map(s => el('option', { value: s.id }, s.name)));
    $('#station').value = state.stationId;
}

function currentStates(date) {
    const states = new Map();
    for (const sat of state.sats) {
        const s = stateAt(sat, date);
        if (s) states.set(sat.norad, s);
    }
    return states;
}

/** Selected-satellite views, refreshed when the selection changes or simulated time drifts. */
function recomputeContext(force = false) {
    const sat = selected();
    const drift = state.contextMs === null ? Infinity : state.simMs - state.contextMs;
    if (!force && drift >= 0 && drift < 5 * MINUTE) return;
    state.contextMs = state.simMs;
    const start = state.simMs;
    const period = sat.elements.periodMin * MINUTE;
    const color = regimeColor(sat.regime);

    state.track = sampleTrack(sat, start - Math.min(period / 2, 12 * HOUR), start + Math.min(1.5 * period, 24 * HOUR), 540);

    // Altitude profile: two orbits (capped to 48 h) with Earth-shadow bands.
    const profile = sampleTrack(sat, start, start + Math.min(2 * period, 48 * HOUR), 480);
    const bands = [];
    for (const p of profile) {
        if (p.eclipse && (!bands.length || bands.at(-1).closed)) bands.push({ from: p.ms, to: p.ms });
        if (p.eclipse) bands.at(-1).to = p.ms; else if (bands.length) bands.at(-1).closed = true;
    }
    for (const band of bands) band.label = tr('altitude.eclipseBand', 'Eclipse · {d}', { d: duration(band.to - band.from) });
    const eclipseShare = profile.filter(p => p.eclipse).length / profile.length;
    const lo = profile.reduce((a, b) => (b.altKm < a.altKm ? b : a));
    const hi = profile.reduce((a, b) => (b.altKm > a.altKm ? b : a));
    const span = duration(profile.at(-1).ms - start);
    $('#altitude-title').textContent = tr('altitude.title', '{name}, {span} ahead', { name: sat.name, span });
    $('#altitude-meta').textContent = tr('altitude.meta', "{pct}% of the time in Earth's shadow · altitude swings {km} km", { pct: num(eclipseShare * 100, 0), km: num(hi.altKm - lo.altKm, 1) });
    altitudeChart = timeSeries($('#altitude-chart'), {
        series: [{ key: 'alt', label: tr('altitude.series', 'Geodetic altitude'), color, values: profile.map(p => ({ ms: p.ms, v: p.altKm })) }],
        yLabel: tr('altitude.axis', 'Altitude · km'), unit: 'km', valueFormat: v => num(v, 1), bands,
        bandLabel: tr('altitude.key', 'Earth shadow (umbra)'), height: 260,
        annotations: [
            { ms: hi.ms, v: hi.altKm, label: tr('altitude.high', 'High {km} km', { km: num(hi.altKm, 0) }) },
            { ms: lo.ms, v: lo.altKm, label: tr('altitude.low', 'Low {km} km', { km: num(lo.altKm, 0) }), position: 'below' },
        ],
        ariaLabel: tr('altitude.aria', '{name} altitude over the next {span}', { name: sat.name, span }),
        extraRows: i => [{ value: profile[i].eclipse ? tr('light.eclipse', 'Eclipse') : tr('light.sunlit', 'Sunlit'), label: tr('tip.illumination', 'illumination') },
            { value: `${num(profile[i].speedKms, 3)} km/s`, label: tr('tip.speed', 'speed') }],
    });
    renderPassDetail();
}

/** Fleet-wide passes and inertial orbits, refreshed on station or window changes and every 30 sim-minutes. */
function recomputeFleet(force = false) {
    const drift = state.fleetMs === null ? Infinity : state.simMs - state.fleetMs;
    if (!force && drift >= 0 && drift < 30 * MINUTE) return;
    state.fleetMs = state.simMs;
    const st = station();
    state.fleetPasses = new Map(state.sats.map(sat => [sat.norad, predictPasses(sat, st, new Date(state.simMs), state.horizonH, state.mask)]));
    const orbits = new Map(state.sats.map(sat => {
        const period = sat.elements.periodMin * MINUTE;
        const ring = sampleTrack(sat, state.simMs, state.simMs + period, sat.regime === 'LEO' ? 240 : 480).map(p => p.position);
        return [sat.norad, ring];
    }));
    if (globe) globe.setOrbits(orbits, state.sats);
    state.selectedPass = nextPassIndex(state.selectedId);
    renderPlan();
    renderPassDetail();
    $('#fleet-meta').textContent = tr('fleet.meta', 'Next contact from {station} above {mask}° within {h} h · select a row to focus', { station: st.short, mask: state.mask, h: state.horizonH });
}

function renderPlan() {
    const st = station();
    const total = [...state.fleetPasses.values()].reduce((n, list) => n + list.length, 0);
    $('#plan-title').textContent = tr('plan.title', 'Every pass over {station}', { station: st.short });
    $('#plan-meta').textContent = tr('plan.meta', '{n} passes above {mask}° in the next {h} h', { n: total, mask: state.mask, h: state.horizonH });
    planChart = contactPlan($('#contact-plan'), {
        rows: state.sats.map(sat => ({ sat, passes: passesOf(sat.norad) })),
        startMs: state.fleetMs, endMs: state.fleetMs + state.horizonH * HOUR,
        selectedId: state.selectedId, selectedPass: { norad: state.selectedId, index: state.selectedPass },
        onSelect: (norad, index) => {
            const changed = norad !== state.selectedId;
            state.selectedId = norad;
            $('#satellite').value = norad;
            state.selectedPass = index ?? nextPassIndex(norad);
            if (changed) recomputeContext(true);
            renderPlan();
            renderPassDetail();
            tick();
        },
    });
    planChart.setNow(state.simMs);
}

function nextPassIndex(norad) {
    const i = passesOf(norad).findIndex(p => p.los.getTime() > state.simMs);
    return Math.max(0, i);
}

function renderPassDetail() {
    const sat = selected();
    const st = station();
    const passes = passesOf(sat.norad);
    const pass = passes[state.selectedPass];
    const color = regimeColor(sat.regime);
    $('#pass-title').textContent = pass
        ? tr('pass.title', '{name} over {station}, pass {i} of {n}', { name: sat.name, station: st.short, i: state.selectedPass + 1, n: passes.length })
        : tr('pass.titleNone', '{name} over {station}', { name: sat.name, station: st.short });
    renderPassTable(passes);
    if (!pass) {
        $('#pass-meta').textContent = '';
        $('#pass-tiles').replaceChildren(el('p', { class: 'empty' }, tr('pass.none', 'No passes above {mask}° in the next {h} h. Try a lower mask, a longer window or another station.', { mask: state.mask, h: state.horizonH })));
        $('#pass-chart').replaceChildren();
        passChart = null;
        skyPlot($('#sky'), null);
        return;
    }
    const minRange = Math.min(...pass.track.map(p => p.rangeKm));
    const startsIn = pass.aos.getTime() - state.simMs;
    $('#pass-meta').textContent = `AOS ${utcShort(pass.aos)} · TCA ${utcTime(pass.tca)} · LOS ${utcShort(pass.los)} UTC`;
    const status = startsIn > 0 ? duration(startsIn) : state.simMs < pass.los.getTime() ? tr('pass.now', 'Now') : tr('pass.done', 'Done');
    const tiles = [
        [status, startsIn > 0 ? tr('pass.until', 'Until acquisition') : tr('pass.status', 'Status')],
        [duration(pass.durationMin * MINUTE), tr('pass.duration', 'Duration')],
        [`${num(pass.maxElDeg, 1)}°`, tr('pass.maxEl', 'Maximum elevation')],
        [`${num(minRange, 0)} km`, tr('pass.closest', 'Closest range')],
        [`${num(pass.aosAzDeg, 0)}° → ${num(pass.losAzDeg, 0)}°`, tr('pass.azimuth', 'Azimuth AOS → LOS')],
    ];
    $('#pass-tiles').replaceChildren(...tiles.map(([value, label]) => el('div', { class: 'tile' }, el('div', { class: 'tile__value' }, value), el('div', { class: 'tile__label' }, label))));
    const track = pass.track;
    const peak = track.reduce((a, b) => (b.elDeg > a.elDeg ? b : a));
    passChart = timeSeries($('#pass-chart'), {
        series: [{ key: 'el', label: tr('pass.elevation', 'Elevation'), color, values: track.map(p => ({ ms: p.ms, v: p.elDeg })) }],
        yDomain: [0, 90], yLabel: tr('pass.axis', 'Elevation · °'), unit: '°', valueFormat: v => num(v, 1), height: 220,
        refLines: state.mask ? [{ v: state.mask, label: tr('pass.maskLine', '{mask}° mask', { mask: state.mask }) }] : [],
        annotations: [{ ms: peak.ms, v: peak.elDeg, label: tr('pass.peak', '{el}° at {time}', { el: num(peak.elDeg, 1), time: utcHm(new Date(peak.ms)) }) }],
        ariaLabel: tr('pass.aria', 'Elevation of {name} during the selected pass', { name: sat.name }),
        extraRows: i => [{ value: `${num(track[i].azDeg, 1)}°`, label: tr('tip.azimuth', 'azimuth') }, { value: `${num(track[i].rangeKm, 0)} km`, label: tr('tip.range', 'slant range') }],
    });
    updateSky();
}

function renderPassTable(passes) {
    const table = $('#pass-table');
    if (!passes.length) { table.replaceChildren(); return; }
    const columns = ['#', tr('col.aos', 'AOS (UTC)'), tr('col.tca', 'TCA (UTC)'), tr('col.los', 'LOS (UTC)'), tr('col.duration', 'Duration'), tr('col.maxEl', 'Max el.'), tr('col.azimuth', 'Azimuth AOS → LOS')];
    const head = el('thead', {}, el('tr', {}, ...columns.map((text, i) => el('th', { class: i > 3 ? 'num' : '', scope: 'col' }, text))));
    const body = el('tbody');
    passes.forEach((pass, index) => {
        const choose = () => { state.selectedPass = index; renderPlan(); renderPassDetail(); };
        body.append(el('tr', { class: index === state.selectedPass ? 'is-selected' : '', onclick: choose },
            el('td', {}, el('button', { type: 'button', class: 'row-button', 'aria-pressed': String(index === state.selectedPass), onclick: event => { event.stopPropagation(); choose(); } }, String(index + 1))),
            el('td', {}, (pass.startsVisible ? '≤ ' : '') + utcShort(pass.aos)),
            el('td', {}, utcTime(pass.tca)),
            el('td', {}, (pass.endsVisible ? '≥ ' : '') + utcShort(pass.los)),
            el('td', { class: 'num' }, duration(pass.durationMin * MINUTE)),
            el('td', { class: 'num' }, `${num(pass.maxElDeg, 1)}°`),
            el('td', { class: 'num' }, `${num(pass.aosAzDeg, 0)}° → ${num(pass.losAzDeg, 0)}°`)));
    });
    table.replaceChildren(head, body);
}

function updateSky() {
    const sat = selected();
    const pass = passesOf(sat.norad)[state.selectedPass];
    const inPass = pass && state.simMs >= pass.aos.getTime() && state.simMs <= pass.los.getTime();
    skyPlot($('#sky'), pass, inPass ? observe(sat, station(), new Date(state.simMs)) : null, regimeColor(sat.regime));
}

function buildFleetTable() {
    const columns = [
        tr('col.satellite', 'Satellite'), tr('col.agency', 'Agency'), tr('col.orbit', 'Orbit'), tr('col.altitude', 'Altitude km'),
        tr('col.speed', 'Speed km/s'), tr('col.lat', 'Lat'), tr('col.lon', 'Lon'), tr('col.incl', 'Incl.'), tr('col.period', 'Period min'),
        tr('col.light', 'Light'), tr('col.next', 'Next contact (UTC)'), tr('col.age', 'Element age'),
    ];
    const numeric = new Set([3, 4, 5, 6, 7, 8]);
    const head = el('thead', {}, el('tr', {}, ...columns.map((text, i) => el('th', { class: numeric.has(i) ? 'num' : '', scope: 'col' }, text))));
    const body = el('tbody');
    state.rows = new Map();
    for (const sat of state.sats) {
        const cells = columns.map((_, i) => el('td', { class: numeric.has(i) ? 'num' : '' }));
        cells[0].append(el('button', { type: 'button', class: 'row-button', onclick: event => { event.stopPropagation(); select(sat.norad); } }, icon(sat.regime), sat.name));
        cells[1].className = 'muted';
        cells[1].textContent = sat.agency;
        cells[2].textContent = `${sat.regime}${sat.elements.sunSynchronous ? ' · SSO' : ''}`;
        cells[7].textContent = `${num(sat.elements.inclinationDeg, 2)}°`;
        cells[8].textContent = num(sat.elements.periodMin, 1);
        const row = el('tr', { onclick: () => select(sat.norad) }, ...cells);
        body.append(row);
        state.rows.set(sat.norad, { row, cells });
    }
    $('#fleet-table').replaceChildren(head, body);
}

function updateFleetTable(states, sun) {
    for (const sat of state.sats) {
        const { row, cells } = state.rows.get(sat.norad);
        const s = states.get(sat.norad);
        row.classList.toggle('is-selected', sat.norad === state.selectedId);
        if (!s) { cells[3].textContent = tr('fleet.error', 'propagation error'); continue; }
        cells[3].textContent = num(s.altKm, 0);
        cells[4].textContent = num(s.speedKms, 3);
        cells[5].textContent = `${num(s.lat, 2)}°`;
        cells[6].textContent = `${num(s.lon, 2)}°`;
        cells[9].replaceChildren(sunlit(inEclipse(s.position, sun)));
        const next = passesOf(sat.norad).find(p => p.los.getTime() > state.simMs);
        const live = next && next.aos.getTime() <= state.simMs;
        cells[10].replaceChildren(live
            ? badge('good', tr('fleet.inContact', 'In contact · {el}°', { el: num(observe(sat, station(), new Date(state.simMs)).elDeg, 0) }))
            : document.createTextNode(next ? `${utcShort(next.aos)} · ${num(next.maxElDeg, 0)}°` : tr('fleet.none', 'None in window')));
        const ageDays = (state.simMs - sat.elements.epoch.getTime()) / 86_400_000;
        cells[11].replaceChildren(badge(ageLevel(Math.abs(ageDays)), days(num(ageDays, 1))));
    }
}

function renderKpis(states, sun) {
    const lit = state.sats.filter(sat => { const s = states.get(sat.norad); return s && !inEclipse(s.position, sun); }).length;
    let next = null;
    let inContact = 0;
    for (const sat of state.sats) {
        const passes = passesOf(sat.norad);
        if (passes.some(p => p.aos.getTime() <= state.simMs && p.los.getTime() > state.simMs)) inContact++;
        const pass = passes.find(p => p.aos.getTime() > state.simMs);
        if (pass && (!next || pass.aos < next.pass.aos)) next = { sat, pass };
    }
    const kpi = (label, value, unit, note) => el('div', { class: 'kpi' },
        el('div', { class: 'kpi__label' }, label), el('div', { class: 'kpi__value' }, value, unit ? el('small', {}, unit) : null), el('div', { class: 'kpi__note' }, note));
    const contactNote = tr('kpi.inContact', '{n} in contact now', { n: inContact });
    $('#kpis').replaceChildren(
        kpi(tr('kpi.tracked', 'Spacecraft tracked'), String(state.sats.length), null, tr('kpi.trackedNote', 'Elements {d} days old at most', { d: num(oldestAgeDays(), 1) })),
        kpi(tr('kpi.next', 'Next acquisition · {station}', { station: station().short }), next ? duration(next.pass.aos.getTime() - state.simMs) : '—', null,
            next ? `${tr('kpi.nextNote', '{name} to {el}°', { name: next.sat.name, el: num(next.pass.maxElDeg, 0) })} · ${contactNote}`
                : `${tr('kpi.noneIn', 'None in {h} h', { h: state.horizonH })} · ${contactNote}`),
        kpi(tr('kpi.sunlight', 'In sunlight'), String(lit), `/ ${state.sats.length}`, tr('kpi.shadow', "{n} in Earth's shadow right now", { n: state.sats.length - lit })),
        kpi(tr('kpi.error', 'Model error vs NASA'), state.validation ? num(state.validation.rms, 2) : '—', 'km', tr('kpi.errorNote', 'SGP4 RMS near epoch, ISS')),
    );
}

function renderTelemetry(s, sun) {
    const sat = selected();
    const e = sat.elements;
    const st = station();
    $('#telemetry-title').textContent = sat.name;
    $('#mission').textContent = `${sat.mission} · ${sat.agency} · NORAD ${sat.norad}`;
    const group = (title, rows) => el('section', { class: 'telemetry-group' }, el('h3', {}, title),
        el('dl', {}, ...rows.flatMap(([label, value]) => [el('dt', {}, label), el('dd', {}, value)])));
    if (!s) {
        $('#readouts').replaceChildren();
        $('#telemetry').replaceChildren(el('p', { class: 'empty' }, tr('telemetry.error', 'SGP4 could not propagate this element set to the selected time.')));
        return;
    }
    const readout = (label, value, unit) => el('div', { class: 'readout' }, el('div', { class: 'readout__label' }, label),
        el('div', { class: 'readout__value' }, value, el('small', {}, unit)));
    $('#readouts').replaceChildren(
        readout(tr('telemetry.altitude', 'Altitude'), num(s.altKm, 1), 'km'), readout(tr('telemetry.velocity', 'Velocity'), num(s.speedKms, 3), 'km/s'),
        readout(tr('telemetry.latitude', 'Latitude'), num(s.lat, 3), '°'), readout(tr('telemetry.longitude', 'Longitude'), num(s.lon, 3), '°'));
    const look = observe(sat, st, new Date(state.simMs));
    const pass = passesOf(sat.norad).find(p => p.los.getTime() > state.simMs);
    const inContact = look.elDeg >= state.mask;
    const ageDays = (state.simMs - e.epoch.getTime()) / 86_400_000;
    const v = s.velocity, r = s.position;
    const linkStatus = inContact ? badge('good', tr('telemetry.inContact', 'In contact'))
        : badge('neutral', pass ? tr('telemetry.aosIn', 'AOS in {d}', { d: duration(pass.aos.getTime() - state.simMs) }) : tr('telemetry.noPass', 'No pass in window'));
    $('#telemetry').replaceChildren(
        group(tr('telemetry.link', 'Link from {station}', { station: st.short }), [
            [tr('telemetry.status', 'Status'), linkStatus],
            [tr('telemetry.azEl', 'Azimuth / elevation'), `${num(look.azDeg, 1)}° / ${num(look.elDeg, 1)}°`],
            [tr('telemetry.range', 'Slant range'), `${num(look.rangeKm, 0)} km`],
            [tr('telemetry.rangeRate', 'Range rate'), `${signed(look.rangeRateKms, 3)} km/s`],
            [tr('telemetry.illumination', 'Illumination'), inEclipse(r, sun) ? badge('eclipse', tr('light.shadow', 'Earth shadow')) : badge('sun', tr('light.sunlit', 'Sunlit'))],
        ]),
        group(tr('telemetry.elements', 'Mean elements at epoch'), [
            [tr('telemetry.sma', 'Semi-major axis'), `${num(e.semiMajorKm, 1)} km`], [tr('telemetry.ecc', 'Eccentricity'), e.eccentricity.toFixed(7)],
            [tr('telemetry.incl', 'Inclination'), `${num(e.inclinationDeg, 4)}°`], ['RAAN', `${num(e.raanDeg, 4)}°`],
            [tr('telemetry.argp', 'Arg. of perigee'), `${num(e.argPerigeeDeg, 4)}°`], [tr('telemetry.period', 'Period'), `${num(e.periodMin, 2)} min`],
            [tr('telemetry.periApo', 'Perigee / apogee'), `${num(e.perigeeKm, 0)} / ${num(e.apogeeKm, 0)} km`],
            [tr('telemetry.nodal', 'Nodal drift (J2)'), `${signed(e.nodalRateDegDay, 3)}°/d${e.sunSynchronous ? ' · SSO' : ''}`],
            [tr('telemetry.bstar', 'B* drag term'), e.bstar.toExponential(3)],
        ]),
        group(tr('telemetry.vector', 'State vector · TEME'), [
            ['r (km)', `${num(r.x, 1)}, ${num(r.y, 1)}, ${num(r.z, 1)}`],
            ['v (km/s)', `${num(v.x, 4)}, ${num(v.y, 4)}, ${num(v.z, 4)}`],
        ]),
        group(tr('telemetry.set', 'Element set'), [
            [tr('telemetry.epoch', 'Epoch'), utcFull(e.epoch)],
            [tr('telemetry.age', 'Age at sim time'), badge(ageLevel(Math.abs(ageDays)), tr('telemetry.ageDays', '{n} days', { n: num(ageDays, 2) }))],
        ]),
        el('pre', { class: 'tle', 'aria-label': tr('telemetry.tle', 'Two-line element set') }, `${sat.catalogName}\n${sat.line1}\n${sat.line2}`),
    );
}

function tick() {
    const now = performance.now();
    if (state.mode === 'live') state.simMs = Date.now();
    else if (state.mode === 'play') state.simMs += (now - state.lastTick) * state.speed;
    state.lastTick = now;
    const offsetMin = Math.round((state.simMs - Date.now()) / MINUTE);
    if (state.mode === 'play' && (offsetMin > 1440 || offsetMin < -720)) setMode('paused');

    const date = new Date(state.simMs);
    recomputeFleet();
    recomputeContext();
    const states = currentStates(date);
    const sun = sunAt(date);
    const sat = selected();
    const s = states.get(sat.norad);
    const st = station();
    const altitude = s ? s.altKm : sat.elements.perigeeKm;
    const look = s ? observe(sat, st, date) : null;
    map.update({
        sats: state.sats, states, selected: sat, track: state.track, now: state.simMs, sunPoint: sun, stationInfo: st,
        footprintDeg: footprintRadiusDeg(altitude, state.mask), contactDeg: footprintRadiusDeg(altitude, state.mask),
    });
    globe?.update({ sats: state.sats, states, selected: sat, gmst: s ? s.gmst : 0, sunUnit: sun.unit, stationInfo: st, inContact: look && look.elDeg >= state.mask });
    if (s) {
        $('#globe-readout').replaceChildren(
            el('span', {}, el('b', {}, sat.name), ` · ${REGIME_LABEL[sat.regime]}`),
            el('span', {}, tr('globe.readoutAlt', 'ALT {alt} km · V {v} km/s', { alt: num(s.altKm, 0), v: num(s.speedKms, 2) })),
            el('span', {}, `${inEclipse(s.position, sun) ? tr('light.shadowLong', 'In Earth shadow') : tr('light.sunlit', 'Sunlit')} · ${tr('globe.readoutPeriod', 'period {p} min', { p: num(sat.elements.periodMin, 1) })}`));
    }
    regimes.update(states, state.selectedId);
    altitudeChart?.setNow(state.simMs);
    planChart?.setNow(state.simMs);
    passChart?.setNow(state.simMs);
    renderTelemetry(s, sun);
    renderKpis(states, sun);
    updateFleetTable(states, sun);
    if (state.mode !== 'paused') updateSky();

    $('#sim-clock').textContent = `${utcFull(date)} UTC`;
    $('#scrub').value = Math.max(-720, Math.min(1440, offsetMin));
    $('#scrub-value').textContent = `${offsetMin < 0 ? '−' : '+'}${Math.floor(Math.abs(offsetMin) / 60)} h ${String(Math.abs(offsetMin) % 60).padStart(2, '0')} m`;
}

function setMode(mode) {
    state.mode = mode;
    const label = $('#mode-label');
    label.textContent = { live: tr('mode.live', 'LIVE'), play: tr('mode.sim', 'SIM {x}×', { x: state.speed }), paused: tr('mode.paused', 'PAUSED') }[mode];
    label.classList.toggle('is-live', mode === 'live');
    $('#play-button').setAttribute('aria-pressed', String(mode === 'play'));
    $('#play-button').textContent = mode === 'play' ? tr('controls.pause', 'Pause') : tr('controls.play', 'Play');
    $('#live-button').disabled = mode === 'live';
}

function select(norad) {
    state.selectedId = Number(norad);
    $('#satellite').value = state.selectedId;
    state.selectedPass = nextPassIndex(state.selectedId);
    recomputeContext(true);
    renderPlan();
    tick();
}

function buildRegimes() {
    regimes = regimeChart($('#regime-chart'), state.sats, { onSelect: select });
}

function renderValidation(oem) {
    const iss = makeSatellite({ name: 'ISS', ...oem.tle });
    const residuals = compareWithOem(iss, oem);
    const epochMs = iss.elements.epoch.getTime();
    const near = residuals.filter(r => Math.abs(r.ms - epochMs) <= 6 * HOUR);
    const rms = Math.sqrt(near.reduce((sum, r) => sum + r.total ** 2, 0) / near.length);
    const last = residuals.at(-1);
    const maxRadial = Math.max(...residuals.map(r => Math.abs(r.radial)));
    state.validation = { rms };
    $('#validation-tiles').replaceChildren(
        ...[[`${num(rms, 2)} km`, tr('validation.rms', 'RMS within ±6 h of epoch')],
            [`${num(last.total, 1)} km`, tr('validation.after', 'After {d}', { d: duration(last.ms - epochMs) })],
            [`${num(maxRadial, 2)} km`, tr('validation.radial', 'Largest radial error')]]
            .map(([value, label]) => el('div', { class: 'tile' }, el('div', { class: 'tile__value' }, value), el('div', { class: 'tile__label' }, label))));
    $('#validation-note').textContent = tr('validation.note',
        "{n} NASA state vectors from {origin}, file created {date} UTC. In-track error dominates and grows with time from epoch, the expected behaviour of SGP4's simplified drag model.",
        { n: num(residuals.length), origin: oem.originator, date: oem.creationDate.slice(0, 16).replace('T', ' ') });
    const peak = residuals.reduce((a, b) => (Math.abs(b.inTrack) > Math.abs(a.inTrack) ? b : a));
    timeSeries($('#validation-chart'), {
        series: [
            { key: 'inTrack', label: tr('validation.inTrack', 'In-track'), color: 'var(--leo)', values: residuals.map(r => ({ ms: r.ms, v: r.inTrack })) },
            { key: 'radial', label: tr('validation.radialSeries', 'Radial'), color: 'var(--heo)', values: residuals.map(r => ({ ms: r.ms, v: r.radial })) },
            { key: 'crossTrack', label: tr('validation.cross', 'Cross-track'), color: 'var(--geo)', values: residuals.map(r => ({ ms: r.ms, v: r.crossTrack })) },
        ],
        yLabel: tr('validation.axis', 'SGP4 − NASA · km'), unit: 'km', valueFormat: v => signed(v, 2),
        markers: [{ ms: epochMs, label: tr('validation.epoch', 'TLE epoch') }], height: 260,
        annotations: [{ ms: peak.ms, v: peak.inTrack, label: `${signed(peak.inTrack, 1)} km`, color: 'var(--leo)' }],
        ariaLabel: tr('validation.aria', 'Difference between SGP4 and the NASA ISS ephemeris in radial, in-track and cross-track components'),
        extraRows: i => [{ value: `${num(residuals[i].total, 2)} km`, label: tr('tip.total', 'total') }],
    });
}

function wireControls() {
    $('#live-button').addEventListener('click', () => { setMode('live'); tick(); });
    $('#play-button').addEventListener('click', () => { setMode(state.mode === 'play' ? 'paused' : 'play'); });
    $('#speed').addEventListener('change', event => { state.speed = Number(event.target.value); if (state.mode === 'play') setMode('play'); });
    $('#scrub').addEventListener('input', event => {
        state.simMs = Date.now() + Number(event.target.value) * MINUTE;
        if (state.mode === 'live') setMode('paused');
        tick();
    });
    $('#satellite').addEventListener('change', event => select(event.target.value));
    const refresh = () => { recomputeFleet(true); recomputeContext(true); tick(); };
    $('#station').addEventListener('change', event => { state.stationId = event.target.value; refresh(); });
    $('#mask').addEventListener('change', event => { state.mask = Number(event.target.value); refresh(); });
    $('#horizon').addEventListener('change', event => { state.horizonH = Number(event.target.value); refresh(); });
    $('#refresh-button').addEventListener('click', async () => {
        $('#refresh-button').disabled = true;
        await loadElements({ force: true });
        rebuild();
        $('#refresh-button').disabled = false;
    });
    document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('[data-preset]').forEach(b => b.classList.toggle('is-active', b === button));
        globe?.setPreset(button.dataset.preset);
    }));
    let resizeTimer;
    let lastWidth = $('.console').clientWidth;
    new ResizeObserver(() => {
        const width = $('.console').clientWidth;
        if (width === lastWidth) return;
        lastWidth = width;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            buildRegimes(); renderPlan(); recomputeContext(true);
            if (state.oem) renderValidation(state.oem);
            tick();
        }, 200);
    }).observe($('.console'));
}

function rebuild() {
    buildSelectors();
    buildLegends();
    buildFleetTable();
    buildRegimes();
    recomputeFleet(true);
    recomputeContext(true);
    tick();
}

async function startGlobe(isLand) {
    try {
        const { createGlobe } = await import('./globe.js?v=20261121a');
        globe = createGlobe($('#globe'), { texture: globeTexture(isLand), onSelect: select });
        recomputeFleet(true);
        tick();
    } catch (error) {
        console.warn('3D view unavailable', error);
        $('#globe').replaceChildren(el('p', { class: 'empty' }, tr('globe.noWebgl', 'The 3D orbit view needs WebGL, which this browser does not provide. Every other view still works.')));
    }
}

async function main() {
    translatePage();
    initNav();
    setStatus('neutral', tr('data.loading', 'Loading element sets…'));
    try {
        const [land] = await Promise.all([
            fetch(LAND_URL).then(r => r.json()).then(topo => topojson.feature(topo, topo.objects.land)),
            loadElements(),
        ]);
        const isLand = landMask(land);
        map = createMap($('#map'), { dots: landDots(isLand, 1.8, false), onSelect: select });
        wireControls();
        setMode('live');
        try {
            state.oem = await (await fetch('data/iss_oem.json')).json();
            renderValidation(state.oem);
        } catch (error) {
            $('#validation-note').textContent = tr('validation.loadError', 'Could not load the NASA ephemeris: {message}', { message: error.message });
        }
        rebuild();
        $('#refresh-button').disabled = false;
        setInterval(tick, 250);
        startGlobe(isLand);
    } catch (error) {
        console.error(error);
        setStatus('critical', tr('data.startError', 'Could not start the console: {message}', { message: error.message }));
    }
}

main();
