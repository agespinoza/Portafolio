// Checks that the browser calculations agree with the Python pipeline on the published data.
// Run from the repository root: node --test projects/17-copper-mine-operations/mine.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { cutoffGrade, decodeBlocks, resourceStatement, shellForPrice, predictRecovery, fleetTotals } from './mine.js';

const here = dirname(fileURLToPath(import.meta.url));
const load = name => JSON.parse(readFileSync(join(here, 'data', name), 'utf8'));
const model = load('block-model.json');
const resource = load('resource.json');
const operations = load('operations.json');

test('cut-off grades match the pipeline', () => {
    const e = resource.economics;
    for (const domain of ['supergene', 'hypogene']) {
        const js = cutoffGrade({ price: e.copperPrice, selling: e.sellingCost, recovery: e.recovery[domain], processing: e.processingCost, ga: e.gaCost });
        assert.ok(Math.abs(js - resource.cutoffs[domain]) < 1e-9, domain);
    }
});

test('resource statement matches the pipeline at the reporting cut-off', () => {
    const rows = resourceStatement(decodeBlocks(model), resource.reportCutoff);
    rows.forEach((row, n) => {
        const py = resource.statement[n];
        // block grades are published to 0.001 % Cu, so a block on the cut-off can switch side
        assert.ok(Math.abs(row.tonnes - py.tonnes) / Math.max(py.tonnes, 1) < 0.005, `${row.cls} tonnes`);
        if (py.tonnes) assert.ok(Math.abs(row.cu - py.cu) < 0.002, `${row.cls} grade`);
    });
});

test('the base price selects the final pit shell', () => {
    const n = shellForPrice(resource.economics.copperPrice, resource.economics.copperPrice, model.revenueFactors);
    assert.equal(model.revenueFactors[n], 1.0);
});

test('shells are nested', () => {
    const b = decodeBlocks(model);
    const counts = model.revenueFactors.map((_, n) => b.shell.filter(s => s >= 0 && s <= n).length);
    counts.slice(1).forEach((c, n) => assert.ok(c >= counts[n]));
});

test('recovery predictions match the published daily predictions', () => {
    const m = operations.recoveryModel;
    for (const day of operations.daily.slice(-40)) {
        const p = predictRecovery(m, day);
        assert.ok(Math.abs(p - day.predicted) < 0.02, day.date);   // inputs are published rounded
    }
});

test('fleet totals follow the ASARCO time model', () => {
    const t = fleetTotals(operations.fleet[0].trucks);
    assert.ok(t.availability > 0.7 && t.availability < 1);
    assert.ok(Math.abs(t.utilization - t.availability * t.useOfAvailability) < 0.1);
});
