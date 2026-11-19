# HR–ERP Integration Console

Every week, Human Resources exports its employee list and the ERP must agree with it. The two systems drift apart: people are hired, transferred and rehired, data is entered by hand, and some records exist in only one place. This console runs that synchronization the way a production integration should. It validates each extract, previews every change before the ERP is touched, applies only approved runs, logs every field it writes and can undo a run.

## Career context

At DIF, I designed an Oracle and C# ERP system that integrated with human resources. This demo applies the same integration practices to fictional data: a data contract, row-level validation, field ownership rules, reconciliation and an audit trail.

## What it shows

| View | What it answers |
| --- | --- |
| Pipeline | How many rows were read, passed validation, matched an ERP record, will be applied and are held for review. |
| Validation | Which rows were rejected, on which line and by which rule. |
| Impact | How active headcount by department changes if the run is applied. |
| Change plan | Every proposed change, filterable by action, with a field-by-field diff that shows which system owns each field. |
| Run history | HR–ERP agreement before and after each run, exceptions per run, and undo for runs applied in the session. |
| Audit trail | Every field written, with its old and new value, searchable by employee or field. |
| Data contract | The source of truth for each field, the validation rules and the cases sent to review. |

You can switch between three pending weekly extracts and a practice file that triggers every validation rule. You can also upload your own CSV; the template link downloads a valid extract. Nothing changes until a run is approved, and reloading the page resets the demo.

## Integration rules

- **Match key:** `employee_id`, formatted as E followed by five digits.
- **HR-owned fields:** identity, job, department, manager, location, employment type, dates and status are copied from HR on every run.
- **ERP-derived fields:** the cost center comes from the department on hire, transfer or rehire; otherwise the ERP keeps its value. The payroll group comes from the employment type.
- **Actions:** new hire, update, transfer, termination, rehire, unchanged and review.
- **Rejected rows:** missing required fields, malformed IDs, emails or dates, unknown status or employment type, departments not yet set up in the ERP, future hire dates, inconsistent termination data and duplicated IDs. All 12 rules are listed in the console's data contract.
- **Sent to review, never applied automatically:** a new ID that shares a national ID or email with an existing employee, active ERP employees missing from a full extract, and reactivations without a new hire date.
- **Warnings that do not block a change:** managers who do not exist or are terminated.

## Code

| File | Purpose |
| --- | --- |
| [`engine.js`](engine.js) | The synchronization engine: CSV parsing, validation, planning, apply, undo and reconciliation. It has no user interface. |
| [`engine.test.mjs`](engine.test.mjs) | 15 automated tests of the engine, including idempotency and exact undo. |
| [`generate_data.mjs`](generate_data.mjs) | Seeded generator for a fictional 200-person organization and eight weekly extracts. The first five weeks are processed with the engine to build the ERP state and the run history. |
| [`app.js`](app.js), [`charts.js`](charts.js) | The browser console and its D3 charts. |
| [`messages.js`](messages.js) | Interface text in Spanish, Japanese, Italian and French. English text sits next to each string in the code. |

The browser console and the tests run the same engine. All people, IDs and emails are fictional, and every address uses the reserved `example.org` domain.

## Run it

From the repository root:

```sh
python3 -m http.server 8000                                  # then open http://localhost:8000/projects/09-employee-erp-integration/
node --test projects/09-employee-erp-integration/engine.test.mjs   # run the tests (Node 20 or later)
node projects/09-employee-erp-integration/generate_data.mjs        # regenerate the dataset
```
