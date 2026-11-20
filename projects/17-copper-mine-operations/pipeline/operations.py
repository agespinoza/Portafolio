"""Mine operations: life-of-mine sequence, a year of haul-fleet, plant and reconciliation data.

Production started in January 2024. The console shows the operating year
November 2025 to October 2026 in monthly detail, with daily plant data.
"""

from __future__ import annotations

import calendar
import math
import random
from typing import Dict, List, Sequence, Set

from . import deposit as dp
from . import economics as ec
from .linalg import mean

START_YEAR = 2024
YEAR_FIRST, YEAR_LAST = 22, 33          # month indexes of Nov 2025 and Oct 2026 (Jan 2024 = 0)
PHASE_RF = (0.6, 0.8, 1.0)              # starter pit and two pushbacks
PHASE_LAG = 3                           # benches a pushback trails the phase before it
MILL_TPY = 7.2e6                        # nameplate mill feed, t/year
TRUCKS = [f"T{n:02d}" for n in range(1, 9)]
SHOVELS = ("S1", "S2")
TRUCK_PAYLOAD = 100.0                   # t, nominal payload of the 100 t rigid-frame class


def month_label(m: int) -> str:
    y, mo = divmod(m, 12)
    return f"{START_YEAR + y}-{mo + 1:02d}"


def days_in(m: int) -> int:
    y, mo = divmod(m, 12)
    return calendar.monthrange(START_YEAR + y, mo + 1)[1]


# ---------------------------------------------------------------------------
# Scheduling
# ---------------------------------------------------------------------------

def phases(blocks: List[dict], shells: Dict[float, Set[int]]) -> List[List[int]]:
    """Splits the final pit into a starter pit and two pushbacks (nested shells), each ordered
    top-down and, within a bench, outward from the phase centroid."""
    phase_of: Dict[int, int] = {}
    for p, rf in enumerate(PHASE_RF):
        for i in shells[rf]:
            if blocks[i]["tonnes"] > 0 and i not in phase_of:
                phase_of[i] = p
    out = []
    for p in range(len(PHASE_RF)):
        members = [i for i, ph in phase_of.items() if ph == p]
        if not members:
            out.append([])
            continue
        cx = mean([blocks[i]["x"] for i in members])
        cy = mean([blocks[i]["y"] for i in members])
        members.sort(key=lambda i: (blocks[i]["k"], math.hypot(blocks[i]["x"] - cx, blocks[i]["y"] - cy)))
        for i in members:
            blocks[i]["phase"] = p + 1
        out.append(members)
    return out


class Scheduler:
    """Ore-driven monthly scheduler.

    The leading phase is mined until the month's ore covers the mill; the rest of the
    fleet capacity strips the next pushbacks. A pushback may only work a bench that the
    phase ahead of it has already finished, which keeps every block's precedence mined
    first (the nested shells are closed sets, so precedence never points to a later phase).
    """

    def __init__(self, blocks: List[dict], phase_lists: List[List[int]]):
        self.blocks = blocks
        self.phases = phase_lists
        self.pos = [0] * len(phase_lists)
        self.mined: List[int] = []

    def done(self) -> bool:
        return all(p >= len(ph) for p, ph in zip(self.pos, self.phases))

    def clone(self) -> "Scheduler":
        other = Scheduler(self.blocks, self.phases)
        other.pos = list(self.pos)
        other.mined = list(self.mined)
        return other

    def _bench(self, p: int) -> int:
        """Bench of the next block in phase p (a finished phase no longer limits anything)."""
        return self.blocks[self.phases[p][self.pos[p]]]["k"] if self.pos[p] < len(self.phases[p]) else 10 ** 6

    def _take(self, p: int) -> int:
        i = self.phases[p][self.pos[p]]
        self.pos[p] += 1
        self.mined.append(i)
        return i

    def month(self, capacity: float, ore_target: float, is_ore) -> List[int]:
        taken: List[int] = []
        moved = ore = 0.0
        active = [p for p in range(len(self.phases)) if self.pos[p] < len(self.phases[p])]
        if not active:
            return taken
        lead = active[0]
        while moved < capacity and self.pos[lead] < len(self.phases[lead]) and ore < ore_target:
            i = self._take(lead)
            taken.append(i)
            moved += self.blocks[i]["tonnes"]
            if is_ore(self.blocks[i]):
                ore += self.blocks[i]["tonnes"]
        progressed = True
        while moved < capacity and progressed:
            progressed = False
            for p in active[1:] + [lead]:
                if self.pos[p] >= len(self.phases[p]):
                    continue
                ahead = p - 1
                while ahead >= 0 and self.pos[ahead] >= len(self.phases[ahead]):
                    ahead -= 1
                if p != lead and ahead >= 0 and self._bench(p) >= self._bench(ahead):
                    continue                                   # wait for the phase ahead to go deeper
                i = self._take(p)
                taken.append(i)
                moved += self.blocks[i]["tonnes"]
                progressed = True
                if moved >= capacity:
                    break
        return taken


def rm_ore(b: dict) -> bool:
    return ec.is_ore(b["cu"], b["domain"])


def gc_ore(b: dict) -> bool:
    return ec.is_ore(b["gc_cu"], b["domain"])


# ---------------------------------------------------------------------------
# Life-of-mine plan (resource model, planned rates)
# ---------------------------------------------------------------------------

def life_of_mine(blocks: List[dict], phase_lists: List[List[int]]) -> dict:
    """Plans the whole pit month by month with the resource model and planned rates.
    Returns the plan and the scheduler state at the start of the operating year."""
    order = [i for ph in phase_lists for i in ph]
    ore_t = sum(blocks[i]["tonnes"] for i in order if rm_ore(blocks[i]))
    total_t = sum(blocks[i]["tonnes"] for i in order)
    years = ore_t / MILL_TPY
    movement_tpy = total_t / years * 1.08       # mine slightly ahead of the mill to build a stockpile
    sched = Scheduler(blocks, phase_lists)
    months = []
    stock_t = stock_metal = 0.0
    snapshot = None
    m = 0
    while not sched.done() or stock_t > 1:
        if m == YEAR_FIRST:
            snapshot = (sched.clone(), stock_t, stock_metal)
        cap = movement_tpy / 365.0 * days_in(m)
        mill_cap = MILL_TPY / 365.0 * days_in(m)
        taken = sched.month(cap, mill_cap, rm_ore)
        moved = sum(blocks[i]["tonnes"] for i in taken)
        ore_rows = [blocks[i] for i in taken if rm_ore(blocks[i])]
        ore = sum(b["tonnes"] for b in ore_rows)
        ore_metal = sum(b["tonnes"] * b["cu"] for b in ore_rows)
        direct = min(ore, mill_cap)
        direct_metal = ore_metal * (direct / ore) if ore else 0.0
        stock_t += ore - direct
        stock_metal += ore_metal - direct_metal
        reclaim = min(stock_t, mill_cap - direct)
        reclaim_metal = stock_metal * (reclaim / stock_t) if stock_t > 0 else 0.0
        stock_t -= reclaim
        stock_metal -= reclaim_metal
        feed = direct + reclaim
        sup = sum(b["tonnes"] for b in ore_rows if b["domain"] == 1) / ore if ore else 0.0
        months.append({"month": m, "label": month_label(m), "blocks": taken, "moved": moved, "ore": ore,
                       "feed": feed, "feedCu": (direct_metal + reclaim_metal) / feed if feed else 0.0, "supergene": sup,
                       "stockpile": stock_t, "stockpileCu": stock_metal / stock_t if stock_t > 0 else 0.0})
        m += 1
        if m > 600:
            raise RuntimeError("schedule did not finish")
    return {"movementTpy": movement_tpy, "years": years, "months": months, "oreTonnes": ore_t,
            "totalTonnes": total_t, "snapshot": snapshot, "order": sched.mined}


# ---------------------------------------------------------------------------
# Operating year
# ---------------------------------------------------------------------------

def _rain_factor(month_of_year: int) -> float:
    """Summer monsoon storms in north-west Mexico close haul roads for hours at a time."""
    return {7: 0.93, 8: 0.91, 9: 0.95}.get(month_of_year, 1.0)


def cycle_time(depth: float, ore_share: float, month_of_year: int, rng: random.Random) -> Dict[str, float]:
    """Truck cycle components in minutes. Ramps are 10 % grade, so each metre of depth adds 10 m of ramp."""
    ramp_km = depth / 0.10 / 1000.0
    flat_km = 2.6 * ore_share + 1.6 * (1 - ore_share)     # crusher is farther than the waste dump
    wet = 1.0 / _rain_factor(month_of_year)
    return {
        "queue": max(0.5, rng.gauss(2.4, 0.3)) * wet,
        "spotLoad": max(2.0, rng.gauss(3.3, 0.12)),
        "haul": (ramp_km / 11.0 + flat_km / 28.0) * 60.0 * wet,
        "dump": max(0.8, rng.gauss(1.3, 0.08)),
        "return": (ramp_km / 24.0 + flat_km / 38.0) * 60.0,
    }


def fleet_month(m: int, cycle: Dict[str, float], rng: random.Random) -> List[dict]:
    """ASARCO time model for each truck: calendar = scheduled maintenance + unscheduled
    downtime + standby + operating delays + operating (productive) hours."""
    month_of_year = m % 12 + 1
    hours = days_in(m) * 24.0
    rows = []
    for n, truck in enumerate(TRUCKS):
        sched = hours * max(0.02, rng.gauss(0.055, 0.008))
        unsched = hours * max(0.01, rng.gauss(0.065, 0.015))
        if truck == "T07":                       # final-drive wear: rising breakdowns, failure in September
            unsched = hours * {28: 0.09, 29: 0.12, 30: 0.15, 31: 0.21, 32: 0.29, 33: 0.12}.get(m, 0.07)
        available = hours - sched - unsched
        standby = available * max(0.04, rng.gauss(0.10, 0.015)) / _rain_factor(month_of_year) ** 2
        delays = (available - standby) * max(0.05, rng.gauss(0.085, 0.01))
        operating = available - standby - delays
        cycle_min = sum(cycle.values()) * rng.gauss(1.0, 0.015)
        payload = TRUCK_PAYLOAD * rng.gauss(0.99, 0.008)
        loads = operating * 60.0 / cycle_min
        rows.append({
            "truck": truck, "calendar": hours, "scheduled": sched, "unscheduled": unsched, "standby": standby,
            "delays": delays, "operating": operating, "loads": loads, "tonnes": loads * payload, "payload": payload,
            "availability": available / hours, "useOfAvailability": (available - standby) / available,
            "utilization": operating / hours, "productivity": payload * 60.0 / cycle_min,
            "failures": max(0, round(unsched / 9.0 + rng.gauss(0, 0.6))),
        })
    for r in rows:
        r["mtbf"] = r["operating"] / max(1, r["failures"])
        r["mttr"] = r["unscheduled"] / max(1, r["failures"])
    return rows


def payload_distribution(rng: random.Random, loads: int) -> dict:
    """Payload of every load in the last month, as a share of the nominal payload, by shovel."""
    edges = [0.80 + 0.02 * i for i in range(24)]          # 80 % .. 126 %
    out = {}
    for shovel, mu, sd in (("S1", 0.975, 0.048), ("S2", 1.012, 0.057)):
        counts = [0] * (len(edges) - 1)
        over110 = over120 = 0
        n = loads // 2
        for _ in range(n):
            v = rng.gauss(mu, sd)
            over110 += v > 1.10
            over120 += v > 1.20
            k = int((v - 0.80) / 0.02)
            if 0 <= k < len(counts):
                counts[k] += 1
        out[shovel] = {"counts": counts, "n": n, "over110": over110 / n, "over120": over120 / n, "mean": mu}
    return {"edges": edges, "shovels": out}


def operating_year(blocks: List[dict], lom: dict, seed: int = 2026) -> dict:
    rng = random.Random(seed)
    plan_months = {mo["month"]: mo for mo in lom["months"]}
    # grade-control model: blasthole sampling of each block (about 15 % relative error)
    for b in blocks:
        b["gc_cu"] = b["true_cu"] * math.exp(rng.gauss(0, 0.15) - 0.011) if b["tonnes"] > 0 else 0.0

    sched, stock_t, stock_metal = lom["snapshot"]
    sched = sched.clone()
    stock_true = stock_gc = stock_metal                       # the opening stockpile is surveyed and assayed
    months, fleet, daily = [], [], []

    for m in range(YEAR_FIRST, YEAR_LAST + 1):
        mo_year = m % 12 + 1
        plan = plan_months[m]
        plan_blocks = plan["blocks"]
        depth = mean([dp.Deposit.topography(blocks[i]["x"], blocks[i]["y"]) - blocks[i]["z"] for i in plan_blocks])
        ore_share = plan["ore"] / plan["moved"] if plan["moved"] else 0.5
        cycle = cycle_time(depth, ore_share, mo_year, rng)
        trucks = fleet_month(m, cycle, rng)
        hauled = sum(t["tonnes"] for t in trucks)
        fleet.append({"month": m, "label": month_label(m), "cycle": cycle, "depth": depth, "trucks": trucks, "hauled": hauled})

        # actual blocks mined this month: the fleet's tonnage, ore decided on the grade-control model
        mined = sched.month(hauled, MILL_TPY / 365.0 * days_in(m), gc_ore)
        moved = sum(blocks[i]["tonnes"] for i in mined)
        rm = [blocks[i] for i in mined if ec.is_ore(blocks[i]["cu"], blocks[i]["domain"])]
        gc = [blocks[i] for i in mined if ec.is_ore(blocks[i]["gc_cu"], blocks[i]["domain"])]

        def totals(rows, key):
            t = sum(b["tonnes"] for b in rows)
            return t, (sum(b["tonnes"] * b[key] for b in rows) / t if t else 0.0)
        rm_t, rm_g = totals(rm, "cu")
        gc_t, gc_g = totals(gc, "gc_cu")
        gc_true_t, gc_true_g = totals(gc, "true_cu")

        # plant: daily throughput, the mill takes direct ore first and reclaims the stockpile for the rest
        days = []
        sup_share = sum(b["tonnes"] for b in gc if b["domain"] == 1) / gc_t if gc_t else plan["supergene"]
        ox_ratio = sum(b["tonnes"] * b["true_ox"] for b in gc) / gc_t if gc_t else 0.05
        for d in range(days_in(m)):
            maintenance = d == 9
            runtime = 0.36 if maintenance else min(0.995, max(0.5, rng.gauss(0.945, 0.02)))
            if not maintenance and rng.random() < 0.04:
                runtime = rng.uniform(0.55, 0.85)                # trips: liner change, conveyor stoppage
            s = min(0.95, max(0.0, sup_share + rng.gauss(0, 0.07)))
            bwi = 11.8 * s + 14.8 * (1 - s) + rng.gauss(0, 0.35)
            tph = min(1050.0, 820.0 * (13.9 / bwi) ** 0.8 * rng.gauss(1.0, 0.025))
            p80 = 150.0 * (bwi / 13.9) ** 0.9 * (tph / 820.0) ** 0.7 * math.exp(rng.gauss(0, 0.035))
            ox = max(0.01, ox_ratio * math.exp(rng.gauss(0, 0.18)))
            collector = 24.0 + 30.0 * (ox - 0.06) + rng.gauss(0, 1.6)
            ph = rng.gauss(10.4, 0.22)
            days.append({"tonnes": tph * 24 * runtime, "runtime": runtime, "tph": tph, "bwi": bwi, "p80": p80,
                         "supergene": s, "ox": ox, "collector": collector, "ph": ph})
        mill_t = sum(x["tonnes"] for x in days)
        direct = min(gc_t, mill_t)
        stock_t += gc_t - direct
        stock_gc += (gc_t - direct) * gc_g
        stock_true += (gc_t - direct) * gc_true_g
        reclaim = min(stock_t, mill_t - direct)
        reclaim_gc = stock_gc / stock_t * reclaim if stock_t else 0.0
        reclaim_true = stock_true / stock_t * reclaim if stock_t else 0.0
        stock_gc -= reclaim_gc
        stock_true -= reclaim_true
        stock_t -= reclaim
        delivered_gc_metal = direct * gc_g + reclaim_gc
        delivered_true_metal = direct * gc_true_g + reclaim_true
        delivered_t = direct + reclaim
        # mining dilution and ore loss at the dig face: +3.5 % tonnes at 96.5 % of the grade
        true_head = delivered_true_metal / delivered_t * 0.965 if delivered_t else 0.0
        mill_reported_t = delivered_t * 1.035 * rng.gauss(1.0, 0.004)
        for x in days:
            x["tonnes"] *= mill_reported_t / mill_t
            x["headTrue"] = true_head * math.exp(rng.gauss(0, 0.07))
        scale = true_head * mill_reported_t / sum(x["tonnes"] * x["headTrue"] for x in days)
        for i, x in enumerate(days):
            x["headTrue"] *= scale
            x["head"] = x["headTrue"] * math.exp(rng.gauss(0, 0.015))        # sampler precision
            rec = (87.2 + 4.0 * math.log(x["headTrue"] / 0.45) - 0.065 * (x["p80"] - 150) - 42.0 * (x["ox"] - 0.06)
                   + 0.10 * (x["collector"] - 24) - 3.0 * (x["ph"] - 10.4) ** 2 + rng.gauss(0, 0.9))
            x["recovery"] = min(95.0, max(70.0, rec))
            x["copper"] = x["tonnes"] * x["headTrue"] / 100 * x["recovery"] / 100
            x["date"] = f"{month_label(m)}-{i + 1:02d}"
            x["month"] = m
        daily.extend(days)
        mill_head = sum(x["tonnes"] * x["head"] for x in days) / mill_reported_t
        copper = sum(x["copper"] for x in days)

        # plan figures for the same month (resource model, planned rates and planning recoveries)
        plan_feed_metal = plan["feed"] * plan["feedCu"]
        plan_rec = 0.89 - 0.05 * sup_share
        months.append({
            "month": m, "label": month_label(m),
            "plan": {"moved": plan["moved"], "ore": plan["ore"], "feed": plan["feed"], "feedCu": plan["feedCu"],
                     "copper": plan_feed_metal / 100 * plan_rec},
            "actual": {"moved": moved, "ore": gc_t, "feed": mill_reported_t, "feedCu": mill_head, "copper": copper,
                       "stockpile": stock_t, "recovery": copper / (mill_reported_t * mill_head / 100) * 100},
            "reconciliation": {
                "rm": {"t": rm_t, "g": rm_g}, "gc": {"t": gc_t, "g": gc_g},
                "delivered": {"t": delivered_t, "g": delivered_gc_metal / delivered_t if delivered_t else 0.0},
                "mill": {"t": mill_reported_t, "g": mill_head},
            },
        })
    payload = payload_distribution(rng, int(sum(t["loads"] for t in fleet[-1]["trucks"])))
    return {"months": months, "fleet": fleet, "daily": daily, "payload": payload}


def f_factors(rec: dict) -> dict:
    """F1 = grade control / resource model, F2 = mill / grade control delivered, F3 = F1 x F2."""
    rm_metal = rec["rm"]["t"] * rec["rm"]["g"]
    gc_metal = rec["gc"]["t"] * rec["gc"]["g"]
    dl_metal = rec["delivered"]["t"] * rec["delivered"]["g"]
    mill_metal = rec["mill"]["t"] * rec["mill"]["g"]
    f1 = {"t": rec["gc"]["t"] / rec["rm"]["t"], "g": rec["gc"]["g"] / rec["rm"]["g"], "m": gc_metal / rm_metal}
    f2 = {"t": rec["mill"]["t"] / rec["delivered"]["t"], "g": rec["mill"]["g"] / rec["delivered"]["g"], "m": mill_metal / dl_metal}
    f3 = {k: f1[k] * f2[k] for k in ("t", "g", "m")}
    return {"F1": f1, "F2": f2, "F3": f3}
