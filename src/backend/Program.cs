using OpenTelemetry.Logs;
using OpenTelemetry.Resources;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services
    .AddHttpContextAccessor()
    .AddOpenTelemetry()
    .WithLogging(config =>
    {
        // config.AddOtlpExporter("<COLLECTOR_URL>"); // Uncomment to enable OTLP log export
        config.AddConsoleExporter(); // Enable OTEL console logging for debugging purposes
    })
    .ConfigureResource(resource => resource
        .AddService(
            serviceName: "plask-2025-otel-workshop",
            serviceVersion: "1.0.0"
        ));

builder.Logging
    .ClearProviders()
    .AddOpenTelemetry(options =>
    {
        options.IncludeFormattedMessage = true;
        options.IncludeScopes = true;
        options.ParseStateValues = true;
        options.AddOtlpExporter();
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
    {
        var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
            .ToArray();
        
        app.Logger.LogInformation("Returning weather forecast for {ForecastDays} days", forecast.Length);
        
        return forecast;
    })
    .WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}