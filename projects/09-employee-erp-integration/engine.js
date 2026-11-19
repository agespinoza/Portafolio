// HR → ERP synchronization engine. Pure functions, no DOM: the browser console and the
// unit tests (engine.test.mjs) run exactly the same code.
//
// Pipeline: parse CSV → validate rows → plan changes against the ERP master → apply an
// approved plan (with an audit trail) → undo a run from its snapshot.
// Messages are returned as codes with parameters so the UI can translate them.

export const COLUMNS = [
    'employee_id', 'first_name', 'last_name', 'email', 'national_id', 'job_title',
    'department_code', 'manager_id', 'location', 'employment_type', 'hire_date', 'status', 'termination_date',
];
export const REQUIRED = ['employee_id', 'first_name', 'last_name', 'email', 'national_id', 'job_title', 'department_code', 'location', 'employment_type', 'hire_date', 'status'];
export const STATUSES = ['Active', 'Leave', 'Terminated'];
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract'];

/** Which system is the source of truth for each ERP field. */
export const OWNERSHIP = {
    first_name: 'HR', last_name: 'HR', email: 'HR', national_id: 'HR', job_title: 'HR', department_code: 'HR',
    manager_id: 'HR', location: 'HR', employment_type: 'HR', hire_date: 'HR', status: 'HR', termination_date: 'HR',
    cost_center: 'ERP-derived', payroll_group: 'ERP-derived',
};
export const SYNCED_FIELDS = COLUMNS.filter(field => field !== 'employee_id');
export const PAYROLL_GROUPS = { 'Full-time': 'PG-FT', 'Part-time': 'PG-PT', Contract: 'PG-CT' };
export const ACTIONS = ['insert', 'update', 'transfer', 'terminate', 'rehire', 'review', 'unchanged'];

const ID = /^E\d{5}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const validDate = value => DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

// ---------- CSV ----------

/** RFC 4180 parser: quoted fields, escaped quotes, CRLF. Returns rows with their source line. */
export function parseCsv(text) {
    const records = [];
    let field = '', row = [], quoted = false, line = 1, rowLine = 1;
    const input = text.replace(/^﻿/, '');
    for (let i = 0; i < input.length; i++) {
        const c = input[i];
        if (quoted) {
            if (c === '"' && input[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false;
            else { if (c === '\n') line++; field += c; }
        } else if (c === '"') quoted = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && input[i + 1] === '\n') i++;
            row.push(field); field = '';
            if (row.some(value => value !== '')) records.push({ line: rowLine, values: row });
            row = []; line++; rowLine = line;
        } else field += c;
    }
    if (field !== '' || row.length) { row.push(field); if (row.some(value => value !== '')) records.push({ line: rowLine, values: row }); }
    if (!records.length) return { header: [], rows: [] };
    const [head, ...body] = records;
    const header = head.values.map(value => value.trim());
    return {
        header,
        rows: body.map(({ line: l, values }) => ({
            line: l,
            extra: values.length > header.length,
            record: Object.fromEntries(header.map((name, i) => [name, (values[i] ?? '').trim()])),
        })),
    };
}

export function toCsv(columns, rows) {
    const cell = value => {
        const text = value == null ? '' : String(value);
        return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return [columns, ...rows.map(row => columns.map(column => row[column]))].map(r => r.map(cell).join(',')).join('\n') + '\n';
}

// ---------- Validation ----------

/**
 * Validates an HR extract. Fatal problems (wrong columns) stop the run; row problems reject the
 * row with a code; reference problems that do not block the change become warnings.
 */
export function validate(parsed, { departments, extractDate }) {
    const missingColumns = COLUMNS.filter(column => !parsed.header.includes(column));
    if (missingColumns.length) return { fatal: { code: 'columns', params: { columns: missingColumns.join(', ') } }, valid: new Map(), rejected: [], warnings: [], read: parsed.rows.length };
    const deptCodes = new Set(departments.map(d => d.code));
    const valid = new Map();
    const rejected = [];
    const seen = new Map();
    for (const { line, record, extra } of parsed.rows) {
        const id = record.employee_id;
        const problems = [];
        const reject = (code, field, params = {}) => problems.push({ line, id, field, code, params });
        if (extra) reject('columns.extra', null);
        for (const field of REQUIRED) if (!record[field]) reject('missing', field, { field });
        if (id && !ID.test(id)) reject('format.id', 'employee_id', { value: id });
        if (record.email && !EMAIL.test(record.email)) reject('format.email', 'email', { value: record.email });
        for (const field of ['hire_date', 'termination_date']) {
            if (record[field] && !validDate(record[field])) reject('format.date', field, { field, value: record[field] });
        }
        if (record.status && !STATUSES.includes(record.status)) reject('enum.status', 'status', { value: record.status });
        if (record.employment_type && !EMPLOYMENT_TYPES.includes(record.employment_type)) reject('enum.type', 'employment_type', { value: record.employment_type });
        if (record.department_code && !deptCodes.has(record.department_code)) reject('dept.unknown', 'department_code', { code: record.department_code });
        if (validDate(record.hire_date) && record.hire_date > extractDate) reject('date.future', 'hire_date', { value: record.hire_date });
        if (record.status === 'Terminated' && !record.termination_date) reject('term.missing', 'termination_date');
        if (record.status !== 'Terminated' && record.termination_date) reject('term.unexpected', 'termination_date');
        if (validDate(record.termination_date) && validDate(record.hire_date) && record.termination_date < record.hire_date) {
            reject('term.beforeHire', 'termination_date', { value: record.termination_date });
        }
        if (id && seen.has(id)) reject('duplicate.id', 'employee_id', { value: id, first: seen.get(id) });
        if (id && !seen.has(id)) seen.set(id, line);
        if (problems.length) rejected.push(...problems);
        else valid.set(id, { ...record, line });
    }
    // A duplicated ID is ambiguous: reject every occurrence, not just the later ones.
    for (const problem of rejected.filter(p => p.code === 'duplicate.id')) {
        const first = valid.get(problem.id);
        if (first) {
            rejected.push({ line: first.line, id: problem.id, field: 'employee_id', code: 'duplicate.id', params: { value: problem.id, first: problem.line } });
            valid.delete(problem.id);
        }
    }
    rejected.sort((a, b) => a.line - b.line);
    return { fatal: null, valid, rejected, warnings: [], read: parsed.rows.length };
}

// ---------- Planning ----------

const derived = (record, departments) => ({
    cost_center: departments.find(d => d.code === record.department_code)?.cost_center ?? '',
    payroll_group: PAYROLL_GROUPS[record.employment_type] ?? '',
});

/**
 * Compares a validated extract with the ERP master and proposes one change per employee.
 * A full extract lists everyone HR knows, so active ERP employees missing from it are flagged;
 * a partial extract (for example, today's changes only) skips that check.
 */
export function plan(validation, erp, { fullExtract = true } = {}) {
    const { departments } = erp;
    const employees = new Map(erp.employees.map(e => [e.employee_id, e]));
    const byNationalId = new Map(erp.employees.map(e => [e.national_id, e]));
    const byEmail = new Map(erp.employees.map(e => [e.email.toLowerCase(), e]));
    const hrIds = new Set(validation.valid.keys());
    const changes = [];

    for (const [id, hr] of validation.valid) {
        const current = employees.get(id);
        const warnings = [];
        if (hr.manager_id) {
            const manager = validation.valid.get(hr.manager_id) || employees.get(hr.manager_id);
            if (!manager) warnings.push({ code: 'manager.missing', params: { manager: hr.manager_id } });
            else if (manager.status === 'Terminated') warnings.push({ code: 'manager.inactive', params: { manager: hr.manager_id } });
        }
        const next = { ...Object.fromEntries(COLUMNS.map(c => [c, hr[c] ?? ''])), ...derived(hr, departments) };

        if (!current) {
            const twin = byNationalId.get(hr.national_id) || byEmail.get(hr.email.toLowerCase());
            if (twin && twin.employee_id !== id) {
                changes.push({ id, action: 'review', reason: { code: 'duplicate.person', params: { other: twin.employee_id } }, fields: [], warnings, line: hr.line, next });
            } else {
                const fields = [...SYNCED_FIELDS, 'cost_center', 'payroll_group'].filter(f => next[f])
                    .map(field => ({ field, from: '', to: next[field], owner: OWNERSHIP[field] }));
                changes.push({ id, action: 'insert', fields, warnings, line: hr.line, next });
            }
            continue;
        }

        const fields = [];
        for (const field of SYNCED_FIELDS) {
            if ((current[field] ?? '') !== next[field]) fields.push({ field, from: current[field] ?? '', to: next[field], owner: OWNERSHIP[field] });
        }
        const transfer = fields.some(f => f.field === 'department_code');
        const typeChange = fields.some(f => f.field === 'employment_type');
        if (transfer || current.status === 'Terminated') {
            if (current.cost_center !== next.cost_center) fields.push({ field: 'cost_center', from: current.cost_center, to: next.cost_center, owner: OWNERSHIP.cost_center });
        } else next.cost_center = current.cost_center;  // ERP keeps its value unless the department changes
        if (typeChange && current.payroll_group !== next.payroll_group) fields.push({ field: 'payroll_group', from: current.payroll_group, to: next.payroll_group, owner: OWNERSHIP.payroll_group });
        else if (!typeChange) next.payroll_group = current.payroll_group;

        let action;
        if (current.status === 'Terminated' && hr.status !== 'Terminated') {
            action = hr.hire_date > (current.termination_date || current.hire_date) ? 'rehire' : 'review';
        } else if (current.status !== 'Terminated' && hr.status === 'Terminated') action = 'terminate';
        else if (!fields.length) action = 'unchanged';
        else if (transfer) action = 'transfer';
        else action = 'update';
        const change = { id, action, fields, warnings, line: hr.line, next };
        if (action === 'review') change.reason = { code: 'reactivation.noRehire', params: {} };
        changes.push(change);
    }

    // Active ERP employees missing from a full HR extract are flagged, never terminated automatically.
    for (const employee of fullExtract ? erp.employees : []) {
        if (!hrIds.has(employee.employee_id) && employee.status !== 'Terminated'
            && !validationRejectedId(validation, employee.employee_id)) {
            changes.push({ id: employee.employee_id, action: 'review', reason: { code: 'missing.fromHr', params: {} }, fields: [], warnings: [], line: null, next: null });
        }
    }
    changes.sort((a, b) => ACTIONS.indexOf(a.action) - ACTIONS.indexOf(b.action) || a.id.localeCompare(b.id));
    return { changes, summary: summarize(validation, changes) };
}

const validationRejectedId = (validation, id) => validation.rejected.some(r => r.id === id);

export function summarize(validation, changes) {
    const counts = Object.fromEntries(ACTIONS.map(action => [action, 0]));
    for (const change of changes) counts[change.action]++;
    const rejectedRows = new Set(validation.rejected.map(r => r.line)).size;
    const warnings = changes.reduce((n, c) => n + c.warnings.length, 0);
    const applicable = counts.insert + counts.update + counts.transfer + counts.terminate + counts.rehire;
    return { read: validation.read, valid: validation.valid.size, rejected: rejectedRows, warnings, applicable, ...counts };
}

// ---------- Apply and undo ----------

/** Applies every non-review change of a plan. Returns the new ERP master, the audit trail and a snapshot for undo. */
export function apply(erp, planned, { runId, timestamp, source }) {
    const employees = new Map(erp.employees.map(e => [e.employee_id, { ...e }]));
    const audit = [];
    for (const change of planned.changes) {
        if (change.action === 'review' || change.action === 'unchanged') continue;
        employees.set(change.id, { employee_id: change.id, ...change.next });
        for (const f of change.fields) audit.push({ runId, timestamp, source, id: change.id, action: change.action, field: f.field, from: f.from, to: f.to });
    }
    const next = { ...erp, employees: [...employees.values()].sort((a, b) => a.employee_id.localeCompare(b.employee_id)) };
    return { erp: next, audit, snapshot: erp };
}

/** Restores the ERP master saved before a run and records the reversal in the audit trail. */
export function undo(run, { timestamp }) {
    const audit = run.audit.map(entry => ({ ...entry, runId: `${run.runId}-undo`, timestamp, action: 'undo', from: entry.to, to: entry.from }));
    return { erp: run.snapshot, audit };
}

// ---------- Reconciliation ----------

/** How closely the ERP master agrees with the HR extract on HR-owned fields. */
export function reconcile(validation, erp) {
    const employees = new Map(erp.employees.map(e => [e.employee_id, e]));
    let compared = 0, matching = 0;
    const mismatchesByField = Object.fromEntries(SYNCED_FIELDS.map(f => [f, 0]));
    for (const [id, hr] of validation.valid) {
        const current = employees.get(id);
        if (!current) continue;
        compared++;
        let same = true;
        for (const field of SYNCED_FIELDS) {
            if ((current[field] ?? '') !== (hr[field] ?? '')) { mismatchesByField[field]++; same = false; }
        }
        if (same) matching++;
    }
    return { compared, matching, matchRate: compared ? matching / compared : 1, mismatchesByField };
}

export function headcountByDepartment(erp) {
    const counts = Object.fromEntries(erp.departments.map(d => [d.code, 0]));
    for (const e of erp.employees) if (e.status !== 'Terminated' && e.department_code in counts) counts[e.department_code]++;
    return counts;
}
