# QA-03 Incomplete checklist allows completion

Severity is high because an incomplete inspection can appear finished.

1. Open a shell in this directory with Python 3.
2. Run `python3 -c 'from workflow import complete; print(complete("In progress", False))'`.
3. Observe the status returned.

Expected behavior is a validation error and no status transition. The current fixture returns `Completed`. After fixing the checklist guard, remove the expected-failure marker and rerun the suite.
