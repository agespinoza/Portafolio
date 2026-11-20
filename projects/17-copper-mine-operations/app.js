import { CLASSES, DOMAINS, blockIndex, cutoffGrade, decodeBlocks, fleetTotals, inShell, predictRecovery, resourceStatement, shellForPrice } from './mine.js?v=20261120c';
import { blockGrid, columnChart, d3, divergingBars, duplicateScatter, histogram, legend, lineChart } from './charts.js?v=20261120c';
import { LANGUAGES, LANGUAGE_NAMES, language, locale, num, site, tr, translatePage } from './i18n.js?v=20261120c';

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
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const mt = t => num(t / 1e6, 1);
const kt = t => num(t / 1e3, 1);
const pct = (v, d = 1) => `${num(v * 100, d)} %`;
const cuf = v => `${num(v, 2)} %`;
const signedPct = v => `${v >= 0 ? '+' : '−'}${num(Math.abs(v) * 100, 1)} %`;
const usd = v => `US$ ${num(v, 2)}`;
const monthName = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
const monthYear = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' });
const monthShort = label => monthName.format(new Date(`${label}-01T00:00:00Z`));
const monthLong = label => monthYear.format(new Date(`${label}-01T00:00:00Z`));
const domainName = d => tr(`domain.${d}`, { leached: 'Leached cap', supergene: 'Supergene', hypogene: 'Hypogene' }[d]);
const className = c => tr(`class.${c}`, { measured: 'Measured', indicated: 'Indicated', inferred: 'Inferred', unclassified: 'Unclassified' }[c]);

const GRADE_COLORS = ['#2a1d15', '#6e3d1f', '#b5652d', '#e39a55', '#f7d3a0'];
const grade = d3.scaleSequentialLog(d3.interpolateRgbBasis(GRADE_COLORS)).domain([0.05, 1.5]).clamp(true);
const DOMAIN_VAR = ['--dom-leached', '--dom-supergene', '--dom-hypogene'];
const CLASS_VAR = ['--cls-measured', '--cls-indicated', '--cls-inferred'];

const state = { mode: 'grade', bench: 6, row: 20, shell: 6, cutoff: 0.18, vario: 'hypogene', swath: 'easting', prod: 'moved', recon: 'm', crm: 'CRM-MG', shovel: 'S2', fleetMonth: 11 };
let D;           // all data

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

// ---------- Small UI helpers ----------

function tabs(container, items, selected, onChange) {
    container.replaceChildren(...items.map(item => el('button', {
        class: 'tab', type: 'button', role: 'tab', 'aria-selected': String(item.key === selected),
        onclick: () => { onChange(item.key); tabs(container, items, item.key, onChange); },
    }, item.label)));
}

const tile = (label, value, note, accent = false) => el('div', { class: `tile${accent ? ' tile--accent' : ''}` },
    el('div', { class: 'tile__value' }, value), el('div', { class: 'tile__label' }, label), note ? el('div', { class: 'tile__note' }, note) : null);

function table(node, head, rows) {
    node.replaceChildren(
        el('thead', {}, el('tr', {}, head.map(h => el('th', { class: h.num ? 'num' : '' }, h.label)))),
        el('tbody', {}, rows.map(r => el('tr', { class: r.className || '' }, r.cells.map((c, i) => el('td', { class: head[i].num ? 'num' : '' }, c))))),
    );
}

const badge = (kind, text) => el('span', { class: `badge badge--${kind}` }, text);

// ---------- Data ----------

async function loadData() {
    const names = ['block-model', 'resource', 'operations', 'qaqc'];
    const [model, resource, operations, qaqc] = await Promise.all(names.map(n => fetch(`data/${n}.json?v=20261120c`).then(r => {
        if (!r.ok) throw new Error(`${n}.json: HTTP ${r.status}`);
        return r.json();
    })));
    const blocks = decodeBlocks(model);
    D = { model, resource, operations, qaqc, blocks, grid: model.grid, base: resource.economics.copperPrice };
    state.shell = model.revenueFactors.indexOf(1.0);
}

// ---------- KPIs and price control ----------

function renderKpis() {
    const r = D.resource;
    const st = resourceStatement(D.blocks, r.reportCutoff);
    const mi = st[0].tonnes + st[1].tonnes;
    const miMetal = st[0].metal + st[1].metal;
    const fp = r.finalPit;
    const months = D.operations.months;
    const cuAct = months.reduce((s, m) => s + m.actual.copper, 0);
    const cuPlan = months.reduce((s, m) => s + m.plan.copper, 0);
    const f3 = yearFactors().F3.m;
    const kpi = (label, value, unit, note) => el('div', { class: 'kpi' },
        el('div', { class: 'kpi__label' }, label), el('div', { class: 'kpi__value' }, value, el('small', {}, unit)), el('div', { class: 'kpi__note' }, note));
    $('#kpis').replaceChildren(
        kpi(tr('kpi.resource', 'Measured + Indicated'), mt(mi), 'Mt', tr('kpi.resourceNote', '{g} Cu · {kt} kt copper', { g: cuf(miMetal / mi), kt: num(miMetal / 100 / 1e3, 0) })),
        kpi(tr('kpi.pit', 'Final pit ore'), mt(fp.ore), 'Mt', tr('kpi.pitNote', '{g} Cu · strip ratio {s}', { g: cuf(fp.cu), s: num(fp.strip, 2) })),
        kpi(tr('kpi.copper', 'Copper in concentrate'), kt(cuAct), 'kt', tr('kpi.copperNote', '{v} against plan, Nov 2025 – Oct 2026', { v: signedPct(cuAct / cuPlan - 1) })),
        kpi(tr('kpi.f3', 'F3 metal factor'), num(f3, 2), '', tr('kpi.f3Note', 'Mill against resource model, same year')),
    );
}

function initPrice() {
    const input = $('#price');
    input.max = String(D.model.revenueFactors.length - 1);
    input.value = String(state.shell);
    const update = () => {
        state.shell = Number(input.value);
        renderPrice();
        renderGeology();
        renderPit();
    };
    input.addEventListener('input', update);
    renderPrice();
}

function renderPrice() {
    const rf = D.model.revenueFactors[state.shell];
    const price = D.base * rf;
    const e = D.resource.economics;
    $('#price-out').textContent = `${usd(price)}/lb`;
    const row = D.resource.pitByPit[state.shell];
    const cut = cutoffGrade({ price, selling: e.sellingCost, recovery: e.recovery.hypogene, processing: e.processingCost, ga: e.gaCost });
    $('#price-readout').replaceChildren(
        el('span', {}, tr('controls.shell', 'Pit shell'), ' ', el('b', {}, `RF ${num(rf, 1)}`)),
        el('span', {}, tr('controls.ore', 'Ore'), ' ', el('b', {}, `${mt(row.ore)} Mt @ ${cuf(row.cu)}`)),
        el('span', {}, tr('controls.strip', 'Strip ratio'), ' ', el('b', {}, num(row.strip, 2))),
        el('span', {}, tr('controls.cutoff', 'Marginal cut-off (hypogene)'), ' ', el('b', {}, `${num(cut, 3)} % Cu`)),
    );
}

// ---------- 01 Geology ----------

function initGeology() {
    const modes = [
        { key: 'grade', label: tr('geo.grade', 'Cu grade') },
        { key: 'domain', label: tr('geo.domain', 'Domain') },
        { key: 'class', label: tr('geo.class', 'Resource class') },
    ];
    tabs($('#geo-mode'), modes, state.mode, key => { state.mode = key; renderGeology(); });
    const bench = $('#bench');
    bench.replaceChildren(...Array.from({ length: D.grid.nz }, (_, k) => {
        const top = D.grid.zTop - D.grid.dz * k;
        return el('option', { value: String(k) }, tr('geo.benchOption', '{n} · {top}–{bottom} m', { n: k + 1, top: num(top), bottom: num(top - D.grid.dz) }));
    }));
    bench.value = String(state.bench);
    bench.addEventListener('change', () => { state.bench = Number(bench.value); renderGeology(); });
}

function blockCell(i, j, k) {
    const b = D.blocks;
    const n = blockIndex(D.grid, i, j, k);
    if (b.domain[n] < 0) return null;
    const domain = DOMAINS[b.domain[n]];
    let fill;
    if (state.mode === 'domain') fill = css(DOMAIN_VAR[b.domain[n]]);
    else if (state.mode === 'class') fill = b.cls[n] <= 2 ? css(CLASS_VAR[b.cls[n]]) : css('--surface-2');
    else fill = b.cls[n] <= 2 ? grade(Math.max(0.05, b.cu[n])) : css('--surface-2');
    const x = D.grid.x0 + (i + 0.5) * D.grid.dx, y = D.grid.y0 + (j + 0.5) * D.grid.dy;
    return {
        fill,
        title: tr('geo.blockTitle', 'Block {e} E · {n} N · bench {k}', { e: num(x), n: num(y), k: k + 1 }),
        rows: [
            { value: b.cls[n] <= 2 ? `${num(b.cu[n], 3)} %` : '—', label: tr('geo.tipGrade', 'Cu (kriged)') },
            { value: domainName(domain), label: '' },
            { value: className(CLASSES[b.cls[n]]), label: '' },
            { value: `${num(b.tonnes[n] / 1e3, 1)} kt`, label: tr('geo.tipTonnes', 'tonnes') },
            { value: inShell(b, n, state.shell) ? tr('geo.inPit', 'inside the pit shell') : tr('geo.outPit', 'outside the pit shell'), label: '' },
        ],
    };
}

function renderGeology() {
    const { grid } = D;
    const k = state.bench;
    const j = grid.ny - 1 - state.row;                 // plan rows run north (top) to south
    $('#plan-title').textContent = tr('geo.planTitle', 'Plan · bench {n} ({z} m elevation)', { n: k + 1, z: num(grid.zTop - grid.dz * (k + 0.5)) });
    $('#section-title').textContent = tr('geo.sectionTitle', 'Section looking north at {n} N', { n: num(grid.y0 + (j + 0.5) * grid.dy) });
    const eTicks = [0, 10, 20, 30, 40].map(c => ({ at: c, label: num(grid.x0 + c * grid.dx) }));
    blockGrid($('#plan-view'), {
        cols: grid.nx, rows: grid.ny, ariaLabel: tr('geo.planAria', 'Plan view of block grades on one bench'),
        cell: (c, r) => blockCell(c, grid.ny - 1 - r, k),
        inside: (c, r) => inShell(D.blocks, blockIndex(grid, c, grid.ny - 1 - r, k), state.shell),
        marker: state.row,
        onPick: r => { state.row = Math.max(0, Math.min(grid.ny - 1, r)); renderGeology(); },
        xTicks: eTicks,
        yTicks: [0, 10, 20, 30, 40].map(r => ({ at: r, label: num(grid.y0 + (grid.ny - r) * grid.dy) })),
        overlay: (g, cw, ch, tip) => {
            const sx = x => (x - grid.x0) / grid.dx * cw, sy = y => (grid.ny - (y - grid.y0) / grid.dy) * ch;
            for (const h of D.model.holes) {
                if (h.dip > -89) {
                    const len = h.length * Math.cos(h.dip * Math.PI / 180);
                    const a = h.azimuth * Math.PI / 180;
                    g.append('line').attr('class', 'trace').attr('x1', sx(h.x)).attr('y1', sy(h.y)).attr('x2', sx(h.x + len * Math.sin(a))).attr('y2', sy(h.y + len * Math.cos(a)));
                }
                g.append('circle').attr('class', 'collar').attr('cx', sx(h.x)).attr('cy', sy(h.y)).attr('r', 2.6).attr('fill', 'var(--ink)');
            }
        },
    });
    const sectionWidth = $('#section-view').clientWidth;
    blockGrid($('#section-view'), {
        cols: grid.nx, rows: grid.nz, aspect: grid.dz / grid.dx, maxHeight: Math.max(300, sectionWidth * 0.62),
        ariaLabel: tr('geo.sectionAria', 'East–west cross-section of the block model'),
        cell: (c, r) => blockCell(c, j, r),
        inside: (c, r) => inShell(D.blocks, blockIndex(grid, c, j, r), state.shell),
        xTicks: eTicks,
        yTicks: [0, 4, 8, 12, 16, 20].map(r => ({ at: r, label: `${num(grid.zTop - r * grid.dz)} m` })),
        overlay: (g, cw, ch) => {
            const topo = D.model.topography[j];
            const line = d3.line().x((_, i) => (i + 0.5) * cw).y(z => (grid.zTop - z) / grid.dz * ch);
            g.append('path').attr('class', 'topo-line').attr('d', line(topo));
            const yc = grid.y0 + (j + 0.5) * grid.dy;
            const comps = D.model.composites.filter(c => Math.abs(c[1] - yc) <= grid.dy);
            g.append('g').selectAll('circle').data(comps).join('circle')
                .attr('cx', c => (c[0] - grid.x0) / grid.dx * cw).attr('cy', c => (grid.zTop - c[2]) / grid.dz * ch).attr('r', 2.4)
                .attr('fill', c => grade(Math.max(0.05, c[3]))).attr('stroke', 'var(--ink)').attr('stroke-width', 0.8);
        },
    });
    const items = state.mode === 'domain'
        ? DOMAINS.map((d, n) => ({ label: domainName(d), color: css(DOMAIN_VAR[n]) }))
        : state.mode === 'class'
            ? CLASSES.slice(0, 3).map((c, n) => ({ label: className(c), color: css(CLASS_VAR[n]) }))
            : [{ kind: 'ramp', gradient: `linear-gradient(90deg, ${GRADE_COLORS.join(',')})`, label: tr('geo.rampLabel', '0.05 → 1.5 % Cu (log scale)') }];
    items.push({ label: tr('geo.pitLine', 'Pit shell'), color: 'var(--ink)', kind: 'line' });
    items.push({ label: tr('geo.topoLine', 'Topography (section)'), color: 'var(--ink-2)', kind: 'dash' });
    items.push({ label: tr('geo.collars', 'Drillhole collars and composites'), color: 'var(--ink)', kind: 'dot' });
    legend($('#geo-legend'), items);
}

// ---------- 02 Variography ----------

function renderVariography() {
    const v = D.resource.variography[state.vario];
    const m = v.model;
    const sph = (h, a) => (h <= 0 ? 0 : h >= a ? m.nugget + m.sill : m.nugget + m.sill * (1.5 * h / a - 0.5 * (h / a) ** 3));
    const maxH = 420;
    const curve = a => d3.range(0, maxH + 1, 5).map(h => ({ x: h, y: sph(h, a) }));
    const fmt = d => num(d, 3);
    lineChart($('#vario-chart'), {
        ariaLabel: tr('vario.aria', 'Experimental and modelled variograms'),
        x: { type: 'linear', domain: [0, maxH], format: d => num(d), label: tr('vario.lag', 'Lag distance (m)') },
        y: { domain: [0, Math.max(m.nugget + m.sill, ...v.horizontal.map(p => p.gamma), ...v.downhole.map(p => p.gamma)) * 1.12], format: fmt, label: 'γ(h) (% Cu)²' },
        refs: [{ y: v.variance, label: tr('vario.variance', 'data variance') }],
        series: [
            { label: tr('vario.hExp', 'Horizontal (experimental)'), color: 'var(--s1)', points: v.horizontal.map(p => ({ x: Math.round(p.h), y: p.gamma })), lineless: true, dots: true, r: 4.5 },
            { label: tr('vario.vExp', 'Downhole (experimental)'), color: 'var(--s2)', points: v.downhole.map(p => ({ x: Math.round(p.h), y: p.gamma })), lineless: true, dots: true, r: 4.5 },
            { label: tr('vario.hModel', 'Horizontal model'), color: 'var(--s1)', points: curve(m.range_h) },
            { label: tr('vario.vModel', 'Vertical model'), color: 'var(--s2)', points: curve(m.range_v), dash: true },
        ],
        tipTitle: h => tr('vario.tipLag', 'Lag {h} m', { h: num(h) }),
    });
    legend($('#vario-legend'), [
        { label: tr('vario.hLegend', 'Horizontal: pairs on the same bench'), color: 'var(--s1)', kind: 'line' },
        { label: tr('vario.vLegend', 'Downhole: pairs in the same hole'), color: 'var(--s2)', kind: 'dash' },
    ]);
    const total = m.nugget + m.sill;
    $('#vario-tiles').replaceChildren(
        tile(tr('vario.nugget', 'Nugget / sill'), pct(m.nugget / total, 0)),
        tile(tr('vario.rangeH', 'Horizontal range'), `${num(m.range_h)} m`),
        tile(tr('vario.rangeV', 'Vertical range'), `${num(m.range_v)} m`, v.verticalAssumed ? tr('vario.assumed', 'assumed from hypogene anisotropy') : null),
        tile(tr('vario.composites', 'Composites'), num(v.n), tr('vario.holes', '{n} drillholes', { n: v.holes })),
    );
    const cap = D.resource.capping[state.vario];
    $('#vario-note').textContent = tr('vario.note', 'Spherical model fitted by weighted least squares: nugget from the downhole variogram, sill and range from the horizontal one. Grades top-cut at {cap} % Cu ({n} composites, {metal} of the metal).', { cap: num(cap.cap, 3), n: cap.capped, metal: pct(cap.metalRemoved) });
}

// ---------- 03 Validation ----------

function renderValidation() {
    const rows = D.resource.validation.swath[state.swath];
    const axisLabel = { easting: tr('valid.easting', 'Easting (m)'), northing: tr('valid.northing', 'Northing (m)'), elevation: tr('valid.elevation', 'Elevation (m)') }[state.swath];
    lineChart($('#swath-chart'), {
        ariaLabel: tr('valid.aria', 'Swath plot of composites, model and true grade'),
        x: { type: 'linear', format: d => num(d), label: axisLabel, ticks: 5 },
        y: { format: d => num(d, 2), label: '% Cu' },
        series: [
            { label: tr('valid.composites', 'Composites'), color: 'var(--s1)', points: rows.map(r => ({ x: r.centre, y: r.composites })), dots: true, r: 3.5, width: 1.2 },
            { label: tr('valid.model', 'Kriged model'), color: 'var(--s2)', points: rows.map(r => ({ x: r.centre, y: r.model })), width: 2.4 },
            { label: tr('valid.truth', 'True grade (known only here)'), color: 'var(--s3)', points: rows.map(r => ({ x: r.centre, y: r.truth })), dash: true },
        ],
        tipTitle: c => `${axisLabel} ${num(c)}`,
    });
    legend($('#swath-legend'), [
        { label: tr('valid.composites', 'Composites'), color: 'var(--s1)', kind: 'dot' },
        { label: tr('valid.model', 'Kriged model'), color: 'var(--s2)', kind: 'line' },
        { label: tr('valid.truth', 'True grade (known only here)'), color: 'var(--s3)', kind: 'dash' },
    ]);
    const cv = D.resource.validation.crossValidation;
    table($('#cv-table'), [
        { label: tr('common.domain', 'Domain') }, { label: 'n', num: true }, { label: tr('valid.bias', 'Bias'), num: true },
        { label: tr('valid.rmse', 'RMSE (% Cu)'), num: true }, { label: tr('valid.corr', 'Correlation'), num: true }, { label: tr('valid.slope', 'Slope'), num: true },
    ], ['supergene', 'hypogene'].map(d => ({ cells: [domainName(d), num(cv[d].n), signedPct(cv[d].relativeBias), num(cv[d].rmse, 3), num(cv[d].correlation, 2), num(cv[d].slope, 2)] })));
}

// ---------- 04 Resource ----------

function nearestGt(curve, c) {
    return curve.reduce((best, r) => (Math.abs(r.cutoff - c) < Math.abs(best.cutoff - c) ? r : best), curve[0]);
}

function renderResource() {
    const c = state.cutoff;
    $('#cutoff-out').textContent = `${num(c, 2)} % Cu`;
    const st = resourceStatement(D.blocks, c);
    const mi = { tonnes: st[0].tonnes + st[1].tonnes, metal: st[0].metal + st[1].metal };
    const row = (label, r, cls) => ({
        className: cls || '',
        cells: [label, mt(r.tonnes), r.tonnes ? num(r.metal / r.tonnes, 3) : '—', num(r.metal / 100 / 1e3, 1)],
    });
    const key = n => el('span', { class: 'class-key' }, el('i', { style: `background:var(${CLASS_VAR[n]})` }), className(CLASSES[n]));
    table($('#res-table'), [
        { label: tr('res.class', 'Class') }, { label: tr('res.mt', 'Tonnes (Mt)'), num: true }, { label: tr('res.cu', 'Cu (%)'), num: true }, { label: tr('res.kt', 'Copper (kt)'), num: true },
    ], [row(key(0), st[0]), row(key(1), st[1]), row(tr('res.mi', 'Measured + Indicated'), mi, 'is-total'), row(key(2), st[2])]);
    const gt = D.resource.gradeTonnage;
    const m = nearestGt(gt.model, c), t = nearestGt(gt.truth, c);
    $('#res-callout').replaceChildren(
        el('b', {}, tr('res.smoothTitle', 'Smoothing, made visible. ')),
        tr('res.smooth', 'Above {c} % Cu the kriged model reports {mt} Mt at {mg} % Cu; the true deposit holds {tt} Mt at {tg} % Cu. Kriging averages neighbouring samples, so it spreads tonnes above the cut-off at a lower grade. Grade control and reconciliation (panel 09) catch this in operation.', { c: num(m.cutoff, 2), mt: mt(m.tonnes), mg: num(m.grade, 3), tt: mt(t.tonnes), tg: num(t.grade, 3) }),
    );
    const series = key => [
        { label: tr('res.model', 'Kriged model'), color: 'var(--s2)', points: gt.model.map(r => ({ x: r.cutoff, y: key(r) })) },
        { label: tr('res.truth', 'True deposit'), color: 'var(--s3)', points: gt.truth.map(r => ({ x: r.cutoff, y: key(r) })), dash: true },
    ];
    const common = { x: { type: 'linear', domain: [0, 0.8], format: d => num(d, 1), label: tr('res.cutoffAxis', 'Cut-off (% Cu)') }, height: 220, highlightX: c, tipTitle: x => tr('res.tipCutoff', 'Cut-off {c} % Cu', { c: num(x, 2) }) };
    lineChart($('#gt-tonnes'), { ...common, ariaLabel: tr('res.gtTonnes', 'Tonnes above cut-off (Mt)'), y: { domain: [0, null], format: d => num(d / 1e6, 0) }, series: series(r => r.tonnes).map(s => ({ ...s, format: v => `${mt(v)} Mt` })) });
    lineChart($('#gt-grade'), { ...common, ariaLabel: tr('res.gtGrade', 'Average grade above cut-off (% Cu)'), y: { format: d => num(d, 2) }, series: series(r => r.grade).map(s => ({ ...s, format: v => `${num(v, 3)} %` })) });
    legend($('#gt-legend'), [
        { label: tr('res.model', 'Kriged model'), color: 'var(--s2)', kind: 'line' },
        { label: tr('res.truth', 'True deposit'), color: 'var(--s3)', kind: 'dash' },
        { label: tr('res.cutoffLine', 'Selected cut-off'), color: 'var(--ink-3)', kind: 'line' },
    ]);
    const cls = D.resource.classification;
    $('#res-note').textContent = tr('res.note', 'Reported inside a pit shell at {rf} × the base price (reasonable prospects for eventual economic extraction). Measured: slope of regression ≥ {ms}, at least {mh} drillholes and an average sample distance ≤ {md} m. Indicated: slope ≥ {is} and distance ≤ {id} m. Fictional data; not a public report under JORC, NI 43-101 or S-K 1300.', {
        rf: num(D.resource.rpeeeRevenueFactor, 1), ms: num(cls.measured.slope, 2), mh: cls.measured.holes, md: num(cls.measured.distance), is: num(cls.indicated.slope, 2), id: num(cls.indicated.distance),
    });
}

// ---------- 05 Pit optimisation ----------

function renderPit() {
    const rows = D.resource.pitByPit;
    const sel = rows[state.shell];
    const e = D.resource.economics;
    $('#pit-tiles').replaceChildren(
        tile(tr('pit.price', 'Copper price'), `${usd(sel.price)}/lb`, `RF ${num(sel.rf, 1)}`, true),
        tile(tr('pit.total', 'Total material'), `${mt(sel.total)} Mt`),
        tile(tr('pit.ore', 'Ore (M + I)'), `${mt(sel.ore)} Mt`, `${cuf(sel.cu)} Cu`),
        tile(tr('pit.strip', 'Strip ratio'), num(sel.strip, 2), tr('pit.stripNote', 'waste : ore')),
        tile(tr('pit.npv', 'Indicative NPV'), `US$ ${num(sel.npvBest / 1e6, 0)} M`, tr('pit.npvNote', 'best case, 8 %')),
        tile(tr('pit.breakeven', 'Break-even cut-off'), `${num(cutoffGrade({ price: e.copperPrice, selling: e.sellingCost, recovery: e.recovery.hypogene, processing: e.processingCost, ga: e.gaCost, mining: e.miningCost }), 3)} %`, tr('pit.breakevenNote', 'hypogene, base price, at the pit rim')),
    );
    const cats = rows.map((r, n) => ({ key: `${n}`, short: `$${num(r.price, 2)}`, label: tr('pit.shellTip', 'Shell at US$ {p}/lb', { p: num(r.price, 2) }), highlight: n === state.shell }));
    const vals = key => Object.fromEntries(rows.map((r, n) => [`${n}`, r[key] / 1e6]));
    columnChart($('#pit-tonnes'), {
        categories: cats, stacked: true, format: v => num(v, 1), ariaLabel: tr('pit.tonnesTitle', 'Ore and waste in each nested shell (Mt)'),
        series: [
            { key: 'ore', label: tr('pit.oreSeries', 'Ore'), color: css('--dom-supergene'), values: vals('ore') },
            { key: 'waste', label: tr('pit.wasteSeries', 'Waste'), color: css('--plan'), values: vals('waste') },
        ],
    });
    legend($('#pit-tonnes-legend'), [{ label: tr('pit.oreSeries', 'Ore'), color: css('--dom-supergene') }, { label: tr('pit.wasteSeries', 'Waste'), color: css('--plan') }]);
    lineChart($('#pit-npv'), {
        ariaLabel: tr('pit.npvTitle', 'Indicative NPV at the base price (US$ M, 8 %)'),
        x: { type: 'linear', domain: [rows[0].price, rows[rows.length - 1].price], format: d => `$${num(d, 1)}`, label: tr('pit.priceAxis', 'Shell price (US$/lb)') },
        y: { domain: [0, null], format: d => num(d, 0) },
        highlightX: sel.price,
        series: [
            { label: tr('pit.best', 'Best case'), color: 'var(--s1)', points: rows.map(r => ({ x: r.price, y: r.npvBest / 1e6 })), dots: true, directLabel: true },
            { label: tr('pit.worst', 'Worst case'), color: 'var(--s2)', points: rows.map(r => ({ x: r.price, y: r.npvWorst / 1e6 })), dots: true, dash: true, directLabel: true, labelDy: 16 },
        ],
        tipTitle: p => tr('pit.shellTip', 'Shell at US$ {p}/lb', { p: num(p, 2) }),
    });
    legend($('#pit-npv-legend'), [{ label: tr('pit.best', 'Best case'), color: 'var(--s1)', kind: 'line' }, { label: tr('pit.worst', 'Worst case'), color: 'var(--s2)', kind: 'dash' }]);
}

// ---------- 06 Production ----------

const MEASURES = () => [
    { key: 'moved', label: tr('prod.moved', 'Material moved'), unit: 'kt', f: v => v / 1e3 },
    { key: 'ore', label: tr('prod.ore', 'Ore mined'), unit: 'kt', f: v => v / 1e3 },
    { key: 'feed', label: tr('prod.feed', 'Mill feed'), unit: 'kt', f: v => v / 1e3 },
    { key: 'copper', label: tr('prod.copper', 'Copper in concentrate'), unit: 't', f: v => v },
];

function renderProduction() {
    const months = D.operations.months;
    const m = MEASURES().find(x => x.key === state.prod);
    const plan = months.reduce((s, x) => s + x.plan[m.key], 0);
    const act = months.reduce((s, x) => s + x.actual[m.key], 0);
    const head = months.reduce((s, x) => s + x.actual.feed * x.actual.feedCu, 0) / months.reduce((s, x) => s + x.actual.feed, 0);
    const rec = months.reduce((s, x) => s + x.actual.copper, 0) / months.reduce((s, x) => s + x.actual.feed * x.actual.feedCu / 100, 0);
    $('#prod-tiles').replaceChildren(
        tile(tr('prod.planYear', 'Plan, 12 months'), `${num(m.f(plan), 0)} ${m.unit}`),
        tile(tr('prod.actualYear', 'Actual, 12 months'), `${num(m.f(act), 0)} ${m.unit}`, signedPct(act / plan - 1), true),
        tile(tr('prod.head', 'Mill head grade'), `${num(head, 3)} %`, tr('prod.headNote', 'measured by the plant sampler')),
        tile(tr('prod.recovery', 'Plant recovery'), pct(rec), tr('prod.recoveryNote', 'copper to concentrate')),
        tile(tr('prod.stockpile', 'Ore stockpile, end of year'), `${mt(months[months.length - 1].actual.stockpile)} Mt`),
    );
    columnChart($('#prod-chart'), {
        ariaLabel: m.label, format: v => num(v, 0),
        categories: months.map(x => ({ key: x.label, short: monthShort(x.label), label: monthLong(x.label) })),
        series: [
            { key: 'plan', label: tr('prod.plan', 'Plan'), color: css('--plan'), values: Object.fromEntries(months.map(x => [x.label, m.f(x.plan[m.key])])) },
            { key: 'actual', label: tr('prod.actual', 'Actual'), color: css('--accent'), values: Object.fromEntries(months.map(x => [x.label, m.f(x.actual[m.key])])) },
        ],
    });
    legend($('#prod-legend'), [{ label: `${tr('prod.plan', 'Plan')} (${m.unit})`, color: css('--plan') }, { label: `${tr('prod.actual', 'Actual')} (${m.unit})`, color: css('--accent') }]);
    const years = D.operations.annual;
    columnChart($('#lom-chart'), {
        ariaLabel: tr('prod.lomTitle', 'Life-of-mine plan: material moved per year (Mt)'), stacked: true, format: v => num(v, 1), height: 220, totalLabels: true,
        categories: years.map(y => ({ key: `${y.year}`, label: tr('prod.lomTip', '{y}: mill feed {f} Mt at {g} % Cu', { y: y.year, f: mt(y.feed), g: num(y.feedCu, 2) }), highlight: y.year === 2025 || y.year === 2026 })),
        series: [
            { key: 'ore', label: tr('pit.oreSeries', 'Ore'), color: css('--dom-supergene'), values: Object.fromEntries(years.map(y => [`${y.year}`, y.ore / 1e6])) },
            { key: 'waste', label: tr('pit.wasteSeries', 'Waste'), color: css('--plan'), values: Object.fromEntries(years.map(y => [`${y.year}`, y.waste / 1e6])) },
        ],
    });
    legend($('#lom-legend'), [
        { label: tr('pit.oreSeries', 'Ore'), color: css('--dom-supergene') }, { label: tr('pit.wasteSeries', 'Waste'), color: css('--plan') },
        { label: tr('prod.lomNote', 'Shaded: the operating year shown above. 2024 is pre-stripping of the leached cap.'), color: 'rgba(3, 7, 15, .6)' },
    ]);
}

// ---------- 07 Fleet ----------

const CYCLE = () => [
    { key: 'queue', label: tr('fleet.queue', 'Queue'), color: 'var(--s1)' },
    { key: 'spotLoad', label: tr('fleet.spotLoad', 'Spot and load'), color: 'var(--s2)' },
    { key: 'haul', label: tr('fleet.haul', 'Haul loaded'), color: 'var(--s3)' },
    { key: 'dump', label: tr('fleet.dump', 'Dump'), color: 'var(--s4)' },
    { key: 'return', label: tr('fleet.return', 'Return empty'), color: 'var(--s5)' },
];

function initFleet() {
    const select = $('#fleet-month');
    select.replaceChildren(...D.operations.fleet.map((f, n) => el('option', { value: String(n) }, monthLong(f.label))));
    select.value = String(state.fleetMonth);
    select.addEventListener('change', () => { state.fleetMonth = Number(select.value); renderFleetTable(); });
    tabs($('#payload-tabs'), ['S1', 'S2'].map(s => ({ key: s, label: tr('fleet.shovel', 'Shovel {s}', { s }) })), state.shovel, key => { state.shovel = key; renderPayload(); });
}

function renderFleet() {
    const fleet = D.operations.fleet;
    const labels = fleet.map(f => f.label);
    const t07 = fleet.map(f => ({ x: f.label, y: f.trucks.find(t => t.truck === 'T07').availability }));
    const rest = fleet.map(f => ({ x: f.label, y: fleetTotals(f.trucks.filter(t => t.truck !== 'T07')).availability }));
    lineChart($('#avail-chart'), {
        ariaLabel: tr('fleet.availTitle', 'Mechanical availability: T07 against the rest of the fleet'),
        x: { type: 'point', domain: labels, format: monthShort }, y: { domain: [0.6, 1], format: v => pct(v, 0) },
        refs: [{ y: 0.85, label: tr('fleet.target', 'target 85 %') }],
        series: [
            { label: tr('fleet.others', 'Other seven trucks'), color: 'var(--s1)', points: rest, dots: true, directLabel: true, labelDy: -10 },
            { label: 'T07', color: 'var(--s2)', points: t07, dots: true, directLabel: true, labelDy: 16 },
        ],
        tipTitle: monthLong,
    });
    legend($('#avail-legend'), [{ label: tr('fleet.others', 'Other seven trucks'), color: 'var(--s1)', kind: 'line' }, { label: tr('fleet.t07', 'T07: final-drive wear, failed in September'), color: 'var(--s2)', kind: 'line' }]);
    columnChart($('#cycle-chart'), {
        ariaLabel: tr('fleet.cycleTitle', 'Truck cycle time (minutes) as the pit deepens'), stacked: true, format: v => num(v, 1), totalLabels: true,
        categories: fleet.map(f => ({ key: f.label, short: monthShort(f.label), label: tr('fleet.cycleTip', '{m} · mining {d} m below surface', { m: monthLong(f.label), d: num(f.depth) }) })),
        series: CYCLE().map(c => ({ ...c, color: css(c.color.slice(4, -1)), values: Object.fromEntries(fleet.map(f => [f.label, f.cycle[c.key]])) })),
    });
    legend($('#cycle-legend'), CYCLE().map(c => ({ label: c.label, color: css(c.color.slice(4, -1)) })));
    renderFleetTable();
    renderPayload();
}

function renderFleetTable() {
    const f = D.operations.fleet[state.fleetMonth];
    const tot = fleetTotals(f.trucks);
    const rows = f.trucks.map(t => ({
        className: t.availability < 0.8 ? 'is-flagged' : '',
        cells: [
            t.availability < 0.8 ? badge('warning', t.truck) : t.truck, pct(t.availability), pct(t.useOfAvailability), pct(t.utilization),
            num(t.operating, 0), num(t.productivity, 0), num(t.failures), num(t.mtbf, 0), num(t.mttr, 1),
        ],
    }));
    rows.push({ className: 'is-total', cells: [tr('fleet.fleet', 'Fleet'), pct(tot.availability), pct(tot.useOfAvailability), pct(tot.utilization), num(f.trucks.reduce((s, t) => s + t.operating, 0), 0), num(tot.productivity, 0), num(f.trucks.reduce((s, t) => s + t.failures, 0)), '', ''] });
    table($('#fleet-table'), [
        { label: tr('fleet.truck', 'Truck') }, { label: tr('fleet.ma', 'Mech. availability'), num: true }, { label: tr('fleet.uoa', 'Use of availability'), num: true },
        { label: tr('fleet.eu', 'Effective utilisation'), num: true }, { label: tr('fleet.opHours', 'Operating h'), num: true }, { label: tr('fleet.tph', 't / op. hour'), num: true },
        { label: tr('fleet.failures', 'Failures'), num: true }, { label: tr('fleet.mtbf', 'MTBF (h)'), num: true }, { label: tr('fleet.mttr', 'MTTR (h)'), num: true },
    ], rows);
}

function renderPayload() {
    const p = D.operations.payload;
    const s = p.shovels[state.shovel];
    $('#payload-title').textContent = tr('fleet.payloadTitle', 'Payload of every load, {m} ({n} loads)', { m: monthLong(D.operations.fleet[D.operations.fleet.length - 1].label), n: num(s.n) });
    histogram($('#payload-chart'), {
        edges: p.edges, counts: s.counts, color: css('--s1'), countLabel: tr('fleet.loads', 'loads'),
        ariaLabel: tr('fleet.payloadAria', 'Histogram of truck payloads'), xFormat: v => `${num(v * 100, 0)} %`,
        limits: [{ x: 1.1, label: '110 %' }, { x: 1.2, label: '120 %', critical: true }],
    });
    const ok110 = s.over110 <= 0.10, ok120 = s.over120 === 0;
    $('#payload-checks').className = 'checks';
    $('#payload-checks').replaceChildren(
        el('li', {}, badge(ok110 ? 'good' : 'critical', tr('fleet.over110', '{v} of loads above 110 % (limit 10 %)', { v: pct(s.over110) }))),
        el('li', {}, badge(ok120 ? 'good' : 'critical', tr('fleet.over120', '{v} of loads above 120 % (limit 0 %)', { v: pct(s.over120, 2) }))),
        el('li', {}, tr('fleet.meanPayload', 'Mean payload {v} of the {t} t nominal.', { v: pct(s.mean, 1), t: num(D.operations.nominalPayload) })),
        ok120 ? null : el('li', {}, tr('fleet.action', 'Action: calibrate the payload monitor on this shovel and coach operators on the last pass.')),
    );
}

// ---------- 08 Plant and recovery model ----------

const FEATURE_LABELS = () => ({
    logHead: tr('feat.logHead', 'Head grade (log)'), p80: tr('feat.p80', 'Grind size P80'), oxide: tr('feat.oxide', 'Oxide ratio ASCu/TCu'),
    collector: tr('feat.collector', 'Collector dosage'), phDev2: tr('feat.ph', 'pH away from 10.4'), supergene: tr('feat.supergene', 'Supergene share'), bwi: tr('feat.bwi', 'Bond work index'),
});

function renderPlant() {
    const rm = D.operations.recoveryModel;
    const mm = rm.metrics;
    $('#model-tiles').replaceChildren(
        tile(tr('plant.maeModel', 'Model error (MAE)'), `${num(mm.model.mae, 2)} pp`, tr('plant.testNote', 'test: last {n} days', { n: rm.testDays }), true),
        tile(tr('plant.maePlanning', 'Planning assumption'), `${num(mm.planning.mae, 2)} pp`, tr('plant.planningNote', 'fixed recovery by domain')),
        tile(tr('plant.maeMean', 'Training average'), `${num(mm.mean.mae, 2)} pp`, tr('plant.meanNote', 'naive baseline')),
        tile(tr('plant.bias', 'Model bias'), `${num(mm.model.bias, 2)} pp`, `R² ${num(mm.model.r2, 2)}`),
    );
    const test = D.operations.daily.filter(d => d.date >= rm.testFrom);
    $('#rec-title').textContent = tr('plant.recTitle', 'Daily flotation recovery in the test period, {from} onward (%)', { from: rm.testFrom });
    lineChart($('#rec-chart'), {
        ariaLabel: tr('plant.recAria', 'Measured and predicted daily recovery'), height: 250,
        x: { type: 'point', domain: test.map(d => d.date), format: d => d.slice(5) }, y: { format: v => num(v, 0) },
        series: [
            { label: tr('plant.measured', 'Measured'), color: 'var(--s1)', points: test.map(d => ({ x: d.date, y: d.recovery })), format: v => `${num(v, 1)} %` },
            { label: tr('plant.predicted', 'Model'), color: 'var(--s2)', points: test.map(d => ({ x: d.date, y: d.predicted })), format: v => `${num(v, 1)} %` },
        ],
        tipTitle: d => d,
    });
    legend($('#rec-legend'), [{ label: tr('plant.measured', 'Measured'), color: 'var(--s1)', kind: 'line' }, { label: tr('plant.predicted', 'Model'), color: 'var(--s2)', kind: 'line' }]);
    const labels = FEATURE_LABELS();
    divergingBars($('#coef-chart'), {
        ariaLabel: tr('plant.coefTitle', 'Effect of one standard deviation on recovery'), format: v => `${v >= 0 ? '+' : '−'}${num(Math.abs(v), 2)}`,
        items: rm.features.map((f, n) => ({ label: labels[f], value: rm.coef[n] })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
    });
    renderWhatIf();
    $('#plant-note').textContent = tr('plant.note', 'Ridge regression on standardised features with engineered terms (log grade, squared pH deviation). Trained on {train} days, regularisation α = {a} chosen by expanding-window cross-validation, and tested on the last {test} days it never saw. Errors are in percentage points of recovery.', { train: rm.trainDays, a: num(rm.alpha, 2), test: rm.testDays });
}

function renderWhatIf() {
    const rm = D.operations.recoveryModel;
    const mean = f => rm.mu[rm.features.indexOf(f)];
    const inputs = state.whatif || (state.whatif = { head: Math.exp(mean('logHead')), p80: mean('p80'), oxide: mean('oxide'), collector: mean('collector'), ph: 10.4 });
    const defs = [
        { key: 'head', label: tr('feat.head', 'Head grade'), min: 0.2, max: 1.4, step: 0.01, fmt: v => `${num(v, 2)} % Cu` },
        { key: 'p80', label: tr('feat.p80', 'Grind size P80'), min: 120, max: 200, step: 1, fmt: v => `${num(v)} µm` },
        { key: 'oxide', label: tr('feat.oxide', 'Oxide ratio ASCu/TCu'), min: 0.01, max: 0.25, step: 0.005, fmt: v => num(v, 3) },
        { key: 'collector', label: tr('feat.collector', 'Collector dosage'), min: 16, max: 32, step: 0.5, fmt: v => `${num(v, 1)} g/t` },
        { key: 'ph', label: tr('feat.phValue', 'Rougher pH'), min: 9.6, max: 11.2, step: 0.05, fmt: v => num(v, 2) },
    ];
    const update = () => {
        const p = predictRecovery(rm, { ...inputs, supergene: mean('supergene'), bwi: mean('bwi') });
        $('#whatif-value').textContent = `${num(p, 1)} %`;
        $('#whatif-label').textContent = tr('plant.whatifNote', 'predicted recovery; supergene share and hardness held at their averages');
    };
    if (!$('#whatif-controls').childElementCount) {
        $('#whatif-controls').replaceChildren(...defs.map(d => {
            const out = el('output', {}, d.fmt(inputs[d.key]));
            const input = el('input', { type: 'range', min: d.min, max: d.max, step: d.step, value: inputs[d.key] });
            input.addEventListener('input', () => { inputs[d.key] = Number(input.value); out.textContent = d.fmt(inputs[d.key]); update(); });
            return el('label', { class: 'field' }, el('span', {}, `${d.label} · `, out), input);
        }));
    }
    update();
}

// ---------- 09 Reconciliation ----------

function yearFactors() {
    const sum = (part, key) => D.operations.months.reduce((s, m) => s + m.reconciliation[part][key === 'm' ? 't' : key] * (key === 'm' ? m.reconciliation[part].g : 1), 0);
    const agg = part => { const t = sum(part, 't'), metal = sum(part, 'm'); return { t, g: metal / t, m: metal }; };
    const rm = agg('rm'), gc = agg('gc'), dl = agg('delivered'), mill = agg('mill');
    const f1 = { t: gc.t / rm.t, g: gc.g / rm.g, m: gc.m / rm.m };
    const f2 = { t: mill.t / dl.t, g: mill.g / dl.g, m: mill.m / dl.m };
    return { F1: f1, F2: f2, F3: { t: f1.t * f2.t, g: f1.g * f2.g, m: f1.m * f2.m } };
}

function renderReconciliation() {
    const months = D.operations.months;
    const labels = months.map(m => m.label);
    const k = state.recon;
    const colors = { F1: 'var(--s1)', F2: 'var(--s2)', F3: 'var(--s3)' };
    lineChart($('#recon-chart'), {
        ariaLabel: tr('recon.aria', 'Monthly reconciliation factors'), x: { type: 'point', domain: labels, format: monthShort },
        y: { domain: [0.7, 1.35], format: v => num(v, 2) }, bands: [{ y0: 0.9, y1: 1.1 }], refs: [{ y: 1 }],
        series: ['F1', 'F2', 'F3'].map((f, n) => ({ label: f, color: colors[f], points: months.map(m => ({ x: m.label, y: m.factors[f][k] })), dots: true, width: f === 'F3' ? 2.6 : 2, directLabel: true, labelDy: [-10, 14, -10][n] })),
        tipTitle: monthLong,
    });
    legend($('#recon-legend'), [
        { label: tr('recon.f1', 'F1 grade control / resource model'), color: 'var(--s1)', kind: 'line' },
        { label: tr('recon.f2', 'F2 mill / grade control'), color: 'var(--s2)', kind: 'line' },
        { label: tr('recon.f3', 'F3 = F1 × F2'), color: 'var(--s3)', kind: 'line' },
    ]);
    const y = yearFactors();
    const flag = v => (Math.abs(v - 1) > 0.1 ? badge('warning', num(v, 3)) : num(v, 3));
    table($('#recon-table'), [{ label: tr('recon.factor', 'Year (12 months)') }, { label: tr('recon.tonnes', 'Tonnes'), num: true }, { label: tr('recon.grade', 'Grade'), num: true }, { label: tr('recon.metal', 'Metal'), num: true }],
        ['F1', 'F2', 'F3'].map(f => ({ cells: [f, flag(y[f].t), flag(y[f].g), flag(y[f].m)] })));
}

// ---------- 10 QA/QC ----------

function renderQaqc() {
    const q = D.qaqc;
    const allCrm = Object.values(q.crms).flatMap(c => c.results);
    $('#qc-tiles').replaceChildren(
        tile(tr('qc.batches', 'Laboratory batches'), num(q.batches), tr('qc.batchNote', '{n} samples each', { n: q.batchSize })),
        tile(tr('qc.crmPass', 'CRM first-pass rate'), pct(allCrm.filter(r => r.status !== 'fail').length / allCrm.length), tr('qc.crmNote', '{n} CRM results', { n: num(allCrm.length) })),
        tile(tr('qc.blanks', 'Blanks above limit'), num(q.blanks.failures), tr('qc.blankNote', 'limit {v} % Cu', { v: num(q.blanks.limit, 3) })),
        tile(tr('qc.dups', 'Duplicates within 10 % HARD'), pct(q.duplicates.withinLimit), tr('qc.dupNote', 'target ≥ 90 %')),
    );
    const c = q.crms[state.crm];
    const s = c.summary;
    $('#crm-title').textContent = tr('qc.crmTitle', '{name}: certified {v} % Cu ± {sd} (1 SD), mean bias {b}', { name: state.crm, v: num(s.certified, 3), sd: num(s.sd, 3), b: signedPct(s.bias) });
    const statusColor = { pass: 'var(--s1)', warning: 'var(--status-warning)', fail: 'var(--status-critical)' };
    lineChart($('#crm-chart'), {
        ariaLabel: tr('qc.crmAria', 'Control chart of reference material results by batch'), height: 270,
        x: { type: 'linear', domain: [0, q.batches + 1], format: d => num(d), label: tr('qc.batchAxis', 'Batch') },
        y: { domain: [s.certified - 4.5 * s.sd, s.certified + 4.5 * s.sd], format: v => num(v, 3) },
        refs: [
            { y: s.certified, label: tr('qc.certified', 'certified') },
            { y: s.certified + 2 * s.sd, className: 'limit-line', label: '+2 SD' }, { y: s.certified - 2 * s.sd, className: 'limit-line', label: '−2 SD' },
            { y: s.certified + 3 * s.sd, className: 'limit-line limit-line--critical', label: '+3 SD' }, { y: s.certified - 3 * s.sd, className: 'limit-line limit-line--critical', label: '−3 SD' },
        ],
        series: [{ label: state.crm, color: 'var(--s1)', points: c.results.map(r => ({ x: r.batch, y: Math.max(s.certified - 4.4 * s.sd, Math.min(s.certified + 4.4 * s.sd, r.value)), status: r.status, raw: r.value })), lineless: true, dots: true, r: 3.6, format: v => `${num(v, 4)} %` }],
        pointColor: p => statusColor[p.status],
        tipTitle: b => tr('qc.batchTip', 'Batch {b}', { b }),
    });
    legend($('#crm-legend'), [
        { label: tr('qc.pass', 'Pass'), color: 'var(--s1)', kind: 'dot' }, { label: tr('qc.warning', 'Warning (2–3 SD)'), color: 'var(--status-warning)', kind: 'dot' },
        { label: tr('qc.fail', 'Fail: beyond 3 SD, or two in a row beyond 2 SD'), color: 'var(--status-critical)', kind: 'dot' },
    ]);
    duplicateScatter($('#dup-chart'), {
        pairs: q.duplicates.pairs, limit: q.duplicates.limit, ariaLabel: tr('qc.dupTitle', 'Field duplicates'), format: v => num(v, v < 0.1 ? 2 : 1),
        labels: { x: tr('qc.original', 'Original'), y: tr('qc.duplicate', 'Duplicate'), batch: b => tr('qc.batchTip', 'Batch {b}', { b }) },
    });
    const causeText = cause => (cause === 'blank' ? tr('qc.causeBlank', 'Blank contaminated') : tr('qc.causeCrm', '{crm} out of control', { crm: cause }));
    const drift = q.drift;
    table($('#qc-table'), [{ label: tr('qc.batch', 'Batch') }, { label: tr('qc.cause', 'Cause') }, { label: tr('qc.action', 'Action') }],
        q.failedBatches.map(f => ({ cells: [num(f.batch), el('span', {}, badge('critical', f.causes.map(causeText).join(' · ')), f.batch >= drift.from && f.batch <= drift.to ? el('span', { class: 'note-inline' }, tr('qc.driftNote', 'Laboratory calibration drift (batches {a}–{b}, +{p})', { a: drift.from, b: drift.to, p: pct(drift.bias) })) : null), tr('qc.reassayed', 'Re-assayed; passed')] })));
}

// ---------- Init ----------

function initTabs() {
    tabs($('#vario-tabs'), ['supergene', 'hypogene', 'leached'].map(d => ({ key: d, label: domainName(d) })), state.vario, key => { state.vario = key; renderVariography(); });
    tabs($('#swath-tabs'), [{ key: 'easting', label: tr('valid.east', 'East') }, { key: 'northing', label: tr('valid.north', 'North') }, { key: 'elevation', label: tr('valid.elev', 'Elevation') }], state.swath, key => { state.swath = key; renderValidation(); });
    tabs($('#prod-tabs'), MEASURES(), state.prod, key => { state.prod = key; renderProduction(); });
    tabs($('#recon-tabs'), [{ key: 't', label: tr('recon.tonnes', 'Tonnes') }, { key: 'g', label: tr('recon.grade', 'Grade') }, { key: 'm', label: tr('recon.metal', 'Metal') }], state.recon, key => { state.recon = key; renderReconciliation(); });
    tabs($('#crm-tabs'), Object.keys(D.qaqc.crms).map(k => ({ key: k, label: k })), state.crm, key => { state.crm = key; renderQaqc(); });
    const cutoff = $('#cutoff');
    cutoff.value = String(state.cutoff);
    cutoff.addEventListener('input', () => { state.cutoff = Number(cutoff.value); renderResource(); });
}

function renderAll() {
    renderKpis();
    renderGeology();
    renderVariography();
    renderValidation();
    renderResource();
    renderPit();
    renderProduction();
    renderFleet();
    renderPlant();
    renderReconciliation();
    renderQaqc();
}

async function main() {
    translatePage();
    initNav();
    try {
        await loadData();
    } catch (error) {
        $('#kpis').replaceChildren(el('p', { class: 'empty' }, tr('error.load', 'The mine data could not be loaded: {m}', { m: error.message })));
        return;
    }
    initPrice();
    initGeology();
    initFleet();
    initTabs();
    renderAll();
    let width = window.innerWidth;
    window.addEventListener('resize', () => {
        if (Math.abs(window.innerWidth - width) < 40) return;
        width = window.innerWidth;
        clearTimeout(main.timer);
        main.timer = setTimeout(renderAll, 200);
    });
}

main();
