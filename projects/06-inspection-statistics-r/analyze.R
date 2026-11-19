inspections <- read.csv("inspections.csv")
stopifnot(all(is.finite(inspections$minutes)), all(inspections$minutes > 0))
print(aggregate(minutes ~ station, inspections, mean))
print(t.test(minutes ~ station, data = inspections, var.equal = FALSE))
png("inspection-durations.png", width = 900, height = 560, res = 120)
boxplot(minutes ~ station, data = inspections, xlab = "Station",
        ylab = "Duration (minutes)", main = "Simulated inspection durations",
        col = c("#9ad3da", "#aac3ed"))
stripchart(minutes ~ station, data = inspections, vertical = TRUE,
           method = "stack", add = TRUE, pch = 19, col = "#153352")
invisible(dev.off())
