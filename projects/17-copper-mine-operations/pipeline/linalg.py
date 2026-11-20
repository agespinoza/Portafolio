"""Small dense linear algebra, written out so every step of the pipeline is inspectable.

Only the Python standard library is used. The systems solved here are small
(kriging systems of at most 17 equations, ridge regressions with about 10
features), so Gaussian elimination is fast enough and easy to audit.
"""

from __future__ import annotations

import math
from typing import List, Sequence

Matrix = List[List[float]]


def solve(a: Sequence[Sequence[float]], b: Sequence[float]) -> List[float]:
    """Solves A x = b with Gaussian elimination and partial pivoting.

    Raises ValueError when the matrix is singular (for kriging this means two
    samples share a location and the system has no unique solution).
    """
    n = len(b)
    m = [list(map(float, row)) + [float(b[i])] for i, row in enumerate(a)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(m[r][col]))
        if abs(m[pivot][col]) < 1e-12:
            raise ValueError("singular matrix")
        if pivot != col:
            m[col], m[pivot] = m[pivot], m[col]
        row = m[col]
        inv = 1.0 / row[col]
        for r in range(col + 1, n):
            factor = m[r][col] * inv
            if factor:
                target = m[r]
                for c in range(col, n + 1):
                    target[c] -= factor * row[c]
    x = [0.0] * n
    for r in range(n - 1, -1, -1):
        s = m[r][n] - sum(m[r][c] * x[c] for c in range(r + 1, n))
        x[r] = s / m[r][r]
    return x


def mean(values: Sequence[float]) -> float:
    return sum(values) / len(values)


def variance(values: Sequence[float]) -> float:
    mu = mean(values)
    return sum((v - mu) ** 2 for v in values) / len(values)


def std(values: Sequence[float]) -> float:
    return math.sqrt(variance(values))


def pearson(x: Sequence[float], y: Sequence[float]) -> float:
    mx, my = mean(x), mean(y)
    sxy = sum((a - mx) * (b - my) for a, b in zip(x, y))
    sxx = sum((a - mx) ** 2 for a in x)
    syy = sum((b - my) ** 2 for b in y)
    return sxy / math.sqrt(sxx * syy)


def slope(x: Sequence[float], y: Sequence[float]) -> float:
    """Least-squares slope of y on x."""
    mx, my = mean(x), mean(y)
    return sum((a - mx) * (b - my) for a, b in zip(x, y)) / sum((a - mx) ** 2 for a in x)
