const chart = document.querySelector('#chart');
const picker = document.querySelector('#point');
const details = document.querySelector('#details');

function draw(tag, attributes, label = '') {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    element.textContent = label;
    chart.append(element);
    return element;
}

try {
    const response = await fetch('../01-trajectory-etl/clean_trajectory.csv');
    if (!response.ok) throw new Error('Could not load the ETL output.');
    const rows = (await response.text()).trim().split(/\r?\n/).slice(1);
    const points = rows.map(row => {
        const [timestamp, x, y] = row.split(',');
        return { timestamp, x: Number(x), y: Number(y) };
    });
    if (!points.length) throw new Error('The ETL output has no points.');
    const minX = Math.min(...points.map(point => point.x));
    const maxX = Math.max(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxY = Math.max(...points.map(point => point.y));
    const x = value => 78 + (value - minX) * 512 / (maxX - minX || 1);
    const y = value => 260 - (value - minY) * 222 / (maxY - minY || 1);
    for (let tick = 0; tick <= 4; tick++) {
        const ratio = tick / 4;
        const xTick = 78 + ratio * 512;
        const yTick = 260 - ratio * 222;
        draw('path', { d: `M 78 ${yTick} H 590 M ${xTick} 38 V 260`, stroke: '#dbe5ef' });
        draw('text', { x: xTick, y: 282, 'text-anchor': 'middle' }, (minX + ratio * (maxX - minX)).toFixed(0));
        draw('text', { x: 67, y: yTick + 4, 'text-anchor': 'end' }, (minY + ratio * (maxY - minY)).toFixed(0));
    }
    draw('text', { x: 334, y: 309, 'text-anchor': 'middle' }, 'X position (km)');
    draw('text', { x: 14, y: 22 }, 'Y (km)');
    draw('polyline', { points: points.map(point => `${x(point.x)},${y(point.y)}`).join(' '),
        fill: 'none', stroke: '#155e75', 'stroke-width': 2 });
    const markers = points.map((point, index) => {
        picker.add(new Option(point.timestamp, index));
        const marker = draw('circle', { cx: x(point.x), cy: y(point.y), r: 7, tabindex: 0,
            role: 'img', 'aria-label': `${point.timestamp}, ${point.x}, ${point.y} kilometers` });
        marker.addEventListener('focus', () => select(index));
        marker.addEventListener('click', () => select(index));
        marker.addEventListener('pointerenter', () => select(index));
        return marker;
    });
    function select(index) {
        const point = points[index];
        picker.value = index;
        markers.forEach((marker, offset) => marker.classList.toggle('active', offset === index));
        details.textContent = `${point.timestamp} | X ${point.x} km | Y ${point.y} km`;
    }
    picker.addEventListener('change', () => select(Number(picker.value)));
    picker.disabled = false;
    select(0);
} catch (error) {
    details.textContent = error.message;
}
