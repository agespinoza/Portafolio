// D3 renderers for the console. Every chart reads colors from CSS custom properties
// so light and dark themes come from one stylesheet.
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

export const REGIMES = ['LEO', 'HEO', 'GEO'];
export const REGIME_LABEL = { LEO: 'Low Earth orbit', HEO: 'Highly elliptical', GEO: 'Geostationary', MEO: 'Medium Earth orbit' };
const REGIME_SLOT = { LEO: 1, HEO: 2, GEO: 3, MEO: 1 };
export const regimeColor = regime => `var(--series-${REGIME_SLOT[regime] || 1})`;
const SYMBOL = { LEO: d3.symbolCircle, HEO: d3.symbolDiamond, GEO: d3.symbolSquare, MEO: d3.symbolCircle };
export const symbolPath = (regime, size = 64) => d3.symbol(SYMBOL[regime] || d3.symbolCircle, size)();

export const utcShort = d3.utcFormat('%b %d %H:%M');
export const utcTime = d3.utcFormat('%H:%M:%S');
export const utcFull = d3.utcFormat('%Y-%m-%d %H:%M:%S');
const tickFormat = date => (date.getUTCHours() === 0 && date.getUTCMinutes() === 0 ? d3.utcFormat('%b %d') : d3.utcFormat('%H:%M'))(date);

// ---------- Shared tooltip ----------

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
            const box = container.getBoundingClientRect();
            const w = tip.offsetWidth;
            const left = x + 14 + w > box.width ? x - 14 - w : x + 14;
            tip.style.left = `${Math.max(0, left)}px`;
            tip.style.top = `${Math.max(0, y - 10)}px`;
        },
        hide() { tip.hidden = true; },
    };
}

// ---------- Time series with crosshair ----------

/**
 * series: [{ key, label, color, values: [{ ms, v }] }] sharing one time grid.
 * bands: [{ from, to }] shaded intervals; refLines: [{ v, label }]; markers: [{ ms, label }].
 */
export function timeSeries(container, opts) {
    const { series, height = 230, yLabel, valueFormat = d => d.toFixed(1), unit = '', bands = [], bandLabel, refLines = [], markers = [] } = opts;
    container.replaceChildren();
    container.classList.add('chart');
    const width = Math.max(300, Math.floor(container.clientWidth));
    const multi = series.length > 1;
    const margin = { top: 26, right: multi ? 92 : 18, bottom: 30, left: 54 };
    const grid = series[0].values;
    const x = d3.scaleUtc().domain([grid[0].ms, grid[grid.length - 1].ms]).range([margin.left, width - margin.right]);
    const values = series.flatMap(s => s.values.map(p => p.v)).filter(Number.isFinite);
    const y = d3.scaleLinear().domain(opts.yDomain || d3.extent(values)).range([height - margin.bottom, margin.top]);
    if (!opts.yDomain) y.nice();

    const svg = d3.select(container).append('svg')
        .attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`)
        .attr('role', 'img').attr('aria-label', opts.ariaLabel).attr('tabindex', 0);

    svg.append('g').selectAll('rect').data(bands).join('rect').attr('class', 'band')
        .attr('x', d => x(d.from)).attr('width', d => Math.max(1, x(d.to) - x(d.from)))
        .attr('y', margin.top).attr('height', height - margin.top - margin.bottom);

    const yTicks = y.ticks(5);
    const axes = svg.append('g');
    axes.selectAll('.grid').data(yTicks).join('line').attr('class', 'grid')
        .attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y).attr('y2', y);
    axes.selectAll('.tick-y').data(yTicks).join('text').attr('class', 'tick')
        .attr('x', margin.left - 8).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d => d3.format(',')(d));
    axes.append('line').attr('class', 'baseline')
        .attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', height - margin.bottom).attr('y2', height - margin.bottom);
    const xTicks = x.ticks(Math.max(2, Math.floor((width - margin.left - margin.right) / 90)));
    axes.selectAll('.tick-x').data(xTicks).join('text').attr('class', 'tick')
        .attr('x', x).attr('y', height - margin.bottom + 18).attr('text-anchor', 'middle').text(tickFormat);
    if (yLabel) axes.append('text').attr('class', 'axis-label').attr('x', margin.left - 46).attr('y', 12).text(yLabel);

    for (const ref of refLines) {
        svg.append('line').attr('class', 'ref').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y(ref.v)).attr('y2', y(ref.v));
        svg.append('text').attr('class', 'ref-label').attr('x', width - margin.right - 4).attr('y', y(ref.v) - 5).attr('text-anchor', 'end').text(ref.label);
    }
    for (const marker of markers) {
        if (marker.ms < x.domain()[0] || marker.ms > x.domain()[1]) continue;
        svg.append('line').attr('class', 'marker').attr('x1', x(marker.ms)).attr('x2', x(marker.ms)).attr('y1', margin.top).attr('y2', height - margin.bottom);
        svg.append('text').attr('class', 'marker-label').attr('x', x(marker.ms) + 4).attr('y', margin.top + 10).text(marker.label);
    }

    const line = d3.line().defined(p => Number.isFinite(p.v)).x(p => x(p.ms)).y(p => y(p.v));
    svg.append('g').selectAll('path').data(series).join('path').attr('class', 'series-line')
        .attr('stroke', s => s.color).attr('d', s => line(s.values));

    if (multi) {
        const ends = series.map(s => {
            const last = [...s.values].reverse().find(p => Number.isFinite(p.v));
            return { s, y: y(last.v) };
        }).sort((a, b) => a.y - b.y);
        for (let i = 1; i < ends.length; i++) ends[i].y = Math.max(ends[i].y, ends[i - 1].y + 14);
        svg.append('g').selectAll('text').data(ends).join('text').attr('class', 'direct-label')
            .attr('x', width - margin.right + 6).attr('y', d => d.y + 4).text(d => d.s.label);
    }

    // Crosshair
    const hair = svg.append('g').attr('class', 'crosshair').style('display', 'none');
    hair.append('line').attr('y1', margin.top).attr('y2', height - margin.bottom);
    const dots = hair.selectAll('circle').data(series).join('circle').attr('r', 4).attr('fill', s => s.color);
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

    const now = svg.append('line').attr('class', 'now-line').attr('y1', margin.top).attr('y2', height - margin.bottom);
    return {
        setNow(ms) {
            const inside = ms >= x.domain()[0] && ms <= x.domain()[1];
            now.style('display', inside ? null : 'none').attr('x1', x(ms)).attr('x2', x(ms));
        },
    };
}

// ---------- Ground-track map ----------

export function createMap(svgElement, land, { onSelect }) {
    const width = 960, height = 480;
    const svg = d3.select(svgElement).attr('viewBox', `0 0 ${width} ${height}`);
    const projection = d3.geoEquirectangular().fitSize([width, height], { type: 'Sphere' });
    const path = d3.geoPath(projection);
    svg.append('path').attr('class', 'map-ocean').attr('d', path({ type: 'Sphere' }));
    svg.append('path').attr('class', 'map-graticule').attr('d', path(d3.geoGraticule10()));
    svg.append('path').attr('class', 'map-land').attr('d', path(land));
    const night = svg.append('path').attr('class', 'map-night');
    const footprint = svg.append('path').attr('class', 'map-footprint');
    const contact = svg.append('path').attr('class', 'map-contact');
    const pastTrack = svg.append('path').attr('class', 'map-track map-track--past');
    const futureTrack = svg.append('path').attr('class', 'map-track');
    const sun = svg.append('g').attr('class', 'map-sun');
    sun.append('circle').attr('r', 7);
    sun.append('circle').attr('r', 2.5).attr('class', 'map-sun__core');
    const station = svg.append('g').attr('class', 'map-station');
    station.append('path').attr('d', d3.symbol(d3.symbolTriangle, 90)());
    const stationLabel = station.append('text').attr('x', 9).attr('y', 14);
    const fleet = svg.append('g');
    const label = svg.append('text').attr('class', 'map-label');
    const tip = tooltip(svgElement.parentElement);
    const toScreen = (lon, lat) => {
        const [px, py] = projection([lon, lat]);
        const box = svgElement.getBoundingClientRect();
        return [px * box.width / width, py * box.height / height];
    };

    return {
        update({ sats, states, selected, track, now, sunPoint, stationInfo, footprintDeg, contactDeg }) {
            night.attr('d', path(d3.geoCircle().center([sunPoint.lon + 180, -sunPoint.lat]).radius(90)()));
            sun.attr('transform', `translate(${projection([sunPoint.lon, sunPoint.lat])})`);
            const selectedState = states.get(selected.norad);
            footprint.attr('d', selectedState ? path(d3.geoCircle().center([selectedState.lon, selectedState.lat]).radius(footprintDeg)()) : null)
                .attr('stroke', regimeColor(selected.regime)).attr('fill', regimeColor(selected.regime));
            contact.attr('d', path(d3.geoCircle().center([stationInfo.lon, stationInfo.lat]).radius(contactDeg)()));
            const split = track.findIndex(p => p.ms >= now);
            const past = track.slice(0, split + 1).map(p => [p.lon, p.lat]);
            const future = track.slice(Math.max(0, split)).map(p => [p.lon, p.lat]);
            pastTrack.attr('d', past.length > 1 ? path({ type: 'LineString', coordinates: past }) : null).attr('stroke', regimeColor(selected.regime));
            futureTrack.attr('d', future.length > 1 ? path({ type: 'LineString', coordinates: future }) : null).attr('stroke', regimeColor(selected.regime));
            station.attr('transform', `translate(${projection([stationInfo.lon, stationInfo.lat])})`);
            stationLabel.text(stationInfo.short);

            const visible = sats.filter(sat => states.get(sat.norad));
            fleet.selectAll('path').data(visible, sat => sat.norad).join(enter => enter.append('path')
                .attr('class', 'map-sat')
                .on('click', (event, sat) => onSelect(sat.norad))
                .on('pointerenter pointermove', (event, sat) => {
                    const s = states.get(sat.norad);
                    const [px, py] = toScreen(s.lon, s.lat);
                    tip.show(px, py, sat.name, [
                        { value: `${d3.format(',.0f')(s.altKm)} km`, label: 'altitude' },
                        { value: `${s.lat.toFixed(2)}°, ${s.lon.toFixed(2)}°`, label: 'lat, lon' },
                        { value: REGIME_LABEL[sat.regime], label: '' },
                    ]);
                })
                .on('pointerleave', () => tip.hide()))
                .attr('d', sat => symbolPath(sat.regime, sat.norad === selected.norad ? 150 : 64))
                .attr('fill', sat => regimeColor(sat.regime))
                .classed('is-selected', sat => sat.norad === selected.norad)
                .attr('transform', sat => { const s = states.get(sat.norad); return `translate(${projection([s.lon, s.lat])})`; })
                .sort(a => (a.norad === selected.norad ? 1 : -1));
            if (selectedState) {
                const [px, py] = projection([selectedState.lon, selectedState.lat]);
                const flip = px > width - 120;
                label.attr('x', px + (flip ? -12 : 12)).attr('y', py - 10).attr('text-anchor', flip ? 'end' : 'start').text(selected.name);
            }
        },
    };
}

// ---------- Polar sky plot ----------

export function skyPlot(svgElement, pass, current) {
    const size = 260, r = 104, c = size / 2;
    const svg = d3.select(svgElement).attr('viewBox', `0 0 ${size} ${size}`);
    svg.selectAll('*').remove();
    const radius = el => r * (90 - el) / 90;
    const point = (az, el) => [c + radius(el) * Math.sin(az * Math.PI / 180), c - radius(el) * Math.cos(az * Math.PI / 180)];
    for (const el of [0, 30, 60]) {
        svg.append('circle').attr('class', el === 0 ? 'sky-horizon' : 'grid').attr('cx', c).attr('cy', c).attr('r', radius(el)).attr('fill', 'none');
        if (el) svg.append('text').attr('class', 'tick').attr('x', c + 3).attr('y', c - radius(el) - 3).text(`${el}°`);
    }
    for (const az of [0, 90]) {
        const [x1, y1] = point(az, 0), [x2, y2] = point(az + 180, 0);
        svg.append('line').attr('class', 'grid').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
    }
    [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([text, az]) => {
        const [x, y] = point(az, -12);
        svg.append('text').attr('class', 'axis-label').attr('x', x).attr('y', y + 4).attr('text-anchor', 'middle').text(text);
    });
    if (!pass) {
        svg.append('text').attr('class', 'tick').attr('x', c).attr('y', c + 4).attr('text-anchor', 'middle').text('No pass in window');
        return;
    }
    const pts = pass.track.filter(p => p.elDeg >= 0).map(p => point(p.azDeg, p.elDeg));
    svg.append('path').attr('class', 'series-line').attr('stroke', 'var(--series-1)').attr('d', d3.line()(pts));
    const [ax, ay] = pts[0], [lx, ly] = pts[pts.length - 1];
    svg.append('circle').attr('class', 'sky-end').attr('cx', ax).attr('cy', ay).attr('r', 4);
    svg.append('text').attr('class', 'marker-label').attr('x', ax + 6).attr('y', ay - 6).text('AOS');
    svg.append('rect').attr('class', 'sky-end').attr('x', lx - 4).attr('y', ly - 4).attr('width', 8).attr('height', 8);
    svg.append('text').attr('class', 'marker-label').attr('x', lx + 6).attr('y', ly - 6).text('LOS');
    if (current && current.elDeg >= 0) {
        const [px, py] = point(current.azDeg, current.elDeg);
        svg.append('circle').attr('class', 'sky-now').attr('cx', px).attr('cy', py).attr('r', 6).attr('fill', 'var(--series-1)');
    }
}

// ---------- Orbit regime chart: inclination vs altitude (log) ----------

export function regimeChart(container, sats, { onSelect }) {
    container.replaceChildren();
    container.classList.add('chart');
    const width = Math.max(300, Math.floor(container.clientWidth)), height = 300;
    const margin = { top: 26, right: 18, bottom: 40, left: 64 };
    const x = d3.scaleLinear().domain([0, 105]).range([margin.left, width - margin.right]);
    const y = d3.scaleLog().domain([300, 250_000]).range([height - margin.bottom, margin.top]);
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`)
        .attr('role', 'img').attr('aria-label', 'Perigee to apogee altitude of each satellite against orbital inclination');
    const yTicks = [300, 1000, 3000, 10_000, 30_000, 100_000];
    svg.selectAll('.grid').data(yTicks).join('line').attr('class', 'grid').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y).attr('y2', y);
    svg.selectAll('.ty').data(yTicks).join('text').attr('class', 'tick').attr('x', margin.left - 8).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d3.format(','));
    svg.append('line').attr('class', 'baseline').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', height - margin.bottom).attr('y2', height - margin.bottom);
    const xTicks = [0, 15, 30, 45, 60, 75, 90, 105];
    svg.selectAll('.tx').data(xTicks).join('text').attr('class', 'tick').attr('x', x).attr('y', height - margin.bottom + 18).attr('text-anchor', 'middle').text(d => `${d}°`);
    svg.append('text').attr('class', 'axis-label').attr('x', (margin.left + width - margin.right) / 2).attr('y', height - 4).attr('text-anchor', 'middle').text('Inclination');
    svg.append('text').attr('class', 'axis-label').attr('x', 4).attr('y', 12).text('Altitude (km)');
    svg.append('line').attr('class', 'ref').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y(35786)).attr('y2', y(35786));
    svg.append('text').attr('class', 'ref-label').attr('x', width - margin.right - 4).attr('y', y(35786) - 5).attr('text-anchor', 'end').text('GEO 35,786 km');

    const tip = tooltip(container);
    const groups = svg.append('g').selectAll('g').data(sats, s => s.norad).join('g').attr('class', 'regime-mark')
        .on('click', (event, sat) => onSelect(sat.norad))
        .on('pointerenter', (event, sat) => {
            const e = sat.elements;
            tip.show(x(e.inclinationDeg), y(Math.max(300, e.perigeeKm)), sat.name, [
                { value: `${d3.format(',.0f')(e.perigeeKm)} – ${d3.format(',.0f')(e.apogeeKm)} km`, label: 'perigee – apogee' },
                { value: `${e.inclinationDeg.toFixed(2)}°`, label: 'inclination' },
                { value: `${d3.format(',.1f')(e.periodMin)} min`, label: 'period' },
            ]);
        })
        .on('pointerleave', () => tip.hide());
    groups.append('line').attr('class', 'regime-range')
        .attr('x1', s => x(s.elements.inclinationDeg)).attr('x2', s => x(s.elements.inclinationDeg))
        .attr('y1', s => y(Math.max(300, s.elements.perigeeKm))).attr('y2', s => y(Math.max(300, s.elements.apogeeKm)) - 0.01)
        .attr('stroke', s => regimeColor(s.regime));
    groups.append('rect').attr('class', 'hit').attr('x', s => x(s.elements.inclinationDeg) - 8).attr('width', 16)
        .attr('y', s => y(Math.max(300, s.elements.apogeeKm)) - 8).attr('height', s => y(Math.max(300, s.elements.perigeeKm)) - y(Math.max(300, s.elements.apogeeKm)) + 16);
    const now = groups.append('path').attr('class', 'map-sat').attr('fill', s => regimeColor(s.regime)).attr('d', s => symbolPath(s.regime, 56));
    const labels = svg.append('text').attr('class', 'map-label');
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
                const flip = px > width - 110;
                labels.attr('x', px + (flip ? -10 : 10)).attr('y', y(Math.max(300, st ? st.altKm : sel.elements.perigeeKm)) - 8)
                    .attr('text-anchor', flip ? 'end' : 'start').text(sel.name);
            }
        },
    };
}
