import {
    COLUMNS, OWNERSHIP, ACTIONS, SYNCED_FIELDS, parseCsv, validate, plan, apply, undo, reconcile, headcountByDepartment,
} from './engine.js?v=20261119c';
import { barChart, groupedBars, runLines, runStacks } from './charts.js?v=20261119c';
import { LANGUAGES, LANGUAGE_NAMES, language, tr, site, num, utcFull, translatePage } from './i18n.js?v=20261119c';

const MAX_UPLOAD = 5 * 1024 * 1024;
const AUDIT_ROWS = 150;
const GLYPH = { insert: '+', update: '✎', transfer: '⇄', terminate: '−', rehire: '↺', review: '!', unchanged: '=', rejected: '✕', undo: '⟲' };

const $ = selector => document.querySelector(selector);
const el = (tag, props = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (key === 'class') node.className = value;
        else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value);
    }
    node.append(...children.flat().filter(child => child !== null && child !== undefined && child !== false));
    return node;
};
const pct = value => `${num(value * 100, 1)}%`;
const fieldLabel = field => tr(`field.${field}`, field);
const deptName = code => tr(`dept.${code}`, state.erp?.departments.find(d => d.code === code)?.name || code);
const actionLabel = action => tr(`action.${action}`, action);
const chip = action => el('span', { class: `chip chip--${action}` }, el('span', { class: 'chip__glyph', 'aria-hidden': 'true' }, GLYPH[action]), actionLabel(action));
const ownerBadge = owner => el('span', { class: `owner owner--${owner === 'HR' ? 'hr' : 'erp'}` }, owner === 'HR' ? tr('owner.hr', 'HR') : tr('owner.erp', 'ERP · derived'));
const ruleText = r => tr(`rule.${r.code}`, r.code, { ...r.params, field: r.params?.field ? fieldLabel(r.params.field) : '' });
const reviewText = reason => tr(`review.${reason.code}`, reason.code, reason.params);
const warningText = w => tr(`warn.${w.code}`, w.code, w.params);
const shortDate = iso => new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

const state = {
    initial: null, erp: null, runs: [], audit: [], extracts: [], applied: new Set(),
    current: null, tab: 'changes', expanded: new Set(), search: '',
};

// ---------- Navigation (same behaviour as the portfolio) ----------

function initNav() {
    const select = $('#language-select');
    select.replaceChildren(...LANGUAGES.map(code => el('option', { value: code }, LANGUAGE_NAMES[code])));
    select.value = language;
    select.addEventListener('change', () => {
        const url = new URL(window.location.href);
        if (select.value === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', select.value);
        window.location.assign(url.href);
    });
    const toggle = $('#nav-toggle');
    const links = $('#primary-links');
    const setOpen = open => {
        toggle.setAttribute('aria-expanded', String(open));
        links.classList.toggle('is-open', open);
        toggle.querySelector('.nav__toggle-label').textContent = open ? site('nav.close', 'Close menu') : site('nav.menu', 'Menu');
        toggle.querySelector('.nav__toggle-icon').textContent = open ? '×' : '☰';
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); } });
    document.addEventListener('click', event => { if (!$('#nav').contains(event.target) && toggle.getAttribute('aria-expanded') === 'true') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 960) setOpen(false); });
}

// ---------- Data ----------

async function loadData() {
    const [erp, history, manifest] = await Promise.all(['data/erp.json', 'data/history.json', 'data/manifest.json'].map(url => fetch(url).then(r => {
        if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
        return r.json();
    })));
    state.initial = { erp, history, manifest };
    resetState();
}

function resetState() {
    const { erp, history, manifest } = state.initial;
    state.erp = structuredClone({ departments: erp.departments, employees: erp.employees });
    state.runs = history.runs.map(run => ({ ...run, session: false }));
    state.audit = [...history.audit];
    state.extracts = manifest.pending.map(p => ({ ...p, kind: p.full ? 'weekly' : 'practice' }));
    state.applied = new Set();
    state.expanded = new Set();
}

async function selectExtract(index) {
    const extract = state.extracts[index];
    if (!extract.text) {
        const response = await fetch(`data/${extract.file}`);
        if (!response.ok) throw new Error(`${extract.file}: HTTP ${response.status}`);
        extract.text = await response.text();
    }
    state.currentIndex = index;
    analyze();
}

function analyze() {
    const extract = state.extracts[state.currentIndex];
    const validation = validate(parseCsv(extract.text), { departments: state.erp.departments, extractDate: extract.date });
    const planned = validation.fatal ? null : plan(validation, state.erp, { fullExtract: extract.full });
    const after = planned ? apply(state.erp, planned, { runId: 'preview', timestamp: '', source: extract.file }).erp : state.erp;
    state.current = { extract, validation, planned, recon: validation.fatal ? null : reconcile(validation, state.erp), after };
    state.expanded = new Set();
    renderAll();
}

// ---------- Rendering ----------

function renderAll() {
    renderSelect();
    renderKpis();
    renderPipeline();
    renderValidation();
    renderImpact();
    renderPlan();
    renderHistory();
    renderAudit();
}

function extractLabel(extract) {
    if (extract.kind === 'upload') return tr('extract.upload', 'Your file: {name}', { name: extract.file });
    if (extract.kind === 'practice') return tr('extract.practice', 'Practice file with every error type');
    const applied = state.applied.has(extract.file) ? ` · ${tr('extract.applied', 'applied')}` : '';
    return `${tr('extract.weekly', 'Weekly extract of {date}', { date: shortDate(extract.date) })}${applied}`;
}

function renderSelect() {
    $('#extract').replaceChildren(...state.extracts.map((extract, i) => el('option', { value: String(i) }, extractLabel(extract))));
    $('#extract').value = String(state.currentIndex);
}

function renderKpis() {
    const active = state.erp.employees.filter(e => e.status !== 'Terminated').length;
    const last = state.runs.at(-1);
    const pending = state.extracts.filter(e => e.kind === 'weekly' && !state.applied.has(e.file)).length;
    const kpi = (label, value, note) => el('div', { class: 'kpi' }, el('div', { class: 'kpi__label' }, label), el('div', { class: 'kpi__value' }, value), el('div', { class: 'kpi__note' }, note));
    $('#kpis').replaceChildren(
        kpi(tr('kpi.active', 'Active in the ERP'), num(active), tr('kpi.activeNote', '{n} records including former employees', { n: num(state.erp.employees.length) })),
        kpi(tr('kpi.agreement', 'Agreement after last run'), last ? pct(last.matchAfter) : '—', last ? tr('kpi.agreementNote', '{run}, up from {before}', { run: last.runId, before: pct(last.matchBefore) }) : ''),
        kpi(tr('kpi.pending', 'Weekly extracts pending'), num(pending), tr('kpi.pendingNote', 'Plus a practice file and your own uploads')),
        kpi(tr('kpi.audit', 'Audit entries'), num(state.audit.length), tr('kpi.auditNote', 'One per field changed, across {n} runs', { n: num(state.runs.length) })),
    );
}

function renderPipeline() {
    const { extract, validation, planned, recon } = state.current;
    $('#pipeline-title').textContent = extractLabel(extract);
    $('#pipeline-meta').textContent = tr('pipeline.meta', '{rows} rows · extract date {date} · {mode}', {
        rows: num(validation.read), date: shortDate(extract.date),
        mode: extract.full ? tr('pipeline.full', 'full extract') : tr('pipeline.partial', 'partial extract'),
    });
    if (validation.fatal) {
        $('#pipeline').replaceChildren(el('li', { class: 'stage' }, el('div', { class: 'stage__label' }, tr('pipeline.stopped', 'Run stopped')),
            el('div', { class: 'stage__detail' }, tr(`rule.${validation.fatal.code}`, validation.fatal.code, validation.fatal.params))));
        return;
    }
    const s = planned.summary;
    const reasons = planned.changes.filter(c => c.action === 'review').reduce((acc, c) => { acc[c.reason.code] = (acc[c.reason.code] || 0) + 1; return acc; }, {});
    const stage = (label, value, details) => el('li', { class: 'stage' },
        el('div', { class: 'stage__label' }, label), el('div', { class: 'stage__value' }, num(value)),
        el('div', { class: 'stage__detail' }, details.map(([k, v]) => el('span', {}, k, el('b', {}, v)))));
    $('#pipeline').replaceChildren(
        stage(tr('pipeline.read', 'Rows read'), s.read, [[tr('pipeline.columns', 'Columns'), num(COLUMNS.length)]]),
        stage(tr('pipeline.valid', 'Passed validation'), s.valid, [[tr('pipeline.rejected', 'Rejected rows'), num(s.rejected)], [tr('pipeline.warnings', 'Warnings'), num(s.warnings)]]),
        stage(tr('pipeline.matched', 'Matched to ERP'), recon.compared, [[tr('pipeline.agreement', 'Already in agreement'), pct(recon.matchRate)], [tr('pipeline.new', 'New to the ERP'), num(s.insert)]]),
        stage(tr('pipeline.planned', 'Changes to apply'), s.applicable, ['insert', 'update', 'transfer', 'terminate', 'rehire'].filter(a => s[a]).map(a => [actionLabel(a), num(s[a])])),
        stage(tr('pipeline.review', 'Held for review'), s.review, Object.entries(reasons).map(([code, n]) => [tr(`reviewShort.${code}`, code), num(n)])),
    );
}

function renderValidation() {
    const { validation } = state.current;
    const rejected = validation.rejected;
    $('#validation-meta').textContent = validation.fatal ? '' : tr('validation.meta', '{n} problems on {rows} rows', { n: num(rejected.length), rows: num(new Set(rejected.map(r => r.line)).size) });
    const byRule = Object.entries(rejected.reduce((acc, r) => { acc[r.code] = (acc[r.code] || 0) + 1; return acc; }, {}))
        .sort((a, b) => b[1] - a[1]).map(([code, value]) => ({ label: tr(`ruleShort.${code}`, code), value }));
    barChart($('#rules-chart'), {
        items: byRule, color: 'var(--status-critical)', valueLabel: tr('validation.problems', 'problems'),
        ariaLabel: tr('validation.chartAria', 'Rejected rows by validation rule'), empty: tr('validation.none', 'Every row passed validation.'),
    });
    if (!rejected.length) { $('#rejected-table').replaceChildren(); return; }
    const head = el('thead', {}, el('tr', {}, ['line', 'employee', 'rule'].map(k => el('th', { scope: 'col', class: k === 'line' ? 'num' : '' }, tr(`validation.col.${k}`, k)))));
    const body = el('tbody', {}, rejected.map(r => el('tr', {},
        el('td', { class: 'num' }, String(r.line)),
        el('td', {}, r.id || '—'),
        el('td', { class: 'summary' }, chip('rejected'), el('span', { class: 'note-inline' }, ruleText(r))))));
    $('#rejected-table').replaceChildren(head, body);
}

function renderImpact() {
    const before = headcountByDepartment(state.erp);
    const after = headcountByDepartment(state.current.after);
    $('#impact-legend').replaceChildren(
        el('li', {}, el('span', { class: 'legend__swatch', style: 'background: var(--ink-3)' }), tr('impact.today', 'In the ERP today')),
        el('li', {}, el('span', { class: 'legend__swatch', style: 'background: var(--accent)' }), tr('impact.after', 'After this run')));
    groupedBars($('#impact-chart'), {
        categories: state.erp.departments.map(d => ({ key: d.code, label: deptName(d.code) })),
        series: [
            { key: 'before', label: tr('impact.today', 'In the ERP today'), color: 'var(--ink-3)', values: before },
            { key: 'after', label: tr('impact.after', 'After this run'), color: 'var(--accent)', values: after },
        ],
        ariaLabel: tr('impact.aria', 'Active headcount by department before and after the run'),
    });
}

function changeSummary(change) {
    const get = field => change.fields.find(f => f.field === field);
    const n = change.next || {};
    switch (change.action) {
        case 'insert': return tr('summary.insert', '{title} in {dept}, hired {date}', { title: n.job_title, dept: deptName(n.department_code), date: n.hire_date });
        case 'transfer': { const d = get('department_code'); return tr('summary.transfer', '{from} → {to}', { from: deptName(d.from), to: deptName(d.to) }); }
        case 'terminate': return tr('summary.terminate', 'Leaves on {date}', { date: n.termination_date });
        case 'rehire': return tr('summary.rehire', 'Returns on {date} as {title}', { date: n.hire_date, title: n.job_title });
        case 'review': return reviewText(change.reason);
        case 'unchanged': return tr('summary.unchanged', 'No differences');
        default: return change.fields.filter(f => f.owner === 'HR').slice(0, 2).map(f => `${fieldLabel(f.field)}: ${f.from || '—'} → ${f.to || '—'}`).join(' · ');
    }
}

function renderPlan() {
    const { planned, validation } = state.current;
    const apply = $('#apply');
    if (!planned) {
        $('#plan-tabs').replaceChildren();
        $('#plan-table').replaceChildren(el('tbody', {}, el('tr', {}, el('td', { class: 'empty' }, tr(`rule.${validation.fatal.code}`, validation.fatal.code, validation.fatal.params)))));
        apply.disabled = true;
        apply.textContent = tr('plan.apply', 'Approve and apply {n} changes', { n: 0 });
        return;
    }
    const s = planned.summary;
    apply.disabled = s.applicable === 0;
    apply.textContent = s.applicable ? tr('plan.apply', 'Approve and apply {n} changes', { n: num(s.applicable) }) : tr('plan.nothing', 'Nothing to apply');
    const tabs = [['changes', s.applicable + s.review], ...ACTIONS.map(a => [a, s[a]])];
    $('#plan-tabs').replaceChildren(...tabs.filter(([key, n]) => n > 0 || key === 'changes').map(([key, n]) => el('button', {
        type: 'button', class: 'tab', role: 'tab', 'aria-selected': String(state.tab === key),
        onclick: () => { state.tab = key; state.expanded = new Set(); renderPlan(); },
    }, key === 'changes' ? tr('plan.tabChanges', 'All changes') : actionLabel(key), el('b', {}, num(n)))));
    if (!tabs.some(([key, n]) => key === state.tab && (n > 0 || key === 'changes'))) state.tab = 'changes';
    const rows = planned.changes.filter(c => (state.tab === 'changes' ? c.action !== 'unchanged' : c.action === state.tab));
    const employees = new Map(state.erp.employees.map(e => [e.employee_id, e]));
    const head = el('thead', {}, el('tr', {}, ['action', 'employee', 'department', 'change', 'notes'].map(k => el('th', { scope: 'col' }, tr(`plan.col.${k}`, k)))));
    const body = el('tbody');
    for (const change of rows) {
        const person = change.next || employees.get(change.id) || {};
        const open = state.expanded.has(change.id);
        const toggle = () => { if (open) state.expanded.delete(change.id); else state.expanded.add(change.id); renderPlan(); };
        const hasDiff = change.fields.length > 0;
        body.append(el('tr', { class: open ? 'is-selected' : '', onclick: hasDiff ? toggle : null },
            el('td', {}, chip(change.action)),
            el('td', {}, hasDiff ? el('button', { type: 'button', class: 'row-button', 'aria-expanded': String(open), onclick: event => { event.stopPropagation(); toggle(); } }, change.id) : el('strong', {}, change.id),
                el('span', { class: 'note-inline' }, `${person.first_name || ''} ${person.last_name || ''}`.trim())),
            el('td', {}, deptName(person.department_code || '')),
            el('td', { class: 'summary' }, changeSummary(change)),
            el('td', { class: 'summary' }, change.warnings.map(w => el('span', { class: 'note-inline warn' }, `⚠ ${warningText(w)}`)),
                change.line ? el('span', { class: 'note-inline' }, tr('plan.line', 'Line {n}', { n: change.line })) : null)));
        if (open) {
            body.append(el('tr', { class: 'diff-row' }, el('td', { colspan: '5' }, el('div', { class: 'diff' },
                change.fields.flatMap(f => [
                    el('span', { class: 'diff__field' }, fieldLabel(f.field)),
                    el('span', { class: 'diff__from' }, f.from || '—'),
                    el('span', { class: 'diff__arrow', 'aria-hidden': 'true' }, '→'),
                    el('span', { class: 'diff__to' }, f.to || '—'),
                    ownerBadge(f.owner),
                ])))));
        }
    }
    if (!rows.length) body.append(el('tr', {}, el('td', { class: 'empty', colspan: '5' }, tr('plan.empty', 'The ERP already agrees with this extract.'))));
    $('#plan-table').replaceChildren(head, body);
}

function renderHistory() {
    const runs = state.runs.map(r => ({ key: r.runId, short: shortDate(r.extractDate), label: `${r.runId} · ${shortDate(r.extractDate)}` }));
    const legend = [['var(--ink-3)', tr('history.before', 'Before the run')], ['var(--accent)', tr('history.after', 'After the run')]];
    $('#history-legend').replaceChildren(...legend.map(([color, label]) => el('li', {}, el('span', { class: 'legend__swatch', style: `background: ${color}` }), label)));
    runLines($('#match-chart'), {
        runs, format: pct, ariaLabel: tr('history.matchAria', 'Share of matched employees whose HR-owned fields agree, before and after each run'),
        series: [
            { label: tr('history.before', 'Before the run'), color: 'var(--ink-3)', values: state.runs.map(r => r.matchBefore), offset: 20 },
            { label: tr('history.after', 'After the run'), color: 'var(--accent)', values: state.runs.map(r => r.matchAfter), offset: -10 },
        ],
    });
    const exceptions = [
        ['var(--status-critical)', tr('history.rejected', 'Rejected rows'), state.runs.map(r => r.rejected)],
        ['var(--status-warning)', tr('history.review', 'Held for review'), state.runs.map(r => r.review)],
    ];
    runStacks($('#exceptions-chart'), {
        runs, ariaLabel: tr('history.exceptionsAria', 'Rejected rows and records held for review in each run'),
        series: exceptions.map(([color, label, values]) => ({ color, label, values })),
    });
    $('#exceptions-legend').replaceChildren(...exceptions.map(([color, label]) => el('li', {}, el('span', { class: 'legend__swatch', style: `background: ${color}` }), label)));

    const lastSession = [...state.runs].reverse().find(r => r.session);
    const columns = ['run', 'extract', 'applied', ...['insert', 'update', 'transfer', 'terminate', 'rehire', 'review'], 'rejected', 'agreement', ''];
    const head = el('thead', {}, el('tr', {}, columns.map(k => el('th', { scope: 'col', class: ['run', 'extract', 'applied', ''].includes(k) ? '' : 'num', title: ACTIONS.includes(k) ? actionLabel(k) : '' },
        ACTIONS.includes(k) ? GLYPH[k] : k ? tr(`history.col.${k}`, k) : ''))));
    const body = el('tbody', {}, [...state.runs].reverse().map(r => el('tr', { class: r.session ? 'is-selected' : '' },
        el('td', {}, el('strong', {}, r.runId), r.session ? el('span', { class: 'note-inline' }, tr('history.thisSession', 'This session')) : null),
        el('td', { class: 'muted' }, r.source),
        el('td', {}, `${utcFull(new Date(r.appliedAt)).slice(0, 16)} UTC`),
        ...['insert', 'update', 'transfer', 'terminate', 'rehire', 'review', 'rejected'].map(k => el('td', { class: 'num' }, num(r[k]))),
        el('td', { class: 'num' }, `${pct(r.matchBefore)} → ${pct(r.matchAfter)}`),
        el('td', {}, r === lastSession ? el('button', { type: 'button', class: 'button', onclick: () => undoRun(r) }, tr('history.undo', 'Undo')) : null))));
    $('#history-table').replaceChildren(head, body);
}

function renderAudit() {
    const query = state.search.trim().toLowerCase();
    const entries = [...state.audit].reverse().filter(a => !query
        || a.id.toLowerCase().includes(query) || a.field.toLowerCase().includes(query) || fieldLabel(a.field).toLowerCase().includes(query)
        || a.runId.toLowerCase().includes(query) || String(a.to).toLowerCase().includes(query));
    const shown = entries.slice(0, AUDIT_ROWS);
    const head = el('thead', {}, el('tr', {}, ['time', 'run', 'employee', 'action', 'field', 'from', 'to'].map(k => el('th', { scope: 'col' }, tr(`audit.col.${k}`, k)))));
    const body = el('tbody', {}, shown.map(a => el('tr', {},
        el('td', {}, `${utcFull(new Date(a.timestamp)).slice(0, 16)}`),
        el('td', {}, a.runId),
        el('td', {}, el('strong', {}, a.id)),
        el('td', {}, chip(a.action)),
        el('td', {}, fieldLabel(a.field)),
        el('td', { class: 'muted' }, a.from || '—'),
        el('td', {}, a.to || '—'))));
    if (!shown.length) body.append(el('tr', {}, el('td', { class: 'empty', colspan: '7' }, tr('audit.empty', 'No audit entries match this search.'))));
    $('#audit-table').replaceChildren(head, body);
    $('#audit-meta').textContent = tr('audit.meta', 'Showing {shown} of {total} entries, newest first. Times in UTC.', { shown: num(shown.length), total: num(entries.length) });
}

function renderContract() {
    const rules = {
        HR: tr('contract.hr', 'Copied from HR on every run'),
        cost_center: tr('contract.costCenter', "Set from the department's cost center on hire, transfer or rehire; otherwise the ERP keeps its value"),
        payroll_group: tr('contract.payroll', 'Set from the employment type on hire or when the type changes'),
    };
    const head = el('thead', {}, el('tr', {}, ['field', 'owner', 'rule'].map(k => el('th', { scope: 'col' }, tr(`contract.col.${k}`, k)))));
    const fields = ['employee_id', ...SYNCED_FIELDS, 'cost_center', 'payroll_group'];
    const body = el('tbody', {}, fields.map(field => el('tr', {},
        el('td', {}, el('strong', {}, fieldLabel(field)), el('span', { class: 'note-inline' }, field)),
        el('td', {}, field === 'employee_id' ? el('span', { class: 'owner' }, tr('owner.key', 'Match key')) : ownerBadge(OWNERSHIP[field])),
        el('td', { class: 'summary' }, field === 'employee_id' ? tr('contract.key', 'Joins HR and ERP records; never changed') : rules[field] || rules.HR))));
    $('#ownership-table').replaceChildren(head, body);
    const ruleCodes = ['missing', 'format.id', 'format.email', 'format.date', 'enum.status', 'enum.type', 'dept.unknown', 'date.future', 'term.missing', 'term.unexpected', 'term.beforeHire', 'duplicate.id'];
    $('#rule-list').replaceChildren(...ruleCodes.map(code => el('li', {}, tr(`ruleShort.${code}`, code))));
    $('#review-list').replaceChildren(
        ...['duplicate.person', 'missing.fromHr', 'reactivation.noRehire'].map(code => el('li', {}, tr(`reviewShort.${code}`, code))),
        el('li', {}, tr('contract.warnings', 'Missing or terminated managers are applied with a warning')));
}

// ---------- Actions ----------

function toast(text) {
    document.querySelector('.toast')?.remove();
    const node = el('div', { class: 'toast', role: 'status' }, text);
    document.body.append(node);
    setTimeout(() => node.remove(), 4200);
}

function applyCurrent() {
    const { extract, validation, planned, recon } = state.current;
    if (!planned || !planned.summary.applicable) return;
    const runId = `RUN-${String(state.runs.length + 1).padStart(3, '0')}`;
    const timestamp = new Date().toISOString();
    const result = apply(state.erp, planned, { runId, timestamp, source: extract.file });
    const s = planned.summary;
    state.runs.push({
        runId, source: extract.file, extractDate: extract.date, appliedAt: timestamp, session: true,
        read: s.read, valid: s.valid, rejected: s.rejected, warnings: s.warnings, review: s.review,
        insert: s.insert, update: s.update, transfer: s.transfer, terminate: s.terminate, rehire: s.rehire, unchanged: s.unchanged,
        matchBefore: recon.matchRate, matchAfter: reconcile(validation, result.erp).matchRate,
        audit: result.audit, snapshot: result.snapshot, previousApplied: new Set(state.applied),
    });
    state.erp = result.erp;
    state.audit.push(...result.audit);
    state.applied.add(extract.file);
    analyze();
    toast(tr('toast.applied', '{run} applied: {n} changes written, {audit} audit entries.', { run: runId, n: num(s.applicable), audit: num(result.audit.length) }));
}

function undoRun(run) {
    const result = undo(run, { timestamp: new Date().toISOString() });
    state.erp = result.erp;
    state.audit.push(...result.audit);
    state.runs = state.runs.filter(r => r !== run);
    state.applied = run.previousApplied;
    analyze();
    toast(tr('toast.undone', '{run} undone. The ERP is back to its previous state.', { run: run.runId }));
}

function upload(file) {
    if (!file) return;
    if (file.size > MAX_UPLOAD) { toast(tr('toast.tooBig', 'The file is larger than 5 MB.')); return; }
    const reader = new FileReader();
    reader.onload = () => {
        state.extracts.push({ file: file.name, date: new Date().toISOString().slice(0, 10), rows: 0, full: true, kind: 'upload', text: String(reader.result) });
        state.currentIndex = state.extracts.length - 1;
        analyze();
        toast(tr('toast.uploaded', '{name} loaded. Nothing changes until you approve the run.', { name: file.name }));
    };
    reader.readAsText(file);
}

function setStatus(text) { $('#status').textContent = text; }

async function main() {
    translatePage();
    initNav();
    setStatus(tr('status.loading', 'Loading data…'));
    try {
        await loadData();
        renderContract();
        await selectExtract(0);
        setStatus('');
        $('#extract').addEventListener('change', event => selectExtract(Number(event.target.value)));
        $('#upload').addEventListener('change', event => { upload(event.target.files[0]); event.target.value = ''; });
        $('#apply').addEventListener('click', applyCurrent);
        $('#reset').addEventListener('click', async () => { resetState(); await selectExtract(0); toast(tr('toast.reset', 'Demo reset to the original data.')); });
        $('#audit-search').addEventListener('input', event => { state.search = event.target.value; renderAudit(); });
        let width = $('.console').clientWidth;
        new ResizeObserver(() => {
            if ($('.console').clientWidth === width) return;
            width = $('.console').clientWidth;
            renderValidation(); renderImpact(); renderHistory();
        }).observe($('.console'));
    } catch (error) {
        console.error(error);
        setStatus(tr('status.error', 'Could not load the console data: {message}', { message: error.message }));
    }
}

main();
