# Employee data model

| Field | Meaning |
| --- | --- |
| employee_id | Stable unique text key |
| name | Employee display name |
| department | Department assigned in HR |

HR owns the name and department for IDs present in HR. ERP-only records are retained and flagged for review. A blank field or duplicate employee ID invalidates the input before any output is written.
