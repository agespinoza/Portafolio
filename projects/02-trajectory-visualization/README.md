# Satellite Operations Console

A browser console that tracks 16 NASA and partner satellites from public orbital data. It answers the questions a mission operations team asks every shift: where each spacecraft is, when the next ground-station contact starts, whether the spacecraft is in sunlight, and how far the orbit model can be trusted.

## Career context

At the University of Arizona Space Institute, I used Java and Python to automate mission operations and support flight-rule checking. This console applies the same workflow to public data. It validates the inputs, propagates orbits with a standard model, schedules contacts, and checks the model against an independent reference.

## What it shows

| View | What it answers |
| --- | --- |
| Ground track | Positions of the whole fleet, the selected satellite's past and future track, its coverage footprint, the ground station's contact circle, and the day-night terminator. |
| Telemetry | Sub-satellite point, altitude, speed, illumination, look angles and range rate from the station, mean orbital elements, J2 nodal drift, the TEME state vector, and the element-set age. |
| Altitude and illumination | Altitude over the next two orbits, with periods in Earth's shadow shaded. These periods matter for power and thermal planning. |
| Ground station contacts | Elevation from the chosen station over 24 or 72 hours, the elevation mask, and the contact windows. |
| Pass schedule | AOS, TCA and LOS times, duration, maximum elevation and azimuths for each pass, plus a polar sky plot of the selected pass. |
| Fleet status | Live state of every satellite, its orbit regime, its next contact, and how old its elements are. |
| Orbit regimes | Perigee-to-apogee range against inclination, covering LEO, sun-synchronous, geostationary and highly elliptical orbits. |
| SGP4 vs NASA | Radial, in-track and cross-track error of SGP4 against NASA's own ISS ephemeris. |

The time controls run the console live, accelerate it up to 900×, or move it from 12 hours back to 24 hours ahead. Seven ground stations are available, including Tucson, NASA Goddard, White Sands, Svalbard and McMurdo. The pass prediction uses a selectable elevation mask.

## Data

| Source | Use |
| --- | --- |
| [CelesTrak GP catalog](https://celestrak.org/NORAD/elements/), built from U.S. Space Force tracking | Two-line element sets for propagation |
| [NASA JSC ISS trajectory data](https://nasa-public-data.s3.amazonaws.com/iss-coords/current/ISS_OEM/ISS.OEM_J2K_EPH.txt) (CCSDS OEM, EME2000) | Reference ephemeris for validation |
| [Natural Earth 1:110m](https://github.com/topojson/world-atlas) | Coastlines |

[`fetch_data.py`](fetch_data.py) is the data pipeline. It downloads each element set and checks the TLE checksums, catalog numbers and element ranges. It parses the NASA OEM file, keeps 72 hours of state vectors, and checks that each one is plausible. It then writes [`data/elements.json`](data/elements.json) and [`data/iss_oem.json`](data/iss_oem.json). A [GitHub Actions workflow](../../.github/workflows/refresh-orbit-data.yml) runs it every day at 06:17 UTC and commits the new snapshot. If any validation check fails, the workflow stops and keeps the previous snapshot.

The page loads that snapshot first. If the snapshot is more than a day old, the page downloads current element sets from CelesTrak one at a time and caches them for two hours, as CelesTrak requests. If CelesTrak is unavailable, the page keeps the snapshot.

## Models and accuracy

- **Propagation:** SGP4/SDP4 through [satellite.js](https://github.com/shashwatak/satellite-js) 5.0.
- **Sun and eclipse:** low-precision solar ephemeris (about 0.01°) and a cylindrical umbra model.
- **Passes:** coarse search every 10–30 seconds, then bisection to 1 second for AOS and LOS. Elevation is geometric, without refraction.
- **Validation:** NASA's EME2000 vectors are rotated to the mean equator of date with IAU-1976 precession. Nutation is neglected, which adds less than 0.7 km of error.

With the November 2026 snapshot, SGP4 matches NASA's ephemeris to 0.54 km RMS within six hours of the element epoch. The error grows to about 8 km after 2.3 days, mostly in-track. This is the expected behavior of SGP4's simplified drag model, and it is why the console flags element sets older than three days.

The console is for education and portfolio use, not for operational decisions.

## Run the demo

From the repository root, run `python3 -m http.server 8000` and visit `http://localhost:8000/projects/02-trajectory-visualization/`. To refresh the bundled data, run `python3 fetch_data.py` from this directory. It needs Python 3.9 or later and uses only the standard library.
