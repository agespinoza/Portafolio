// Screening-model drift engine. No user interface and no imports, so the browser console and the
// automated tests (engine.test.mjs) run exactly the same code.
//
// Setting: each quarter a model scores simulated cattle herds and flags the ones that should get a confirmatory
// TB test. A herd's score is drawn from a normal distribution: mean 0 when the herd is clean and `separation`
// when it is infected, standard deviation 1. The share of infected herds each quarter comes from a real
// public series; the herds themselves are simulated.
//
// Three ways to react when that share changes (label shift: the mix of herds changes, not what an infected
// herd looks like):
//   keep      never touch the flagging threshold,
//   unlabeled estimate the new share from how many herds the model flags (Lipton et al. 2018, black box
//             shift estimation) and re-tune the threshold at once,
//   labeled   wait for confirmed results, which arrive `labelDelay` quarters late, then re-tune,
// and `oracle`, which always knows the true share (the best any re-tuning could do with this test).

export const POLICIES = ['keep', 'unlabeled', 'labeled', 'oracle'];

export const DEFAULTS = {
    /** Distance between the mean scores of infected and clean herds, in standard deviations. */
    separation: 2,
    /** Cost of an infected herd that is not flagged, and of a clean herd that is flagged. */
    costMiss: 20,
    costFalse: 1,
    /** Cost of one threshold re-tune. */
    costRetune: 10,
    /** Quarters before confirmed results are known. */
    labelDelay: 1,
    /** Herds scored per quarter, before the volume adjustment. */
    batch: 1500,
    /** Scale the herds scored each quarter by the real cattle flow. */
    volumeScale: true,
    /** Relative change in the estimated share that triggers a re-tune. */
    margin: 0.3,
    /** Quarters at the start used to set the first threshold. */
    trainQuarters: 4,
    /** Quarters of flagged-share estimates averaged before the unlabeled policy acts. */
    smooth: 3,
    /** What-if: multiply the real change in the share of infected herds (1 keeps the real series). */
    amplify: 1,
    /** Quarter index where the test itself changes (null for never) and by how much the separation moves. */
    protocolAt: null,
    protocolDelta: 0.6,
};

// ---------- random numbers and the normal distribution ----------

export function makeRng(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const normal = rng => Math.sqrt(-2 * Math.log(Math.max(rng(), 1e-12))) * Math.cos(2 * Math.PI * rng());

/** Standard normal CDF (Abramowitz and Stegun 7.1.26, error below 1.5e-7). */
export function cdf(x) {
    const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
    const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
    const erf = 1 - poly * Math.exp(-(x * x) / 2);
    return 0.5 * (1 + (x >= 0 ? erf : -erf));
}

// ---------- the decision rule ----------

const clampShare = p => Math.min(0.5, Math.max(1e-4, p));

/** The threshold that minimizes expected cost when a share `p` of herds is infected. */
export function threshold(p, separation, costMiss, costFalse) {
    const share = clampShare(p);
    return separation / 2 + Math.log(((1 - share) * costFalse) / (share * costMiss)) / separation;
}

/** Sensitivity and false-positive rate of a threshold, for a given separation. */
export const rates = (tau, separation) => ({ tpr: 1 - cdf(tau - separation), fpr: 1 - cdf(tau) });

/** Black box shift estimate of the infected share from the flagged share q (undefined if the rates are too close). */
export function estimateShare(q, tau, separation) {
    const { tpr, fpr } = rates(tau, separation);
    return tpr - fpr < 0.05 ? null : clampShare((q - fpr) / (tpr - fpr));
}

// ---------- simulation ----------

const median = values => { const s = [...values].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

/** Herds scored in each quarter: constant, or scaled by the cattle flow relative to its median. */
export function batchSizes(volume, config) {
    if (!config.volumeScale) return volume.map(() => config.batch);
    const typical = median(volume.filter(v => v > 0)) || 1;
    return volume.map(v => (v > 0 ? Math.round(config.batch * Math.min(2, v / typical)) : 0));
}

/** Makes the real change from the starting level `k` times larger (or smaller), keeping shares between 0.03% and 50%. */
export function amplify(prevalence, k, trainQuarters = DEFAULTS.trainQuarters) {
    const start = prevalence.slice(0, trainQuarters).reduce((a, b) => a + b, 0) / trainQuarters;
    return prevalence.map(p => Math.min(0.5, Math.max(0.0003, start + k * (p - start))));
}

function drawQuarters(prevalence, sizes, config, rng) {
    return prevalence.map((p, t) => {
        const separation = config.separation + (config.protocolAt !== null && t >= config.protocolAt ? config.protocolDelta : 0);
        const scores = [], infected = [];
        for (let i = 0; i < sizes[t]; i++) {
            const sick = rng() < p ? 1 : 0;
            infected.push(sick);
            scores.push(normal(rng) + sick * separation);
        }
        return { scores, infected, separation };
    });
}

/**
 * Runs every policy over one simulated sequence of quarters.
 * @param {number[]} real share of infected herds per quarter (real data; see `amplify` in the config)
 * @param {number[]} volume cattle flow per quarter, same length (real data)
 */
export function simulate(real, volume, config = {}, seed = 1) {
    const c = { ...DEFAULTS, ...config };
    const prevalence = amplify(real, c.amplify, c.trainQuarters);
    const sizes = batchSizes(volume, c);
    const quarters = drawQuarters(prevalence, sizes, c, makeRng(seed * 7919 + 13));
    const reference = prevalence.slice(0, c.trainQuarters).reduce((a, b) => a + b, 0) / c.trainQuarters;
    const first = threshold(reference, c.separation, c.costMiss, c.costFalse);
    const result = {};

    for (const policy of POLICIES) {
        let tau = first, used = reference, retunes = 0, total = 0;
        const flaggedShare = [], estimates = [];
        const steps = quarters.map((quarter, t) => {
            const n = quarter.scores.length;
            let tp = 0, fp = 0, fn = 0, tn = 0;
            quarter.scores.forEach((s, i) => {
                const flag = s > tau;
                if (quarter.infected[i]) { if (flag) tp++; else fn++; } else if (flag) fp++; else tn++;
            });
            const retuneNow = tauNew => { tau = tauNew; retunes++; total += c.costRetune; };
            const cost = fn * c.costMiss + fp * c.costFalse;
            total += cost;

            // What the team can know at the end of this quarter, and the threshold it would set for the next.
            const q = n ? (tp + fp) / n : null;
            const estimate = q === null ? null : estimateShare(q, tau, c.separation);
            if (q !== null) flaggedShare.push(q);
            estimates.push({ value: estimate, herds: n });

            let next = null;
            if (policy === 'oracle') next = prevalence[Math.min(t + 1, prevalence.length - 1)];
            if (policy === 'unlabeled' && estimate !== null) {
                const recent = estimates.slice(-c.smooth).filter(e => e.value !== null);
                const herds = recent.reduce((a, e) => a + e.herds, 0);
                // Weighted by herds scored, and never more than three times away from the level in use.
                const pooled = recent.reduce((a, e) => a + e.value * e.herds, 0) / herds;
                next = Math.min(used * 3, Math.max(used / 3, pooled));
            }
            if (policy === 'labeled') {
                const known = quarters.slice(Math.max(0, t - c.labelDelay - 1), t - c.labelDelay + 1).filter(k => k.scores.length);
                const herds = known.reduce((a, k) => a + k.scores.length, 0);
                if (herds) next = known.reduce((a, k) => a + k.infected.reduce((x, y) => x + y, 0), 0) / herds;
            }
            let retuned = false;
            if (next !== null) {
                const gap = Math.abs(next - used);
                if (gap / used > c.margin && gap > 0.001) {
                    retuneNow(threshold(next, c.separation, c.costMiss, c.costFalse));
                    used = next;
                    retuned = true;
                }
            }
            return {
                t, herds: n, prevalence: prevalence[t], estimate, tau, tp, fp, fn, tn, cost, retuned,
                ppv: tp + fp ? tp / (tp + fp) : null, missRate: tp + fn ? fn / (tp + fn) : null, cumulative: total,
            };
        });
        result[policy] = { steps, retunes, total, flaggedShare };
    }
    return result;
}

// ---------- many simulated sequences ----------

const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];

/** Mean and 10th–90th percentile of the total cost of each policy over `runs` seeds. */
export function compare(prevalence, volume, config = {}, runs = 30) {
    const totals = Object.fromEntries(POLICIES.map(p => [p, []]));
    const retunes = Object.fromEntries(POLICIES.map(p => [p, 0]));
    for (let seed = 1; seed <= runs; seed++) {
        const run = simulate(prevalence, volume, config, seed);
        for (const p of POLICIES) { totals[p].push(run[p].total); retunes[p] += run[p].retunes; }
    }
    return Object.fromEntries(POLICIES.map(p => {
        const sorted = [...totals[p]].sort((a, b) => a - b);
        return [p, { mean: totals[p].reduce((a, b) => a + b, 0) / runs, p10: quantile(sorted, 0.1), p90: quantile(sorted, 0.9), retunes: retunes[p] / runs }];
    }));
}

/** Longest run of the real series that has data: Ireland's series ends before the UK's. */
export function usableLength(values) {
    let n = values.length;
    while (n > 0 && (values[n - 1] === null || values[n - 1] === undefined)) n--;
    return n;
}
