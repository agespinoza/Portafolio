# Inspection Duration Analysis in R

Compare mean inspection durations between two simulated stations using Welch's two-sample t-test.

## Career context

R was among the tools I used while developing and maintaining vehicle inspection software at Opus. This analysis demonstrates how to compare simulated inspection times across stations.

## Run the demo

Run `Rscript analyze.R` from this directory. The script prints the means, confidence interval and p-value and creates `inspection-durations.png`. Each row represents an independent simulated inspection. Results describe the sample and do not establish station causality.
