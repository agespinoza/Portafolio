// Hand-built SVG charts for the monitor. Colors come from CSS classes in styles.css.
import { num, pct, tr } from './i18n.js?v=20261122a';

const NS = 'http://www.w3.org/2000/svg';
const W = 760, ML = 52, MR = 14;
const PW = W - ML - MR;

const svg = (tag, attrs = {}, ...children) => {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) if (value !== null && value !== undefined) node.setAttribute(key, value);
    node.append(...children.flat().filter(Boolean));
    return node;
};
const text = (value, attrs) => { const node = svg('text', attrs); node.textContent = value; return node; };
const path = points => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');

/** Splits a series at gaps (null values) so a missing quarter breaks the line instead of joining across it. */
function segments(values, x, y) {
    const out = [];
    let current = [];
    values.forEach((v, i) => {
        if (v === null || v === undefined) { if (current.length) out.push(current); current = []; } else current.push([x(i), y(v)]);
    });
    if (current.length) out.push(current);
    return out;
}

function frame(container, height, label, count, onPick) {
    const root = svg('svg', { viewBox: `0 0 ${W} ${height}`, role: 'img', 'aria-label': label });
    const x = i => ML + ((i + 0.5) / count) * PW;
    root.addEventListener('click', event => {
        const box = root.getBoundingClientRect();
        const px = ((event.clientX - box.left) / box.width) * W;
        onPick(Math.min(count - 1, Math.max(0, Math.floor(((px - ML) / PW) * count))));
    });
    container.replaceChildren(root);
    return { root, x };
}

function xAxis(root, x, labels, y) {
    const every = Math.max(1, Math.round(labels.length / 7));
    labels.forEach((label, i) => { if (i % every === 0) root.append(text(label.replace('Q', ' Q'), { class: 'tick', x: x(i), y, 'text-anchor': 'middle' })); });
}

function yAxis(root, y, ticks, format, left, right) {
    for (const value of ticks) {
        root.append(svg('line', { class: 'grid', x1: left, x2: right, y1: y(value), y2: y(value) }));
        root.append(text(format(value), { class: 'tick', x: left - 8, y: y(value) + 4, 'text-anchor': 'end' }));
    }
}

function cursor(root, x, i, top, bottom) {
    root.append(svg('line', { class: 'cursor', x1: x(i), x2: x(i), y1: top, y2: bottom }));
}

const niceTicks = (max, count = 4) => {
    const raw = max / count;
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(s => s >= raw);
    return Array.from({ length: count + 1 }, (_, i) => i * step).filter(v => v <= max * 1.001 + step);
};

/** The real series: share of infected herds (top) and cattle imported from Mexico (bottom). */
export function dataChart(container, { labels, real, scaled, flow, index, onPick, label }) {
    const H = 300, top = 14, mid = 190, bottom = 276;
    const { root, x } = frame(container, H, label, labels.length, onPick);
    const peak = Math.max(...real.filter(v => v !== null), ...scaled.filter(v => v !== null)) * 1.1;
    const ticks = niceTicks(peak);
    const y = v => mid - 14 - (v / ticks[ticks.length - 1]) * (mid - 14 - top);
    yAxis(root, y, ticks, v => pct(v, ticks[1] < 0.01 ? 1 : 0), ML, W - MR);
    const hasScaled = scaled.some((v, i) => v !== null && real[i] !== null && Math.abs(v - real[i]) > 1e-9);
    if (hasScaled) for (const s of segments(scaled, x, y)) root.append(svg('path', { class: 'line line--scaled', d: path(s) }));
    for (const s of segments(real, x, y)) root.append(svg('path', { class: 'line line--real', d: path(s) }));

    const flowMax = Math.max(...flow, 1);
    const fy = v => bottom - (v / flowMax) * (bottom - mid - 18);
    const barW = Math.max(2, PW / labels.length - 2);
    root.append(text(tr('chart.flowAxis', 'Cattle imported from Mexico (head)'), { class: 'axis-label', x: ML, y: mid + 8 }));
    flow.forEach((v, i) => {
        if (v > 0) root.append(svg('rect', { class: 'flow-bar', x: x(i) - barW / 2, y: fy(v), width: barW, height: bottom - fy(v) }));
        else root.append(svg('line', { class: 'flow-gap', x1: x(i) - barW / 2, x2: x(i) + barW / 2, y1: bottom - 1, y2: bottom - 1 }));
    });
    root.append(text(`${num(flowMax)}`, { class: 'tick', x: ML - 8, y: fy(flowMax) + 4, 'text-anchor': 'end' }));
    root.append(text('0', { class: 'tick', x: ML - 8, y: bottom + 4, 'text-anchor': 'end' }));
    xAxis(root, x, labels, bottom + 18);
    cursor(root, x, index, top, bottom);
    return hasScaled;
}

/** Real share against the estimate the flag rate gives, with the quarters where the threshold was re-tuned. */
export function shareChart(container, { labels, scaled, steps, index, onPick, label }) {
    const H = 260, top = 14, bottom = 224;
    const { root, x } = frame(container, H, label, labels.length, onPick);
    const peak = Math.max(...scaled.filter(v => v !== null)) * 1.5;
    const ticks = niceTicks(peak);
    const y = v => bottom - (v / ticks[ticks.length - 1]) * (bottom - top);
    yAxis(root, y, ticks, v => pct(v, ticks[1] < 0.01 ? 1 : 0), ML, W - MR);
    steps.forEach((s, i) => {
        if (s.estimate !== null) root.append(svg('circle', { class: 'est-dot', cx: x(i), cy: y(Math.min(s.estimate, ticks[ticks.length - 1])), r: 2.6 }));
    });
    // Rolling mean of the last three estimates, so the trend reads through the quarter-to-quarter noise.
    const cap = ticks[ticks.length - 1];
    const smooth = steps.map((_, i) => {
        const w = steps.slice(Math.max(0, i - 2), i + 1).map(s => s.estimate).filter(v => v !== null);
        return w.length ? Math.min(w.reduce((a, b) => a + b, 0) / w.length, cap) : null;
    });
    for (const s of segments(smooth, x, y)) root.append(svg('path', { class: 'line line--est', d: path(s) }));
    for (const s of segments(scaled, x, y)) root.append(svg('path', { class: 'line line--real', d: path(s) }));
    steps.forEach((s, i) => {
        if (s.retuned) root.append(svg('path', { class: 'retune', d: `M${x(i) - 5} ${top - 2}h10l-5 9z` }));
    });
    xAxis(root, x, labels, bottom + 18);
    cursor(root, x, index, top, bottom);
}

/** Cumulative cost of every policy. */
export function costChart(container, { labels, policies, shown, index, onPick, label }) {
    const H = 260, top = 14, bottom = 224;
    const { root, x } = frame(container, H, label, labels.length, onPick);
    const peak = Math.max(...Object.values(policies).map(p => p.steps[p.steps.length - 1].cumulative)) * 1.05;
    const ticks = niceTicks(peak);
    const y = v => bottom - (v / ticks[ticks.length - 1]) * (bottom - top);
    yAxis(root, y, ticks, v => num(v), ML, W - MR);
    for (const key of Object.keys(policies).filter(k => k !== shown)) {
        root.append(svg('path', { class: `line series--${key} is-dim`, d: path(policies[key].steps.map((s, n) => [x(n), y(s.cumulative)])) }));
    }
    root.append(svg('path', { class: `line series--${shown}`, d: path(policies[shown].steps.map((s, n) => [x(n), y(s.cumulative)])) }));
    xAxis(root, x, labels, bottom + 18);
    cursor(root, x, index, top, bottom);
}

/** Mean cost with the 10th–90th percentile range for each policy, as plain bars. */
export function costBars(list, { cost, names, keys }) {
    const max = Math.max(...keys.map(k => cost[k].p90)) * 1.05;
    const best = keys.reduce((a, b) => (cost[b].mean < cost[a].mean && b !== 'oracle' ? b : a), keys[0] === 'oracle' ? keys[1] : keys[0]);
    const at = v => `${(v / max) * 100}%`;
    list.replaceChildren(...keys.map(key => {
        const item = document.createElement('li');
        if (key === best) item.className = 'is-best';
        item.innerHTML = '<span class="cost-bars__name"></span><span class="cost-bars__track" aria-hidden="true"><i class="cost-bars__bar"></i><i class="cost-bars__range"></i></span><span class="cost-bars__val"><strong></strong><small></small></span>';
        item.querySelector('.cost-bars__name').textContent = names[key];
        const bar = item.querySelector('.cost-bars__bar');
        bar.classList.add(`series--${key}`, 'series-fill');
        bar.style.width = at(cost[key].mean);
        const range = item.querySelector('.cost-bars__range');
        range.style.left = at(cost[key].p10);
        range.style.width = `calc(${at(cost[key].p90)} - ${at(cost[key].p10)})`;
        item.querySelector('strong').textContent = num(cost[key].mean);
        item.querySelector('small').textContent = `${num(cost[key].p10)}–${num(cost[key].p90)}`;
        return item;
    }));
    return best;
}
