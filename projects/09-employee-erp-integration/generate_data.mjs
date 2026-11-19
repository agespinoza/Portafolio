// Generates the synthetic dataset for the console: an ERP master, eight weekly HR extracts
// and the history of the first five runs. Every person, ID and email is fictional.
// The first five weeks are processed with the real engine, so the history is the engine's
// own output. Run: node projects/09-employee-erp-integration/generate_data.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLUMNS, toCsv, parseCsv, validate, plan, apply, reconcile, PAYROLL_GROUPS } from './engine.js';

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'data');
mkdirSync(DIR, { recursive: true });

// Deterministic pseudo-random numbers so the dataset is reproducible.
let seed = 20261119;
const random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = list => list[Math.floor(random() * list.length)];
const between = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));

const DEPARTMENTS = [
    { code: 'ADM', name: 'Administration', cost_center: 'CC-1100' },
    { code: 'FIN', name: 'Finance', cost_center: 'CC-1200' },
    { code: 'HRS', name: 'Human Resources', cost_center: 'CC-1300' },
    { code: 'ITS', name: 'Information Technology', cost_center: 'CC-1400' },
    { code: 'LEG', name: 'Legal', cost_center: 'CC-1500' },
    { code: 'COM', name: 'Communications', cost_center: 'CC-1600' },
    { code: 'SOC', name: 'Social Services', cost_center: 'CC-2100' },
    { code: 'HLT', name: 'Health Programs', cost_center: 'CC-2200' },
    { code: 'EDU', name: 'Education and Training', cost_center: 'CC-2300' },
    { code: 'OPS', name: 'Operations', cost_center: 'CC-3100' },
];
const TITLES = {
    ADM: ['Administrative Assistant', 'Office Coordinator', 'Records Clerk'], FIN: ['Accountant', 'Budget Analyst', 'Payroll Specialist'],
    HRS: ['HR Generalist', 'Recruiter', 'Benefits Coordinator'], ITS: ['Software Developer', 'Systems Administrator', 'Data Analyst', 'Help Desk Technician'],
    LEG: ['Legal Advisor', 'Paralegal'], COM: ['Communications Officer', 'Graphic Designer'], SOC: ['Social Worker', 'Case Manager', 'Program Coordinator'],
    HLT: ['Nurse', 'Nutritionist', 'Health Promoter'], EDU: ['Instructor', 'Training Coordinator'], OPS: ['Logistics Coordinator', 'Maintenance Technician', 'Driver'],
};
const WEIGHTS = { ADM: 14, FIN: 14, HRS: 10, ITS: 18, LEG: 6, COM: 8, SOC: 40, HLT: 30, EDU: 22, OPS: 28 };
const FIRST = ['Ana', 'Luis', 'María', 'José', 'Carmen', 'Jorge', 'Lucía', 'Miguel', 'Sofía', 'Daniel', 'Elena', 'Carlos', 'Paula', 'Andrés', 'Laura', 'Diego',
    'Valeria', 'Ricardo', 'Isabel', 'Fernando', 'Gabriela', 'Héctor', 'Natalia', 'Raúl', 'Patricia', 'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'Ethan', 'Mia',
    'Lucas', 'Chloe', 'Mateo', 'Grace', 'Samuel', 'Zoe', 'Adrián', 'Renata', 'Tomás', 'Julia', 'Iván', 'Camila', 'Óscar', 'Daniela', 'Hugo', 'Ximena'];
const LAST = ['García', 'Hernández', 'López', 'Martínez', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez',
    'Díaz', 'Cruz', 'Morales', 'Reyes', 'Ortiz', 'Castillo', 'Vargas', 'Romero', 'Mendoza', 'Silva', 'Chen', 'Nguyen', 'Kim', 'Patel', 'Smith', 'Johnson',
    'Brown', 'Taylor', 'Wilson', 'Anderson', 'Thomas', 'Moore', 'Jackson', 'Lee', 'Walker', 'Young', 'Allen'];
const LOCATIONS = ['Mexicali', 'Mexicali', 'Mexicali', 'Tijuana', 'Ensenada', 'San Felipe'];
const ascii = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const WEEKS = ['2026-09-25', '2026-10-02', '2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30', '2026-11-06', '2026-11-13'];
const HISTORY_WEEKS = 5;
const daysBefore = (date, n) => new Date(Date.parse(`${date}T00:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10);

let nextId = 1;
let nextNational = 300000;
const usedEmails = new Set();
function person(department, hireDate) {
    const first = pick(FIRST), last = pick(LAST);
    let email = `${ascii(first)}.${ascii(last)}@example.org`;
    for (let n = 2; usedEmails.has(email); n++) email = `${ascii(first)}.${ascii(last)}${n}@example.org`;
    usedEmails.add(email);
    return {
        employee_id: `E${String(nextId++).padStart(5, '0')}`, first_name: first, last_name: last, email,
        national_id: `ID-${nextNational += between(7, 97)}`, job_title: pick(TITLES[department]), department_code: department,
        manager_id: '', location: pick(LOCATIONS), employment_type: random() < 0.78 ? 'Full-time' : random() < 0.6 ? 'Part-time' : 'Contract',
        hire_date: hireDate, status: 'Active', termination_date: '',
    };
}

// ---- Organization at week 0: department heads report to the director, staff to their head.
const hr = new Map();
const director = { ...person('ADM', '2009-03-02'), job_title: 'Executive Director', employment_type: 'Full-time' };
hr.set(director.employee_id, director);
const heads = {};
for (const d of DEPARTMENTS) {
    const head = { ...person(d.code, daysBefore('2026-01-01', between(900, 5000))), job_title: `${d.name} Manager`, manager_id: director.employee_id, employment_type: 'Full-time' };
    hr.set(head.employee_id, head);
    heads[d.code] = head.employee_id;
}
const weighted = Object.entries(WEIGHTS).flatMap(([code, w]) => Array(w).fill(code));
for (let i = 0; i < 178; i++) {
    const code = pick(weighted);
    const e = person(code, daysBefore('2026-09-01', between(30, 4800)));
    e.manager_id = heads[code];
    hr.set(e.employee_id, e);
}
for (let i = 0; i < 6; i++) {  // former employees, terminated in both systems
    const e = person(pick(weighted), daysBefore('2024-01-01', between(400, 2500)));
    e.manager_id = heads[e.department_code];
    Object.assign(e, { status: 'Terminated', termination_date: daysBefore('2025-12-01', between(30, 600)) });
    hr.set(e.employee_id, e);
}

// ---- ERP master at week 0: HR plus ERP-owned fields, with realistic drift.
const toErp = e => ({ ...e, cost_center: DEPARTMENTS.find(d => d.code === e.department_code).cost_center, payroll_group: PAYROLL_GROUPS[e.employment_type] });
let erp = { departments: DEPARTMENTS, employees: [...hr.values()].map(toErp) };
const staff = () => [...hr.values()].filter(e => e.status !== 'Terminated' && !e.job_title.endsWith('Manager') && e.job_title !== 'Executive Director');
for (const e of staff().slice(10, 14)) erp.employees.find(x => x.employee_id === e.employee_id).job_title = 'Pending title update';
for (let i = 0; i < 2; i++) {  // contractors loaded straight into the ERP, unknown to HR
    const c = toErp({ ...person('OPS', '2025-05-12'), employment_type: 'Contract', manager_id: heads.OPS });
    erp.employees.push(c);
}

// ---- Weekly HR events and extracts.
const extracts = [];
const extractText = new Map();
for (const [week, date] of WEEKS.entries()) {
    const active = staff();
    for (let i = between(3, 6); i > 0; i--) {
        const code = pick(weighted);
        const e = person(code, daysBefore(date, between(0, 6)));
        e.manager_id = heads[code];
        hr.set(e.employee_id, e);
    }
    for (let i = between(2, 4); i > 0; i--) {
        const e = pick(active);
        const code = pick(DEPARTMENTS.filter(d => d.code !== e.department_code)).code;
        Object.assign(e, { department_code: code, job_title: pick(TITLES[code]), manager_id: heads[code] });
    }
    for (let i = between(2, 3); i > 0; i--) { const e = pick(active); e.job_title = pick(TITLES[e.department_code]); }
    for (let i = between(1, 3); i > 0; i--) {
        const e = pick(staff());
        Object.assign(e, { status: 'Terminated', termination_date: daysBefore(date, between(1, 6)) });
    }
    if (week % 2 === 1) {
        const former = [...hr.values()].find(e => e.status === 'Terminated' && e.termination_date < daysBefore(date, 60));
        if (former) Object.assign(former, { status: 'Active', termination_date: '', hire_date: daysBefore(date, 2) });
    }
    if (week % 3 === 0) { const e = pick(staff()); e.status = e.status === 'Leave' ? 'Active' : 'Leave'; }
    if (week === 2 || week === 6) {
        const e = pick(staff());
        e.last_name = pick(LAST);
        e.email = `${ascii(e.first_name)}.${ascii(e.last_name)}${week}@example.org`;
    }

    // Extract rows: every person HR knows, plus the data-entry mistakes real extracts contain.
    const rows = [...hr.values()].map(e => ({ ...e }));
    const mistakes = [
        rows => { const r = pick(rows); r.email = r.email.replace('@', ' at '); },
        rows => { const r = pick(rows.filter(x => x.hire_date > '2026-09-01')) || pick(rows); const [y, m, d] = r.hire_date.split('-'); r.hire_date = `${m}/${d}/${y}`; },
        rows => { const r = pick(rows); Object.assign(r, { department_code: 'DAT', job_title: 'Data Engineer' }); },
        rows => { rows.push({ ...pick(rows) }); },
        rows => { const r = pick(rows.filter(x => x.status === 'Active')); r.status = 'Actve'; },
        rows => { const r = pick(rows.filter(x => x.status === 'Active')); r.status = 'Terminated'; },
    ];
    for (let i = between(1, 4); i > 0; i--) pick(mistakes)(rows);
    if (week === 3 || week === 6) {  // the same person entered again under a new ID
        const twin = pick(staff());
        rows.push({ ...twin, employee_id: `E${String(nextId++).padStart(5, '0')}`, hire_date: daysBefore(date, 1) });
    }
    if (week === 4 || week === 7) { const r = pick(rows.filter(x => x.status === 'Active')); r.manager_id = 'E09999'; }
    rows.sort((a, b) => a.employee_id.localeCompare(b.employee_id));
    const file = `hr-extract-${date}.csv`;
    const text = toCsv(COLUMNS, rows);
    writeFileSync(join(DIR, file), text);
    extractText.set(file, text);
    extracts.push({ file, date, rows: rows.length });
}

// ---- Process the first weeks with the real engine to build the ERP state and run history.
const runs = [];
const audit = [];
for (const [index, extract] of extracts.slice(0, HISTORY_WEEKS).entries()) {
    const validation = validate(parseCsv(extractText.get(extract.file)), { departments: DEPARTMENTS, extractDate: extract.date });
    const before = reconcile(validation, erp).matchRate;
    const planned = plan(validation, erp);
    const runId = `RUN-${String(index + 1).padStart(3, '0')}`;
    const timestamp = `${daysBefore(extract.date, -3)}T14:${String(10 + index * 7).padStart(2, '0')}:00Z`;
    const result = apply(erp, planned, { runId, timestamp, source: extract.file });
    erp = result.erp;
    audit.push(...result.audit);
    const s = planned.summary;
    runs.push({
        runId, source: extract.file, extractDate: extract.date, appliedAt: timestamp,
        read: s.read, valid: s.valid, rejected: s.rejected, warnings: s.warnings, review: s.review,
        insert: s.insert, update: s.update, transfer: s.transfer, terminate: s.terminate, rehire: s.rehire, unchanged: s.unchanged,
        matchBefore: before, matchAfter: reconcile(validation, erp).matchRate,
        rejectedByRule: countBy(validation.rejected, r => r.code),
    });
}

function countBy(list, key) { return list.reduce((acc, item) => { acc[key(item)] = (acc[key(item)] || 0) + 1; return acc; }, {}); }

// ---- A short practice extract that triggers every validation rule and review reason once.
{
    const sample = staff().slice(0, 18).map(e => ({ ...e }));
    const broken = [
        r => { r.email = r.email.replace('@', ' at '); },
        r => { const [y, m, d] = r.hire_date.split('-'); r.hire_date = `${m}/${d}/${y}`; },
        r => { Object.assign(r, { department_code: 'DAT', job_title: 'Data Engineer' }); },
        r => { r.status = 'Actve'; },
        r => { r.status = 'Terminated'; },
        r => { r.employment_type = 'Intern'; },
        r => { r.first_name = ''; },
        r => { r.employee_id = r.employee_id.replace('E', 'EMP-'); },
        r => { r.hire_date = '2027-01-15'; },
        r => { Object.assign(r, { status: 'Terminated', termination_date: '2001-01-01' }); },
    ];
    broken.forEach((mutate, i) => mutate(sample[i]));
    sample.push({ ...sample[12] });
    const twin = sample[14];
    sample.push({ ...twin, employee_id: `E${String(nextId++).padStart(5, '0')}`, hire_date: '2026-11-12' });
    sample[15].manager_id = 'E09999';
    sample.push({ ...person('ITS', '2026-11-10'), manager_id: heads.ITS });
    const file = 'hr-extract-practice-errors.csv';
    writeFileSync(join(DIR, file), toCsv(COLUMNS, sample));
    extracts.push({ file, date: '2026-11-13', rows: sample.length, practice: true });
}

writeFileSync(join(DIR, 'erp.json'), `${JSON.stringify({ generatedFor: 'portfolio demo, fictional data', asOf: WEEKS[HISTORY_WEEKS - 1], ...erp }, null, 1)}\n`);
writeFileSync(join(DIR, 'history.json'), `${JSON.stringify({ runs, audit }, null, 1)}\n`);
writeFileSync(join(DIR, 'manifest.json'), `${JSON.stringify({ pending: extracts.slice(HISTORY_WEEKS).map(({ file, date, rows, practice }) => ({ file, date, rows, full: !practice })) }, null, 1)}\n`);
console.log(`ERP: ${erp.employees.length} employees · history: ${runs.length} runs, ${audit.length} audit entries · pending extracts: ${extracts.length - HISTORY_WEEKS}`);
for (const r of runs) console.log(`  ${r.runId} ${r.extractDate}: +${r.insert} ~${r.update} →${r.transfer} ✕${r.terminate} ↺${r.rehire} review ${r.review} rejected ${r.rejected} · match ${(r.matchBefore * 100).toFixed(1)}% → ${(r.matchAfter * 100).toFixed(1)}%`);
