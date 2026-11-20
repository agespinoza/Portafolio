"""Geostatistics: experimental variograms, spherical model fitting and ordinary block kriging.

Conventions
-----------
* A sample is a tuple ``(x, y, z, value, hole_index)`` in mine-grid metres.
* Anisotropy is geometric: horizontal range ``range_h`` and vertical range
  ``range_v``. Distances are scaled so the model is isotropic in the scaled space.
* The kriging system is ``C w + mu 1 = c``, ``sum(w) = 1``. With this sign
  convention the kriging variance is ``Cvv - w.c - mu``. The slope of regression
  uses the industry formula ``(BV - KV + |mu|) / (BV - KV + 2|mu|)``.
"""

from __future__ import annotations

import math
from collections import defaultdict
from dataclasses import dataclass, asdict
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from .linalg import solve

Sample = Tuple[float, float, float, float, int]


@dataclass(frozen=True)
class SphericalModel:
    nugget: float
    sill: float          # partial sill of the spherical structure
    range_h: float       # metres
    range_v: float       # metres

    @property
    def total_sill(self) -> float:
        return self.nugget + self.sill

    def gamma_scaled(self, h: float) -> float:
        """Variogram at a distance already scaled to the horizontal range."""
        if h <= 1e-9:
            return 0.0
        if h >= self.range_h:
            return self.nugget + self.sill
        r = h / self.range_h
        return self.nugget + self.sill * (1.5 * r - 0.5 * r ** 3)

    def scaled_distance(self, dx: float, dy: float, dz: float) -> float:
        k = self.range_h / self.range_v
        return math.sqrt(dx * dx + dy * dy + (dz * k) ** 2)

    def gamma(self, dx: float, dy: float, dz: float) -> float:
        return self.gamma_scaled(self.scaled_distance(dx, dy, dz))

    def cov(self, dx: float, dy: float, dz: float) -> float:
        h = self.scaled_distance(dx, dy, dz)
        if h <= 1e-9:
            return self.total_sill
        return self.total_sill - self.gamma_scaled(h)

    def to_dict(self) -> Dict[str, float]:
        return {k: round(v, 5) for k, v in asdict(self).items()}


# ---------------------------------------------------------------------------
# Experimental variograms
# ---------------------------------------------------------------------------

def experimental_horizontal(samples: Sequence[Sample], lag: float, n_lags: int, dz_tol: float) -> List[dict]:
    """Omnidirectional horizontal variogram from pairs on the same bench (|dz| <= dz_tol)."""
    sums = [0.0] * n_lags
    dist = [0.0] * n_lags
    counts = [0] * n_lags
    pts = list(samples)
    for i in range(len(pts)):
        xi, yi, zi, vi, hi = pts[i]
        for j in range(i + 1, len(pts)):
            xj, yj, zj, vj, hj = pts[j]
            if hi == hj or abs(zi - zj) > dz_tol:
                continue
            h = math.hypot(xi - xj, yi - yj)
            k = int(h / lag + 0.5) - 1          # lag centres at lag, 2*lag, ...
            if 0 <= k < n_lags:
                d = vi - vj
                sums[k] += 0.5 * d * d
                dist[k] += h
                counts[k] += 1
    return [{"h": dist[k] / counts[k], "gamma": sums[k] / counts[k], "pairs": counts[k]}
            for k in range(n_lags) if counts[k] >= 30]


def experimental_downhole(samples: Sequence[Sample], lag: float, n_lags: int) -> List[dict]:
    """Down-the-hole variogram: pairs within the same drillhole, binned by vertical separation."""
    by_hole: Dict[int, List[Sample]] = defaultdict(list)
    for s in samples:
        by_hole[s[4]].append(s)
    sums = [0.0] * n_lags
    dist = [0.0] * n_lags
    counts = [0] * n_lags
    for pts in by_hole.values():
        for i in range(len(pts)):
            for j in range(i + 1, len(pts)):
                h = abs(pts[i][2] - pts[j][2])
                k = int(h / lag + 0.5) - 1
                if 0 <= k < n_lags:
                    d = pts[i][3] - pts[j][3]
                    sums[k] += 0.5 * d * d
                    dist[k] += h
                    counts[k] += 1
    return [{"h": dist[k] / counts[k], "gamma": sums[k] / counts[k], "pairs": counts[k]}
            for k in range(n_lags) if counts[k] >= 20]


def _wls(points: Sequence[dict], f) -> float:
    """Cressie's weighted least squares: sum N(h) * (gamma_exp / gamma_model - 1)^2."""
    total = 0.0
    for p in points:
        g = f(p["h"])
        if g <= 0:
            return float("inf")
        total += p["pairs"] * (p["gamma"] / g - 1.0) ** 2
    return total


def _sph(nugget: float, sill: float, a: float):
    def f(h):
        if h >= a:
            return nugget + sill
        r = h / a
        return nugget + sill * (1.5 * r - 0.5 * r ** 3)
    return f


def fit_spherical(horizontal: Sequence[dict], downhole: Sequence[dict], data_variance: float) -> SphericalModel:
    """Fits a nested nugget + spherical model with geometric anisotropy, in the usual order:

    1. the **nugget** from the downhole variogram, which has the closest-spaced pairs;
    2. the **sill and horizontal range** from the horizontal variogram, nugget held fixed;
    3. the **vertical range** from the downhole variogram, nugget held fixed. Its sill is left
       free because pairs in one hole share the same lateral position in the deposit's zoning,
       so the downhole variogram can level off below the total sill.

    Each step is a grid search on Cressie's weighted least squares.
    """
    var = data_variance
    best = (float("inf"), 0.0)
    # A thin domain gives too few downhole lags; the nugget is then fitted on the horizontal variogram.
    source = downhole if len(downhole) >= 4 else horizontal
    for nug_frac in [0.02 * i for i in range(31)]:
        for sill_frac in [0.1 + 0.05 * i for i in range(25)]:
            for a in range(15, 505, 5):
                score = _wls(source, _sph(var * nug_frac, var * sill_frac, a))
                if score < best[0]:
                    best = (score, var * nug_frac)
    nugget = best[1]
    best_h = (float("inf"), None)
    for total_factor in [0.7 + 0.025 * i for i in range(25)]:
        sill = max(1e-9, var * total_factor - nugget)
        for a in range(40, 505, 5):
            score = _wls(horizontal, _sph(nugget, sill, a))
            if score < best_h[0]:
                best_h = (score, (sill, float(a)))
    sill, a_h = best_h[1]
    best_v = (float("inf"), a_h)
    for a_v in range(15, 405, 5):
        for sill_frac in [0.1 + 0.05 * i for i in range(23)]:
            score = _wls(downhole, _sph(nugget, sill * sill_frac, a_v))
            if score < best_v[0]:
                best_v = (score, float(a_v))
    return SphericalModel(nugget=nugget, sill=sill, range_h=a_h, range_v=best_v[1])


# ---------------------------------------------------------------------------
# Neighbourhood search and kriging
# ---------------------------------------------------------------------------

class SearchIndex:
    """Buckets samples on a horizontal grid so neighbourhood queries stay local."""

    def __init__(self, samples: Sequence[Sample], cell: float = 50.0):
        self.cell = cell
        self.buckets: Dict[Tuple[int, int], List[Sample]] = defaultdict(list)
        for s in samples:
            self.buckets[(int(s[0] // cell), int(s[1] // cell))].append(s)

    def neighbours(self, x: float, y: float, z: float, model: SphericalModel, radius: float,
                   max_samples: int, max_per_hole: int, exclude_hole: Optional[int] = None,
                   exclude: Optional[Sample] = None) -> List[Sample]:
        """Nearest samples in scaled (anisotropic) distance, at most ``max_per_hole`` from any hole."""
        reach = int(radius // self.cell) + 1
        cx, cy = int(x // self.cell), int(y // self.cell)
        found = []
        for i in range(cx - reach, cx + reach + 1):
            for j in range(cy - reach, cy + reach + 1):
                for s in self.buckets.get((i, j), ()):
                    if s is exclude or (exclude_hole is not None and s[4] == exclude_hole):
                        continue
                    d = model.scaled_distance(s[0] - x, s[1] - y, s[2] - z)
                    if d <= radius:
                        found.append((d, s))
        found.sort(key=lambda t: t[0])
        per_hole: Dict[int, int] = defaultdict(int)
        chosen = []
        for _, s in found:
            if per_hole[s[4]] >= max_per_hole:
                continue
            per_hole[s[4]] += 1
            chosen.append(s)
            if len(chosen) == max_samples:
                break
        return chosen


def block_covariance(model: SphericalModel, offsets: Sequence[Tuple[float, float, float]]) -> float:
    """Average covariance between all pairs of discretisation points of one block (C-bar(V,V))."""
    total = 0.0
    for a in offsets:
        for b in offsets:
            total += model.cov(a[0] - b[0], a[1] - b[1], a[2] - b[2])
    return total / (len(offsets) ** 2)


@dataclass
class KrigingResult:
    estimate: float
    variance: float
    slope: float
    efficiency: float
    n_samples: int
    n_holes: int
    weights: List[float]
    mean_distance: float


def ordinary_kriging(points: Sequence[Sample], targets: Sequence[Tuple[float, float, float]],
                     model: SphericalModel, cvv: float) -> KrigingResult:
    """Ordinary kriging of the average over ``targets`` (one point for point kriging,
    a discretised block for block kriging). ``cvv`` is the target's average covariance."""
    n = len(points)
    a = [[0.0] * (n + 1) for _ in range(n + 1)]
    rhs = [0.0] * (n + 1)
    for i in range(n):
        xi, yi, zi = points[i][0], points[i][1], points[i][2]
        a[i][i] = model.total_sill
        for j in range(i + 1, n):
            c = model.cov(xi - points[j][0], yi - points[j][1], zi - points[j][2])
            a[i][j] = a[j][i] = c
        a[i][n] = a[n][i] = 1.0
        rhs[i] = sum(model.cov(xi - t[0], yi - t[1], zi - t[2]) for t in targets) / len(targets)
    rhs[n] = 1.0
    sol = solve(a, rhs)
    w, mu = sol[:n], sol[n]
    wc = sum(wi * ci for wi, ci in zip(w, rhs[:n]))
    variance = max(0.0, cvv - wc - mu)
    # Slope of regression as reported by mining software: (BV - KV + |mu|) / (BV - KV + 2|mu|)
    explained = cvv - variance
    denom = explained + 2 * abs(mu)
    slope = (explained + abs(mu)) / denom if denom > 0 else 0.0
    efficiency = (cvv - variance) / cvv if cvv > 0 else 0.0
    estimate = sum(wi * p[3] for wi, p in zip(w, points))
    cx = sum(t[0] for t in targets) / len(targets)
    cy = sum(t[1] for t in targets) / len(targets)
    cz = sum(t[2] for t in targets) / len(targets)
    mean_distance = sum(math.dist((p[0], p[1], p[2]), (cx, cy, cz)) for p in points) / n
    return KrigingResult(estimate, variance, slope, efficiency, n, len({p[4] for p in points}), w, mean_distance)


def inverse_distance(points: Sequence[Sample], x: float, y: float, z: float, power: float = 2.0) -> float:
    """Inverse-distance weighting, used as a check estimate and for contact surfaces."""
    num = den = 0.0
    for p in points:
        d = math.sqrt((p[0] - x) ** 2 + (p[1] - y) ** 2 + (p[2] - z) ** 2)
        if d < 1e-6:
            return p[3]
        w = d ** -power
        num += w * p[3]
        den += w
    return num / den


def cross_validate(samples: Sequence[Sample], model: SphericalModel, radius: float,
                   max_samples: int = 16, max_per_hole: int = 4) -> List[Tuple[float, float]]:
    """Leave-one-hole-out cross-validation: each composite is re-estimated without any
    composite from its own drillhole, which avoids the optimism of plain leave-one-out."""
    index = SearchIndex(samples)
    out = []
    for s in samples:
        nb = index.neighbours(s[0], s[1], s[2], model, radius, max_samples, max_per_hole, exclude_hole=s[4])
        if len(nb) < 4:
            continue
        r = ordinary_kriging(nb, [(s[0], s[1], s[2])], model, model.total_sill)
        out.append((s[3], r.estimate))
    return out


def iter_offsets(dx: float, dy: float, dz: float, n: Iterable[int] = (2, 2, 2)) -> List[Tuple[float, float, float]]:
    """Regular discretisation offsets for a block of size dx x dy x dz."""
    nx, ny, nz = n
    return [((i + 0.5) / nx * dx - dx / 2, (j + 0.5) / ny * dy - dy / 2, (k + 0.5) / nz * dz - dz / 2)
            for i in range(nx) for j in range(ny) for k in range(nz)]
