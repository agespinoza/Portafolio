import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm';
import {
    makeSatellite, stateAt, sunAt, inEclipse, footprintRadiusDeg, observe, predictPasses, sampleTrack, compareWithOem,
} from './orbit.js';
import {
    REGIMES, REGIME_LABEL, regimeColor, symbolPath, utcFull, utcShort, utcTime,
    timeSeries, createMap, skyPlot, regimeChart,
} from './charts.js';

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
];

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
const num = (value, digits = 0) => Number.isFinite(value)
    ? value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
const signed = (value, digits) => (value >= 0 ? '+' : '−') + num(Math.abs(value), digits);
const duration = ms => {
    const minutes = Math.round(Math.abs(ms) / MINUTE);
    const d = Math.floor(minutes / 1440), h = Math.floor((minutes % 1440) / 60), m = minutes % 60;
    return d ? `${d} d ${h} h` : h ? `${h} h ${String(m).padStart(2, '0')} m` : `${m} min`;
};
const icon = regime => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '-6 -6 12 12');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', symbolPath(regime, 56));
    path.setAttribute('fill', regimeColor(regime));
    svg.append(path);
    return svg;
};
const badge = (level, text) => el('span', { class: `badge badge--${level}` }, text);
const ageLevel = days => days < 3 ? 'good' : days < 7 ? 'warning' : 'critical';

const state = {
    sats: [], selectedId: 25544, stationId: 'tucson', mask: 10, horizonH: 24,
    mode: 'live', speed: 60, simMs: Date.now(), lastTick: performance.now(),
    source: null, contextMs: null, fleetMs: null, passes: [], fleetPasses: new Map(), selectedPass: 0,
};
const station = () => STATIONS.find(s => s.id === state.stationId);
const selected = () => state.sats.find(s => s.norad === state.selectedId) || state.sats[0];

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
        setStatus('neutral', `Downloading element sets from CelesTrak… ${index + 1}/${catalog.length}`);
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
        try { sats.push(makeSatellite({ ...meta, line1: set.line1, line2: set.line2 })); } catch (error) { console.warn(error); }
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
        setStatus('neutral', 'Downloading current element sets from CelesTrak…');
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

function renderDataStatus(throttled = false) {
    const ages = state.sats.map(s => (Date.now() - s.elements.epoch.getTime()) / 86_400_000);
    const oldest = Math.max(...ages);
    const level = ageLevel(oldest);
    const origin = { snapshot: 'bundled snapshot', cache: 'CelesTrak (cached)', live: 'CelesTrak (live)' }[state.source.kind];
    const partial = state.source.kind === 'live' && state.source.count < state.source.total ? ` · ${state.source.count}/${state.source.total} refreshed` : '';
    setStatus(level, `${origin}, retrieved ${utcShort(new Date(state.source.fetchedMs))} UTC · oldest epoch ${num(oldest, 1)} d${partial}${throttled ? ' · refresh limited to once per 2 h' : ''}`);
}

// ---------- Rendering ----------

let map, regimes, altitudeChart, elevationChart, validationChart;

function buildLegends() {
    const present = REGIMES.filter(regime => state.sats.some(s => s.regime === regime));
    for (const id of ['#map-legend', '#regime-legend']) {
        $(id).replaceChildren(...present.map(regime => el('li', {}, icon(regime), REGIME_LABEL[regime])));
    }
    const mapLegend = $('#map-legend');
    const stationKey = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stationKey.setAttribute('viewBox', '-6 -6 12 12');
    stationKey.innerHTML = '<path d="M0,-5L5,4H-5Z" fill="currentColor"/>';
    mapLegend.append(el('li', {}, stationKey, 'Ground station'));
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

/** Heavier computations, refreshed when the selection changes or simulated time drifts. */
function recomputeContext(force = false) {
    const sat = selected();
    const drift = state.contextMs === null ? Infinity : state.simMs - state.contextMs;
    if (!force && drift >= 0 && drift < 5 * MINUTE) return;
    state.contextMs = state.simMs;
    const start = state.simMs;
    const period = sat.elements.periodMin * MINUTE;

    state.track = sampleTrack(sat, start - Math.min(period / 2, 12 * HOUR), start + Math.min(1.5 * period, 24 * HOUR), 540);

    // Altitude profile: two orbits (capped to 48 h) with Earth-shadow bands.
    const profile = sampleTrack(sat, start, start + Math.min(2 * period, 48 * HOUR), 480);
    const bands = [];
    for (const p of profile) {
        if (p.eclipse && (!bands.length || bands.at(-1).closed)) bands.push({ from: p.ms, to: p.ms });
        if (p.eclipse) bands.at(-1).to = p.ms; else if (bands.length) bands.at(-1).closed = true;
    }
    const eclipseShare = profile.filter(p => p.eclipse).length / profile.length;
    $('#altitude-meta').textContent = `Next ${duration(profile.at(-1).ms - start)} · ${num(eclipseShare * 100, 0)}% in Earth shadow`;
    altitudeChart = timeSeries($('#altitude-chart'), {
        series: [{ key: 'alt', label: 'Geodetic altitude', color: regimeColor(sat.regime), values: profile.map(p => ({ ms: p.ms, v: p.altKm })) }],
        yLabel: 'Altitude (km)', unit: 'km', valueFormat: v => num(v, 1), bands, bandLabel: 'Earth shadow (eclipse)',
        ariaLabel: `${sat.name} altitude over the next ${duration(profile.at(-1).ms - start)}`,
        extraRows: i => [{ value: profile[i].eclipse ? 'Eclipse' : 'Sunlit', label: 'illumination' },
            { value: `${num(profile[i].speedKms, 3)} km/s`, label: 'speed' }],
    });

    // Ground station elevation over the pass window.
    const st = station();
    const end = start + state.horizonH * HOUR;
    const steps = 720;
    const looks = [];
    for (let i = 0; i <= steps; i++) {
        const ms = start + (end - start) * i / steps;
        const look = observe(sat, st, new Date(ms));
        looks.push({ ms, v: look && look.elDeg >= 0 ? look.elDeg : NaN, look });
    }
    state.passes = predictPasses(sat, st, new Date(start), state.horizonH, state.mask);
    state.selectedPass = 0;
    const contactMin = state.passes.reduce((sum, p) => sum + p.durationMin, 0);
    $('#contact-meta').textContent = `${st.short} · ${state.passes.length} passes above ${state.mask}° · ${duration(contactMin * MINUTE)} total contact in ${state.horizonH} h`;
    elevationChart = timeSeries($('#elevation-chart'), {
        series: [{ key: 'el', label: 'Elevation', color: regimeColor(sat.regime), values: looks }],
        yDomain: [0, 90], yLabel: 'Elevation (°)', unit: '°', valueFormat: v => num(v, 1),
        bands: state.passes.map(p => ({ from: p.aos.getTime(), to: p.los.getTime() })), bandLabel: `Contact window above the ${state.mask}° mask`,
        refLines: state.mask ? [{ v: state.mask, label: `${state.mask}° mask` }] : [],
        ariaLabel: `${sat.name} elevation from ${st.short} over ${state.horizonH} hours`,
        extraRows: i => looks[i].look ? [{ value: `${num(looks[i].look.azDeg, 1)}°`, label: 'azimuth' },
            { value: `${num(looks[i].look.rangeKm, 0)} km`, label: 'slant range' }] : [],
    });
    renderPasses();
}

function recomputeFleetPasses(force = false) {
    const drift = state.fleetMs === null ? Infinity : state.simMs - state.fleetMs;
    if (!force && drift >= 0 && drift < 30 * MINUTE) return;
    state.fleetMs = state.simMs;
    state.fleetPasses = new Map(state.sats.map(sat => [sat.norad, predictPasses(sat, station(), new Date(state.simMs), state.horizonH, state.mask)]));
    $('#fleet-meta').textContent = `Next contact from ${station().short} above ${state.mask}° within ${state.horizonH} h · select a row to focus a satellite`;
}

function renderPasses() {
    const table = $('#pass-table');
    if (!state.passes.length) {
        table.replaceChildren(el('tbody', {}, el('tr', {}, el('td', { class: 'empty' }, `No passes above ${state.mask}° in the next ${state.horizonH} h. Try a lower mask, a longer window or another station.`))));
        skyPlot($('#sky'), null);
        $('#sky-caption').textContent = '';
        return;
    }
    const head = el('thead', {}, el('tr', {}, ...['#', 'AOS (UTC)', 'TCA (UTC)', 'LOS (UTC)', 'Duration', 'Max el.', 'Azimuth AOS → LOS'].map((text, i) => el('th', { class: i > 3 ? 'num' : '', scope: 'col' }, text))));
    const body = el('tbody');
    state.passes.forEach((pass, index) => {
        const choose = () => { state.selectedPass = index; renderPasses(); updateSky(); };
        const row = el('tr', { class: index === state.selectedPass ? 'is-selected' : '', onclick: choose },
            el('td', {}, el('button', { type: 'button', class: 'row-button', 'aria-pressed': String(index === state.selectedPass), onclick: event => { event.stopPropagation(); choose(); } }, String(index + 1))),
            el('td', {}, (pass.startsVisible ? '≤ ' : '') + utcShort(pass.aos)),
            el('td', {}, utcTime(pass.tca)),
            el('td', {}, (pass.endsVisible ? '≥ ' : '') + utcShort(pass.los)),
            el('td', { class: 'num' }, duration(pass.durationMin * MINUTE)),
            el('td', { class: 'num' }, `${num(pass.maxElDeg, 1)}°`),
            el('td', { class: 'num' }, `${num(pass.aosAzDeg, 0)}° → ${num(pass.losAzDeg, 0)}°`));
        body.append(row);
    });
    table.replaceChildren(head, body);
    updateSky();
}

function updateSky() {
    const pass = state.passes[state.selectedPass];
    const now = observe(selected(), station(), new Date(state.simMs));
    const inPass = pass && state.simMs >= pass.aos.getTime() && state.simMs <= pass.los.getTime();
    skyPlot($('#sky'), pass, inPass ? now : null);
    if (pass) {
        const until = pass.aos.getTime() - state.simMs;
        $('#sky-caption').textContent = `Pass ${state.selectedPass + 1}: max ${num(pass.maxElDeg, 1)}° at ${utcTime(pass.tca)} UTC · ${inPass ? 'in progress' : until > 0 ? `AOS in ${duration(until)}` : 'completed'}`;
    }
}

function buildFleetTable() {
    const columns = ['Satellite', 'Agency', 'Orbit', 'Altitude km', 'Speed km/s', 'Lat', 'Lon', 'Incl.', 'Period min', 'Light', 'Next contact (UTC)', 'Element age'];
    const numeric = new Set([3, 4, 5, 6, 7, 8]);
    const head = el('thead', {}, el('tr', {}, ...columns.map((text, i) => el('th', { class: numeric.has(i) ? 'num' : '', scope: 'col' }, text))));
    const body = el('tbody');
    state.rows = new Map();
    for (const sat of state.sats) {
        const cells = columns.map((_, i) => el('td', { class: numeric.has(i) ? 'num' : '' }));
        cells[0].append(el('button', { type: 'button', class: 'row-button', onclick: event => { event.stopPropagation(); select(sat.norad); } }, icon(sat.regime), sat.name));
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
        if (!s) { cells[3].textContent = 'propagation error'; continue; }
        cells[3].textContent = num(s.altKm, 0);
        cells[4].textContent = num(s.speedKms, 3);
        cells[5].textContent = `${num(s.lat, 2)}°`;
        cells[6].textContent = `${num(s.lon, 2)}°`;
        const dark = inEclipse(s.position, sun);
        cells[9].replaceChildren(dark ? badge('neutral', 'Eclipse') : document.createTextNode('Sunlit'));
        const passes = state.fleetPasses.get(sat.norad) || [];
        const next = passes.find(p => p.los.getTime() > state.simMs);
        const live = next && next.aos.getTime() <= state.simMs;
        cells[10].replaceChildren(live ? badge('good', `In contact · ${num(observe(sat, station(), new Date(state.simMs)).elDeg, 0)}°`)
            : document.createTextNode(next ? `${utcShort(next.aos)} · ${num(next.maxElDeg, 0)}°` : 'None in window'));
        const ageDays = (state.simMs - sat.elements.epoch.getTime()) / 86_400_000;
        cells[11].replaceChildren(badge(ageLevel(Math.abs(ageDays)), `${num(ageDays, 1)} d`));
    }
}

function renderTelemetry(s, sun) {
    const sat = selected();
    const e = sat.elements;
    const st = station();
    $('#mission').textContent = `${sat.mission} · ${sat.agency} · NORAD ${sat.norad}`;
    const group = (title, rows) => el('section', { class: 'telemetry-group' }, el('h3', {}, title),
        el('dl', {}, ...rows.flatMap(([label, value]) => [el('dt', {}, label), el('dd', {}, value)])));
    if (!s) { $('#telemetry').replaceChildren(el('p', { class: 'empty' }, 'SGP4 could not propagate this element set to the selected time.')); return; }
    const look = observe(sat, st, new Date(state.simMs));
    const pass = state.passes.find(p => p.los.getTime() > state.simMs);
    const inContact = look.elDeg >= state.mask;
    const ageDays = (state.simMs - e.epoch.getTime()) / 86_400_000;
    const v = s.velocity, r = s.position;
    $('#telemetry').replaceChildren(
        group('Sub-satellite point', [
            ['Latitude', `${num(s.lat, 3)}°`], ['Longitude', `${num(s.lon, 3)}°`],
            ['Altitude', `${num(s.altKm, 1)} km`], ['Inertial speed', `${num(s.speedKms, 3)} km/s`],
            ['Illumination', inEclipse(r, sun) ? badge('neutral', 'Earth shadow') : 'Sunlit'],
        ]),
        group(`Link from ${st.short}`, [
            ['Status', inContact ? badge('good', 'In contact') : badge('neutral', pass ? `AOS in ${duration(pass.aos.getTime() - state.simMs)}` : 'No pass in window')],
            ['Azimuth', `${num(look.azDeg, 1)}°`], ['Elevation', `${num(look.elDeg, 1)}°`],
            ['Slant range', `${num(look.rangeKm, 0)} km`], ['Range rate', `${signed(look.rangeRateKms, 3)} km/s`],
        ]),
        group('Mean elements (at epoch)', [
            ['Semi-major axis', `${num(e.semiMajorKm, 1)} km`], ['Eccentricity', e.eccentricity.toFixed(7)],
            ['Inclination', `${num(e.inclinationDeg, 4)}°`], ['RAAN', `${num(e.raanDeg, 4)}°`],
            ['Arg. of perigee', `${num(e.argPerigeeDeg, 4)}°`], ['Period', `${num(e.periodMin, 2)} min`],
            ['Perigee / apogee', `${num(e.perigeeKm, 0)} / ${num(e.apogeeKm, 0)} km`],
            ['Nodal drift (J2)', `${signed(e.nodalRateDegDay, 3)}°/day${e.sunSynchronous ? ' · SSO' : ''}`],
            ['B* drag term', e.bstar.toExponential(3)],
        ]),
        group('State vector (TEME)', [
            ['r (km)', `${num(r.x, 1)}, ${num(r.y, 1)}, ${num(r.z, 1)}`],
            ['v (km/s)', `${num(v.x, 4)}, ${num(v.y, 4)}, ${num(v.z, 4)}`],
        ]),
        group('Element set', [
            ['Epoch', `${utcFull(e.epoch)} UTC`],
            ['Age at sim time', badge(ageLevel(Math.abs(ageDays)), `${num(ageDays, 2)} days`)],
        ]),
        el('pre', { class: 'tle', 'aria-label': 'Two-line element set' }, `${sat.catalogName}\n${sat.line1}\n${sat.line2}`),
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
    recomputeContext();
    recomputeFleetPasses();
    const states = currentStates(date);
    const sun = sunAt(date);
    const sat = selected();
    const s = states.get(sat.norad);
    const st = station();
    const altitude = s ? s.altKm : sat.elements.perigeeKm;
    map.update({
        sats: state.sats, states, selected: sat, track: state.track, now: state.simMs, sunPoint: sun, stationInfo: st,
        footprintDeg: footprintRadiusDeg(altitude, state.mask), contactDeg: footprintRadiusDeg(altitude, state.mask),
    });
    regimes.update(states, state.selectedId);
    altitudeChart.setNow(state.simMs);
    elevationChart.setNow(state.simMs);
    renderTelemetry(s, sun);
    updateFleetTable(states, sun);
    if (state.mode !== 'paused') updateSky();

    $('#sim-clock').textContent = `${utcFull(date)} UTC`;
    $('#scrub').value = Math.max(-720, Math.min(1440, offsetMin));
    $('#scrub-value').textContent = `${offsetMin < 0 ? '−' : '+'}${Math.floor(Math.abs(offsetMin) / 60)} h ${String(Math.abs(offsetMin) % 60).padStart(2, '0')} m`;
}

function setMode(mode) {
    state.mode = mode;
    const label = $('#mode-label');
    label.textContent = { live: 'LIVE', play: `SIM ${state.speed}×`, paused: 'PAUSED' }[mode];
    label.classList.toggle('is-live', mode === 'live');
    $('#play-button').setAttribute('aria-pressed', String(mode === 'play'));
    $('#play-button').textContent = mode === 'play' ? 'Pause' : 'Play';
    $('#live-button').disabled = mode === 'live';
}

function select(norad) {
    state.selectedId = Number(norad);
    $('#satellite').value = state.selectedId;
    recomputeContext(true);
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
    $('#validation-tiles').replaceChildren(
        ...[[`${num(rms, 2)} km`, 'RMS position error within ±6 h of TLE epoch'],
            [`${num(last.total, 1)} km`, `Error ${duration(last.ms - epochMs)} after epoch`],
            [`${num(maxRadial, 2)} km`, 'Largest radial error (altitude)']]
            .map(([value, label]) => el('div', { class: 'tile' }, el('div', { class: 'tile__value' }, value), el('div', { class: 'tile__label' }, label))));
    $('#validation-note').textContent = `${residuals.length} NASA state vectors from ${oem.originator}, file created ${oem.creationDate.slice(0, 16).replace('T', ' ')} UTC. In-track error dominates and grows with time from epoch, the expected behaviour of SGP4's drag model.`;
    validationChart = timeSeries($('#validation-chart'), {
        series: [
            { key: 'inTrack', label: 'In-track', color: 'var(--series-1)', values: residuals.map(r => ({ ms: r.ms, v: r.inTrack })) },
            { key: 'radial', label: 'Radial', color: 'var(--series-2)', values: residuals.map(r => ({ ms: r.ms, v: r.radial })) },
            { key: 'crossTrack', label: 'Cross-track', color: 'var(--series-3)', values: residuals.map(r => ({ ms: r.ms, v: r.crossTrack })) },
        ],
        yLabel: 'SGP4 − NASA (km)', unit: 'km', valueFormat: v => signed(v, 2), markers: [{ ms: epochMs, label: 'TLE epoch' }],
        ariaLabel: 'Difference between SGP4 and the NASA ISS ephemeris in radial, in-track and cross-track components',
        extraRows: i => [{ value: `${num(residuals[i].total, 2)} km`, label: 'total' }],
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
    $('#station').addEventListener('change', event => { state.stationId = event.target.value; recomputeContext(true); recomputeFleetPasses(true); tick(); });
    $('#mask').addEventListener('change', event => { state.mask = Number(event.target.value); recomputeContext(true); recomputeFleetPasses(true); tick(); });
    $('#horizon').addEventListener('change', event => { state.horizonH = Number(event.target.value); recomputeContext(true); recomputeFleetPasses(true); tick(); });
    $('#refresh-button').addEventListener('click', async () => {
        $('#refresh-button').disabled = true;
        await loadElements({ force: true });
        rebuild();
        $('#refresh-button').disabled = false;
    });
    let resizeTimer;
    let lastWidth = $('.console').clientWidth;
    new ResizeObserver(() => {
        const width = $('.console').clientWidth;
        if (width === lastWidth) return;
        lastWidth = width;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { buildRegimes(); recomputeContext(true); if (state.oem) renderValidation(state.oem); tick(); }, 200);
    }).observe($('.console'));
}

function rebuild() {
    buildSelectors();
    buildLegends();
    buildFleetTable();
    buildRegimes();
    recomputeContext(true);
    recomputeFleetPasses(true);
    tick();
}

async function main() {
    try {
        const [land] = await Promise.all([
            fetch(LAND_URL).then(r => r.json()).then(topo => topojson.feature(topo, topo.objects.land)),
            loadElements(),
        ]);
        map = createMap($('#map'), land, { onSelect: select });
        wireControls();
        setMode('live');
        rebuild();
        $('#refresh-button').disabled = false;
        setInterval(tick, 250);
        try {
            state.oem = await (await fetch('data/iss_oem.json')).json();
            renderValidation(state.oem);
        } catch (error) {
            $('#validation-note').textContent = `Could not load the NASA ephemeris: ${error.message}`;
        }
    } catch (error) {
        console.error(error);
        setStatus('critical', `Could not start the console: ${error.message}`);
    }
}

main();
