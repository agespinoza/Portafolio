// Pure calculations used by the console (no DOM). The same formulas as the Python
// pipeline; mine.test.mjs checks that both give identical results on the published data.

export const LB_PER_TONNE = 2204.62;
export const DOMAINS = ['leached', 'supergene', 'hypogene'];
export const CLASSES = ['measured', 'indicated', 'inferred', 'unclassified'];

/** Cut-off grade (% Cu) at which a tonne's revenue pays its costs. mining = 0 gives the marginal cut-off. */
export function cutoffGrade({ price, selling, recovery, processing, ga, mining = 0 }) {
    const marginPerPercent = (price - selling) * recovery * LB_PER_TONNE / 100;
    return (processing + ga + mining) / marginPerPercent;
}

/** Expands the compact block model into typed arrays with tonnages. */
export function decodeBlocks(model) {
    const { grid, density, blocks } = model;
    const n = blocks.cu.length;
    const volume = grid.dx * grid.dy * grid.dz;
    const tonnes = new Float64Array(n);
    const cu = new Float64Array(n);
    for (let i = 0; i < n; i++) {
        const d = blocks.domain[i];
        tonnes[i] = d < 0 ? 0 : volume * blocks.frac[i] / 100 * density[d];
        cu[i] = blocks.cu[i] / 1000;
    }
    return { grid, n, tonnes, cu, domain: blocks.domain, cls: blocks.cls, shell: blocks.shell, rpeee: blocks.rpeee, phase: blocks.phase };
}

export const blockIndex = (grid, i, j, k) => (k * grid.ny + j) * grid.nx + i;

/** Tonnes and grade above a cut-off, by resource class, for blocks inside the RPEEE shell. */
export function resourceStatement(b, cutoff) {
    const rows = [0, 1, 2].map(cls => ({ cls: CLASSES[cls], tonnes: 0, metal: 0 }));
    for (let i = 0; i < b.n; i++) {
        if (!b.rpeee[i] || b.domain[i] <= 0 || b.cls[i] > 2 || b.cu[i] < cutoff) continue;
        rows[b.cls[i]].tonnes += b.tonnes[i];
        rows[b.cls[i]].metal += b.tonnes[i] * b.cu[i];
    }
    return rows.map(r => ({ ...r, cu: r.tonnes ? r.metal / r.tonnes : 0, copper: r.metal / 100 }));
}

/** The nested pit shell that corresponds to a copper price (nearest revenue factor). */
export function shellForPrice(price, basePrice, revenueFactors) {
    const rf = price / basePrice;
    let best = 0;
    revenueFactors.forEach((f, n) => { if (Math.abs(f - rf) < Math.abs(revenueFactors[best] - rf)) best = n; });
    return best;
}

/** A block is inside shell n when its smallest containing shell index is <= n. */
export const inShell = (b, i, n) => b.shell[i] >= 0 && b.shell[i] <= n;

/** Flotation recovery (%) predicted by the published ridge model. */
export function predictRecovery(model, x) {
    const values = {
        logHead: Math.log(x.head), p80: x.p80, oxide: x.oxide, collector: x.collector,
        phDev2: (x.ph - 10.4) ** 2, supergene: x.supergene, bwi: x.bwi,
    };
    return model.features.reduce((sum, f, n) => sum + model.coef[n] * (values[f] - model.mu[n]) / model.sd[n], model.intercept);
}

/** Share of time per ASARCO category for a set of truck-month records. */
export function fleetTotals(trucks) {
    const sum = key => trucks.reduce((s, t) => s + t[key], 0);
    const calendar = sum('calendar');
    const available = calendar - sum('scheduled') - sum('unscheduled');
    return {
        availability: available / calendar,
        useOfAvailability: (available - sum('standby')) / available,
        utilization: sum('operating') / calendar,
        tonnes: sum('tonnes'),
        productivity: sum('tonnes') / sum('operating'),
    };
}
