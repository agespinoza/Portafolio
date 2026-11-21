// D3 renderers. Colors come from CSS custom properties (styles.css); identity is
// always backed by a symbol or label so color never carries meaning alone.
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { tr, num, duration, utcShort, utcTime, utcHm, utcFull, tickFormat } from './i18n.js?v=20261121a';

export const REGIMES = ['LEO', 'HEO', 'GEO'];
export const REGIME_LABEL = {
    LEO: tr('regime.LEO', 'Low Earth orbit'), HEO: tr('regime.HEO', 'Highly elliptical'),
    GEO: tr('regime.GEO', 'Geostationary'), MEO: tr('regime.MEO', 'Medium Earth orbit'),
};
export const regimeColor = regime => `var(--${(regime === 'MEO' ? 'LEO' : regime).toLowerCase()})`;
const SYMBOL = { LEO: d3.symbolCircle, HEO: d3.symbolDiamond, GEO: d3.symbolSquare, MEO: d3.symbolCircle };
export const symbolPath = (regime, size = 64) => d3.symbol(SYMBOL[regime] || d3.symbolCircle, size)();

export { utcShort, utcTime, utcHm, utcFull };
const fmt = value => num(value, 0);

let uid = 0;
const nextId = prefix => `${prefix}-${++uid}`;

function glowFilter(defs, stdDeviation = 3) {
    const id = nextId('glow');
    const filter = defs.append('filter').attr('id', id).attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', stdDeviation).attr('result', 'blur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');
    return `url(#${id})`;
}

function verticalGradient(defs, color, top = 0.32) {
    const id = nextId('fade');
    const g = defs.append('linearGradient').attr('id', id).attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', 1);
    g.append('stop').attr('offset', '0%').style('stop-color', color).style('stop-opacity', top);
    g.append('stop').attr('offset', '100%').style('stop-color', color).style('stop-opacity', 0);
    return `url(#${id})`;
}

// ---------- Tooltip ----------

export function tooltip(container) {
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
            const width = container.clientWidth;
            const w = tip.offsetWidth;
            tip.style.left = `${Math.max(0, x + 16 + w > width ? x - 16 - w : x + 16)}px`;
            tip.style.top = `${Math.max(0, y - 12)}px`;
        },
        hide() { tip.hidden = true; },
    };
}

// ---------- Time series with crosshair ----------

export function timeSeries(container, opts) {
    const {
        series, height = 240, yLabel, valueFormat = d => d.toFixed(1), unit = '', bands = [], bandLabel,
        refLines = [], markers = [], annotations = [], area = series.length === 1,
    } = opts;
    container.replaceChildren();
    container.classList.add('chart');
    const width = Math.max(300, Math.floor(container.clientWidth));
    const multi = series.length > 1;
    const margin = { top: 30, right: multi ? 96 : 20, bottom: 30, left: 56 };
    const grid = series[0].values;
    const x = d3.scaleUtc().domain([grid[0].ms, grid[grid.length - 1].ms]).range([margin.left, width - margin.right]);
    const values = series.flatMap(s => s.values.map(p => p.v)).filter(Number.isFinite);
    const y = d3.scaleLinear().domain(opts.yDomain || d3.extent(values)).range([height - margin.bottom, margin.top]);
    if (!opts.yDomain) y.nice();

    const svg = d3.select(container).append('svg')
        .attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`)
        .attr('role', 'img').attr('aria-label', opts.ariaLabel).attr('tabindex', 0);
    const defs = svg.append('defs');
    const glow = glowFilter(defs, 2.5);

    const bandGroup = svg.append('g');
    for (const band of bands) {
        const bx = x(band.from), bw = Math.max(1.5, x(band.to) - x(band.from));
        bandGroup.append('rect').attr('class', 'band').attr('x', bx).attr('width', bw)
            .attr('y', margin.top).attr('height', height - margin.top - margin.bottom).attr('rx', 3);
        if (band.label && bw > 54) {
            bandGroup.append('text').attr('class', 'band-label').attr('x', bx + bw / 2).attr('y', margin.top + 13)
                .attr('text-anchor', 'middle').text(band.label);
        }
    }

    const yTicks = y.ticks(5);
    const axes = svg.append('g');
    axes.selectAll('.grid').data(yTicks).join('line').attr('class', 'grid')
        .attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y).attr('y2', y);
    axes.selectAll('.tick-y').data(yTicks).join('text').attr('class', 'tick')
        .attr('x', margin.left - 10).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d => fmt(d));
    axes.append('line').attr('class', 'baseline')
        .attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', height - margin.bottom).attr('y2', height - margin.bottom);
    const xTicks = x.ticks(Math.max(2, Math.floor((width - margin.left - margin.right) / 96)));
    axes.selectAll('.tick-x').data(xTicks).join('text').attr('class', 'tick')
        .attr('x', x).attr('y', height - margin.bottom + 19).attr('text-anchor', 'middle').text(tickFormat);
    if (yLabel) axes.append('text').attr('class', 'axis-label').attr('x', margin.left - 48).attr('y', 9).text(yLabel);

    for (const ref of refLines) {
        svg.append('line').attr('class', 'ref').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y(ref.v)).attr('y2', y(ref.v));
        svg.append('text').attr('class', 'ref-label').attr('x', width - margin.right - 4).attr('y', y(ref.v) - 6).attr('text-anchor', 'end').text(ref.label);
    }
    for (const marker of markers) {
        if (marker.ms < x.domain()[0] || marker.ms > x.domain()[1]) continue;
        svg.append('line').attr('class', 'marker').attr('x1', x(marker.ms)).attr('x2', x(marker.ms)).attr('y1', margin.top).attr('y2', height - margin.bottom);
        svg.append('text').attr('class', 'marker-label').attr('x', x(marker.ms) + 6).attr('y', margin.top + 12).text(marker.label);
    }

    const line = d3.line().defined(p => Number.isFinite(p.v)).x(p => x(p.ms)).y(p => y(p.v));
    if (area) {
        const fill = verticalGradient(defs, series[0].color);
        const areaGen = d3.area().defined(p => Number.isFinite(p.v)).x(p => x(p.ms)).y0(height - margin.bottom).y1(p => y(p.v));
        svg.append('path').attr('d', areaGen(series[0].values)).attr('fill', fill);
    }
    svg.append('g').selectAll('path').data(series).join('path').attr('class', 'series-line')
        .attr('stroke', s => s.color).attr('filter', glow).attr('d', s => line(s.values));

    for (const note of annotations) {
        const ax = x(note.ms), ay = y(note.v);
        const g = svg.append('g').attr('class', 'annotation');
        g.append('circle').attr('cx', ax).attr('cy', ay).attr('r', 4).attr('fill', note.color || series[0].color);
        const above = note.position !== 'below';
        const anchor = ax > width - margin.right - 70 ? 'end' : ax < margin.left + 70 ? 'start' : 'middle';
        g.append('text').attr('x', ax).attr('y', above ? ay - 10 : ay + 18).attr('text-anchor', anchor).text(note.label);
    }

    if (multi) {
        const ends = series.map(s => {
            const last = [...s.values].reverse().find(p => Number.isFinite(p.v));
            return { s, y: y(last.v) };
        }).sort((a, b) => a.y - b.y);
        for (let i = 1; i < ends.length; i++) ends[i].y = Math.max(ends[i].y, ends[i - 1].y + 15);
        const label = svg.append('g').selectAll('g').data(ends).join('g');
        label.append('line').attr('x1', width - margin.right + 4).attr('x2', width - margin.right + 14)
            .attr('y1', d => d.y).attr('y2', d => d.y).attr('stroke', d => d.s.color).attr('stroke-width', 2);
        label.append('text').attr('class', 'direct-label').attr('x', width - margin.right + 18).attr('y', d => d.y + 4).text(d => d.s.label);
    }

    const now = svg.append('g').attr('class', 'now').style('display', 'none');
    now.append('line').attr('y1', margin.top - 4).attr('y2', height - margin.bottom);
    now.append('text').attr('x', 4).attr('y', margin.top - 4).text(tr('chart.now', 'NOW'));

    const hair = svg.append('g').attr('class', 'crosshair').style('display', 'none');
    hair.append('line').attr('y1', margin.top).attr('y2', height - margin.bottom);
    const dots = hair.selectAll('circle').data(series).join('circle').attr('r', 4.5).attr('fill', s => s.color);
    const tip = tooltip(container);
    const bisect = d3.bisector(p => p.ms).center;
    let index = -1;
    const showAt = i => {
        index = Math.max(0, Math.min(grid.length - 1, i));
        const px = x(grid[index].ms);
        hair.style('display', null);
        hair.select('line').attr('x1', px).attr('x2', px);
        dots.attr('cx', px).attr('cy', s => Number.isFinite(s.values[index].v) ? y(s.values[index].v) : -99);
        const rows = series.map(s => ({
            color: multi ? s.color : null,
            value: Number.isFinite(s.values[index].v) ? `${valueFormat(s.values[index].v)} ${unit}` : '—',
            label: s.label,
        }));
        if (opts.extraRows) rows.push(...opts.extraRows(index));
        tip.show(px, margin.top, `${utcFull(new Date(grid[index].ms))} UTC`, rows);
    };
    const hide = () => { hair.style('display', 'none'); tip.hide(); };
    svg.on('pointermove', event => showAt(bisect(grid, x.invert(d3.pointer(event)[0]))))
        .on('pointerleave', hide).on('blur', hide)
        .on('keydown', event => {
            const step = Math.max(1, Math.round(grid.length / 60));
            if (event.key === 'ArrowRight') { showAt(index < 0 ? 0 : index + step); event.preventDefault(); }
            if (event.key === 'ArrowLeft') { showAt(index < 0 ? grid.length - 1 : index - step); event.preventDefault(); }
            if (event.key === 'Escape') hide();
        });

    if (bandLabel && bands.length) {
        const key = d3.select(container).append('p').attr('class', 'chart-key');
        key.append('span').attr('class', 'chart-key__band');
        key.append('span').text(bandLabel);
    }
    return {
        setNow(ms) {
            const inside = ms >= x.domain()[0] && ms <= x.domain()[1];
            now.style('display', inside ? null : 'none').attr('transform', `translate(${x(ms)},0)`);
        },
    };
}

// ---------- Contact plan (Gantt of every pass for the fleet) ----------

export function contactPlan(container, { rows, startMs, endMs, selectedId, selectedPass, onSelect }) {
    container.replaceChildren();
    container.classList.add('chart');
    const width = Math.max(320, Math.floor(container.clientWidth));
    const rowH = 26;
    const margin = { top: 34, right: 16, bottom: 12, left: width < 520 ? 92 : 118 };
    const height = margin.top + rows.length * rowH + margin.bottom;
    const x = d3.scaleUtc().domain([startMs, endMs]).range([margin.left, width - margin.right]);
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`)
        .attr('role', 'img').attr('aria-label', tr('plan.aria', 'Contact plan: passes of every satellite over the ground station'));
    const defs = svg.append('defs');
    const glow = glowFilter(defs, 3);

    const xTicks = x.ticks(Math.max(3, Math.floor((width - margin.left) / 90)));
    svg.selectAll('.grid').data(xTicks).join('line').attr('class', 'grid')
        .attr('x1', x).attr('x2', x).attr('y1', margin.top - 8).attr('y2', height - margin.bottom);
    svg.selectAll('.tick').data(xTicks).join('text').attr('class', 'tick').attr('x', x).attr('y', margin.top - 14)
        .attr('text-anchor', 'middle').text(tickFormat);

    const tip = tooltip(container);
    rows.forEach((row, i) => {
        const y0 = margin.top + i * rowH;
        const g = svg.append('g').attr('class', 'plan-row').classed('is-selected', row.sat.norad === selectedId);
        g.append('rect').attr('class', 'plan-row__bg').attr('x', 0).attr('y', y0).attr('width', width).attr('height', rowH)
            .on('click', () => onSelect(row.sat.norad, null));
        g.append('path').attr('d', symbolPath(row.sat.regime, 40)).attr('fill', regimeColor(row.sat.regime))
            .attr('transform', `translate(10,${y0 + rowH / 2})`);
        g.append('text').attr('class', 'plan-label').attr('x', 22).attr('y', y0 + rowH / 2 + 4).text(row.sat.name)
            .on('click', () => onSelect(row.sat.norad, null));
        g.append('line').attr('class', 'plan-track').attr('x1', margin.left).attr('x2', width - margin.right)
            .attr('y1', y0 + rowH / 2).attr('y2', y0 + rowH / 2);
        row.passes.forEach((pass, index) => {
            const px = x(pass.aos.getTime()), pw = Math.max(3, x(pass.los.getTime()) - px);
            const isSel = selectedPass && selectedPass.norad === row.sat.norad && selectedPass.index === index;
            const bar = g.append('g').attr('class', 'plan-pass').classed('is-selected', isSel)
                .on('click', event => { event.stopPropagation(); onSelect(row.sat.norad, index); })
                .on('pointerenter pointermove', event => {
                    const [mx, my] = d3.pointer(event, container);
                    tip.show(mx, my, row.sat.name, [
                        { value: `${utcHm(pass.aos)} – ${utcHm(pass.los)} UTC`, label: '' },
                        { value: duration(pass.durationMin * 60_000), label: tr('tip.duration', 'duration') },
                        { value: `${num(pass.maxElDeg, 1)}°`, label: tr('tip.maxEl', 'max elevation') },
                    ]);
                })
                .on('pointerleave', () => tip.hide());
            bar.append('rect').attr('class', 'plan-hit').attr('x', px - 4).attr('width', pw + 8).attr('y', y0).attr('height', rowH);
            bar.append('rect').attr('class', 'plan-bar').attr('x', px).attr('width', pw).attr('y', y0 + 7).attr('height', rowH - 14).attr('rx', 3)
                .attr('fill', regimeColor(row.sat.regime)).attr('fill-opacity', 0.45 + 0.55 * Math.min(1, pass.maxElDeg / 90))
                .attr('filter', isSel ? glow : null);
            if (pw > 30) bar.append('text').attr('class', 'plan-bar__label').attr('x', px + pw / 2).attr('y', y0 + rowH / 2 + 3.5)
                .attr('text-anchor', 'middle').text(`${Math.round(pass.maxElDeg)}°`);
        });
    });
    const now = svg.append('g').attr('class', 'now').style('display', 'none');
    now.append('line').attr('y1', margin.top - 8).attr('y2', height - margin.bottom);
    return {
        setNow(ms) {
            const inside = ms >= startMs && ms <= endMs;
            now.style('display', inside ? null : 'none').attr('transform', `translate(${x(ms)},0)`);
        },
    };
}

// ---------- Ground-track map ----------

export function createMap(svgElement, { dots, onSelect }) {
    const width = 960, height = 480;
    const svg = d3.select(svgElement).attr('viewBox', `0 0 ${width} ${height}`);
    const projection = d3.geoEquirectangular().fitSize([width, height], { type: 'Sphere' });
    const path = d3.geoPath(projection);
    const defs = svg.append('defs');
    const glow = glowFilter(defs, 3.5);
    const footFill = nextId('foot');
    const fg = defs.append('radialGradient').attr('id', footFill);
    fg.append('stop').attr('offset', '0%').attr('class', 'foot-stop-in');
    fg.append('stop').attr('offset', '100%').attr('class', 'foot-stop-out');

    svg.append('path').attr('class', 'map-ocean').attr('d', path({ type: 'Sphere' }));
    svg.append('path').attr('class', 'map-graticule').attr('d', path(d3.geoGraticule().step([15, 15])()));
    svg.append('path').attr('class', 'map-equator').attr('d', path({ type: 'LineString', coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]] }));
    let d = '';
    for (const [lon, lat] of dots) {
        const [px, py] = projection([lon, lat]);
        d += `M${(px - 1.25).toFixed(1)},${py.toFixed(1)}a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0`;
    }
    svg.append('path').attr('class', 'map-land').attr('d', d);
    // Night with civil, nautical and astronomical twilight as soft steps.
    const twilight = [90, 96, 102, 108].map(() => svg.append('path').attr('class', 'map-night'));
    const footprint = svg.append('path').attr('class', 'map-footprint').attr('fill', `url(#${footFill})`);
    const contact = svg.append('path').attr('class', 'map-contact');
    const pastTrack = svg.append('path').attr('class', 'map-track map-track--past');
    const futureTrack = svg.append('path').attr('class', 'map-track').attr('filter', glow);
    const sun = svg.append('g').attr('class', 'map-sun');
    sun.append('circle').attr('r', 9).attr('class', 'map-sun__halo');
    sun.append('circle').attr('r', 4);
    const station = svg.append('g').attr('class', 'map-station');
    station.append('path').attr('d', d3.symbol(d3.symbolTriangle, 80)());
    const stationLabel = station.append('text').attr('x', 9).attr('y', 15);
    const fleet = svg.append('g');
    const pulse = svg.append('circle').attr('class', 'map-pulse').attr('r', 8);
    const label = svg.append('text').attr('class', 'map-label');
    const tip = tooltip(svgElement.parentElement);
    const toScreen = (lon, lat) => {
        const [px, py] = projection([lon, lat]);
        const box = svgElement.getBoundingClientRect();
        return [px * box.width / width, py * box.height / height];
    };

    return {
        update({ sats, states, selected, track, now, sunPoint, stationInfo, footprintDeg, contactDeg }) {
            const anti = [sunPoint.lon + 180, -sunPoint.lat];
            [90, 96, 102, 108].forEach((r, i) => twilight[i].attr('d', path(d3.geoCircle().center(anti).radius(180 - r)())));
            sun.attr('transform', `translate(${projection([sunPoint.lon, sunPoint.lat])})`);
            const s = states.get(selected.norad);
            const color = regimeColor(selected.regime);
            footprint.attr('d', s ? path(d3.geoCircle().center([s.lon, s.lat]).radius(footprintDeg)()) : null).attr('stroke', color);
            fg.selectAll('stop').style('stop-color', color);
            contact.attr('d', path(d3.geoCircle().center([stationInfo.lon, stationInfo.lat]).radius(contactDeg)()));
            const split = track.findIndex(p => p.ms >= now);
            const past = track.slice(0, split + 1).map(p => [p.lon, p.lat]);
            const future = track.slice(Math.max(0, split)).map(p => [p.lon, p.lat]);
            pastTrack.attr('d', past.length > 1 ? path({ type: 'LineString', coordinates: past }) : null).attr('stroke', color);
            futureTrack.attr('d', future.length > 1 ? path({ type: 'LineString', coordinates: future }) : null).attr('stroke', color);
            station.attr('transform', `translate(${projection([stationInfo.lon, stationInfo.lat])})`);
            stationLabel.text(stationInfo.short);

            const visible = sats.filter(sat => states.get(sat.norad));
            fleet.selectAll('path').data(visible, sat => sat.norad).join(enter => enter.append('path')
                .attr('class', 'map-sat')
                .on('click', (event, sat) => onSelect(sat.norad))
                .on('pointerenter pointermove', (event, sat) => {
                    const st = states.get(sat.norad);
                    const [px, py] = toScreen(st.lon, st.lat);
                    tip.show(px, py, sat.name, [
                        { value: `${num(st.altKm)} km`, label: tr('tip.altitude', 'altitude') },
                        { value: `${num(st.lat, 2)}°, ${num(st.lon, 2)}°`, label: tr('tip.latlon', 'lat, lon') },
                        { value: REGIME_LABEL[sat.regime], label: '' },
                    ]);
                })
                .on('pointerleave', () => tip.hide()))
                .attr('d', sat => symbolPath(sat.regime, sat.norad === selected.norad ? 130 : 56))
                .attr('fill', sat => regimeColor(sat.regime))
                .classed('is-selected', sat => sat.norad === selected.norad)
                .attr('transform', sat => { const st = states.get(sat.norad); return `translate(${projection([st.lon, st.lat])})`; })
                .sort(a => (a.norad === selected.norad ? 1 : -1));
            if (s) {
                const [px, py] = projection([s.lon, s.lat]);
                pulse.attr('cx', px).attr('cy', py).attr('stroke', color);
                const flip = px > width - 130;
                label.attr('x', px + (flip ? -14 : 14)).attr('y', py - 12).attr('text-anchor', flip ? 'end' : 'start').text(selected.name);
            }
        },
    };
}

// ---------- Polar sky plot ----------

export function skyPlot(svgElement, pass, current, color = 'var(--leo)') {
    const size = 300, r = 118, c = size / 2;
    const svg = d3.select(svgElement).attr('viewBox', `0 0 ${size} ${size}`);
    svg.selectAll('*').remove();
    const defs = svg.append('defs');
    const glow = glowFilter(defs, 3);
    const bg = nextId('sky');
    const g = defs.append('radialGradient').attr('id', bg);
    g.append('stop').attr('offset', '0%').attr('class', 'sky-stop-in');
    g.append('stop').attr('offset', '100%').attr('class', 'sky-stop-out');
    const radius = el => r * (90 - el) / 90;
    const point = (az, el) => [c + radius(el) * Math.sin(az * Math.PI / 180), c - radius(el) * Math.cos(az * Math.PI / 180)];
    svg.append('circle').attr('cx', c).attr('cy', c).attr('r', r).attr('fill', `url(#${bg})`);
    for (const el of [0, 30, 60]) {
        svg.append('circle').attr('class', el === 0 ? 'sky-horizon' : 'grid').attr('cx', c).attr('cy', c).attr('r', radius(el)).attr('fill', 'none');
        if (el) svg.append('text').attr('class', 'tick').attr('x', c + 4).attr('y', c - radius(el) - 4).text(`${el}°`);
    }
    for (let az = 0; az < 360; az += 30) {
        const [x1, y1] = point(az, 0), [x2, y2] = point(az, az % 90 ? 80 : 90);
        svg.append('line').attr('class', 'grid').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
    }
    [[tr('sky.N', 'N'), 0], [tr('sky.E', 'E'), 90], [tr('sky.S', 'S'), 180], [tr('sky.W', 'W'), 270]].forEach(([text, az]) => {
        const [x, y] = point(az, -13);
        svg.append('text').attr('class', 'sky-cardinal').attr('x', x).attr('y', y + 4).attr('text-anchor', 'middle').text(text);
    });
    if (!pass) {
        svg.append('text').attr('class', 'tick').attr('x', c).attr('y', c + 4).attr('text-anchor', 'middle').text(tr('sky.none', 'No pass in window'));
        return;
    }
    const visible = pass.track.filter(p => p.elDeg >= 0);
    const pts = visible.map(p => point(p.azDeg, p.elDeg));
    svg.append('path').attr('class', 'series-line sky-track').attr('stroke', color).attr('filter', glow).attr('d', d3.line().curve(d3.curveCatmullRom)(pts));
    // Minute ticks along the pass, labelled every few minutes.
    const spanMin = (pass.los - pass.aos) / 60000;
    const every = spanMin > 240 ? 60 : spanMin > 60 ? 15 : spanMin > 20 ? 5 : 1;
    const startMin = Math.ceil(pass.aos.getTime() / 60000 / every) * every;
    for (let m = startMin; m * 60000 < pass.los.getTime(); m += every) {
        const ms = m * 60000;
        const nearest = visible.reduce((a, b) => (Math.abs(b.ms - ms) < Math.abs(a.ms - ms) ? b : a));
        const [tx, ty] = point(nearest.azDeg, nearest.elDeg);
        svg.append('circle').attr('class', 'sky-tick').attr('cx', tx).attr('cy', ty).attr('r', 2.2);
    }
    const [ax, ay] = pts[0], [lx, ly] = pts[pts.length - 1];
    const tca = visible.reduce((a, b) => (b.elDeg > a.elDeg ? b : a));
    const [tx, ty] = point(tca.azDeg, tca.elDeg);
    svg.append('circle').attr('class', 'sky-end').attr('cx', ax).attr('cy', ay).attr('r', 4.5);
    svg.append('text').attr('class', 'sky-note').attr('x', ax + 8).attr('y', ay - 7).text(`AOS ${utcHm(pass.aos)}`);
    svg.append('rect').attr('class', 'sky-end').attr('x', lx - 4.5).attr('y', ly - 4.5).attr('width', 9).attr('height', 9).attr('rx', 1.5);
    svg.append('text').attr('class', 'sky-note').attr('x', lx + 8).attr('y', ly + 14).text(`LOS ${utcHm(pass.los)}`);
    svg.append('circle').attr('cx', tx).attr('cy', ty).attr('r', 4).attr('fill', color);
    svg.append('text').attr('class', 'sky-note sky-note--strong').attr('x', tx + 8).attr('y', ty + 4).text(`${pass.maxElDeg.toFixed(0)}°`);
    if (current && current.elDeg >= 0) {
        const [px, py] = point(current.azDeg, current.elDeg);
        svg.append('circle').attr('class', 'map-pulse').attr('cx', px).attr('cy', py).attr('r', 8).attr('stroke', color);
        svg.append('circle').attr('class', 'sky-now').attr('cx', px).attr('cy', py).attr('r', 5.5).attr('fill', color);
    }
}

// ---------- Orbit regimes: inclination vs altitude (log) ----------

export function regimeChart(container, sats, { onSelect }) {
    container.replaceChildren();
    container.classList.add('chart');
    const width = Math.max(300, Math.floor(container.clientWidth)), height = 340;
    const margin = { top: 30, right: 18, bottom: 42, left: 66 };
    const x = d3.scaleLinear().domain([0, 105]).range([margin.left, width - margin.right]);
    const y = d3.scaleLog().domain([300, 250_000]).range([height - margin.bottom, margin.top]);
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`)
        .attr('role', 'img').attr('aria-label', tr('regime.aria', 'Perigee to apogee altitude of each satellite against orbital inclination'));
    const defs = svg.append('defs');
    const glow = glowFilter(defs, 2.5);
    // Approximate Van Allen radiation belts, the reason most missions avoid MEO.
    for (const [lo, hi, text] of [[1000, 6000, tr('regime.inner', 'Inner Van Allen belt')], [13000, 60000, tr('regime.outer', 'Outer Van Allen belt')]]) {
        svg.append('rect').attr('class', 'belt').attr('x', margin.left).attr('width', width - margin.left - margin.right)
            .attr('y', y(hi)).attr('height', y(lo) - y(hi));
        svg.append('text').attr('class', 'belt-label').attr('x', width - margin.right - 6).attr('y', y(hi) + 14).attr('text-anchor', 'end').text(text);
    }
    const yTicks = [300, 1000, 3000, 10_000, 30_000, 100_000];
    svg.selectAll('.grid').data(yTicks).join('line').attr('class', 'grid').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y).attr('y2', y);
    svg.selectAll('.ty').data(yTicks).join('text').attr('class', 'tick').attr('x', margin.left - 10).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(fmt);
    svg.append('line').attr('class', 'baseline').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', height - margin.bottom).attr('y2', height - margin.bottom);
    const xTicks = [0, 15, 30, 45, 60, 75, 90, 105];
    svg.selectAll('.tx').data(xTicks).join('text').attr('class', 'tick').attr('x', x).attr('y', height - margin.bottom + 19).attr('text-anchor', 'middle').text(d => `${d}°`);
    svg.append('text').attr('class', 'axis-label').attr('x', (margin.left + width - margin.right) / 2).attr('y', height - 4).attr('text-anchor', 'middle').text(tr('regime.incl', 'Inclination'));
    svg.append('text').attr('class', 'axis-label').attr('x', 6).attr('y', 14).text(tr('regime.alt', 'Altitude (km)'));
    svg.append('line').attr('class', 'ref').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y(35786)).attr('y2', y(35786));
    svg.append('text').attr('class', 'ref-label').attr('x', margin.left + 18).attr('y', y(35786) - 6).text(tr('regime.geoLine', 'Geostationary · {km} km', { km: num(35786) }));
    svg.append('line').attr('class', 'ref').attr('x1', x(98)).attr('x2', x(98)).attr('y1', margin.top).attr('y2', height - margin.bottom);
    svg.append('text').attr('class', 'ref-label').attr('x', x(98) - 6).attr('y', margin.top + 12).attr('text-anchor', 'end').text(tr('regime.sso', 'Sun-synchronous ≈ 98°'));

    const tip = tooltip(container);
    const groups = svg.append('g').selectAll('g').data(sats, s => s.norad).join('g').attr('class', 'regime-mark')
        .on('click', (event, sat) => onSelect(sat.norad))
        .on('pointerenter', (event, sat) => {
            const e = sat.elements;
            tip.show(x(e.inclinationDeg), y(Math.max(300, e.perigeeKm)), sat.name, [
                { value: `${num(e.perigeeKm)} – ${num(e.apogeeKm)} km`, label: tr('tip.periApo', 'perigee – apogee') },
                { value: `${num(e.inclinationDeg, 2)}°`, label: tr('tip.incl', 'inclination') },
                { value: `${num(e.periodMin, 1)} min`, label: tr('tip.period', 'period') },
            ]);
        })
        .on('pointerleave', () => tip.hide());
    groups.append('line').attr('class', 'regime-range')
        .attr('x1', s => x(s.elements.inclinationDeg)).attr('x2', s => x(s.elements.inclinationDeg))
        .attr('y1', s => y(Math.max(300, s.elements.perigeeKm))).attr('y2', s => y(Math.max(300, s.elements.apogeeKm)) - 0.01)
        .attr('stroke', s => regimeColor(s.regime));
    groups.append('rect').attr('class', 'hit').attr('x', s => x(s.elements.inclinationDeg) - 9).attr('width', 18)
        .attr('y', s => y(Math.max(300, s.elements.apogeeKm)) - 9).attr('height', s => y(Math.max(300, s.elements.perigeeKm)) - y(Math.max(300, s.elements.apogeeKm)) + 18);
    const now = groups.append('path').attr('class', 'map-sat').attr('fill', s => regimeColor(s.regime)).attr('d', s => symbolPath(s.regime, 60)).attr('filter', glow);
    const label = svg.append('text').attr('class', 'map-label');
    return {
        update(states, selectedId) {
            now.attr('transform', s => {
                const st = states.get(s.norad);
                return `translate(${x(s.elements.inclinationDeg)},${y(Math.max(300, st ? st.altKm : s.elements.perigeeKm))})`;
            }).classed('is-selected', s => s.norad === selectedId);
            const sel = sats.find(s => s.norad === selectedId);
            if (sel) {
                const st = states.get(sel.norad);
                const px = x(sel.elements.inclinationDeg);
                const flip = px > width - 120;
                label.attr('x', px + (flip ? -12 : 12)).attr('y', y(Math.max(300, st ? st.altKm : sel.elements.perigeeKm)) - 10)
                    .attr('text-anchor', flip ? 'end' : 'start').text(sel.name);
            }
        },
    };
}
