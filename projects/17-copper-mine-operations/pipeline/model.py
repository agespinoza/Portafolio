"""Flotation recovery model: standardised ridge regression with a time-ordered validation.

The model is deliberately simple and explainable. Metallurgists need to see
which variable moves recovery and by how much, and a linear model with
engineered terms (log grade, a quadratic pH term) gives that directly.
"""

from __future__ import annotations

import math
from typing import Dict, List, Sequence

from .linalg import mean, solve, std


class Ridge:
    def __init__(self, alpha: float = 1.0):
        self.alpha = alpha

    def fit(self, rows: Sequence[Sequence[float]], y: Sequence[float]) -> "Ridge":
        p = len(rows[0])
        self.mu = [mean([r[j] for r in rows]) for j in range(p)]
        self.sd = [std([r[j] for r in rows]) or 1.0 for j in range(p)]
        z = [[(r[j] - self.mu[j]) / self.sd[j] for j in range(p)] for r in rows]
        self.intercept = mean(y)
        yc = [v - self.intercept for v in y]
        xtx = [[sum(zi[a] * zi[b] for zi in z) + (self.alpha if a == b else 0.0) for b in range(p)] for a in range(p)]
        xty = [sum(zi[a] * yi for zi, yi in zip(z, yc)) for a in range(p)]
        self.coef = solve(xtx, xty)              # coefficients on standardised features
        return self

    def predict_one(self, r: Sequence[float]) -> float:
        return self.intercept + sum(c * (v - m) / s for c, v, m, s in zip(self.coef, r, self.mu, self.sd))

    def predict(self, rows: Sequence[Sequence[float]]) -> List[float]:
        return [self.predict_one(r) for r in rows]


def metrics(actual: Sequence[float], predicted: Sequence[float]) -> Dict[str, float]:
    err = [p - a for a, p in zip(actual, predicted)]
    mu = mean(actual)
    ss_res = sum(e * e for e in err)
    ss_tot = sum((a - mu) ** 2 for a in actual)
    return {
        "mae": mean([abs(e) for e in err]),
        "rmse": math.sqrt(ss_res / len(err)),
        "bias": mean(err),
        "r2": 1 - ss_res / ss_tot,
    }


def time_series_cv(rows, y, alphas: Sequence[float], folds: int = 4) -> Dict[float, float]:
    """Expanding-window cross-validation on the training period (no look-ahead)."""
    n = len(y)
    size = n // (folds + 1)
    out = {}
    for alpha in alphas:
        errors = []
        for f in range(1, folds + 1):
            train_end = size * f
            test_end = min(n, train_end + size)
            m = Ridge(alpha).fit(rows[:train_end], y[:train_end])
            errors.append(metrics(y[train_end:test_end], m.predict(rows[train_end:test_end]))["mae"])
        out[alpha] = mean(errors)
    return out
