"""Builds every dataset the console reads. Run from the repository root:

    python3 projects/17-copper-mine-operations/pipeline/build.py

The run is seeded and deterministic and uses only the Python standard library.
It takes about two minutes, mostly for block kriging. ``--cache FILE`` keeps the estimation
results between runs while working on the later stages.
"""

from __future__ import annotations

import csv
import json
import math
import os
import random
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

from pipeline import deposit as dp, economics as ec, operations as ops, pit, qaqc, resource as rs  # noqa: E402
from pipeline.model import Ridge, metrics, time_series_cv  # noqa: E402

OUT = os.path.join(os.path.dirname(HERE), "data")
REVENUE_FACTORS = [round(0.4 + 0.1 * i, 1) for i in range(11)]       # 0.4 .. 1.4
RPEEE_RF = 1.3
REPORT_CUTOFF = 0.18
DISCOUNT = 0.08


def log(msg, t0=[time.time()]):
    print(f"[{time.time() - t0[0]:6.1f} s] {msg}", flush=True)


def r(v, n=4):
    return None if v is None else round(v, n)


def shells_for(blocks, prec, forb, include_inferred):
    shells = {}
    for rf in REVENUE_FACTORS:
        values = []
        for b in blocks:
            usable = b["cls"] <= (2 if include_inferred else 1)
            values.append(ec.block_value(b["tonnes"], b["cu"] if usable else 0.0, max(b["domain"], 0), b["k"], rf))
        shells[rf] = pit.max_closure(values, prec, forb)
    return shells


def inventory(blocks, ids):
    ore = [blocks[i] for i in ids if ec.is_ore(blocks[i]["cu"], blocks[i]["domain"]) and blocks[i]["cls"] <= 1]
    total = sum(blocks[i]["tonnes"] for i in ids)
    ore_t = sum(b["tonnes"] for b in ore)
    metal = sum(b["tonnes"] * b["cu"] for b in ore)
    value = sum(ec.block_value(blocks[i]["tonnes"], blocks[i]["cu"] if blocks[i]["cls"] <= 1 else 0.0,
                               max(blocks[i]["domain"], 0), blocks[i]["k"]) for i in ids)
    return {"total": total, "ore": ore_t, "waste": total - ore_t, "cu": metal / ore_t if ore_t else 0.0,
            "copper": metal / 100, "strip": (total - ore_t) / ore_t if ore_t else 0.0, "value": value}


def discounted(blocks, order, rate_tpy):
    """Indicative NPV of mining ``order`` at a constant movement rate (values at the base price)."""
    npv = cum = 0.0
    for i in order:
        b = blocks[i]
        cum += b["tonnes"]
        v = ec.block_value(b["tonnes"], b["cu"] if b["cls"] <= 1 else 0.0, max(b["domain"], 0), b["k"])
        npv += v / (1 + DISCOUNT) ** (cum / rate_tpy)
    return npv


def write_json(name, data):
    with open(os.path.join(OUT, name), "w") as f:
        json.dump(data, f, separators=(",", ":"))
    log(f"wrote data/{name} ({os.path.getsize(os.path.join(OUT, name)) / 1024:.0f} KB)")


def main():
    os.makedirs(OUT, exist_ok=True)
    cache = sys.argv[sys.argv.index("--cache") + 1] if "--cache" in sys.argv else None
    if cache and os.path.exists(cache):
        import pickle
        with open(cache, "rb") as f:
            holes, assays, comps, capping, vario, blocks, surfaces, validation = pickle.load(f)
        log("loaded estimation results from cache")
    else:
        deposit = dp.Deposit(17)
        rng = random.Random(2024)
        holes = dp.plan_drilling(rng)
        assays = dp.sample_holes(deposit, holes, rng)
        comps = dp.bench_composites(assays)
        log(f"{len(holes)} drillholes, {len(assays)} assays, {len(comps)} bench composites")
        capping = rs.cap_grades(comps)
        vario = rs.variography(comps)
        log("variograms fitted")
        blocks, surfaces = rs.build_block_model(deposit, comps, assays, holes, vario)
        log(f"{len(blocks)} blocks estimated")
        validation = rs.validation(blocks, comps, vario)
        log("validation done")

        if cache:
            import pickle
            with open(cache, "wb") as f:
                pickle.dump((holes, assays, comps, capping, vario, blocks, surfaces, validation), f)

    prec, forb = pit.grid_precedence(dp.NX, dp.NY, dp.NZ)
    plan_shells = shells_for(blocks, prec, forb, include_inferred=False)
    for a, b in zip(REVENUE_FACTORS, REVENUE_FACTORS[1:]):
        assert plan_shells[a] <= plan_shells[b], f"shells {a} and {b} are not nested"
    rpeee = shells_for(blocks, prec, forb, include_inferred=True)[RPEEE_RF]
    log("pit shells optimised")

    phase_lists = ops.phases(blocks, plan_shells)
    lom = ops.life_of_mine(blocks, phase_lists)
    order = lom["order"]
    year = ops.operating_year(blocks, lom)
    log(f"life of mine {lom['years']:.1f} years at {lom['movementTpy'] / 1e6:.1f} Mt/y moved")
    qc = qaqc.run(assays)
    log("QA/QC done")

    # ---------------- block model for the browser ----------------
    shell_index = [-1] * len(blocks)
    for n, rf in reversed(list(enumerate(REVENUE_FACTORS))):
        for i in plan_shells[rf]:
            shell_index[i] = n
    model = {
        "grid": {"x0": dp.X0, "y0": dp.Y0, "nx": dp.NX, "ny": dp.NY, "nz": dp.NZ, "dx": dp.DX, "dy": dp.DY, "dz": dp.DZ, "zTop": dp.Z_TOP},
        "density": [dp.DENSITY[d] for d in range(3)],
        "revenueFactors": REVENUE_FACTORS,
        "blocks": {
            "domain": [b["domain"] for b in blocks],
            "cu": [round(b["cu"] * 1000) for b in blocks],              # 0.001 % Cu
            "cls": [b["cls"] for b in blocks],
            "shell": shell_index,
            "rpeee": [1 if i in rpeee else 0 for i in range(len(blocks))],
            "frac": [round(b["fraction"] * 100) for b in blocks],
            "phase": [b.get("phase", 0) for b in blocks],
        },
        "topography": [[round(surfaces[(i, j)][2], 1) for i in range(dp.NX)] for j in range(dp.NY)],
        "holes": [{"id": h.hole_id, "x": h.x, "y": h.y, "z": h.z, "azimuth": h.azimuth, "dip": h.dip,
                   "length": h.length, "year": h.year, "purpose": h.purpose} for h in holes],
        "composites": [[round(c["x"], 1), round(c["y"], 1), round(c["z"], 1), round(c["cu"], 3), c["domain"], c["hole"]] for c in comps],
    }
    write_json("block-model.json", model)

    # ---------------- resource ----------------
    def gt_curve(key, ids):
        rows = []
        pts = [(blocks[i][key], blocks[i]["tonnes"]) for i in ids if blocks[i]["domain"] > 0]
        for c in [0.02 * n for n in range(41)]:
            sel = [(g, t) for g, t in pts if g >= c]
            t = sum(t for _, t in sel)
            rows.append({"cutoff": round(c, 2), "tonnes": t, "grade": sum(g * t for g, t in sel) / t if t else None})
        return rows
    estimated = [i for i in rpeee if blocks[i]["cls"] <= 2]
    statement = []
    for cls in range(3):
        sel = [blocks[i] for i in rpeee if blocks[i]["cls"] == cls and blocks[i]["domain"] > 0 and blocks[i]["cu"] >= REPORT_CUTOFF]
        t = sum(b["tonnes"] for b in sel)
        statement.append({"class": rs.CLASSES[cls], "tonnes": t, "cu": sum(b["tonnes"] * b["cu"] for b in sel) / t if t else 0,
                          "byDomain": {dp.DOMAINS[d]: sum(b["tonnes"] for b in sel if b["domain"] == d) for d in (1, 2)}})
    resource = {
        "reportCutoff": REPORT_CUTOFF, "rpeeeRevenueFactor": RPEEE_RF,
        "economics": ec.PARAMS,
        "cutoffs": {d: ec.cutoff_grade(ec.PARAMS["copperPrice"], ec.PARAMS["sellingCost"], ec.PARAMS["recovery"][d],
                                       ec.PARAMS["processingCost"], ec.PARAMS["gaCost"]) for d in ("supergene", "hypogene")},
        "classification": {"measured": {"slope": rs.MEASURED_SOR, "holes": rs.MEASURED_HOLES, "distance": rs.MEASURED_DISTANCE},
                           "indicated": {"slope": rs.INDICATED_SOR, "distance": rs.INDICATED_DISTANCE}},
        "statement": statement,
        "gradeTonnage": {"model": gt_curve("cu", estimated), "truth": gt_curve("true_cu", estimated)},
        "capping": {dp.DOMAINS[d]: v for d, v in capping.items()},
        "variography": {dp.DOMAINS[d]: {
            "n": v["n"], "holes": v["holes"], "mean": v["mean"], "variance": v["variance"], "model": v["model"].to_dict(),
            "verticalAssumed": v["verticalAssumed"],
            "horizontal": [{k: r(p[k], 5) for k in ("h", "gamma")} | {"pairs": p["pairs"]} for p in v["horizontal"]],
            "downhole": [{k: r(p[k], 5) for k in ("h", "gamma")} | {"pairs": p["pairs"]} for p in v["downhole"]],
        } for d, v in vario.items()},
        "validation": validation,
        "search": {"maxSamples": rs.MAX_SAMPLES, "maxPerHole": rs.MAX_PER_HOLE, "minSamples": rs.MIN_SAMPLES},
    }
    # pit-by-pit
    pit_rows = []
    final = plan_shells[1.0]
    for rf in REVENUE_FACTORS:
        inv = inventory(blocks, plan_shells[rf])
        shell_order = sorted(plan_shells[rf], key=lambda i: (shell_index[i], blocks[i]["k"]))
        bench_order = sorted(plan_shells[rf], key=lambda i: blocks[i]["k"])
        inv["npvBest"] = discounted(blocks, shell_order, lom["movementTpy"])
        inv["npvWorst"] = discounted(blocks, bench_order, lom["movementTpy"])
        inv["rf"] = rf
        inv["price"] = round(ec.PARAMS["copperPrice"] * rf, 2)
        pit_rows.append(inv)
    resource["pitByPit"] = pit_rows
    resource["finalPit"] = {"rf": 1.0, **inventory(blocks, final),
                            "phases": [inventory(blocks, [i for i in order if blocks[i]["phase"] == p]) for p in (1, 2, 3)],
                            "deepestBench": max(blocks[i]["k"] for i in final)}
    write_json("resource.json", resource)

    # ---------------- recovery model ----------------
    days = year["daily"]
    feature_names = ["logHead", "p80", "oxide", "collector", "phDev2", "supergene", "bwi"]
    def features(x):
        return [math.log(x["head"]), x["p80"], x["ox"], x["collector"], (x["ph"] - 10.4) ** 2, x["supergene"], x["bwi"]]
    split = next(i for i, x in enumerate(days) if x["month"] == ops.YEAR_LAST - 2)
    X = [features(x) for x in days]
    y = [x["recovery"] for x in days]
    cv = time_series_cv(X[:split], y[:split], [0.01, 0.1, 1.0, 3.0, 10.0, 30.0])
    alpha = min(cv, key=cv.get)
    ridge = Ridge(alpha).fit(X[:split], y[:split])
    pred = ridge.predict(X[split:])
    mean_train = sum(y[:split]) / split
    planning = [100 * (0.89 - 0.05 * x["supergene"]) for x in days[split:]]
    recovery_model = {
        "features": feature_names, "alpha": alpha, "cv": {str(k): v for k, v in cv.items()},
        "intercept": ridge.intercept, "coef": ridge.coef, "mu": ridge.mu, "sd": ridge.sd,
        "trainDays": split, "testDays": len(days) - split, "testFrom": days[split]["date"],
        "metrics": {"model": metrics(y[split:], pred), "planning": metrics(y[split:], planning),
                    "mean": metrics(y[split:], [mean_train] * len(pred))},
        "train": metrics(y[:split], ridge.predict(X[:split])),
    }
    daily_out = [{"date": x["date"], "tonnes": round(x["tonnes"]), "runtime": r(x["runtime"], 3), "tph": round(x["tph"]),
                  "head": r(x["head"], 4), "p80": round(x["p80"], 1), "oxide": r(x["ox"], 4), "collector": round(x["collector"], 1),
                  "ph": round(x["ph"], 2), "supergene": r(x["supergene"], 3), "bwi": round(x["bwi"], 2),
                  "recovery": round(x["recovery"], 2), "copper": round(x["copper"], 1),
                  "predicted": round(ridge.predict_one(features(x)), 2)} for x in days]

    annual = {}
    for mo in lom["months"]:
        yr = ops.START_YEAR + mo["month"] // 12
        a = annual.setdefault(yr, {"year": yr, "moved": 0.0, "ore": 0.0, "feed": 0.0, "metal": 0.0})
        a["moved"] += mo["moved"]
        a["ore"] += mo["ore"]
        a["feed"] += mo["feed"]
        a["metal"] += mo["feed"] * mo["feedCu"]
    for a in annual.values():
        a["feedCu"] = a["metal"] / a["feed"] if a["feed"] else 0
        a["waste"] = a["moved"] - a["ore"]
        del a["metal"]

    operations = {
        "start": "2024-01", "year": {"from": ops.month_label(ops.YEAR_FIRST), "to": ops.month_label(ops.YEAR_LAST)},
        "millTpy": ops.MILL_TPY, "movementTpy": lom["movementTpy"], "lifeYears": lom["years"],
        "annual": list(annual.values()),
        "months": [{**m, "factors": ops.f_factors(m["reconciliation"])} for m in year["months"]],
        "fleet": [{"label": f["label"], "depth": f["depth"], "hauled": f["hauled"], "cycle": f["cycle"],
                   "trucks": [{k: (round(v, 4) if isinstance(v, float) else v) for k, v in t.items()} for t in f["trucks"]]}
                  for f in year["fleet"]],
        "payload": year["payload"], "nominalPayload": ops.TRUCK_PAYLOAD,
        "recoveryModel": recovery_model, "daily": daily_out,
    }
    write_json("operations.json", operations)
    write_json("qaqc.json", qc)

    # ---------------- downloadable CSV files ----------------
    with open(os.path.join(OUT, "collars.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["hole_id", "easting", "northing", "elevation", "azimuth", "dip", "length_m", "year", "purpose"])
        for h in holes:
            w.writerow([h.hole_id, h.x, h.y, h.z, h.azimuth, h.dip, h.length, h.year, h.purpose])
    with open(os.path.join(OUT, "assays.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["hole_id", "from_m", "to_m", "cu_pct", "ascu_pct", "domain"])
        for a in assays:
            w.writerow([a["hole_id"], a["from"], a["to"], a["cu"], a["ascu"], dp.DOMAINS[a["domain"]]])
    with open(os.path.join(OUT, "plant-daily.csv"), "w", newline="") as f:
        w = csv.writer(f)
        keys = ["date", "tonnes", "runtime", "tph", "head", "p80", "oxide", "collector", "ph", "supergene", "bwi", "recovery", "copper"]
        w.writerow(keys)
        for x in daily_out:
            w.writerow([x[k] for k in keys])
    log("wrote CSV files")


if __name__ == "__main__":
    main()
