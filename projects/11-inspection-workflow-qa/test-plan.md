# Inspection workflow test plan

Verify the completion transition using synthetic records. Run the three cases with Python unittest before approving a change to the workflow rules. Release requires all three behaviors to pass with no expected failures.

| Case | Starting status | Checklist | Expected | Observed |
| --- | --- | --- | --- | --- |
| QA-01 | In progress | Complete | Complete the inspection | Pass |
| QA-02 | Scheduled | Complete | Reject completion | Pass |
| QA-03 | In progress | Incomplete | Reject completion | Defect QA-03 |
