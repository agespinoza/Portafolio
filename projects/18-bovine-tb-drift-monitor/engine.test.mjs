// Run from the repository root:  node --test projects/18-bovine-tb-drift-monitor/engine.test.mjs   (Node 20 or later)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEFAULTS, POLICIES, amplify, batchSizes, cdf, compare, estimateShare, rates, simulate, threshold, usableLength } from './engine.js';

const flat = (value, n = 40) => Array.from({ length: n }, () => value);
const steady = flat(1000);
const mean = values => values.reduce((a, b) => a + b, 0) / values.length;

test('the normal CDF matches known values', () => {
    assert.ok(Math.abs(cdf(0) - 0.5) < 1e-6);
    assert.ok(Math.abs(cdf(1.96) - 0.975) < 1e-4);
    assert.ok(Math.abs(cdf(-1) - 0.158655) < 1e-4);
});

test('the same seed gives the same simulation', () => {
    const a = simulate(flat(0.05), steady, {}, 4);
    const b = simulate(flat(0.05), steady, {}, 4);
    assert.deepEqual(a.keep.steps.map(s => s.cost), b.keep.steps.map(s => s.cost));
    assert.deepEqual(a.unlabeled.steps.map(s => s.tau), b.unlabeled.steps.map(s => s.tau));
});

test('the threshold rises when infection gets rarer and falls when a miss gets more costly', () => {
    assert.ok(threshold(0.01, 2, 20, 1) > threshold(0.1, 2, 20, 1));
    assert.ok(threshold(0.05, 2, 50, 1) < threshold(0.05, 2, 5, 1));
});

test('the flagged-share estimate recovers the true share when the test has not changed', () => {
    const run = simulate(flat(0.06, 60), flat(1000, 60), { volumeScale: false, batch: 2000 }, 3);
    const estimates = run.keep.steps.map(s => s.estimate).filter(v => v !== null);
    assert.ok(Math.abs(mean(estimates) - 0.06) / 0.06 < 0.1);
});

test('after the share of infected herds falls, re-tuning beats keeping the old threshold', () => {
    const falling = [...flat(0.12, 12), ...flat(0.02, 28)];
    const result = compare(falling, steady, { volumeScale: false }, 20);
    assert.ok(result.unlabeled.mean < result.keep.mean);
    assert.ok(result.oracle.mean <= result.keep.mean);
});

test('a longer label delay makes label-based re-tuning cost more', () => {
    const rising = [...flat(0.02, 12), ...flat(0.1, 28)];
    const fast = compare(rising, steady, { volumeScale: false, labelDelay: 0 }, 20).labeled.mean;
    const slow = compare(rising, steady, { volumeScale: false, labelDelay: 6 }, 20).labeled.mean;
    assert.ok(slow > fast);
});

test('a less sensitive test biases the flagged-share estimate downward', () => {
    const config = { volumeScale: false, batch: 2000, protocolAt: 20, protocolDelta: -1 };
    const steps = simulate(flat(0.06, 40), flat(1000, 40), config, 2).keep.steps;
    const error = from => mean(steps.slice(from, from + 20).map(s => Math.abs(s.estimate - 0.06)));
    assert.ok(error(20) > 2 * error(0));
});

test('quarters with no cattle flow score no herds and cost nothing', () => {
    const volume = [...flat(1000, 10), 0, 0, ...flat(1000, 10)];
    const run = simulate(flat(0.05, 22), volume, {}, 1);
    for (const policy of POLICIES) {
        for (const step of run[policy].steps.slice(10, 12)) { assert.equal(step.herds, 0); assert.equal(step.cost, 0); }
    }
    assert.deepEqual(batchSizes([0, 500, 1000, 5000], { ...DEFAULTS, volumeScale: true }).slice(0, 2), [0, 750]);
});

test('amplifying scales the change from the starting level and keeps shares valid', () => {
    const real = [0.04, 0.04, 0.04, 0.04, 0.06, 0.01];
    const big = amplify(real, 3, 4);
    assert.ok(Math.abs(big[4] - 0.10) < 1e-9);
    assert.ok(big[5] >= 0.0003 && big[5] <= 0.5);
    amplify(real, 1, 4).forEach((value, i) => assert.ok(Math.abs(value - real[i]) < 1e-12));
});

test('rates and the estimator agree with each other', () => {
    const { tpr, fpr } = rates(1, 2);
    assert.ok(Math.abs(estimateShare(0.05 * tpr + 0.95 * fpr, 1, 2) - 0.05) < 1e-9);
});

test('the bundled snapshot is aligned and its Irish series ends before the British one', () => {
    const snapshot = JSON.parse(readFileSync(new URL('./data/snapshot.json', import.meta.url), 'utf8'));
    const n = snapshot.quarters.length;
    assert.equal(snapshot.flowHead.length, n);
    for (const [key, series] of Object.entries(snapshot.regions)) assert.equal(series.length, n, key);
    assert.equal(usableLength(snapshot.regions.uk_hra), n);
    assert.ok(usableLength(snapshot.regions.ie) < n);
    assert.equal(snapshot.quarters[usableLength(snapshot.regions.ie) - 1], snapshot.ieLast);
});
