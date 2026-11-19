var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var stages = new[] { "Submitted", "Under review", "Approved" };
var stage = 0;
var gate = new object();
var activity = new List<Activity> { new(DateTimeOffset.UtcNow, stages[0]) };

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/api/application", () =>
{
    lock (gate)
    {
        return Results.Ok(new { id = "M-1001", stage, status = stages[stage], activity = activity.ToArray() });
    }
});
app.MapPost("/api/application/advance", (AdvanceRequest request) =>
{
    lock (gate)
    {
        if (request.ExpectedStage != stage || stage == stages.Length - 1)
            return Results.Conflict(new { error = "The application has already moved or is complete." });

        stage++;
        activity.Add(new Activity(DateTimeOffset.UtcNow, stages[stage]));
        return Results.NoContent();
    }
});
app.Run();

record AdvanceRequest(int? ExpectedStage);
record Activity(DateTimeOffset TimestampUtc, string Status);
