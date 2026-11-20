"""Resource model: geological domains, variography, block kriging and classification."""

from __future__ import annotations

import math
from typing import Dict, List

from . import deposit as dp
from .geostats import (SearchIndex, SphericalModel, block_covariance, cross_validate, experimental_downhole,
                       experimental_horizontal, fit_spherical, inverse_distance, iter_offsets, ordinary_kriging)
from .linalg import mean, pearson, slope, variance

MAX_SAMPLES = 16
MAX_PER_HOLE = 4
MIN_SAMPLES = 4

# Classification thresholds (slope of regression and drillhole support)
MEASURED_SOR, MEASURED_HOLES, MEASURED_DISTANCE = 0.90, 3, 60.0
INDICATED_SOR, INDICATED_DISTANCE = 0.60, 120.0
CLASSES = ("measured", "indicated", "inferred", "unclassified")


def idx(i: int, j: int, k: int) -> int:
    return (k * dp.NY + j) * dp.NX + i


def block_centre(i: int, j: int, k: int):
    return dp.X0 + (i + 0.5) * dp.DX, dp.Y0 + (j + 0.5) * dp.DY, dp.bench_centre(k)


CAP_PERCENTILE = 0.99


def cap_grades(comps: List[dict]) -> Dict[int, dict]:
    """Top-cuts composite grades per domain at the 99th percentile, so a few high-grade
    outliers cannot spread metal into large volumes. The original grade is kept as ``cu_raw``."""
    report = {}
    for d in (0, 1, 2):
        rows = [c for c in comps if c["domain"] == d]
        values = sorted(c["cu"] for c in rows)
        cap = values[min(len(values) - 1, int(CAP_PERCENTILE * len(values)))]
        before = sum(c["cu"] * c["length"] for c in rows)
        n = 0
        for c in rows:
            c["cu_raw"] = c["cu"]
            if c["cu"] > cap:
                c["cu"] = cap
                n += 1
        after = sum(c["cu"] * c["length"] for c in rows)
        report[d] = {"cap": cap, "capped": n, "metalRemoved": 1 - after / before}
    return report


def variography(comps: List[dict]) -> Dict[int, dict]:
    """Experimental variograms and fitted models per domain. The hypogene domain is fitted first:
    when a thin domain has too few downhole lags, its vertical range is not fitted but assumed
    from the hypogene anisotropy ratio, and flagged as such."""
    out = {}
    for d in (2, 1, 0):
        samples = [(c["x"], c["y"], c["z"], c["cu"], c["hole"]) for c in comps if c["domain"] == d]
        values = [s[3] for s in samples]
        var = variance(values)
        horiz = experimental_horizontal(samples, lag=30.0, n_lags=14, dz_tol=7.5)
        down = experimental_downhole(samples, lag=15.0, n_lags=10)
        model = fit_spherical(horiz, down, var)
        assumed = len(down) < 4
        if assumed:
            ratio = out[2]["model"].range_v / out[2]["model"].range_h
            model = SphericalModel(model.nugget, model.sill, model.range_h, round(model.range_h * ratio / 5) * 5)
        out[d] = {"samples": samples, "variance": var, "horizontal": horiz, "downhole": down, "model": model,
                  "verticalAssumed": assumed, "mean": mean(values), "n": len(samples), "holes": len({s[4] for s in samples})}
    return dict(sorted(out.items()))


def build_block_model(deposit: dp.Deposit, comps: List[dict], assays: List[dict], holes: List[dp.Hole], vario: Dict[int, dict]):
    """Estimates every block below topography. Returns a list of block dicts indexed by ``idx``."""
    bol_pts, bos_pts = dp.contact_depths(assays, holes)
    offsets = iter_offsets(dp.DX, dp.DY, dp.DZ, (2, 2, 2))
    true_offsets = iter_offsets(dp.DX, dp.DY, dp.DZ, (3, 3, 2))
    indexes = {d: SearchIndex(v["samples"]) for d, v in vario.items()}
    cvv = {d: block_covariance(v["model"], offsets) for d, v in vario.items()}

    # Modelled contact surfaces per column (inverse distance from the logged intercepts)
    surfaces = {}
    for j in range(dp.NY):
        for i in range(dp.NX):
            x, y, _ = block_centre(i, j, 0)
            surfaces[(i, j)] = (inverse_distance(bol_pts, x, y, 0.0), inverse_distance(bos_pts, x, y, 0.0), dp.Deposit.topography(x, y))

    blocks = []
    for k in range(dp.NZ):
        for j in range(dp.NY):
            for i in range(dp.NX):
                x, y, z = block_centre(i, j, k)
                bol, bos, topo = surfaces[(i, j)]
                fraction = min(1.0, max(0.0, (topo - dp.bench_floor(k)) / dp.DZ))
                b = {"i": i, "j": j, "k": k, "x": x, "y": y, "z": z, "fraction": fraction}
                if fraction <= 0.0:
                    b.update(domain=-1, tonnes=0.0, cu=0.0, true_cu=0.0, cls=3, ox=0.0)
                    blocks.append(b)
                    continue
                depth = topo - z
                domain = 0 if depth < bol else (1 if depth < bos else 2)
                b["domain"] = domain
                b["tonnes"] = dp.DX * dp.DY * dp.DZ * fraction * dp.DENSITY[domain]
                # true block grade: average of the true field over a 3x3x2 discretisation
                pts = [(x + o[0], y + o[1], z + o[2]) for o in true_offsets]
                pts = [p for p in pts if p[2] <= topo] or [(x, y, z)]
                b["true_cu"] = mean([deposit.cu(*p) for p in pts])
                b["true_ox"] = mean([deposit.oxide_ratio(*p) for p in pts])
                model = vario[domain]["model"]
                est = None
                for pass_no, radius in ((1, model.range_h), (2, 2.0 * model.range_h)):
                    nb = indexes[domain].neighbours(x, y, z, model, radius, MAX_SAMPLES, MAX_PER_HOLE)
                    if len(nb) >= MIN_SAMPLES and len({s[4] for s in nb}) >= 2:
                        targets = [(x + o[0], y + o[1], z + o[2]) for o in offsets]
                        est = ordinary_kriging(nb, targets, model, cvv[domain])
                        break
                if est is None:
                    b.update(cu=0.0, cls=3, kv=None, sor=None, n=0, holes=0, pass_no=0)
                else:
                    if (pass_no == 1 and est.slope >= MEASURED_SOR and est.n_holes >= MEASURED_HOLES
                            and est.mean_distance <= MEASURED_DISTANCE):
                        cls = 0
                    elif pass_no == 1 and est.slope >= INDICATED_SOR and est.mean_distance <= INDICATED_DISTANCE:
                        cls = 1
                    else:
                        cls = 2
                    b.update(cu=max(0.002, est.estimate), cls=cls, kv=est.variance, sor=est.slope, dist=est.mean_distance,
                             n=est.n_samples, holes=est.n_holes, pass_no=pass_no)
                # oxide ratio estimated by inverse distance from nearby composites of the domain
                blocks.append(b)
    _estimate_oxide(blocks, comps)
    return blocks, surfaces


def _estimate_oxide(blocks: List[dict], comps: List[dict]) -> None:
    by_domain: Dict[int, list] = {0: [], 1: [], 2: []}
    for c in comps:
        by_domain[c["domain"]].append((c["x"], c["y"], c["z"], c["ascu"] / max(c["cu"], 1e-4), c["hole"]))
    model = SphericalModel(0.0, 1.0, 150.0, 60.0)
    indexes = {d: SearchIndex(v) for d, v in by_domain.items()}
    for b in blocks:
        if b["domain"] < 0:
            continue
        nb = indexes[b["domain"]].neighbours(b["x"], b["y"], b["z"], model, 300.0, 8, 3)
        b["ox"] = inverse_distance(nb, b["x"], b["y"], b["z"]) if nb else (0.55, 0.10, 0.03)[b["domain"]]


def validation(blocks: List[dict], comps: List[dict], vario: Dict[int, dict]) -> dict:
    """Global and local checks of the estimate: cross-validation, swath plots, smoothing."""
    out = {"crossValidation": {}, "swath": {}}
    for d, v in vario.items():
        pairs = cross_validate(v["samples"], v["model"], v["model"].range_h * 1.5)
        actual = [p[0] for p in pairs]
        est = [p[1] for p in pairs]
        errors = [e - a for a, e in zip(actual, est)]
        out["crossValidation"][dp.DOMAINS[d]] = {
            "n": len(pairs),
            "meanError": mean(errors),
            "relativeBias": mean(errors) / mean(actual),
            "mae": mean([abs(e) for e in errors]),
            "rmse": math.sqrt(mean([e * e for e in errors])),
            "correlation": pearson(actual, est),
            "slope": slope(est, actual),          # regression of true on estimate (1 = conditionally unbiased)
        }
    # swath plots along easting and northing for the estimated hypogene + supergene blocks
    est_blocks = [b for b in blocks if b["domain"] in (1, 2) and b.get("pass_no")]
    for axis, key, origin, size, count in (("easting", "x", dp.X0, 40.0, 20), ("northing", "y", dp.Y0, 40.0, 20), ("elevation", "z", None, dp.DZ, dp.NZ)):
        rows = []
        for s in range(count):
            if axis == "elevation":
                lo, hi = dp.bench_floor(s), dp.bench_floor(s) + dp.DZ
            else:
                lo, hi = origin + s * size, origin + (s + 1) * size
            bs = [b for b in est_blocks if lo <= b[key] < hi]
            cs = [c for c in comps if c["domain"] in (1, 2) and lo <= c[key] < hi]
            if len(bs) < 5 or len(cs) < 5:
                continue
            tw = sum(b["tonnes"] for b in bs)
            rows.append({
                "centre": (lo + hi) / 2,
                "model": sum(b["cu"] * b["tonnes"] for b in bs) / tw,
                "truth": sum(b["true_cu"] * b["tonnes"] for b in bs) / tw,
                "composites": mean([c["cu"] for c in cs]),
                "nComposites": len(cs),
            })
        out["swath"][axis] = rows
    return out
