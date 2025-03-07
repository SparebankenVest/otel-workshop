using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using MongoDB.Driver;
using MongoDB.Bson;
using Microsoft.Extensions.Configuration;

// Bygg konfigurasjon med støtte for miljøspesifikke appsettings
var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

// Sett opp OpenTelemetry med støtte for logging, tracing og metrics
builder.Services
    .AddHttpContextAccessor()
    .AddOpenTelemetry()
    .WithLogging(logs => logs
        .ClearProviders()               // Fjern alle standard logger-providere (f.eks. Console, Debug, EventSource, etc.). Ikke nødvendig hvis du vil beholde disse.
        //.AddConsoleExporter()         // Skru på OTEL console logging for debugging
        .AddOtlpExporter())             // Skru på OTEL OTLP exporter for å sende data til OTEL Collector
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation() // Auto instrumenter ASP.NET Core-metrikk (innkommende traffikk)
        .AddHttpClientInstrumentation() // Auto instrumenter HTTP-klientmetrikk (utgående trafikk)
        .AddRuntimeInstrumentation()
        // .AddConsoleExporter()        // Skru på OTEL console logging for debugging
        .AddOtlpExporter())             // Skru på OTEL OTLP exporter for å sende data til OTEL Collector
    .WithTracing(tracer => tracer
        .AddAspNetCoreInstrumentation() // Auto instrumenter ASP.NET Core-tracing (innkommende trafikk)
        .AddHttpClientInstrumentation() // Auto instrumenter HTTP-klienttracing (utgående trafikk)
        // .AddConsoleExporter() // Skru på OTEL console logging for debugging
        .AddOtlpExporter())      // Skru på OTEL OTLP exporter for å sende data til OTEL Collector
    .ConfigureResource(resource => resource
        .AddService(
            serviceName: "otel-workshop-api",
            serviceVersion: "0.0.1",
        ));

// Custom Metrics
// Sett opp meter og lag en counter metrikk
var customMeter = new Meter("Otel.Workshop.Api");
var factWordCounter = customMeter.CreateCounter<int>("otel.workshop.fact.word.count", description: "Counts the number of words in a fact");

var app = builder.Build();
var configuration = app.Services.GetRequiredService<IConfiguration>();
var mongoClient = new MongoClient(configuration["ConnectionStrings:MongoDB"]);
var database = mongoClient.GetDatabase("otel-mongodb");
var collection = database.GetCollection<BsonDocument>("facts");

app.MapOpenApi(); // GET openapi/v1.json

app.MapHealthChecks("/health");

app.Use(async (context, next) =>
{
    await next();
    // Hvis responsen er 404 og ikke har startet, returner en JSON-feilmelding
    if (context.Response.StatusCode == 404 && !context.Response.HasStarted)
    {
        context.requesrt= "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { message = "Page not found." }));
    }
});

app.MapGet("/fact/{id}", async (string id, ILogger<Program> logger) => {
    try
    {
        // Konverter strengen til et ObjectId
        var objectId = ObjectId.Parse(id);

        // Finn dokumentet basert på ID
        var filter = Builders<BsonDocument>.Filter.Eq("_id", objectId);
        var document = await collection.Find(filter).FirstOrDefaultAsync();

        if (document == null)
        {
            logger.LogWarning("Fact not found.");
            return Results.NotFound(new { message = "Fact not found." });
        }
        fact = document["fact"].AsString;
        logger.LogInformation("Fact retrieved: " + fact);

        // METRIKK: tell antall ord i faktaet
        var wordCount = fact.Split(' ').Length;
        factWordCounter.Add(wordCount);

        // Returner dokumentet
        return Results.Ok(new { id = document["_id"].AsObjectId.ToString(), fact = fact });
    }
    catch (Exception e)
    {
        logger.LogError("Error retrieving fact: " + e.Message);
        return Results.Problem(e.Message);
    }
});

app.MapGet("/fact", async (ILogger<Program> logger) => {
    using (HttpClient client = new HttpClient())
    {
        try
        {
            // Angi URL-en til det eksterne endepunktet
            string url = "https://uselessfacts.jsph.pl/api/v2/facts/random";

            // Send en GET-forespørsel til endepunktet
            HttpResponseMessage response = await client.GetAsync(url);

            // Sjekk om responsen er vellykket
            response.EnsureSuccessStatusCode();

            // Les innholdet fra responsen som en stream
            using var responseStream = await response.Content.ReadAsStreamAsync();

            // Deserialiser JSON-strengen til et C#-objekt asynkront
            var  fact = await JsonSerializer.DeserializeAsync<Fact>(responseStream);
            logger.LogInformation("Fact retrived: " + fact.Text);

            // METRIKK: tell antall ord i faktaet
            var wordCount = fact.Text.Split(' ').Length;
            factWordCounter.Add(wordCount);

            // Returner det deserialiserte objektet
            return Results.Ok(fact);
        }
        catch (HttpRequestException e)
        {
            // Håndter feil ved HTTP-forespørsel
            logger.LogError("HTTP Request Error: " + e.Message);
            return Results.Problem(e.Message);
        }
    }
});


app.MapPost("/fact", async (HttpContext context, ILogger<Program> logger) => {
    try
    {
        // Les inn data fra forespørselsteksten
        var requestData = await context.Request.ReadFromJsonAsync<SaveRequest>();

        // Logg data for feilsøking
        logger.LogInformation("Storing text: " + requestData);

        // Lagre tekststrengen i Cosmos DB
        var document = new BsonDocument
        {
            { "fact", requestData.Fact }
        };

        await collection.InsertOneAsync(document);

        // Returner en suksessmelding
        return Results.Ok(new { id = document["_id"].AsObjectId.ToString(), message = "Fact stored successfully!" });

    }
    catch (Exception e)
    {
        // Håndter feil
        logger.LogError("Error storing text: " + e.Message);
        return Results.Problem(e.Message);
    }
});

app.Run();

// Definer en modell som matcher JSON-strukturen
public class Fact
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("text")]
    public string? Text { get; set; }

    [JsonPropertyName("source")]
    public string? Source { get; set; }

    [JsonPropertyName("source_url")]
    public string? SourceUrl { get; set; }

    [JsonPropertyName("language")]
    public string? Language { get; set; }

    [JsonPropertyName("permalink")]
    public string? Permalink { get; set; }
}

public class SaveRequest
{
    [JsonPropertyName("fact")]
    public string? Fact { get; set; }
}