"""Ultimate-pit optimisation as a maximum-closure problem (equivalent to Lerchs–Grossmann).

Each block is a node. A block that must be removed before another (its
precedence) is linked by an arc of infinite capacity. Positive-value blocks
connect from the source, negative-value blocks to the sink, and the maximum
closure is the set of nodes still reachable from the source after a maximum
flow (Picard, 1976). The flow is computed with Dinic's algorithm.
"""

from __future__ import annotations

from collections import deque
from typing import Iterable, List, Sequence, Set

INF = 1e18
EPS = 1e-9


class FlowGraph:
    def __init__(self, n: int):
        self.n = n
        self.head = [-1] * n
        self.to: List[int] = []
        self.cap: List[float] = []
        self.nxt: List[int] = []

    def add(self, u: int, v: int, c: float) -> None:
        for a, b, cc in ((u, v, c), (v, u, 0.0)):
            self.to.append(b)
            self.cap.append(cc)
            self.nxt.append(self.head[a])
            self.head[a] = len(self.to) - 1

    def max_flow(self, s: int, t: int) -> float:
        to, cap, nxt, head = self.to, self.cap, self.nxt, self.head
        flow = 0.0
        while True:
            level = [-1] * self.n
            level[s] = 0
            q = deque([s])
            while q:
                v = q.popleft()
                e = head[v]
                while e != -1:
                    u = to[e]
                    if level[u] < 0 and cap[e] > EPS:
                        level[u] = level[v] + 1
                        q.append(u)
                    e = nxt[e]
            if level[t] < 0:
                return flow
            it = head[:]
            while True:
                path: List[int] = []
                v = s
                while v != t:
                    e = it[v]
                    while e != -1 and not (cap[e] > EPS and level[to[e]] == level[v] + 1):
                        e = nxt[e]
                    it[v] = e
                    if e == -1:
                        level[v] = -1                    # dead end: prune it
                        if not path:
                            break
                        back = path.pop()
                        v = to[back ^ 1]
                        it[v] = nxt[it[v]]
                        continue
                    path.append(e)
                    v = to[e]
                if v != t:
                    break
                f = min(cap[e] for e in path)
                for e in path:
                    cap[e] -= f
                    cap[e ^ 1] += f
                flow += f

    def reachable(self, s: int) -> Set[int]:
        seen = {s}
        q = deque([s])
        while q:
            v = q.popleft()
            e = self.head[v]
            while e != -1:
                u = self.to[e]
                if u not in seen and self.cap[e] > EPS:
                    seen.add(u)
                    q.append(u)
                e = self.nxt[e]
        return seen


def max_closure(values: Sequence[float], precedence: Sequence[Iterable[int]],
                forbidden: Iterable[int] = ()) -> Set[int]:
    """Returns the set of node indices of the maximum-value closed set.

    ``precedence[i]`` lists the nodes that must be mined before node ``i``.
    Nodes in ``forbidden`` can never be mined (for example blocks whose
    slope cone would leave the model).
    """
    n = len(values)
    s, t = n, n + 1
    g = FlowGraph(n + 2)
    for i, v in enumerate(values):
        if v > 0:
            g.add(s, i, v)
        elif v < 0:
            g.add(i, t, -v)
        for j in precedence[i]:
            g.add(i, j, INF)
    for i in forbidden:
        g.add(i, t, INF)
    g.max_flow(s, t)
    closure = g.reachable(s)
    closure.discard(s)
    return closure


def grid_precedence(nx: int, ny: int, nz: int):
    """1:5 precedence pattern on a regular grid (k = 0 is the top bench).

    A block needs the block directly above it and that block's four edge
    neighbours. Blocks whose pattern would reach outside the model are
    returned as forbidden so the pit never relies on the model edge.
    """
    def idx(i, j, k):
        return (k * ny + j) * nx + i

    precedence: List[List[int]] = [[] for _ in range(nx * ny * nz)]
    forbidden: List[int] = []
    for k in range(1, nz):
        for j in range(ny):
            for i in range(nx):
                me = idx(i, j, k)
                ok = True
                for di, dj in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
                    ii, jj = i + di, j + dj
                    if 0 <= ii < nx and 0 <= jj < ny:
                        precedence[me].append(idx(ii, jj, k - 1))
                    else:
                        ok = False
                if not ok:
                    forbidden.append(me)
    return precedence, forbidden
