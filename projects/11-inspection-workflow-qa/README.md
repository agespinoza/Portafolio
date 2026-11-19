# Inspection Workflow Quality Assurance

Test a simulated inspection workflow and reproduce a defect that allows completion without a checklist.

## Career context

At Teleplan International, I wrote inspection criteria and checklists, executed functional tests, and documented defects. The demo applies that method to a simulated vehicle inspection workflow.

## Run the demo

Run `python3 -m unittest -v` from this directory. The suite documents one expected failure. To see the assertion fail directly, run `python3 -c 'from test_workflow import WorkflowTests; WorkflowTests().test_incomplete_checklist()'`.
