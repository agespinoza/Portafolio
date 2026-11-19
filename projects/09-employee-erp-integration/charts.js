// D3 charts for the integration console. Colors come from CSS custom properties.
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { num } from './i18n.js?v=20261119c';

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
                label.textContent = row.label;
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

/** Horizontal bars, one series. items: [{ label, value, note }]. */
export function barChart(container, { items, color = 'var(--accent)', ariaLabel, valueLabel, empty }) {
    const rowH = 30;
    if (!items.length) { container.replaceChildren(Object.assign(document.createElement('p'), { className: 'empty', textContent: empty })); return; }
    const height = items.length * rowH + 8;
    const { svg, width, tip } = frame(container, height, ariaLabel);
    const labelW = Math.min(220, width * 0.45);
    const x = d3.scaleLinear().domain([0, d3.max(items, d => d.value) || 1]).range([0, width - labelW - 44]);
    const g = svg.selectAll('g').data(items).join('g').attr('transform', (d, i) => `translate(0,${i * rowH + 4})`);
    g.append('text').attr('class', 'cat-label').attr('x', labelW - 10).attr('y', rowH / 2 + 1).attr('text-anchor', 'end').text(d => d.label);
    g.append('rect').attr('class', 'bar').attr('x', labelW).attr('y', 5).attr('height', rowH - 12).attr('rx', 4)
        .attr('width', d => Math.max(3, x(d.value))).attr('fill', color);
    g.append('text').attr('class', 'bar-label').attr('x', d => labelW + Math.max(3, x(d.value)) + 8).attr('y', rowH / 2 + 1).text(d => num(d.value));
    g.append('rect').attr('fill', 'transparent').attr('width', width).attr('height', rowH)
        .on('pointerenter pointermove', (event, d) => { const [mx, my] = d3.pointer(event, container); tip.show(mx, my, d.label, [{ value: num(d.value), label: valueLabel }, ...(d.note ? [{ value: d.note, label: '' }] : [])]); })
        .on('pointerleave', () => tip.hide());
    g.selectAll('text').attr('dominant-baseline', 'middle');
}

/** Grouped vertical bars: categories × two series. */
export function groupedBars(container, { categories, series, ariaLabel }) {
    const height = 260;
    const { svg, width, tip } = frame(container, height, ariaLabel);
    const margin = { top: 12, right: 8, bottom: 34, left: 36 };
    const x0 = d3.scaleBand().domain(categories.map(c => c.key)).range([margin.left, width - margin.right]).paddingInner(0.28);
    const x1 = d3.scaleBand().domain(series.map(s => s.key)).range([0, x0.bandwidth()]).padding(0.12);
    const max = d3.max(series.flatMap(s => categories.map(c => s.values[c.key] || 0))) || 1;
    const y = d3.scaleLinear().domain([0, max]).nice().range([height - margin.bottom, margin.top]);
    svg.append('g').selectAll('line').data(y.ticks(4)).join('line').attr('class', 'grid')
        .attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y).attr('y2', y);
    svg.append('g').selectAll('text').data(y.ticks(4)).join('text').attr('class', 'tick')
        .attr('x', margin.left - 8).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d => num(d));
    svg.append('line').attr('class', 'baseline').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y(0)).attr('y2', y(0));
    const group = svg.append('g').selectAll('g').data(categories).join('g').attr('transform', c => `translate(${x0(c.key)},0)`);
    group.selectAll('rect').data(c => series.map(s => ({ c, s, v: s.values[c.key] || 0 }))).join('rect')
        .attr('x', d => x1(d.s.key)).attr('width', x1.bandwidth()).attr('y', d => y(d.v)).attr('height', d => y(0) - y(d.v))
        .attr('rx', 3).attr('fill', d => d.s.color);
    group.append('text').attr('class', 'tick').attr('x', x0.bandwidth() / 2).attr('y', height - margin.bottom + 18).attr('text-anchor', 'middle').text(c => c.key);
    group.append('rect').attr('fill', 'transparent').attr('y', margin.top).attr('width', x0.bandwidth()).attr('height', height - margin.top - margin.bottom)
        .on('pointerenter pointermove', (event, c) => {
            const [mx, my] = d3.pointer(event, container);
            const delta = (series[1].values[c.key] || 0) - (series[0].values[c.key] || 0);
            tip.show(mx, my, c.label, [
                ...series.map(s => ({ color: s.color, value: num(s.values[c.key] || 0), label: s.label })),
                { value: `${delta >= 0 ? '+' : '−'}${num(Math.abs(delta))}`, label: '' },
            ]);
        })
        .on('pointerleave', () => tip.hide());
}

/** Lines over runs (categorical x), percent values 0–1. */
export function runLines(container, { runs, series, ariaLabel, format }) {
    const height = 230;
    const { svg, width, tip } = frame(container, height, ariaLabel);
    const margin = { top: 26, right: 16, bottom: 30, left: 46 };
    const x = d3.scalePoint().domain(runs.map(r => r.key)).range([margin.left + 8, width - margin.right]);
    const values = series.flatMap(s => s.values).filter(Number.isFinite);
    const y = d3.scaleLinear().domain([Math.min(0.9, d3.min(values)), 1]).nice().range([height - margin.bottom, margin.top]);
    svg.append('g').selectAll('line').data(y.ticks(4)).join('line').attr('class', 'grid').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y).attr('y2', y);
    svg.append('g').selectAll('text').data(y.ticks(4)).join('text').attr('class', 'tick').attr('x', margin.left - 8).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(format);
    svg.append('g').selectAll('text').data(runs).join('text').attr('class', 'tick').attr('x', r => x(r.key)).attr('y', height - margin.bottom + 18).attr('text-anchor', 'middle').text(r => r.short);
    const line = d3.line().defined(d => Number.isFinite(d.v)).x(d => x(d.key)).y(d => y(d.v));
    for (const s of series) {
        const points = runs.map((r, i) => ({ key: r.key, v: s.values[i] }));
        svg.append('path').attr('class', 'series-line').attr('stroke', s.color).attr('d', line(points));
        svg.append('g').selectAll('circle').data(points.filter(p => Number.isFinite(p.v))).join('circle')
            .attr('cx', p => x(p.key)).attr('cy', p => y(p.v)).attr('r', 4.5).attr('fill', s.color).attr('stroke', 'var(--surface)').attr('stroke-width', 2);
        const first = points.find(p => Number.isFinite(p.v));
        if (first) svg.append('text').attr('class', 'direct-label').attr('x', x(first.key) + 8).attr('y', y(first.v) + (s.offset || 0)).text(s.label);
    }
    svg.append('g').selectAll('rect').data(runs).join('rect').attr('fill', 'transparent')
        .attr('x', r => x(r.key) - x.step() / 2).attr('width', x.step()).attr('y', margin.top).attr('height', height - margin.top - margin.bottom)
        .on('pointerenter pointermove', (event, r) => {
            const i = runs.indexOf(r);
            const [mx, my] = d3.pointer(event, container);
            tip.show(mx, my, r.label, series.map(s => ({ color: s.color, value: Number.isFinite(s.values[i]) ? format(s.values[i]) : '—', label: s.label })));
        })
        .on('pointerleave', () => tip.hide());
}

/** Stacked vertical bars over runs. series: [{ key, label, color, values: [] }]. */
export function runStacks(container, { runs, series, ariaLabel }) {
    const height = 230;
    const { svg, width, tip } = frame(container, height, ariaLabel);
    const margin = { top: 14, right: 8, bottom: 30, left: 36 };
    const x = d3.scaleBand().domain(runs.map(r => r.key)).range([margin.left, width - margin.right]).padding(0.35);
    const totals = runs.map((r, i) => series.reduce((sum, s) => sum + s.values[i], 0));
    const y = d3.scaleLinear().domain([0, d3.max(totals) || 1]).nice().range([height - margin.bottom, margin.top]);
    svg.append('g').selectAll('line').data(y.ticks(4)).join('line').attr('class', 'grid').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y).attr('y2', y);
    svg.append('g').selectAll('text').data(y.ticks(4)).join('text').attr('class', 'tick').attr('x', margin.left - 8).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d => num(d));
    svg.append('g').selectAll('text').data(runs).join('text').attr('class', 'tick').attr('x', r => x(r.key) + x.bandwidth() / 2).attr('y', height - margin.bottom + 18).attr('text-anchor', 'middle').text(r => r.short);
    runs.forEach((r, i) => {
        let base = 0;
        for (const s of series) {
            const v = s.values[i];
            if (v > 0) {
                svg.append('rect').attr('x', x(r.key)).attr('width', x.bandwidth()).attr('y', y(base + v) + 1).attr('height', Math.max(0, y(base) - y(base + v) - 2))
                    .attr('rx', 3).attr('fill', s.color);
            }
            base += v;
        }
        svg.append('text').attr('class', 'bar-label').attr('x', x(r.key) + x.bandwidth() / 2).attr('y', y(totals[i]) - 6).attr('text-anchor', 'middle').text(num(totals[i]));
        svg.append('rect').attr('fill', 'transparent').attr('x', x(r.key)).attr('width', x.bandwidth()).attr('y', margin.top).attr('height', height - margin.top - margin.bottom)
            .on('pointerenter pointermove', event => {
                const [mx, my] = d3.pointer(event, container);
                tip.show(mx, my, r.label, series.map(s => ({ color: s.color, value: num(s.values[i]), label: s.label })));
            })
            .on('pointerleave', () => tip.hide());
    });
}
