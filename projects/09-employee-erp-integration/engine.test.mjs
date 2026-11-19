// Unit tests for the sync engine. Run with: node --test projects/09-employee-erp-integration/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLUMNS, parseCsv, toCsv, validate, plan, apply, undo, reconcile, headcountByDepartment } from './engine.js';

const departments = [
    { code: 'FIN', name: 'Finance', cost_center: 'CC-1200' },
    { code: 'ITS', name: 'Information Technology', cost_center: 'CC-1400' },
];
const base = {
    employee_id: 'E00001', first_name: 'Ana', last_name: 'Ruiz', email: 'ana.ruiz@example.org', national_id: 'ID-100001',
    job_title: 'Analyst', department_code: 'FIN', manager_id: '', location: 'Mexicali', employment_type: 'Full-time',
    hire_date: '2020-01-15', status: 'Active', termination_date: '',
};
const erpRecord = (overrides = {}) => ({ ...base, cost_center: 'CC-1200', payroll_group: 'PG-FT', ...overrides });
const csv = rows => toCsv(COLUMNS, rows);
const run = (rows, employees, extractDate = '2026-11-13') => {
    const erp = { departments, employees };
    const validation = validate(parseCsv(csv(rows)), { departments, extractDate });
    return { erp, validation, planned: plan(validation, erp) };
};
const actionOf = (planned, id) => planned.changes.find(c => c.id === id)?.action;

test('parses quoted fields, escaped quotes and CRLF line endings', () => {
    const parsed = parseCsv('a,b\r\n"x, y","say ""hi"""\r\n');
    assert.deepEqual(parsed.header, ['a', 'b']);
    assert.deepEqual(parsed.rows[0].record, { a: 'x, y', b: 'say "hi"' });
    assert.equal(parsed.rows[0].line, 2);
});

test('stops the whole run when required columns are missing', () => {
    const result = validate(parseCsv('employee_id,first_name\nE00001,Ana\n'), { departments, extractDate: '2026-11-13' });
    assert.equal(result.fatal.code, 'columns');
    assert.equal(result.valid.size, 0);
});

test('rejects rows with the rule that failed and the source line', () => {
    const { validation } = run([
        { ...base, employee_id: 'E00002', email: 'not-an-email' },
        { ...base, employee_id: 'X12', national_id: 'ID-2' },
        { ...base, employee_id: 'E00004', department_code: 'DAT', national_id: 'ID-4' },
        { ...base, employee_id: 'E00005', hire_date: '2026-02-30', national_id: 'ID-5' },
        { ...base, employee_id: 'E00006', status: 'Terminated', national_id: 'ID-6' },
        { ...base, employee_id: 'E00007', hire_date: '2027-01-01', national_id: 'ID-7' },
        { ...base, employee_id: 'E00008', first_name: '', national_id: 'ID-8' },
    ], []);
    const codes = validation.rejected.map(r => [r.line, r.code]);
    assert.deepEqual(codes, [[2, 'format.email'], [3, 'format.id'], [4, 'dept.unknown'], [5, 'format.date'], [6, 'term.missing'], [7, 'date.future'], [8, 'missing']]);
    assert.equal(validation.valid.size, 0);
});

test('rejects every occurrence of a duplicated employee ID', () => {
    const { validation } = run([{ ...base }, { ...base, first_name: 'Anna' }], []);
    assert.equal(validation.valid.size, 0);
    assert.deepEqual(validation.rejected.map(r => r.line).sort(), [2, 3]);
});

test('inserts a new hire with ERP-derived cost center and payroll group', () => {
    const { planned } = run([{ ...base, employee_id: 'E00010', national_id: 'ID-10', email: 'new@example.org', department_code: 'ITS', employment_type: 'Contract' }], []);
    const change = planned.changes[0];
    assert.equal(change.action, 'insert');
    assert.equal(change.next.cost_center, 'CC-1400');
    assert.equal(change.next.payroll_group, 'PG-CT');
});

test('classifies updates, transfers, terminations and unchanged records', () => {
    const employees = ['E00001', 'E00002', 'E00003', 'E00004'].map((id, i) => erpRecord({ employee_id: id, national_id: `ID-${i}`, email: `${id}@example.org` }));
    const rows = employees.map(({ cost_center, payroll_group, ...hr }) => hr);
    rows[0] = { ...rows[0], job_title: 'Senior Analyst' };
    rows[1] = { ...rows[1], department_code: 'ITS' };
    rows[2] = { ...rows[2], status: 'Terminated', termination_date: '2026-11-01' };
    const { planned } = run(rows, employees);
    assert.equal(actionOf(planned, 'E00001'), 'update');
    assert.equal(actionOf(planned, 'E00002'), 'transfer');
    assert.equal(actionOf(planned, 'E00003'), 'terminate');
    assert.equal(actionOf(planned, 'E00004'), 'unchanged');
    const transfer = planned.changes.find(c => c.id === 'E00002');
    assert.ok(transfer.fields.some(f => f.field === 'cost_center' && f.to === 'CC-1400'));
});

test('a title change keeps the cost center the ERP already has', () => {
    const employees = [erpRecord({ cost_center: 'CC-9999' })];
    const { planned } = run([{ ...base, job_title: 'Lead' }], employees);
    assert.equal(planned.changes[0].next.cost_center, 'CC-9999');
});

test('rehires need a hire date after the termination; otherwise the record goes to review', () => {
    const employees = [erpRecord({ status: 'Terminated', termination_date: '2024-06-30' })];
    assert.equal(actionOf(run([{ ...base, hire_date: '2026-11-03' }], employees).planned, 'E00001'), 'rehire');
    const reactivation = run([{ ...base }], employees).planned.changes[0];
    assert.equal(reactivation.action, 'review');
    assert.equal(reactivation.reason.code, 'reactivation.noRehire');
});

test('a new ID that matches an existing person goes to review as a possible duplicate', () => {
    const { planned } = run([{ ...base, employee_id: 'E00099' }], [erpRecord()]);
    const change = planned.changes.find(c => c.id === 'E00099');
    assert.equal(change.action, 'review');
    assert.deepEqual(change.reason, { code: 'duplicate.person', params: { other: 'E00001' } });
});

test('active ERP employees missing from the extract are flagged, never terminated', () => {
    const { planned } = run([], [erpRecord()]);
    assert.equal(planned.changes[0].action, 'review');
    assert.equal(planned.changes[0].reason.code, 'missing.fromHr');
});

test('a partial extract does not flag employees it does not mention', () => {
    const erp = { departments, employees: [erpRecord()] };
    const validation = validate(parseCsv(csv([])), { departments, extractDate: '2026-11-13' });
    assert.equal(plan(validation, erp, { fullExtract: false }).changes.length, 0);
});

test('warns about missing or terminated managers without blocking the change', () => {
    const employees = [erpRecord({ employee_id: 'E00050', national_id: 'ID-50', email: 'm@example.org', status: 'Terminated', termination_date: '2025-01-01' })];
    const { planned } = run([
        { ...base, employee_id: 'E00060', national_id: 'ID-60', email: 'a@example.org', manager_id: 'E00050' },
        { ...base, employee_id: 'E00061', national_id: 'ID-61', email: 'b@example.org', manager_id: 'E00077' },
    ], employees);
    assert.equal(planned.changes.find(c => c.id === 'E00060').warnings[0].code, 'manager.inactive');
    assert.equal(planned.changes.find(c => c.id === 'E00061').warnings[0].code, 'manager.missing');
    assert.equal(actionOf(planned, 'E00060'), 'insert');
});

test('apply writes an audit entry per field and undo restores the snapshot exactly', () => {
    const employees = [erpRecord()];
    const { erp, planned } = run([{ ...base, job_title: 'Lead', department_code: 'ITS' }], employees);
    const result = apply(erp, planned, { runId: 'R1', timestamp: '2026-11-13T10:00:00Z', source: 'test.csv' });
    assert.equal(result.erp.employees[0].job_title, 'Lead');
    assert.equal(result.erp.employees[0].cost_center, 'CC-1400');
    assert.deepEqual(result.audit.map(a => a.field).sort(), ['cost_center', 'department_code', 'job_title']);
    const reverted = undo({ runId: 'R1', ...result }, { timestamp: '2026-11-13T11:00:00Z' });
    assert.deepEqual(reverted.erp, erp);
    assert.ok(reverted.audit.every(a => a.action === 'undo'));
});

test('applying the same extract twice is idempotent', () => {
    const { erp, planned } = run([{ ...base, job_title: 'Lead' }], [erpRecord()]);
    const once = apply(erp, planned, { runId: 'R1', timestamp: 't', source: 's' }).erp;
    const again = plan(validate(parseCsv(csv([{ ...base, job_title: 'Lead' }])), { departments, extractDate: '2026-11-13' }), once);
    assert.deepEqual(again.changes.map(c => c.action), ['unchanged']);
});

test('reconciliation reports the match rate and mismatches by field', () => {
    const { validation, erp } = run([{ ...base, job_title: 'Lead' }], [erpRecord()]);
    const result = reconcile(validation, erp);
    assert.equal(result.matchRate, 0);
    assert.equal(result.mismatchesByField.job_title, 1);
    assert.deepEqual(headcountByDepartment(erp), { FIN: 1, ITS: 0 });
});
