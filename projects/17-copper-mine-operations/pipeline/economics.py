"""Economic parameters, block values and cut-off grades. All costs in US dollars."""

from __future__ import annotations

LB_PER_TONNE = 2204.62

PARAMS = {
    "copperPrice": 4.10,        # $/lb Cu, long-term planning price
    "sellingCost": 0.48,        # $/lb Cu: treatment and refining charges, freight, royalty
    "processingCost": 10.60,     # $/t milled: crushing, grinding, flotation, tailings
    "gaCost": 1.90,             # $/t milled: general and administrative
    "miningCost": 2.25,         # $/t moved at the pit rim
    "miningCostPerBench": 0.05, # $/t added per bench of depth (longer hauls)
    "recovery": {"leached": 0.45, "supergene": 0.84, "hypogene": 0.89},
}
DOMAIN_KEYS = ("leached", "supergene", "hypogene")


def cutoff_grade(price: float, selling: float, recovery: float, processing: float, ga: float,
                 mining: float = 0.0) -> float:
    """Cut-off grade in % Cu at which the revenue of a tonne pays its costs.

    With ``mining = 0`` this is the marginal (in-pit) cut-off used to send material that must be
    mined anyway to the mill or the waste dump; including the mining cost gives the break-even cut-off.
    """
    margin_per_percent = (price - selling) * recovery * LB_PER_TONNE / 100.0
    return (processing + ga + mining) / margin_per_percent


def mining_cost(bench: int, p: dict = PARAMS) -> float:
    return p["miningCost"] + p["miningCostPerBench"] * max(0, bench - 1)


def block_value(tonnes: float, cu: float, domain: int, bench: int, revenue_factor: float = 1.0,
                p: dict = PARAMS) -> float:
    """Undiscounted value of a block: the better of milling it or sending it to the dump."""
    if tonnes <= 0:
        return 0.0
    rec = p["recovery"][DOMAIN_KEYS[domain]]
    revenue = cu / 100.0 * LB_PER_TONNE * rec * (p["copperPrice"] * revenue_factor - p["sellingCost"])
    mine = mining_cost(bench, p)
    as_ore = revenue - p["processingCost"] - p["gaCost"] - mine
    return tonnes * max(as_ore, -mine)


def is_ore(cu: float, domain: int, p: dict = PARAMS) -> bool:
    """Marginal cut-off decision for material inside the pit."""
    rec = p["recovery"][DOMAIN_KEYS[domain]]
    return domain > 0 and cu >= cutoff_grade(p["copperPrice"], p["sellingCost"], rec, p["processingCost"], p["gaCost"])
