"""Assay quality control: certified reference materials (CRMs), blanks and field duplicates.

Every laboratory batch of 40 drill samples carries two CRMs, one blank and one
field duplicate. The rules follow common industry practice:

* **CRM**: a result beyond 3 standard deviations fails the batch; two
  consecutive results of the same CRM beyond 2 SD on the same side also fail it.
* **Blank**: a result above 0.005 % Cu (five times the 0.001 % detection limit)
  points to contamination and fails the batch.
* **Duplicates**: at least 90 % of pairs should agree within 10 % HARD
  (half absolute relative difference).

Failed batches are re-assayed. The pass rates reported are for the first assay.
"""

from __future__ import annotations

import math
import random
from typing import Dict, List

from .linalg import mean

BATCH_SIZE = 40
CRMS = {
    "CRM-LG": {"certified": 0.285, "sd": 0.009},
    "CRM-MG": {"certified": 0.612, "sd": 0.016},
    "CRM-HG": {"certified": 1.204, "sd": 0.028},
}
BLANK_LIMIT = 0.005
HARD_LIMIT = 0.10
DRIFT_BATCHES = range(118, 134)      # a calibration drift at the laboratory, caught by the CRMs
DRIFT = 0.024


def run(assays: List[dict], seed: int = 31) -> dict:
    rng = random.Random(seed)
    n_batches = math.ceil(len(assays) / BATCH_SIZE)
    crm_rows: Dict[str, List[dict]] = {k: [] for k in CRMS}
    blanks, duplicates, failed = [], [], {}
    swap_batches = {41, 167}
    contamination_batch = 87
    for b in range(1, n_batches + 1):
        batch = assays[(b - 1) * BATCH_SIZE: b * BATCH_SIZE]
        bias = DRIFT if b in DRIFT_BATCHES else rng.gauss(0, 0.002)
        names = rng.sample(sorted(CRMS), 2)
        for slot, name in enumerate(names):
            c = CRMS[name]
            value = c["certified"] * (1 + bias) + rng.gauss(0, c["sd"])
            if b in swap_batches and slot == 0:            # sample swap: the wrong CRM sachet was inserted
                other = next(n for n in CRMS if n != name)
                value = CRMS[other]["certified"] + rng.gauss(0, CRMS[other]["sd"])
            z = (value - c["certified"]) / c["sd"]
            crm_rows[name].append({"batch": b, "value": round(value, 4), "z": round(z, 2)})
        high_before = max(a["cu"] for a in batch) if batch else 0
        blank = abs(rng.gauss(0.0006, 0.0003))
        if b == contamination_batch:
            blank = 0.021                                   # carry-over after a high-grade sample
        blanks.append({"batch": b, "value": round(blank, 4), "previousMax": round(high_before, 3)})
        if blank > BLANK_LIMIT:
            failed.setdefault(b, []).append("blank")
        if batch:
            orig = rng.choice(batch)
            dup = max(0.003, orig["cu"] * math.exp(rng.gauss(0, 0.085)))
            hard = abs(orig["cu"] - dup) / (orig["cu"] + dup)
            duplicates.append({"batch": b, "original": orig["cu"], "duplicate": round(dup, 4), "hard": round(hard, 4)})

    # Westgard-style rules for each CRM in batch order
    for name, rows in crm_rows.items():
        prev = None
        for r in rows:
            status = "pass"
            if abs(r["z"]) > 3:
                status = "fail"
            elif abs(r["z"]) > 2:
                status = "warning"
                if prev and abs(prev["z"]) > 2 and (prev["z"] > 0) == (r["z"] > 0):
                    status = "fail"
            r["status"] = status
            if status == "fail":
                failed.setdefault(r["batch"], []).append(name)
            prev = r

    crm_summary = {}
    for name, rows in crm_rows.items():
        values = [r["value"] for r in rows]
        crm_summary[name] = {
            **CRMS[name], "n": len(rows), "mean": mean(values),
            "bias": mean(values) / CRMS[name]["certified"] - 1,
            "passRate": sum(r["status"] != "fail" for r in rows) / len(rows),
        }
    within = sum(d["hard"] <= HARD_LIMIT for d in duplicates) / len(duplicates)
    return {
        "batches": n_batches, "batchSize": BATCH_SIZE,
        "crms": {name: {"summary": crm_summary[name], "results": rows} for name, rows in crm_rows.items()},
        "blanks": {"limit": BLANK_LIMIT, "results": blanks, "failures": sum(b["value"] > BLANK_LIMIT for b in blanks)},
        "duplicates": {"limit": HARD_LIMIT, "withinLimit": within, "pairs": duplicates},
        "failedBatches": [{"batch": b, "causes": c, "action": "re-assayed"} for b, c in sorted(failed.items())],
        "drift": {"from": DRIFT_BATCHES.start, "to": DRIFT_BATCHES.stop - 1, "bias": DRIFT},
    }
