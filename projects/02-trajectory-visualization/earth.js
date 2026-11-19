// Builds the dot-matrix Earth used by both the 2D map and the 3D globe texture.
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

/** Rasterize land once; returns a fast land/sea lookup by longitude and latitude. */
export function landMask(land, width = 2160, height = 1080) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const projection = d3.geoEquirectangular().fitSize([width, height], { type: 'Sphere' });
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    d3.geoPath(projection, ctx)(land);
    ctx.fill();
    const pixels = ctx.getImageData(0, 0, width, height).data;
    return (lon, lat) => {
        const x = Math.min(width - 1, Math.max(0, Math.floor((lon + 180) / 360 * width)));
        const y = Math.min(height - 1, Math.max(0, Math.floor((90 - lat) / 180 * height)));
        return pixels[(y * width + x) * 4] > 127;
    };
}

/** Land dots on a regular grid, or an equal-area-ish one where longitude spacing widens with 1/cos(latitude). */
export function landDots(isLand, step = 2, equalArea = true) {
    const dots = [];
    for (let lat = -90 + step / 2; lat < 90; lat += step) {
        const lonStep = equalArea ? step / Math.max(0.2, Math.cos(lat * Math.PI / 180)) : step;
        for (let lon = -180 + lonStep / 2; lon < 180; lon += lonStep) {
            if (isLand(lon, lat)) dots.push([lon, lat]);
        }
    }
    return dots;
}

/** Equirectangular texture for the globe: deep ocean, luminous land dots, faint graticule. */
export function globeTexture(isLand, width = 4096, height = 2048) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const ocean = ctx.createLinearGradient(0, 0, 0, height);
    ocean.addColorStop(0, '#0c1a33');
    ocean.addColorStop(0.5, '#0f2340');
    ocean.addColorStop(1, '#0c1a33');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, width, height);
    const x = lon => (lon + 180) / 360 * width;
    const y = lat => (90 - lat) / 180 * height;
    ctx.strokeStyle = 'rgba(131, 144, 165, 0.16)';
    ctx.lineWidth = 2;
    for (let lon = -180; lon <= 180; lon += 15) { ctx.beginPath(); ctx.moveTo(x(lon), 0); ctx.lineTo(x(lon), height); ctx.stroke(); }
    for (let lat = -75; lat <= 75; lat += 15) { ctx.beginPath(); ctx.moveTo(0, y(lat)); ctx.lineTo(width, y(lat)); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(131, 144, 165, 0.32)';
    ctx.beginPath(); ctx.moveTo(0, y(0)); ctx.lineTo(width, y(0)); ctx.stroke();
    const step = 0.8;
    for (let lat = -90 + step / 2; lat < 90; lat += step) {
        const stretch = 1 / Math.max(0.08, Math.cos(lat * Math.PI / 180));
        const lonStep = step * stretch;
        for (let lon = -180 + lonStep / 2; lon < 180; lon += lonStep) {
            if (!isLand(lon, lat)) continue;
            // Dots are stretched horizontally near the poles so they look round on the sphere.
            const shade = 0.62 + 0.38 * Math.cos(lat * Math.PI / 180);
            ctx.fillStyle = `rgba(${Math.round(120 * shade + 40)}, ${Math.round(190 * shade + 30)}, ${Math.round(205 * shade + 30)}, 0.92)`;
            ctx.beginPath();
            ctx.ellipse(x(lon), y(lat), Math.min(60, 3.1 * stretch), 3.1, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    return canvas;
}
