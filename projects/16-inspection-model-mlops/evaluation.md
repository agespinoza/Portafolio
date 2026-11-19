# Inspection model evaluation

The reference run trained on nine inspections and held out three with IDs divisible by four. Both methods were scored on the same holdout rows.

| Estimator | Holdout mean absolute error (minutes) |
| --- | ---: |
| Training mean | 13.52 |
| Linear regression | 0.56 |

The model version includes the data and pipeline hashes. These synthetic holdout results illustrate the evaluation workflow. Three holdout records provide limited evidence about performance on new inspections.
