# Clean and summarize inspection records in Excel

Allow 30 minutes. By the end, learners can standardize text, apply a data quality rule and calculate station totals from valid rows.

1. Open the Practice sheet. Inspect the raw columns A through C and notice the inconsistent station names, missing duration, and zero duration.
2. In D4, enter `=PROPER(TRIM(B4))` and fill through D9.
3. In E4, enter `=IF(AND(ISNUMBER(C4),C4>0),"Valid","Review")` and fill through E9.
4. In H4, enter `=SUMIFS($C$4:$C$9,$D$4:$D$9,G4,$E$4:$E$9,"Valid")` and fill through H5.
5. Check that North totals 50 minutes and South totals 60 minutes. Two rows should need review.

## Rubric

| Criterion | Points |
| --- | ---: |
| Preserve all six raw rows and correctly normalize every station | 3 |
| Flag the missing duration and the zero duration for review | 3 |
| Show correct totals for both stations using formulas | 3 |
| Explain why the two flagged records were excluded | 1 |
