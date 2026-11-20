"""Automated tests of the mining pipeline. Run from the repository root:

    python3 -m unittest discover -s projects/17-copper-mine-operations/tests
"""

import itertools
import math
import os
import random
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pipeline import economics as ec, operations as ops, pit, qaqc  # noqa: E402
from pipeline.geostats import (SphericalModel, block_covariance, experimental_downhole, ordinary_kriging,  # noqa: E402
                               iter_offsets, cross_validate)
from pipeline.linalg import solve  # noqa: E402
from pipeline.model import Ridge, metrics  # noqa: E402


class LinearAlgebra(unittest.TestCase):
    def test_solve_matches_known_solution(self):
        a = [[4, -2, 1], [-2, 4, -2], [1, -2, 4]]
        x = [1.0, -2.0, 3.0]
        b = [sum(a[i][j] * x[j] for j in range(3)) for i in range(3)]
        for got, want in zip(solve(a, b), x):
            self.assertAlmostEqual(got, want, places=10)

    def test_singular_matrix_is_reported(self):
        with self.assertRaises(ValueError):
            solve([[1, 2], [2, 4]], [1, 2])


class Geostatistics(unittest.TestCase):
    model = SphericalModel(nugget=0.0, sill=1.0, range_h=100.0, range_v=50.0)

    def test_spherical_model_reaches_sill_at_range(self):
        self.assertEqual(self.model.gamma(0, 0, 0), 0.0)
        self.assertAlmostEqual(self.model.gamma(100, 0, 0), 1.0)
        self.assertAlmostEqual(self.model.gamma(0, 0, 50), 1.0)       # anisotropy: shorter vertical range
        self.assertAlmostEqual(self.model.gamma(50, 0, 0), 0.6875)

    def test_kriging_weights_sum_to_one(self):
        pts = [(0, 0, 0, 1.0, 0), (60, 0, 0, 2.0, 1), (0, 70, 0, 3.0, 2), (40, 40, 10, 1.5, 3)]
        r = ordinary_kriging(pts, [(20, 20, 0)], self.model, self.model.total_sill)
        self.assertAlmostEqual(sum(r.weights), 1.0, places=10)
        self.assertGreater(r.variance, 0)

    def test_point_kriging_is_an_exact_interpolator(self):
        pts = [(0, 0, 0, 1.0, 0), (60, 0, 0, 2.0, 1), (0, 70, 0, 3.0, 2)]
        r = ordinary_kriging(pts, [(60, 0, 0)], self.model, self.model.total_sill)
        self.assertAlmostEqual(r.estimate, 2.0, places=8)
        self.assertAlmostEqual(r.variance, 0.0, places=8)

    def test_block_variance_is_below_point_variance(self):
        cvv = block_covariance(self.model, iter_offsets(20, 20, 15))
        self.assertLess(cvv, self.model.total_sill)
        self.assertGreater(cvv, 0.8)

    def test_downhole_variogram_of_a_linear_trend(self):
        samples = [(0, 0, -15.0 * k, float(k), 0) for k in range(30)]
        lags = experimental_downhole(samples, lag=15.0, n_lags=3)
        self.assertAlmostEqual(lags[0]["gamma"], 0.5)                  # 0.5 * (1)^2
        self.assertAlmostEqual(lags[1]["gamma"], 2.0)                  # 0.5 * (2)^2

    def test_cross_validation_leaves_the_whole_hole_out(self):
        rng = random.Random(3)
        samples = [(x * 40.0, y * 40.0, -15.0 * k, rng.random(), x * 10 + y) for x in range(5) for y in range(5) for k in range(3)]
        pairs = cross_validate(samples, self.model, radius=200.0)
        self.assertEqual(len(pairs), len(samples))
        # with its own hole removed, no composite can be reproduced exactly
        self.assertTrue(all(abs(a - e) > 1e-9 for a, e in pairs))


class PitOptimisation(unittest.TestCase):
    def brute_force(self, values, precedence, forbidden):
        best, best_set = 0.0, set()
        n = len(values)
        for mask in range(1 << n):
            chosen = {i for i in range(n) if mask >> i & 1}
            if chosen & set(forbidden):
                continue
            if any(j not in chosen for i in chosen for j in precedence[i]):
                continue
            v = sum(values[i] for i in chosen)
            if v > best + 1e-9:
                best, best_set = v, chosen
        return best, best_set

    def test_max_closure_matches_brute_force(self):
        rng = random.Random(11)
        precedence, forbidden = pit.grid_precedence(3, 2, 2)
        for _ in range(25):
            values = [rng.uniform(-10, 6) for _ in range(12)]
            values[rng.randrange(6, 12)] += 40                      # one rich block at depth
            closure = pit.max_closure(values, precedence, forbidden)
            best, _ = self.brute_force(values, precedence, forbidden)
            self.assertAlmostEqual(sum(values[i] for i in closure), best, places=6)
            for i in closure:
                self.assertTrue(set(precedence[i]) <= closure)

    def test_shells_are_nested_as_price_rises(self):
        rng = random.Random(5)
        nx, ny, nz = 6, 6, 4
        precedence, forbidden = pit.grid_precedence(nx, ny, nz)
        grades = [rng.uniform(0, 1.2) * (1 if 1 <= (i % nx) <= 4 else 0.2) for i in range(nx * ny * nz)]
        shells = []
        for rf in (0.6, 0.8, 1.0, 1.2):
            values = [ec.block_value(10_000, g, 2, n // (nx * ny), rf) for n, g in enumerate(grades)]
            shells.append(pit.max_closure(values, precedence, forbidden))
        for small, large in zip(shells, shells[1:]):
            self.assertTrue(small <= large)


class Economics(unittest.TestCase):
    def test_cutoff_grade_formula(self):
        # (10 + 2) $/t  /  ((4 - 0.5) $/lb * 0.9 * 22.0462 lb per % per t)
        self.assertAlmostEqual(ec.cutoff_grade(4.0, 0.5, 0.9, 10.0, 2.0), 12 / (3.5 * 0.9 * 22.0462), places=6)

    def test_block_value_takes_the_better_destination(self):
        mine = ec.mining_cost(3)
        self.assertAlmostEqual(ec.block_value(1000, 0.0, 2, 3), -1000 * mine)        # waste pays mining only
        self.assertGreater(ec.block_value(1000, 0.8, 2, 3), 0)
        self.assertEqual(ec.block_value(0, 1.0, 2, 3), 0.0)

    def test_marginal_cutoff_decides_ore(self):
        cut = ec.cutoff_grade(ec.PARAMS["copperPrice"], ec.PARAMS["sellingCost"], ec.PARAMS["recovery"]["hypogene"],
                              ec.PARAMS["processingCost"], ec.PARAMS["gaCost"])
        self.assertTrue(ec.is_ore(cut + 1e-6, 2))
        self.assertFalse(ec.is_ore(cut - 1e-6, 2))
        self.assertFalse(ec.is_ore(5.0, 0))          # leached cap is never milled


class Scheduling(unittest.TestCase):
    def test_schedule_respects_slope_precedence(self):
        rng = random.Random(7)
        nx, ny, nz = 8, 8, 5
        precedence, forbidden = pit.grid_precedence(nx, ny, nz)
        blocks, shells = [], {}
        for n in range(nx * ny * nz):
            i, j, k = n % nx, (n // nx) % ny, n // (nx * ny)
            centre = math.exp(-((i - 3.5) ** 2 + (j - 3.5) ** 2) / 6)
            blocks.append({"x": i * 20.0, "y": j * 20.0, "k": k, "tonnes": 15_000.0, "domain": 2,
                           "cu": max(0.0, 2.4 * centre + rng.gauss(0, 0.05))})
        for rf in ops.PHASE_RF:
            values = [ec.block_value(b["tonnes"], b["cu"], 2, b["k"], rf) for b in blocks]
            shells[rf] = pit.max_closure(values, precedence, forbidden)
        phase_lists = ops.phases(blocks, shells)
        self.assertTrue(all(phase_lists), "every phase should contain blocks")
        sched = ops.Scheduler(blocks, phase_lists)
        while not sched.done():
            sched.month(120_000.0, 60_000.0, ops.rm_ore)
        self.assertEqual(sorted(sched.mined), sorted(i for ph in phase_lists for i in ph))
        mined_at = {i: n for n, i in enumerate(sched.mined)}
        for i in sched.mined:
            for j in precedence[i]:
                self.assertIn(j, mined_at, "a block was mined while a block above it stays in place")
                self.assertLess(mined_at[j], mined_at[i])


class Reconciliation(unittest.TestCase):
    def test_f_factors(self):
        rec = {"rm": {"t": 100.0, "g": 0.50}, "gc": {"t": 95.0, "g": 0.55},
               "delivered": {"t": 95.0, "g": 0.55}, "mill": {"t": 98.0, "g": 0.52}}
        f = ops.f_factors(rec)
        self.assertAlmostEqual(f["F1"]["t"], 0.95)
        self.assertAlmostEqual(f["F1"]["g"], 1.10)
        self.assertAlmostEqual(f["F1"]["m"], 0.95 * 1.10)
        self.assertAlmostEqual(f["F3"]["m"], f["F1"]["m"] * f["F2"]["m"])


class QualityControl(unittest.TestCase):
    def test_injected_problems_are_caught(self):
        assays = [{"cu": 0.3 + 0.001 * n} for n in range(qaqc.BATCH_SIZE * 200)]
        result = qaqc.run(assays)
        failed = {f["batch"]: f["causes"] for f in result["failedBatches"]}
        self.assertIn("blank", failed[87])                  # contamination
        self.assertIn(41, failed)                            # CRM sachet swap
        self.assertIn(167, failed)
        self.assertTrue(any(qaqc.DRIFT_BATCHES.start <= b < qaqc.DRIFT_BATCHES.stop for b in failed),
                        "the laboratory drift should fail at least one batch")


class RecoveryModel(unittest.TestCase):
    def test_ridge_recovers_linear_coefficients(self):
        rng = random.Random(1)
        rows = [[rng.gauss(0, 1), rng.gauss(5, 2)] for _ in range(300)]
        y = [3.0 + 2.0 * a - 0.5 * b for a, b in rows]
        m = Ridge(alpha=1e-6).fit(rows, y)
        self.assertAlmostEqual(m.predict_one([1.0, 4.0]), 3.0 + 2.0 - 2.0, places=4)
        self.assertLess(metrics(y, m.predict(rows))["mae"], 1e-6)


if __name__ == "__main__":
    unittest.main()
