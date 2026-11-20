"""A fictional porphyry copper deposit: the "true" grade field, the drilling and the compositing.

The deposit is synthetic but follows the geology of a supergene-enriched
porphyry copper system in an arid climate:

* a **leached cap** near surface where copper was dissolved by weathering,
* a **supergene enrichment blanket** (chalcocite) where that copper re-precipitated,
* **hypogene** (primary chalcopyrite) mineralisation below, strongest near the
  intrusive centre and elongated along a NE-trending structure.

Because the truth is known everywhere, the pipeline can measure how well the
resource model recovers it, which is impossible with a real deposit.
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import Dict, List, Tuple

# Mine grid (local coordinates, metres)
X0, Y0 = 10_000.0, 20_000.0
NX, NY, NZ = 40, 40, 22
DX, DY, DZ = 20.0, 20.0, 15.0
Z_TOP = 1_230.0

CENTRE = (X0 + 430.0, Y0 + 410.0)
STRIKE_DEG = 40.0          # azimuth of the long axis, degrees east of north

DOMAINS = ("leached", "supergene", "hypogene")
DENSITY = {0: 2.35, 1: 2.50, 2: 2.62}           # t/m3, dry bulk density by domain


def bench_floor(k: int) -> float:
    return Z_TOP - DZ * (k + 1)


def bench_centre(k: int) -> float:
    return Z_TOP - DZ * (k + 0.5)


def bench_of(z: float) -> int:
    return int((Z_TOP - z) // DZ)


class RandomField:
    """Stationary Gaussian random field with unit variance (random Fourier features).

    Two nested Gaussian structures give a long-range trend and short-range
    variability; ``stretch`` makes the field anisotropic along the strike.
    """

    def __init__(self, rng: random.Random, dims: int, scales: List[Tuple[float, float]], k: int = 120,
                 stretch: float = 1.4, vertical: float = 0.55):
        self.terms = []
        weight_total = sum(w for w, _ in scales)
        for weight, length in scales:
            n = max(4, int(k * weight / weight_total))
            amp = math.sqrt(2.0 * weight / weight_total / n)
            for _ in range(n):
                w = [rng.gauss(0, 1) / length for _ in range(dims)]
                w[0] /= stretch                       # longer correlation along strike (u axis)
                if dims == 3:
                    w[2] /= vertical                  # shorter correlation vertically
                self.terms.append((w, rng.uniform(0, 2 * math.pi), amp))
        self.dims = dims

    def __call__(self, *p: float) -> float:
        total = 0.0
        if self.dims == 2:
            for (a, b), phase, amp in self.terms:
                total += amp * math.cos(a * p[0] + b * p[1] + phase)
        else:
            for (a, b, c), phase, amp in self.terms:
                total += amp * math.cos(a * p[0] + b * p[1] + c * p[2] + phase)
        return total


def to_strike(x: float, y: float) -> Tuple[float, float]:
    """Rotates mine-grid coordinates into (along-strike, across-strike) relative to the centre."""
    t = math.radians(STRIKE_DEG)
    dx, dy = x - CENTRE[0], y - CENTRE[1]
    u = dx * math.sin(t) + dy * math.cos(t)
    v = dx * math.cos(t) - dy * math.sin(t)
    return u, v


class Deposit:
    """The true deposit. All coordinates are in mine-grid metres."""

    def __init__(self, seed: int = 17):
        rng = random.Random(seed)
        self.grade_field = RandomField(rng, 3, [(0.45, 95.0), (0.55, 28.0)], k=160)
        self.leach_field = RandomField(rng, 2, [(1.0, 160.0)], k=40)
        self.blanket_field = RandomField(rng, 2, [(1.0, 130.0)], k=40)
        self.oxide_field = RandomField(rng, 3, [(1.0, 90.0)], k=60)
        # veinlet-scale variability: correlated over a few metres, so it averages out within a block
        self.vein_field = RandomField(rng, 3, [(1.0, 3.5)], k=80, stretch=1.0, vertical=1.0)

    # --- surfaces -------------------------------------------------------
    @staticmethod
    def topography(x: float, y: float) -> float:
        hill = 24.0 * math.exp(-(((x - X0 - 560) / 260) ** 2 + ((y - Y0 - 300) / 300) ** 2))
        slope = -0.006 * (x - X0) + 0.004 * (y - Y0)
        return 1_203.0 + hill + slope

    def leached_base_depth(self, x: float, y: float) -> float:
        u, v = to_strike(x, y)
        r2 = (u / 380) ** 2 + (v / 260) ** 2
        return max(20.0, 46.0 + 12.0 * r2 + 12.0 * self.leach_field(x, y))

    def supergene_thickness(self, x: float, y: float) -> float:
        u, v = to_strike(x, y)
        r2 = (u / 330) ** 2 + (v / 230) ** 2
        return max(4.0, 16.0 + 52.0 * math.exp(-r2) + 9.0 * self.blanket_field(x, y))

    def domain_at(self, x: float, y: float, z: float) -> int:
        depth = self.topography(x, y) - z
        bol = self.leached_base_depth(x, y)
        if depth < bol:
            return 0
        if depth < bol + self.supergene_thickness(x, y):
            return 1
        return 2

    # --- grades ---------------------------------------------------------
    def hypogene_cu(self, x: float, y: float, z: float) -> float:
        u, v = to_strike(x, y)
        r2 = (u / 250) ** 2 + (v / 170) ** 2
        breccia = 0.45 * math.exp(-(((u - 110) / 70) ** 2 + ((v + 35) / 55) ** 2))
        depth = self.topography(x, y) - z
        base = 0.045 + 0.60 * math.exp(-r2) * (0.85 + 0.15 * min(1.0, depth / 200)) + breccia
        g = self.grade_field(*_strike_xyz(x, y, z))
        vein = self.vein_field(x, y, z)
        return base * math.exp(0.42 * g - 0.088 + 0.45 * vein - 0.101)

    def cu(self, x: float, y: float, z: float) -> float:
        """True total copper (% Cu) at a point."""
        d = self.domain_at(x, y, z)
        hyp = self.hypogene_cu(x, y, z)
        if d == 0:
            return hyp * 0.16
        if d == 1:
            u, v = to_strike(x, y)
            enrich = 1.45 + 0.55 * math.exp(-((u / 300) ** 2 + (v / 210) ** 2))
            return hyp * enrich
        return hyp

    def oxide_ratio(self, x: float, y: float, z: float) -> float:
        """Acid-soluble to total copper ratio (ASCu/TCu): high in oxidised rock, low in sulphides."""
        d = self.domain_at(x, y, z)
        base = (0.55, 0.10, 0.03)[d]
        return min(0.95, max(0.005, base * math.exp(0.35 * self.oxide_field(x, y, z))))


def _strike_xyz(x: float, y: float, z: float) -> Tuple[float, float, float]:
    u, v = to_strike(x, y)
    return u, v, z


# ---------------------------------------------------------------------------
# Drilling
# ---------------------------------------------------------------------------

@dataclass
class Hole:
    hole_id: str
    x: float
    y: float
    z: float
    azimuth: float
    dip: float
    length: float
    year: int
    purpose: str


def plan_drilling(rng: random.Random) -> List[Hole]:
    holes: List[Hole] = []
    collars: List[Tuple[float, float, str, int]] = []
    # 2021 exploration on a 100 m grid
    for i in range(7):
        for j in range(7):
            collars.append((X0 + 100 + 100 * i + rng.uniform(-12, 12), Y0 + 100 + 100 * j + rng.uniform(-12, 12), "exploration", 2021))
    # 2022 step-outs on 150 m spacing around the grid
    for (x, y) in [(40, 420), (800, 380), (420, 40), (420, 790), (60, 760), (780, 60), (70, 80), (770, 770)]:
        collars.append((X0 + x + rng.uniform(-10, 10), Y0 + y + rng.uniform(-10, 10), "step-out", 2022))
    # 2023 infill at 50 m in the core of the deposit
    for i in range(6):
        for j in range(6):
            x, y = X0 + 200 + 100 * i + 50, Y0 + 200 + 100 * j + 50
            u, v = to_strike(x, y)
            if (u / 330) ** 2 + (v / 240) ** 2 < 1.0:
                collars.append((x + rng.uniform(-8, 8), y + rng.uniform(-8, 8), "infill", 2023))
    # 2024 grade-definition infill near the starter pit
    for (dx, dy) in [(-25, -25), (25, 25), (-25, 25), (25, -25), (0, 60), (60, 0), (-60, 0), (0, -60)]:
        x, y = CENTRE[0] + 40 + dx, CENTRE[1] + dy
        collars.append((x + rng.uniform(-5, 5), y + rng.uniform(-5, 5), "infill", 2024))

    counters: Dict[int, int] = {}
    for x, y, purpose, year in collars:
        counters[year] = counters.get(year, 0) + 1
        angled = purpose == "infill" and rng.random() < 0.35
        azimuth = rng.choice([45.0, 225.0, 135.0]) if angled else 0.0
        dip = -60.0 if angled else -90.0
        length = round(rng.uniform(330, 400) if purpose != "step-out" else rng.uniform(260, 320), 1)
        holes.append(Hole(f"CA-{year % 100:02d}-{counters[year]:03d}", round(x, 1), round(y, 1),
                          round(Deposit.topography(x, y), 1), azimuth, dip, length, year, purpose))
    return holes


def hole_point(hole: Hole, depth: float) -> Tuple[float, float, float]:
    """Straight-hole trace: position at a given down-hole depth."""
    az, dp = math.radians(hole.azimuth), math.radians(hole.dip)
    horiz = depth * math.cos(dp)
    return (hole.x + horiz * math.sin(az), hole.y + horiz * math.cos(az), hole.z + depth * math.sin(dp))


def sample_holes(deposit: Deposit, holes: List[Hole], rng: random.Random, interval: float = 3.0) -> List[dict]:
    """Assays every ``interval`` metres. Short-scale veinlet variability and laboratory precision add a ~30 % relative error (the nugget),
    and the logged domain follows the true geology."""
    assays = []
    for h_index, hole in enumerate(holes):
        n = int(hole.length // interval)
        for s in range(n):
            frm, to = s * interval, (s + 1) * interval
            x, y, z = hole_point(hole, (frm + to) / 2)
            if z < bench_floor(NZ - 1) - 30:
                break
            true_cu = deposit.cu(x, y, z)
            # sub-block geological variability (veinlets) plus laboratory precision: the nugget effect
            cu = max(0.003, true_cu * math.exp(rng.gauss(0, 0.30) - 0.045))
            ratio = deposit.oxide_ratio(x, y, z)
            assays.append({
                "hole": h_index, "hole_id": hole.hole_id, "from": frm, "to": to, "x": x, "y": y, "z": z,
                "cu": round(cu, 4), "ascu": round(cu * ratio, 4), "domain": deposit.domain_at(x, y, z),
            })
    return assays


def bench_composites(assays: List[dict], min_length: float = 6.0) -> List[dict]:
    """Length-weighted composites on bench elevations, broken at domain contacts."""
    groups: Dict[Tuple[int, int, int], List[dict]] = {}
    for a in assays:
        k = bench_of(a["z"])
        if 0 <= k < NZ:
            groups.setdefault((a["hole"], k, a["domain"]), []).append(a)
    comps = []
    for (hole, k, domain), rows in groups.items():
        length = sum(r["to"] - r["from"] for r in rows)
        if length < min_length:
            continue
        w = [(r["to"] - r["from"]) / length for r in rows]
        comps.append({
            "hole": hole, "hole_id": rows[0]["hole_id"], "bench": k, "domain": domain, "length": length,
            "x": sum(wi * r["x"] for wi, r in zip(w, rows)),
            "y": sum(wi * r["y"] for wi, r in zip(w, rows)),
            "z": sum(wi * r["z"] for wi, r in zip(w, rows)),
            "cu": sum(wi * r["cu"] for wi, r in zip(w, rows)),
            "ascu": sum(wi * r["ascu"] for wi, r in zip(w, rows)),
        })
    comps.sort(key=lambda c: (c["hole"], c["bench"]))
    return comps


def contact_depths(assays: List[dict], holes: List[Hole]) -> Tuple[List[tuple], List[tuple]]:
    """Depth below surface of the base of leaching and base of supergene, logged in each hole."""
    bol, bos = [], []
    by_hole: Dict[int, List[dict]] = {}
    for a in assays:
        by_hole.setdefault(a["hole"], []).append(a)
    for h, rows in by_hole.items():
        first_sup = next((r for r in rows if r["domain"] >= 1), None)
        first_hyp = next((r for r in rows if r["domain"] == 2), None)
        if first_sup:
            topo = Deposit.topography(first_sup["x"], first_sup["y"])
            bol.append((first_sup["x"], first_sup["y"], 0.0, topo - first_sup["z"], h))
        if first_hyp:
            topo = Deposit.topography(first_hyp["x"], first_hyp["y"])
            bos.append((first_hyp["x"], first_hyp["y"], 0.0, topo - first_hyp["z"], h))
    return bol, bos
