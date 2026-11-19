// Orbital mechanics helpers. SGP4 propagation comes from satellite.js; the rest
// (sun geometry, eclipse, passes, frame conversion, residuals) is implemented here.
import * as satellite from 'https://cdn.jsdelivr.net/npm/satellite.js@5.0.0/+esm';

export const MU = 398600.4418;      // km^3/s^2, Earth gravitational parameter (WGS-84)
export const RE = 6378.137;         // km, Earth equatorial radius (WGS-84)
const DEG = Math.PI / 180;
const ARCSEC = DEG / 3600;
const MINUTE = 60_000;

export const regimeOf = ({ perigeeKm, apogeeKm, periodMin, eccentricity }) =>
    Math.abs(periodMin - 1436.1) < 30 && eccentricity < 0.01 ? 'GEO'
        : eccentricity > 0.25 ? 'HEO'
            : apogeeKm < 2000 && perigeeKm > 0 ? 'LEO' : 'MEO';

/** Build a satellite record from a TLE and derive its mean orbital elements. */
export function makeSatellite(meta) {
    const satrec = satellite.twoline2satrec(meta.line1, meta.line2);
    if (satrec.error) throw new Error(`${meta.name}: SGP4 initialisation error ${satrec.error}`);
    const n = satrec.no / 60;                                  // rad/s
    const a = Math.cbrt(MU / (n * n));
    const e = satrec.ecco;
    const elements = {
        semiMajorKm: a,
        eccentricity: e,
        inclinationDeg: satrec.inclo / DEG,
        raanDeg: satrec.nodeo / DEG,
        argPerigeeDeg: satrec.argpo / DEG,
        meanAnomalyDeg: satrec.mo / DEG,
        periodMin: (2 * Math.PI / satrec.no),
        perigeeKm: a * (1 - e) - RE,
        apogeeKm: a * (1 + e) - RE,
        bstar: satrec.bstar,
        epoch: new Date((satrec.jdsatepoch - 2440587.5) * 86_400_000),
    };
    // Sun-synchronous: J2 nodal regression matches the Sun's mean motion (0.9856 deg/day).
    const J2 = 1.08262668e-3;
    const nodalRate = -1.5 * n * J2 * (RE / a) ** 2 * Math.cos(satrec.inclo) / (1 - e * e) ** 2 / DEG * 86400;
    elements.nodalRateDegDay = nodalRate;
    elements.sunSynchronous = Math.abs(nodalRate - 0.9856) < 0.05;
    return { ...meta, satrec, elements, regime: regimeOf(elements) };
}

/** Propagate to a Date. Returns TEME position/velocity plus geodetic sub-point. */
export function stateAt(sat, date) {
    const pv = satellite.propagate(sat.satrec, date);
    if (!pv || !pv.position || sat.satrec.error) return null;
    const gmst = satellite.gstime(date);
    const geo = satellite.eciToGeodetic(pv.position, gmst);
    const { x, y, z } = pv.position;
    const v = pv.velocity;
    return {
        date, gmst, position: pv.position, velocity: v,
        lat: geo.latitude / DEG,
        lon: wrapLon(geo.longitude / DEG),
        altKm: geo.height,
        radiusKm: Math.hypot(x, y, z),
        speedKms: Math.hypot(v.x, v.y, v.z),
    };
}

export const wrapLon = lon => ((lon + 540) % 360) - 180;

/** Low-precision solar position (Astronomical Almanac), accurate to ~0.01 deg. */
export function sunAt(date) {
    const n = date.getTime() / 86_400_000 + 2440587.5 - 2451545.0;
    const L = (280.460 + 0.9856474 * n) * DEG;
    const g = (357.528 + 0.9856003 * n) * DEG;
    const lambda = L + (1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DEG;
    const epsilon = (23.439 - 0.0000004 * n) * DEG;
    const unit = { x: Math.cos(lambda), y: Math.cos(epsilon) * Math.sin(lambda), z: Math.sin(epsilon) * Math.sin(lambda) };
    const ra = Math.atan2(unit.y, unit.x);
    const dec = Math.asin(unit.z);
    const gmst = satellite.gstime(date);
    return { unit, lat: dec / DEG, lon: wrapLon((ra - gmst) / DEG) };
}

/** Cylindrical Earth-shadow model: true when the satellite is in umbra. */
export function inEclipse(position, sun) {
    const along = position.x * sun.unit.x + position.y * sun.unit.y + position.z * sun.unit.z;
    if (along > 0) return false;
    const perp = Math.hypot(position.x - along * sun.unit.x, position.y - along * sun.unit.y, position.z - along * sun.unit.z);
    return perp < RE;
}

/** Earth-central half-angle (deg) of the region that sees the satellite above minElevation. */
export function footprintRadiusDeg(altKm, minElevationDeg = 0) {
    const el = minElevationDeg * DEG;
    return (Math.acos(RE * Math.cos(el) / (RE + altKm)) - el) / DEG;
}

export function lookAngles(station, state) {
    const observer = { latitude: station.lat * DEG, longitude: station.lon * DEG, height: station.altKm };
    const ecf = satellite.eciToEcf(state.position, state.gmst);
    const look = satellite.ecfToLookAngles(observer, ecf);
    return { azDeg: (look.azimuth / DEG + 360) % 360, elDeg: look.elevation / DEG, rangeKm: look.rangeSat };
}

/** Elevation, range and range-rate of a satellite from a station at a Date. */
export function observe(sat, station, date) {
    const state = stateAt(sat, date);
    if (!state) return null;
    const look = lookAngles(station, state);
    const later = stateAt(sat, new Date(date.getTime() + 1000));
    const rangeRate = later ? lookAngles(station, later).rangeKm - look.rangeKm : NaN;
    return { ...look, rangeRateKms: rangeRate, state };
}

function elevation(sat, station, ms) {
    const state = stateAt(sat, new Date(ms));
    return state ? lookAngles(station, state).elDeg : -90;
}

function bisect(sat, station, lo, hi, mask) {
    const below = elevation(sat, station, lo) < mask;
    while (hi - lo > 1000) {
        const mid = (lo + hi) / 2;
        if ((elevation(sat, station, mid) < mask) === below) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
}

/**
 * Predict passes above an elevation mask. Coarse search with a step that scales
 * with the orbit period, then bisection to 1 s for AOS/LOS and a refined TCA.
 */
export function predictPasses(sat, station, start, hours = 24, mask = 10) {
    const startMs = start.getTime();
    const endMs = startMs + hours * 3_600_000;
    const step = Math.min(30_000, Math.max(10_000, sat.elements.periodMin * MINUTE / 300));
    const passes = [];
    let prevMs = startMs;
    let prevEl = elevation(sat, station, startMs);
    let aos = prevEl >= mask ? startMs : null;
    for (let ms = startMs + step; ms <= endMs + step; ms += step) {
        const t = Math.min(ms, endMs);
        const el = elevation(sat, station, t);
        if (prevEl < mask && el >= mask) aos = bisect(sat, station, prevMs, t, mask);
        if (aos !== null && ((prevEl >= mask && el < mask) || t === endMs)) {
            const los = el < mask ? bisect(sat, station, prevMs, t, mask) : endMs;
            passes.push(describePass(sat, station, aos, los, aos === startMs && prevEl >= mask, el >= mask));
            aos = null;
        }
        prevMs = t; prevEl = el;
        if (t === endMs) break;
    }
    return passes;
}

function describePass(sat, station, aos, los, startsVisible, endsVisible) {
    const samples = 120;
    let best = { el: -90, ms: aos };
    const track = [];
    for (let i = 0; i <= samples; i++) {
        const ms = aos + (los - aos) * i / samples;
        const look = lookAngles(station, stateAt(sat, new Date(ms)));
        track.push({ ms, ...look });
        if (look.elDeg > best.el) best = { el: look.elDeg, ms };
    }
    const aosLook = track[0];
    const losLook = track[track.length - 1];
    return {
        aos: new Date(aos), los: new Date(los), tca: new Date(best.ms), maxElDeg: best.el,
        durationMin: (los - aos) / MINUTE, aosAzDeg: aosLook.azDeg, losAzDeg: losLook.azDeg,
        startsVisible, endsVisible, track,
    };
}

/** Ground track samples over [start, end], used for both the map and the altitude profile. */
export function sampleTrack(sat, startMs, endMs, count) {
    const points = [];
    for (let i = 0; i <= count; i++) {
        const ms = startMs + (endMs - startMs) * i / count;
        const state = stateAt(sat, new Date(ms));
        if (state) points.push({ ms, ...state, eclipse: inEclipse(state.position, sunAt(state.date)) });
    }
    return points;
}

// ---- Frame conversion for validating SGP4 against NASA's EME2000 ephemeris ----

/** IAU-1976 precession matrix from J2000 (EME2000) to mean equator and equinox of date. */
export function precessionMatrix(date) {
    const T = (date.getTime() / 86_400_000 + 2440587.5 - 2451545.0) / 36525;
    const zeta = (2306.2181 * T + 0.30188 * T * T + 0.017998 * T ** 3) * ARCSEC;
    const z = (2306.2181 * T + 1.09468 * T * T + 0.018203 * T ** 3) * ARCSEC;
    const theta = (2004.3109 * T - 0.42665 * T * T - 0.041833 * T ** 3) * ARCSEC;
    const [cz, sz, ct, st, cZ, sZ] = [Math.cos(zeta), Math.sin(zeta), Math.cos(theta), Math.sin(theta), Math.cos(z), Math.sin(z)];
    return [
        [cz * ct * cZ - sz * sZ, -sz * ct * cZ - cz * sZ, -st * cZ],
        [cz * ct * sZ + sz * cZ, -sz * ct * sZ + cz * cZ, -st * sZ],
        [cz * st, -sz * st, ct],
    ];
}

const apply = (m, v) => ({
    x: m[0][0] * v.x + m[0][1] * v.y + m[0][2] * v.z,
    y: m[1][0] * v.x + m[1][1] * v.y + m[1][2] * v.z,
    z: m[2][0] * v.x + m[2][1] * v.y + m[2][2] * v.z,
});
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const unit = a => { const n = Math.hypot(a.x, a.y, a.z); return { x: a.x / n, y: a.y / n, z: a.z / n }; };

/**
 * Compare SGP4 (TEME) with NASA's OEM (EME2000) in the OEM's radial / in-track /
 * cross-track frame. EME2000 is precessed to the mean equator of date; nutation
 * (< 20 arcsec, under 0.7 km at ISS radius) is neglected and stated in the UI.
 */
export function compareWithOem(sat, oem) {
    return oem.records.map(([time, x, y, z, vx, vy, vz]) => {
        const date = new Date(time);
        const P = precessionMatrix(date);
        const r = apply(P, { x, y, z });
        const v = apply(P, { x: vx, y: vy, z: vz });
        const state = stateAt(sat, date);
        if (!state) return null;
        const d = sub(state.position, r);
        const R = unit(r);
        const C = unit(cross(r, v));
        const I = cross(C, R);
        return { ms: date.getTime(), radial: dot(d, R), inTrack: dot(d, I), crossTrack: dot(d, C), total: Math.hypot(d.x, d.y, d.z) };
    }).filter(Boolean);
}
