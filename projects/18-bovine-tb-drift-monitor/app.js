import { DEFAULTS, POLICIES, amplify, compare, simulate, usableLength } from './engine.js?v=20261122a';
import { costBars, costChart, dataChart, shareChart } from './charts.js?v=20261122b';
import { LANGUAGES, LANGUAGE_NAMES, date, language, localeFor, num, pct, site, tr, translatePage } from './i18n.js?v=20261122a';

const $ = selector => document.querySelector(selector);
const el = (tag, props = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (key === 'class') node.className = value;
        else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value);
    }
    node.append(...children.flat().filter(child => child !== null && child !== undefined && child !== false));
    return node;
};

const RUNS = 30;
const REGIONS = ['uk_edge', 'uk_hra', 'uk_lra', 'uk_england', 'uk_wales', 'uk_scotland', 'ie'];
const REGION_NAMES = {
    uk_edge: ['Great Britain: England, Edge area', 'region.uk_edge'], uk_hra: ['Great Britain: England, High Risk Area', 'region.uk_hra'],
    uk_lra: ['Great Britain: England, Low Risk Area', 'region.uk_lra'], uk_england: ['Great Britain: England (all)', 'region.uk_england'],
    uk_wales: ['Great Britain: Wales', 'region.uk_wales'], uk_scotland: ['Great Britain: Scotland', 'region.uk_scotland'], ie: ['Ireland (whole state)', 'region.ie'],
};
const regionName = key => tr(REGION_NAMES[key][1], REGION_NAMES[key][0]);
const policyName = key => ({
    keep: tr('policy.keep', 'Keep the threshold'),
    unlabeled: tr('policy.unlabeled', 'Re-tune from the flag rate'),
    labeled: tr('policy.labeled', 'Re-tune from confirmed results'),
    oracle: tr('policy.oracle', 'Know the true share (best case)'),
})[key];
const quarterLabel = label => label.replace('Q', ' Q');

const state = {
    snapshot: null, region: 'uk_edge', policy: 'unlabeled', index: 0, seed: 1, playing: false, timer: null,
    config: { ...DEFAULTS, amplify: 1 }, protocolOn: false, protocolQuarter: 40,
    view: null,
};

// ---------- Navigation (same behaviour as the portfolio) ----------

function initNav() {
    const select = $('#language-select');
    select.replaceChildren(...LANGUAGES.map(code => el('option', { value: code, lang: localeFor(code) }, LANGUAGE_NAMES[code])));
    select.value = language;
    select.addEventListener('change', () => {
        const url = new URL(window.location.href);
        if (select.value === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', select.value);
        window.location.assign(url.href);
    });
    const toggle = $('#nav-toggle');
    const links = $('#primary-links');
    const setOpen = open => {
        toggle.setAttribute('aria-expanded', String(open));
        links.classList.toggle('is-open', open);
        toggle.querySelector('.nav__toggle-label').textContent = open ? site('nav.close', 'Close menu') : site('nav.menu', 'Menu');
        toggle.querySelector('.nav__toggle-icon').textContent = open ? '×' : '☰';
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); } });
    document.addEventListener('click', event => { if (!$('#nav').contains(event.target) && toggle.getAttribute('aria-expanded') === 'true') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 960) setOpen(false); });
}

// ---------- Data and simulation ----------

async function loadData() {
    const response = await fetch('data/snapshot.json');
    if (!response.ok) throw new Error(`data/snapshot.json: HTTP ${response.status}`);
    state.snapshot = await response.json();
}

function config() {
    return { ...state.config, protocolAt: state.protocolOn ? state.protocolQuarter : null };
}

function recompute() {
    const { snapshot } = state;
    const series = snapshot.regions[state.region];
    const n = usableLength(series);
    const real = series.slice(0, n), flow = snapshot.flowHead.slice(0, n), labels = snapshot.quarters.slice(0, n);
    const cfg = config();
    const policies = simulate(real, flow, cfg, state.seed);
    state.view = {
        n, real, flow, labels, cfg, policies,
        scaled: amplify(real, cfg.amplify, cfg.trainQuarters),
        runs: compare(real, flow, cfg, RUNS),
    };
    state.index = Math.min(state.index, n - 1);
    const range = $('#quarter');
    range.max = String(n - 1);
    range.value = String(state.index);
    renderAll();
}

// ---------- Rendering ----------

function renderAll() {
    renderQuarter();
    renderStatic();
    renderRuns();
    renderSliders();
}

/** Everything that depends on the chosen quarter. */
function renderQuarter() {
    const v = state.view;
    $('#quarter-out').textContent = quarterLabel(v.labels[state.index]);
    $('#quarter').value = String(state.index);
    renderKpis();
    renderCharts();
    renderTable();
}

function renderKpis() {
    const v = state.view, t = state.index;
    const step = v.policies[state.policy].steps[t];
    const share = v.real[t];
    const retunes = v.policies[state.policy].steps.slice(0, t + 1).filter(s => s.retuned).length;
    const card = (label, value, note) => el('div', { class: 'kpi' },
        el('div', { class: 'kpi__label' }, label), el('div', { class: 'kpi__value' }, value), el('div', { class: 'kpi__note' }, note));
    $('#kpis').replaceChildren(
        card(tr('kpi.share', 'Infected herds (real data)'), pct(share, share < 0.01 ? 2 : 1), `${regionName(state.region)} · ${quarterLabel(v.labels[t])}`),
        card(tr('kpi.flow', 'Cattle imported from Mexico'), num(v.flow[t]),
            v.flow[t] > 0 ? tr('kpi.flowNote', 'head this quarter · USDA ERS') : tr('kpi.flowNone', 'no imports recorded this quarter')),
        card(tr('kpi.caught', 'Infected herds caught'), step.missRate === null ? '—' : pct(1 - step.missRate, 0),
            step.herds ? tr('kpi.caughtNote', '{fp} false alarms among {n} herds scored', { fp: num(step.fp), n: num(step.herds) }) : tr('kpi.noHerds', 'no herds scored this quarter')),
        card(tr('kpi.cost', 'Cost so far'), num(step.cumulative), tr('kpi.costNote', '{n} threshold re-tunes so far · {policy}', { n: retunes, policy: policyName(state.policy) })),
    );
}

function renderCharts() {
    const v = state.view;
    const pick = index => { state.index = index; renderQuarter(); };
    $('#data-title').textContent = tr('data.title', '{region}: share of infected herds and cattle flow', { region: regionName(state.region) });
    const scaledShown = dataChart($('#data-chart'), {
        labels: v.labels, real: v.real, scaled: v.scaled, flow: v.flow, index: state.index, onPick: pick,
        label: tr('data.aria', 'Share of infected herds per quarter and US cattle imports from Mexico. Click to choose a quarter.'),
    });
    $('#data-legend').replaceChildren(...[
        el('li', {}, el('i', { class: 'key key--real' }), tr('legend.real', 'real share')),
        scaledShown ? el('li', {}, el('i', { class: 'key key--scaled' }), tr('legend.scaled', 'share used in the simulation ({x}× the real change)', { x: num(v.cfg.amplify, 1) })) : null,
        el('li', {}, el('i', { class: 'key key--flow' }), tr('legend.flow', 'cattle imported from Mexico')),
    ].filter(Boolean));
    const zero = v.flow.filter(f => f === 0).length;
    const ending = state.region === 'ie' ? tr('data.ieEnds', 'Ireland’s series ends in {q}.', { q: quarterLabel(state.snapshot.ieLast) }) : '';
    $('#data-note').textContent = [
        tr('data.note', 'Each point is the end of a quarter. Click a chart to move the quarter shown everywhere else.'),
        ending,
        zero ? tr('data.zero', '{n} quarters have no cattle imports recorded and are shown as zero.', { n: zero }) : '',
    ].filter(Boolean).join(' ');

    const steps = v.policies[state.policy].steps;
    shareChart($('#share-chart'), {
        labels: v.labels, scaled: v.scaled, steps, index: state.index, onPick: pick,
        label: tr('share.aria', 'Real share of infected herds against the estimate from the flag rate, for the policy shown.'),
    });
    $('#share-legend').replaceChildren(
        el('li', {}, el('i', { class: 'key key--real' }), tr('legend.simShare', 'share in the simulation')),
        el('li', {}, el('i', { class: 'key key--est' }), tr('legend.estimate', 'estimate from the flag rate')),
        el('li', {}, el('i', { class: 'key key--retune' }), tr('legend.retune', 'threshold re-tuned')),
    );

    costChart($('#cost-chart'), {
        labels: v.labels, policies: v.policies, shown: state.policy, index: state.index, onPick: pick,
        label: tr('cost.aria', 'Cumulative cost of each policy over the quarters.'),
    });
    $('#cost-legend').replaceChildren(...POLICIES.map(key => el('li', {}, el('i', { class: `key series-fill series--${key}` }), policyName(key))));
    const final = key => v.policies[key].total;
    $('#cost-note').textContent = tr('cost.note', 'One simulated year of this series (simulation {seed}). All the way to the end: keep {keep}, flag rate {flag}, confirmed results {labeled}, true share {oracle}. Costs are in arbitrary units.', {
        seed: state.seed, keep: num(final('keep')), flag: num(final('unlabeled')), labeled: num(final('labeled')), oracle: num(final('oracle')),
    });
}

function renderTable() {
    const v = state.view, t = state.index;
    $('#table-title').textContent = tr('table.title', 'Every policy in {quarter}', { quarter: quarterLabel(v.labels[t]) });
    const herds = v.policies.keep.steps[t].herds;
    $('#table-meta').textContent = herds
        ? tr('table.meta', '{n} herds scored · real share {share}', { n: num(herds), share: pct(v.real[t], v.real[t] < 0.01 ? 2 : 1) })
        : tr('table.none', 'No cattle imported this quarter, so no herds are scored.');
    const head = ['policy', 'threshold', 'caught', 'precision', 'cost', 'total'];
    const labels = {
        policy: tr('table.policy', 'Policy'), threshold: tr('table.threshold', 'Flag above score'), caught: tr('table.caught', 'Infected herds caught'),
        precision: tr('table.precision', 'Flagged herds that are infected'), cost: tr('table.cost', 'Cost this quarter'), total: tr('table.total', 'Cost so far'),
    };
    const row = key => {
        const s = v.policies[key].steps[t];
        return el('tr', { class: key === state.policy ? 'is-selected' : '' },
            el('td', {}, policyName(key)),
            el('td', { class: 'num' }, num(s.tau, 2)),
            el('td', { class: 'num' }, s.missRate === null ? '—' : pct(1 - s.missRate, 0)),
            el('td', { class: 'num' }, s.ppv === null ? '—' : pct(s.ppv, 0)),
            el('td', { class: 'num' }, num(s.cost)),
            el('td', { class: 'num' }, num(s.cumulative)));
    };
    $('#policy-table').replaceChildren(
        el('thead', {}, el('tr', {}, head.map(h => el('th', { class: h === 'policy' ? '' : 'num', scope: 'col' }, labels[h])))),
        el('tbody', {}, POLICIES.map(row)));
}

function renderStatic() {
    $('#engine-note').textContent = tr('engine.note', 'The browser console and the automated tests run the same engine (engine.js). The data come from build_data.py, built {date}.', { date: date(state.snapshot.built) });
}

function renderRuns() {
    const v = state.view;
    const names = Object.fromEntries(POLICIES.map(k => [k, policyName(k)]));
    const best = costBars($('#cost-bars'), { cost: v.runs, names, keys: POLICIES });
    $('#runs-meta').textContent = tr('runs.meta', 'Mean of {n} simulated years, with the 10th–90th percentile range', { n: RUNS });
    const keep = v.runs.keep.mean, bestMean = v.runs[best].mean, oracle = v.runs.oracle.mean;
    const saving = Math.max(0, 1 - bestMean / keep), ceiling = Math.max(0, 1 - oracle / keep);
    $('#runs-note').textContent = best === 'keep'
        ? tr('runs.keepWins', 'Keeping the threshold is cheapest here: the real change is small and every re-tune costs {c}. Even knowing the true share would save only {oracle}. Try a larger change in the what-if panel.', { c: num(v.cfg.costRetune), oracle: pct(ceiling, 1) })
        : tr('runs.best', '{policy} is cheapest on average ({mean}, {x} less than keeping the threshold, using {n} re-tunes a year). Knowing the true share would save {oracle}.', {
            policy: policyName(best), mean: num(bestMean), x: pct(saving, 1), n: num(v.runs[best].retunes, 1), oracle: pct(ceiling, 1),
        });
}

const SOURCES = [
    ['Defra / APHA', 'Tuberculosis in cattle in Great Britain: herd prevalence', 'sources.ukUse', 'England (all, High Risk, Edge, Low Risk), Wales, Scotland', '2010 Q4 – 2026 Q2', 'Open Government Licence', 'https://www.gov.uk/government/statistical-data-sets/tuberculosis-in-cattle-in-great-britain'],
    ['DAFM · CSO', 'DAQ01 Bovine Tuberculosis', 'sources.ieUse', 'Ireland: herds restricted at quarter end over herds in the state', '2010 Q4 – 2024 Q1', 'CC BY 4.0', 'https://data.gov.ie/dataset/daq01-bovine-tuberculosis'],
    ['USDA ERS', 'Livestock & Meat International Trade Data: cattle, monthly, head', 'sources.ersUse', 'Cattle imported by the US from Mexico, summed per quarter', '2010 Q4 – 2026 Q2', 'US government data', 'https://www.ers.usda.gov/data-products/livestock-and-meat-international-trade-data'],
    ['SENASICA', 'Situación actual de tuberculosis bovina', 'sources.senasicaUse', 'Share of Mexico’s territory by campaign phase', '30 Dec 2024', 'gob.mx', 'https://www.gob.mx/senasica/documentos/situacion-actual-de-tuberculosis-bovina'],
];

function renderSources() {
    const head = ['publisher', 'dataset', 'used', 'period', 'licence'];
    const labels = {
        publisher: tr('sources.publisher', 'Publisher'), dataset: tr('sources.dataset', 'Dataset'), used: tr('sources.used', 'Used for'),
        period: tr('sources.period', 'Period'), licence: tr('sources.licence', 'Licence'),
    };
    const uses = { 'sources.ukUse': 'Shares of infected herds for the five British regions', 'sources.ieUse': 'Share of infected herds for Ireland', 'sources.ersUse': 'How many herds are scored each quarter', 'sources.senasicaUse': 'Context only: not simulated' };
    $('#sources-table').replaceChildren(
        el('thead', {}, el('tr', {}, head.map(h => el('th', { scope: 'col' }, labels[h])))),
        el('tbody', {}, SOURCES.map(([publisher, title, useKey, , period, licence, url]) => el('tr', {},
            el('td', {}, publisher),
            el('td', {}, el('a', { href: url, rel: 'noopener', target: '_blank' }, title)),
            el('td', { class: 'wrap-cell' }, tr(useKey, uses[useKey])),
            el('td', {}, period),
            el('td', {}, licence)))));
    const phases = state.snapshot.senasica;
    const parts = [
        ['eradication', 'Eradication phase', phases.territoryShare.eradication], ['lowPrevalenceII', 'Low prevalence II', phases.territoryShare.lowPrevalenceII],
        ['lowPrevalenceI', 'Low prevalence I', phases.territoryShare.lowPrevalenceI], ['control', 'Control phase', phases.territoryShare.control],
    ];
    $('#context').replaceChildren(
        el('h3', {}, tr('context.title', 'Mexico, for context')),
        el('p', {}, tr('context.text', 'SENASICA reports the share of the national territory by tuberculosis campaign phase, as of {date}. I found no public Mexican or US bovine TB series by month or by state, so those countries are not simulated and no incidence comparison between Mexico, the US, and the UK is made here.', { date: date(phases.asOf) })),
        el('ul', { class: 'phases', 'aria-label': tr('context.aria', 'Share of Mexico’s territory by phase') },
            parts.map(([key, fallback, value]) => el('li', { style: `flex: ${value} 1 0` },
                el('strong', {}, `${num(value, 2)}%`), el('span', {}, tr(`phase.${key}`, fallback))))));
}

// ---------- Controls ----------

const SLIDERS = [
    { id: 'amplify', key: 'amplify', min: 1, max: 5, step: 0.5, label: ['slider.amplify', 'Size of the change (× the real change)'], format: v => `${num(v, 1)}×` },
    { id: 'delay', key: 'labelDelay', min: 0, max: 6, step: 1, label: ['slider.delay', 'Confirmed results arrive after (quarters)'], format: v => num(v) },
    { id: 'miss', key: 'costMiss', min: 1, max: 50, step: 1, label: ['slider.miss', 'A missed infected herd costs (× a false alarm)'], format: v => `${num(v)}×` },
    { id: 'margin', key: 'margin', min: 0.1, max: 1, step: 0.05, label: ['slider.margin', 'Re-tune when the estimate moves by'], format: v => pct(v, 0) },
];

function renderSliders() {
    const container = $('#sliders');
    if (container.dataset.ready) {
        for (const s of SLIDERS) $(`#slider-${s.id}-out`).textContent = s.format(state.config[s.key]);
        $('#slider-protocol-out').textContent = state.protocolOn ? quarterLabel(state.view.labels[Math.min(state.protocolQuarter, state.view.n - 1)]) : tr('slider.off', 'off');
        $('#slider-delta-out').textContent = `${state.config.protocolDelta >= 0 ? '+' : '−'}${num(Math.abs(state.config.protocolDelta), 1)}`;
        return;
    }
    container.dataset.ready = '1';
    const field = (id, label, input, output) => el('label', { class: 'field field--slider', for: id },
        el('span', {}, label, ' ', output), input);
    const nodes = SLIDERS.map(s => {
        const input = el('input', { type: 'range', id: `slider-${s.id}`, min: s.min, max: s.max, step: s.step, value: state.config[s.key] });
        input.addEventListener('input', () => { state.config[s.key] = Number(input.value); scheduleRecompute(); renderSliders(); });
        return field(`slider-${s.id}`, tr(...s.label), input, el('output', { id: `slider-${s.id}-out` }));
    });
    const volume = el('input', { type: 'checkbox', id: 'volume', checked: '' });
    volume.checked = state.config.volumeScale;
    volume.addEventListener('change', () => { state.config.volumeScale = volume.checked; scheduleRecompute(); });
    nodes.push(el('label', { class: 'field field--check', for: 'volume' }, volume, tr('slider.volume', 'Scale the herds scored by cattle imports from Mexico')));

    const protocol = el('input', { type: 'range', id: 'slider-protocol', min: 1, max: 54, step: 1, value: state.protocolQuarter });
    protocol.addEventListener('input', () => { state.protocolQuarter = Number(protocol.value); state.protocolOn = true; scheduleRecompute(); renderSliders(); });
    const off = el('button', { type: 'button', class: 'button button--small' }, tr('slider.protocolOff', 'No test change'));
    off.addEventListener('click', () => { state.protocolOn = false; scheduleRecompute(); renderSliders(); });
    nodes.push(field('slider-protocol', tr('slider.protocol', 'The test itself changes at'), protocol, el('output', { id: 'slider-protocol-out' })), el('div', { class: 'field field--slider' }, off));
    const delta = el('input', { type: 'range', id: 'slider-delta', min: -1, max: 1, step: 0.1, value: state.config.protocolDelta });
    delta.addEventListener('input', () => { state.config.protocolDelta = Number(delta.value); scheduleRecompute(); renderSliders(); });
    nodes.push(field('slider-delta', tr('slider.delta', 'Change in test sensitivity'), delta, el('output', { id: 'slider-delta-out' })));
    container.replaceChildren(...nodes);
    renderSliders();
}

let pending = null;
function scheduleRecompute() {
    clearTimeout(pending);
    pending = setTimeout(recompute, 70);
}

function setPlaying(on) {
    state.playing = on;
    clearInterval(state.timer);
    $('#play').textContent = on ? tr('controls.pause', 'Pause') : tr('controls.play', 'Play');
    if (on) {
        if (state.index >= state.view.n - 1) { state.index = 0; renderQuarter(); }
        state.timer = setInterval(() => {
            if (state.index >= state.view.n - 1) { setPlaying(false); return; }
            state.index += 1;
            renderQuarter();
        }, 320);
    }
}

function initControls() {
    $('#region').replaceChildren(...REGIONS.map(key => el('option', { value: key }, regionName(key))));
    $('#policy').replaceChildren(...POLICIES.map(key => el('option', { value: key }, policyName(key))));
    $('#region').value = state.region;
    $('#policy').value = state.policy;
    $('#region').addEventListener('change', event => { state.region = event.target.value; recompute(); });
    $('#policy').addEventListener('change', event => { state.policy = event.target.value; renderQuarter(); });
    $('#quarter').addEventListener('input', event => { setPlaying(false); state.index = Number(event.target.value); renderQuarter(); });
    $('#play').addEventListener('click', () => setPlaying(!state.playing));
    $('#reseed').addEventListener('click', () => { state.seed += 1; recompute(); });
    const reset = () => {
        state.config = { ...DEFAULTS, amplify: 1 };
        state.protocolOn = false;
        recompute();
    };
    $('#reset').addEventListener('click', reset);
}

async function main() {
    translatePage();
    initNav();
    $('#status').textContent = tr('status.loading', 'Loading data…');
    try {
        await loadData();
        initControls();
        renderSources();
        $('#status').textContent = '';
        const flow = state.snapshot.flowHead;
        state.index = flow.map((v, i) => (v > 0 ? i : -1)).filter(i => i >= 0).pop();
        recompute();
    } catch (error) {
        console.error(error);
        $('#status').textContent = tr('status.error', 'Could not load the console data: {message}', { message: error.message });
    }
}

main();
