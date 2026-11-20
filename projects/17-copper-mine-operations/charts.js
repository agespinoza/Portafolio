// D3 charts for the mine console. Colors come from CSS custom properties; text uses ink tokens.
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { num } from './i18n.js?v=20261120b';

export { d3 };

function tooltip(container) {
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.hidden = true;
    container.append(tip);
    return {
        show(x, y, title, rows) {
            tip.replaceChildren();
            const head = document.createElement('div');
            head.className = 'tooltip__title';
            head.textContent = title;
            tip.append(head);
            for (const row of rows) {
                const line = document.createElement('div');
                line.className = 'tooltip__row';
                if (row.color) {
                    const key = document.createElement('span');
                    key.className = 'tooltip__key';
                    key.style.background = row.color;
                    line.append(key);
                }
                const value = document.createElement('strong');
                value.textContent = row.value;
                const label = document.createElement('span');
                label.textContent = row.label ?? '';
                line.append(value, label);
                tip.append(line);
            }
            tip.hidden = false;
            const w = tip.offsetWidth;
            tip.style.left = `${Math.max(0, x + 16 + w > container.clientWidth ? x - 16 - w : x + 16)}px`;
            tip.style.top = `${Math.max(0, y - 12)}px`;
        },
        hide() { tip.hidden = true; },
    };
}

function frame(container, height, ariaLabel) {
    container.replaceChildren();
    container.classList.add('chart');
    const width = Math.max(280, Math.floor(container.clientWidth));
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img').attr('aria-label', ariaLabel);
    return { svg, width, tip: tooltip(container) };
}

function yAxis(svg, y, margin, width, format, ticks = 4) {
    svg.append('g').selectAll('line').data(y.ticks(ticks)).join('line').attr('class', 'grid')
        .attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y).attr('y2', y);
    svg.append('g').selectAll('text').data(y.ticks(ticks)).join('text').attr('class', 'tick')
        .attr('x', margin.left - 8).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(format);
}

/** Fills a legend <ul>. items: [{ label, color, kind: 'swatch'|'line'|'dash'|'dot'|'ramp', gradient }] */
export function legend(ul, items) {
    ul.replaceChildren(...items.map(item => {
        const li = document.createElement('li');
        const key = document.createElement('span');
        if (item.kind === 'line' || item.kind === 'dash') {
            key.className = `legend__line${item.kind === 'dash' ? ' legend__line--dash' : ''}`;
            key.style.borderColor = item.color;
        } else if (item.kind === 'dot') {
            key.className = 'legend__dot';
            key.style.background = item.color;
        } else if (item.kind === 'ramp') {
            key.className = 'legend__ramp';
            key.style.background = item.gradient;
        } else {
            key.className = 'legend__swatch';
            key.style.background = item.color;
        }
        li.append(key, document.createTextNode(item.label));
        return li;
    }));
}

/**
 * Line chart with a shared crosshair tooltip.
 * series: [{ label, color, points: [{ x, y }], dash, dots, lineless, directLabel }]
 * x: { type: 'linear' | 'point', domain, format, label, ticks }   y: { domain, format, label }
 */
export function lineChart(container, { series, x, y, height = 260, ariaLabel, refs = [], bands = [], tipTitle, highlightX, pointColor }) {
    const { svg, width, tip } = frame(container, height, ariaLabel);
    const margin = { top: 16, right: 18, bottom: x.label ? 42 : 30, left: 52 };
    const all = series.flatMap(s => s.points);
    const xs = x.type === 'point'
        ? d3.scalePoint().domain(x.domain).range([margin.left + 10, width - margin.right - 10])
        : d3.scaleLinear().domain(x.domain || d3.extent(all, p => p.x)).range([margin.left, width - margin.right]);
    if (x.type !== 'point' && !x.domain) xs.nice();
    const extent = d3.extent(all.filter(p => Number.isFinite(p.y)), p => p.y);
    const yd = y.domain ? y.domain.map((v, i) => (v === null || v === undefined ? extent[i] : v)) : extent;
    const ys = d3.scaleLinear().domain(yd).range([height - margin.bottom, margin.top]);
    if (!y.domain || y.domain.includes(null)) ys.nice();
    for (const b of bands) {
        svg.append('rect').attr('class', 'ref-band').attr('x', margin.left).attr('width', width - margin.left - margin.right)
            .attr('y', ys(b.y1)).attr('height', Math.max(0, ys(b.y0) - ys(b.y1)));
    }
    yAxis(svg, ys, margin, width, y.format);
    const xTicks = x.type === 'point' ? x.domain.filter((_, i) => i % Math.ceil(x.domain.length / Math.max(2, Math.floor(width / 70))) === 0) : xs.ticks(x.ticks || 6);
    svg.append('g').selectAll('text').data(xTicks).join('text').attr('class', 'tick')
        .attr('x', d => xs(d)).attr('y', height - margin.bottom + 18).attr('text-anchor', 'middle').text(x.format || (d => d));
    if (x.label) svg.append('text').attr('class', 'axis-label').attr('x', (margin.left + width - margin.right) / 2).attr('y', height - 6).attr('text-anchor', 'middle').text(x.label);
    if (y.label) svg.append('text').attr('class', 'axis-label').attr('x', margin.left).attr('y', 10).text(y.label);
    if (highlightX !== undefined) {
        svg.append('line').attr('class', 'ref').attr('x1', xs(highlightX)).attr('x2', xs(highlightX)).attr('y1', margin.top).attr('y2', height - margin.bottom);
    }
    for (const r of refs) {
        svg.append('line').attr('class', r.className || 'ref').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', ys(r.y)).attr('y2', ys(r.y));
        if (r.label) svg.append('text').attr('class', 'limit-label').attr('x', width - margin.right).attr('y', ys(r.y) - 5).attr('text-anchor', 'end').text(r.label);
    }
    const line = d3.line().defined(p => Number.isFinite(p.y)).x(p => xs(p.x)).y(p => ys(p.y));
    for (const s of series) {
        if (!s.lineless) {
            svg.append('path').attr('class', 'series-line').attr('stroke', s.color).attr('stroke-width', s.width || 2)
                .attr('stroke-dasharray', s.dash ? '5 4' : null).attr('d', line(s.points));
        }
        if (s.dots) {
            svg.append('g').selectAll('circle').data(s.points.filter(p => Number.isFinite(p.y))).join('circle')
                .attr('cx', p => xs(p.x)).attr('cy', p => ys(p.y)).attr('r', s.r || 4)
                .attr('fill', p => (pointColor && pointColor(p, s)) || s.color).attr('stroke', 'var(--surface)').attr('stroke-width', 1.5);
        }
        if (s.directLabel) {
            const last = [...s.points].reverse().find(p => Number.isFinite(p.y));
            if (last) svg.append('text').attr('class', 'direct-label').attr('x', Math.min(xs(last.x) + 6, width - 4)).attr('y', ys(last.y) + (s.labelDy || -8))
                .attr('text-anchor', xs(last.x) > width - 80 ? 'end' : 'start').text(s.label);
        }
    }
    // crosshair
    const keys = [...new Set(all.map(p => p.x))].sort((a, b) => (x.type === 'point' ? x.domain.indexOf(a) - x.domain.indexOf(b) : a - b));
    const cross = svg.append('g').attr('class', 'crosshair').style('display', 'none');
    cross.append('line').attr('y1', margin.top).attr('y2', height - margin.bottom);
    svg.append('rect').attr('fill', 'transparent').attr('x', margin.left).attr('y', margin.top)
        .attr('width', width - margin.left - margin.right).attr('height', height - margin.top - margin.bottom)
        .on('pointermove', event => {
            const [mx, my] = d3.pointer(event);
            let best = keys[0], bestD = Infinity;
            for (const k of keys) { const d = Math.abs(xs(k) - mx); if (d < bestD) { bestD = d; best = k; } }
            cross.style('display', null).select('line').attr('x1', xs(best)).attr('x2', xs(best));
            const rows = series.map(s => {
                const p = s.points.find(q => q.x === best);
                return p && Number.isFinite(p.y) ? { color: s.color, value: (s.format || y.format)(p.y), label: s.label } : null;
            }).filter(Boolean);
            tip.show(mx, my, tipTitle ? tipTitle(best) : String(best), rows);
        })
        .on('pointerleave', () => { cross.style('display', 'none'); tip.hide(); });
    return { xs, ys, svg, margin, width };
}

/**
 * Vertical bars over categories, grouped or stacked.
 * categories: [{ key, label, short, highlight }]   series: [{ key, label, color, values: { [key]: v } }]
 */
export function columnChart(container, { categories, series, stacked = false, height = 250, ariaLabel, format, totalLabels = false }) {
    const { svg, width, tip } = frame(container, height, ariaLabel);
    const margin = { top: 18, right: 8, bottom: 30, left: 48 };
    const x0 = d3.scaleBand().domain(categories.map(c => c.key)).range([margin.left, width - margin.right]).paddingInner(stacked ? 0.3 : 0.24);
    const x1 = d3.scaleBand().domain(series.map(s => s.key)).range([0, x0.bandwidth()]).padding(0.1);
    const totals = categories.map(c => series.reduce((s, ser) => s + (ser.values[c.key] || 0), 0));
    const max = stacked ? d3.max(totals) : d3.max(series.flatMap(s => categories.map(c => s.values[c.key] || 0)));
    const y = d3.scaleLinear().domain([0, max || 1]).nice().range([height - margin.bottom, margin.top]);
    yAxis(svg, y, margin, width, format);
    svg.append('line').attr('class', 'baseline').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y(0)).attr('y2', y(0));
    const every = Math.ceil(categories.length / Math.max(2, Math.floor(width / 46)));
    categories.forEach((c, ci) => {
        const gx = x0(c.key);
        if (c.highlight) svg.append('rect').attr('class', 'band').attr('x', gx - 4).attr('width', x0.bandwidth() + 8).attr('y', margin.top - 6).attr('height', height - margin.bottom - margin.top + 6).attr('rx', 6);
        let base = 0;
        for (const s of series) {
            const v = s.values[c.key] || 0;
            if (v <= 0) continue;
            if (stacked) {
                svg.append('rect').attr('x', gx).attr('width', x0.bandwidth()).attr('y', y(base + v) + 1).attr('height', Math.max(0, y(base) - y(base + v) - 2)).attr('rx', 3).attr('fill', s.color);
                base += v;
            } else {
                svg.append('rect').attr('x', gx + x1(s.key)).attr('width', x1.bandwidth()).attr('y', y(v)).attr('height', y(0) - y(v)).attr('rx', 3).attr('fill', s.color);
            }
        }
        if (stacked && totalLabels) svg.append('text').attr('class', 'bar-label').attr('x', gx + x0.bandwidth() / 2).attr('y', y(totals[ci]) - 6).attr('text-anchor', 'middle').text(format(totals[ci]));
        if (ci % every === 0) svg.append('text').attr('class', 'tick').attr('x', gx + x0.bandwidth() / 2).attr('y', height - margin.bottom + 18).attr('text-anchor', 'middle').text(c.short || c.key);
        svg.append('rect').attr('fill', 'transparent').attr('x', gx - x0.step() * x0.paddingInner() / 2).attr('width', x0.step()).attr('y', margin.top).attr('height', height - margin.top - margin.bottom)
            .on('pointerenter pointermove', event => {
                const [mx, my] = d3.pointer(event, container);
                const rows = series.map(s => ({ color: s.color, value: format(s.values[c.key] || 0), label: s.label }));
                if (stacked) rows.push({ value: format(totals[ci]), label: '∑' });
                tip.show(mx, my, c.label || c.key, rows);
            })
            .on('pointerleave', () => tip.hide());
    });
}

/** Horizontal bars around zero (positive and negative effects). items: [{ label, value }] */
export function divergingBars(container, { items, ariaLabel, format, posColor = 'var(--s1)', negColor = 'var(--s2)' }) {
    const rowH = 30;
    const height = items.length * rowH + 26;
    const { svg, width, tip } = frame(container, height, ariaLabel);
    const labelW = Math.min(200, width * 0.42);
    const ext = d3.max(items, d => Math.abs(d.value)) || 1;
    const x = d3.scaleLinear().domain([-ext, ext]).nice().range([labelW, width - 12]);
    svg.append('line').attr('class', 'baseline').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', items.length * rowH);
    svg.append('g').selectAll('text').data(x.ticks(5)).join('text').attr('class', 'tick').attr('x', x).attr('y', height - 6).attr('text-anchor', 'middle').text(d => format(d));
    items.forEach((d, i) => {
        const yy = i * rowH;
        svg.append('text').attr('class', 'cat-label').attr('x', labelW - 10).attr('y', yy + rowH / 2).attr('dominant-baseline', 'middle').attr('text-anchor', 'end').text(d.label);
        const x0 = Math.min(x(0), x(d.value)), w = Math.max(2, Math.abs(x(d.value) - x(0)));
        svg.append('rect').attr('x', x0).attr('y', yy + 6).attr('width', w).attr('height', rowH - 12).attr('rx', 4).attr('fill', d.value >= 0 ? posColor : negColor);
        svg.append('text').attr('class', 'bar-label').attr('dominant-baseline', 'middle').attr('y', yy + rowH / 2)
            .attr('x', d.value >= 0 ? x0 + w + 6 : x0 - 6).attr('text-anchor', d.value >= 0 ? 'start' : 'end').text(format(d.value));
        svg.append('rect').attr('fill', 'transparent').attr('y', yy).attr('width', width).attr('height', rowH)
            .on('pointerenter pointermove', event => { const [mx, my] = d3.pointer(event, container); tip.show(mx, my, d.label, [{ value: format(d.value), label: d.note || '' }]); })
            .on('pointerleave', () => tip.hide());
    });
}

/** Histogram from precomputed bins with vertical limit lines. */
export function histogram(container, { edges, counts, color, ariaLabel, xFormat, limits = [], countLabel }) {
    const height = 230;
    const { svg, width, tip } = frame(container, height, ariaLabel);
    const margin = { top: 22, right: 12, bottom: 30, left: 46 };
    const x = d3.scaleLinear().domain([edges[0], edges[edges.length - 1]]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, d3.max(counts) || 1]).nice().range([height - margin.bottom, margin.top]);
    yAxis(svg, y, margin, width, d => num(d));
    svg.append('g').selectAll('text').data(x.ticks(7)).join('text').attr('class', 'tick').attr('x', x).attr('y', height - margin.bottom + 18).attr('text-anchor', 'middle').text(xFormat);
    counts.forEach((c, i) => {
        const x0 = x(edges[i]) + 1, w = Math.max(1, x(edges[i + 1]) - x(edges[i]) - 2);
        if (c > 0) svg.append('rect').attr('x', x0).attr('width', w).attr('y', y(c)).attr('height', y(0) - y(c)).attr('rx', 2).attr('fill', color);
        svg.append('rect').attr('fill', 'transparent').attr('x', x0).attr('width', w + 2).attr('y', margin.top).attr('height', height - margin.top - margin.bottom)
            .on('pointerenter pointermove', event => { const [mx, my] = d3.pointer(event, container); tip.show(mx, my, `${xFormat(edges[i])} – ${xFormat(edges[i + 1])}`, [{ value: num(c), label: countLabel }]); })
            .on('pointerleave', () => tip.hide());
    });
    for (const l of limits) {
        svg.append('line').attr('class', `limit-line${l.critical ? ' limit-line--critical' : ''}`).attr('x1', x(l.x)).attr('x2', x(l.x)).attr('y1', margin.top - 8).attr('y2', height - margin.bottom);
        svg.append('text').attr('class', 'limit-label').attr('x', x(l.x) + 4).attr('y', margin.top - 10).text(l.label);
    }
    svg.append('line').attr('class', 'baseline').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y(0)).attr('y2', y(0));
}

/** Scatter on log axes with a 1:1 line and ±limit lines (duplicate pairs). */
export function duplicateScatter(container, { pairs, limit, ariaLabel, format, labels }) {
    const height = 260;
    const { svg, width, tip } = frame(container, height, ariaLabel);
    const margin = { top: 12, right: 12, bottom: 40, left: 52 };
    const lo = Math.max(0.005, d3.min(pairs, p => Math.min(p.original, p.duplicate)));
    const hi = d3.max(pairs, p => Math.max(p.original, p.duplicate));
    const x = d3.scaleLog().domain([lo, hi]).nice().range([margin.left, width - margin.right]).clamp(true);
    const y = d3.scaleLog().domain(x.domain()).range([height - margin.bottom, margin.top]).clamp(true);
    const ticks = x.ticks(4).filter(t => [1, 2, 5].includes(+t.toPrecision(1)[0]));
    svg.append('g').selectAll('line').data(ticks).join('line').attr('class', 'grid').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y).attr('y2', y);
    svg.append('g').selectAll('text').data(ticks).join('text').attr('class', 'tick').attr('x', margin.left - 8).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(format);
    svg.append('g').selectAll('text').data(ticks).join('text').attr('class', 'tick').attr('x', x).attr('y', height - margin.bottom + 18).attr('text-anchor', 'middle').text(format);
    svg.append('text').attr('class', 'axis-label').attr('x', (margin.left + width) / 2).attr('y', height - 4).attr('text-anchor', 'middle').text(labels.x);
    svg.append('text').attr('class', 'axis-label').attr('x', margin.left).attr('y', 8).text(labels.y);
    const [d0, d1] = x.domain();
    const f = (1 + limit) / (1 - limit);                         // HARD = limit  ⇔  ratio = (1+h)/(1-h)
    for (const [k, cls] of [[1, 'ref'], [f, 'limit-line'], [1 / f, 'limit-line']]) {
        const xa = Math.max(d0, d0 / k), xb = Math.min(d1, d1 / k);       // keep y = k·x inside the plot
        svg.append('line').attr('class', cls).attr('x1', x(xa)).attr('y1', y(xa * k)).attr('x2', x(xb)).attr('y2', y(xb * k));
    }
    svg.append('g').selectAll('circle').data(pairs).join('circle').attr('cx', p => x(p.original)).attr('cy', p => y(p.duplicate)).attr('r', 3.5)
        .attr('fill', p => (p.hard > limit ? 'var(--status-warning)' : 'var(--s1)')).attr('fill-opacity', 0.85).attr('stroke', 'var(--surface)').attr('stroke-width', 1)
        .on('pointerenter', (event, p) => { const [mx, my] = d3.pointer(event, container); tip.show(mx, my, labels.batch(p.batch), [{ value: format(p.original), label: labels.x }, { value: format(p.duplicate), label: labels.y }, { value: `${num(p.hard * 100, 1)} %`, label: 'HARD' }]); })
        .on('pointerleave', () => tip.hide());
}

/**
 * Grid of blocks (plan or section). cell(c, r) returns null (empty) or { fill, title, rows }.
 * inside(c, r) marks cells in the pit; the outline is drawn on the edges between inside and outside.
 */
export function blockGrid(container, { cols, rows, cell, inside, aspect = 1, ariaLabel, onPick, marker, overlay, xTicks, yTicks, maxHeight = 520 }) {
    container.replaceChildren();
    container.classList.add('chart');
    const width = Math.max(280, Math.floor(container.clientWidth));
    const margin = { top: 6, right: 6, bottom: 24, left: 46 };
    const cw = Math.min((width - margin.left - margin.right) / cols, (maxHeight - margin.top - margin.bottom) / (rows * aspect));
    const ch = cw * aspect;
    const height = Math.ceil(rows * ch + margin.top + margin.bottom);
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img').attr('aria-label', ariaLabel);
    const tip = tooltip(container);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const info = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const v = cell(c, r);
            if (!v) continue;
            info.push([c, r, v]);
            g.append('rect').attr('class', 'cell').attr('x', c * cw).attr('y', r * ch).attr('width', cw + 0.4).attr('height', ch + 0.4).attr('fill', v.fill);
        }
    }
    if (inside) {
        const segs = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!inside(c, r)) continue;
                if (r === 0 || !inside(c, r - 1)) segs.push([c, r, c + 1, r]);
                if (r === rows - 1 || !inside(c, r + 1)) segs.push([c, r + 1, c + 1, r + 1]);
                if (c === 0 || !inside(c - 1, r)) segs.push([c, r, c, r + 1]);
                if (c === cols - 1 || !inside(c + 1, r)) segs.push([c + 1, r, c + 1, r + 1]);
            }
        }
        g.append('path').attr('class', 'pit-outline').attr('d', segs.map(([a, b, c, d]) => `M${a * cw},${b * ch}L${c * cw},${d * ch}`).join(''));
    }
    if (overlay) overlay(g, cw, ch, tip);
    if (marker !== undefined && marker !== null) g.append('rect').attr('class', 'row-marker').attr('x', -2).attr('y', marker * ch - 1).attr('width', cols * cw + 4).attr('height', ch + 2).attr('rx', 2);
    for (const t of xTicks || []) svg.append('text').attr('class', 'tick').attr('x', margin.left + t.at * cw).attr('y', height - 6).attr('text-anchor', 'middle').text(t.label);
    for (const t of yTicks || []) svg.append('text').attr('class', 'tick').attr('x', margin.left - 6).attr('y', margin.top + t.at * ch + 4).attr('text-anchor', 'end').text(t.label);
    const hit = g.append('rect').attr('fill', 'transparent').attr('width', cols * cw).attr('height', rows * ch).style('cursor', onPick ? 'pointer' : 'default');
    hit.on('pointermove', event => {
        const [mx, my] = d3.pointer(event);
        const c = Math.floor(mx / cw), r = Math.floor(my / ch);
        const v = c >= 0 && r >= 0 && c < cols && r < rows ? cell(c, r) : null;
        if (!v) { tip.hide(); return; }
        const [px, py] = d3.pointer(event, container);
        tip.show(px, py, v.title, v.rows);
    }).on('pointerleave', () => tip.hide());
    if (onPick) hit.on('click', event => { const [, my] = d3.pointer(event); onPick(Math.floor(my / ch)); });
    return { cw, ch };
}
