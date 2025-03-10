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
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Builder;
using System.Diagnostics.Metrics;

// Bygg konfigurasjon med støtte for miljøspesifikke appsettings
var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

// Sett opp OpenTelemetry med støtte for logging, tracing og metrics

builder.Logging.ClearProviders(); // Fjern alle standard logger-providere (f.eks. Console, Debug, EventSource, etc.). Ikke nødvendig hvis du vil beholde disse.
builder.Services
    .AddHttpContextAccessor()
    .AddOpenTelemetry()
    .WithLogging(logs => logs
        //.AddConsoleExporter()         // Skru på OTEL console logging for debugging
        .AddOtlpExporter())             // Skru på OTEL OTLP exporter for å sende data til OTEL Collector
    .WithMetrics(metrics => metrics
        .AddMeter("Otel.Workshop.Api")  // Opprett en ny meter for egendefinerte metrikker
        .AddAspNetCoreInstrumentation() // Auto instrumenter ASP.NET Core-metrikk (innkommende traffikk)
        .AddHttpClientInstrumentation() // Auto instrumenter HTTP-klientmetrikk (utgående trafikk)
        .AddRuntimeInstrumentation()    // Auto instrumenter runtime-metrikk (CPU, minne, etc.)
        // .AddConsoleExporter()        // Skru på OTEL console logging for debugging
        .AddOtlpExporter())             // Skru på OTEL OTLP exporter for å sende data til OTEL Collector
    .WithTracing(tracer => tracer
        .AddAspNetCoreInstrumentation() // Auto instrumenter ASP.NET Core-tracing (innkommende trafikk)
        .AddMongoDbClientInstrumentation() // Auto instrumenter MongoDB-tracing
        .AddHttpClientInstrumentation() // Auto instrumenter HTTP-klienttracing (utgående trafikk)
        // .AddConsoleExporter() // Skru på OTEL console logging for debugging
        .AddOtlpExporter())      // Skru på OTEL OTLP exporter for å sende data til OTEL Collector
    .ConfigureResource(resource => resource
        .AddService(
            serviceName: "otel-workshop-api",
            serviceVersion: "0.0.1" // Removed the extra comma here
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
        context.Response.ContentType = "application/json";
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

        var fact = document["fact"]?.AsString;
        if (fact == null)
        {
            logger.LogWarning("Fact is null.");
            return Results.NotFound(new { message = "Fact is null." });
        }

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
            var fact = await JsonSerializer.DeserializeAsync<Fact>(responseStream);
            if (fact == null || fact.Text == null)
            {
                logger.LogWarning("Fact or fact text is null.");
                return Results.NotFound(new { message = "Fact or fact text is null." });
            }

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

        if (requestData == null)
        {
            logger.LogWarning("Request data is null.");
            return Results.BadRequest(new { message = "Request data is null." });
        }

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

app.MapGet("/facts", async (ILogger<Program> logger) => {
    try
    {
        // Hent alle dokumentene fra Cosmos DB
        var documents = await collection.Find(new BsonDocument()).ToListAsync();

        if (documents == null || documents.Count == 0)
        {
            logger.LogWarning("No facts found.");
            return Results.NotFound(new { message = "No facts found." });
        }

        logger.LogInformation("Facts retrieved: " + documents.Count);

        // Returner dokumentene
        return Results.Ok(documents.Select(d => new { id = d["_id"].AsObjectId.ToString(), fact = d["fact"].AsString }));
    }
    catch (Exception e)
    {
        // Håndter feil
        logger.LogError("Error retrieving facts: " + e.Message);
        return Results.Problem(e.Message);
    }
});

app.MapDelete("/fact/{id}", async (string id, ILogger<Program> logger) => {
    try
    {
        // Konverter strengen til et ObjectId
        var objectId = ObjectId.Parse(id);

        // Slett dokumentet basert på ID
        var filter = Builders<BsonDocument>.Filter.Eq("_id", objectId);
        var result = await collection.DeleteOneAsync(filter);

        if (result.DeletedCount == 0)
        {
            logger.LogWarning("Fact not found.");
            return Results.NotFound(new { message = "Fact not found." });
        }

        logger.LogInformation("Fact deleted: " + id);

        // Returner en suksessmelding
        return Results.Ok(new { message = "Fact deleted successfully!" });
    }
    catch (Exception e)
    {
        // Håndter feil
        logger.LogError("Error deleting fact: " + e.Message);
        return Results.Problem(e.Message);
    }
});

app.MapPut("/fact/{id}", async (string id, HttpContext context, ILogger<Program> logger) => {
    try
    {
        // Konverter strengen til et ObjectId
        var objectId = ObjectId.Parse(id);

        // Les inn data fra forespørselsteksten
        var requestData = await context.Request.ReadFromJsonAsync<SaveRequest>();

        if (requestData == null)
        {
            logger.LogWarning("Request data is null.");
            return Results.BadRequest(new { message = "Request data is null." });
        }

        // Logg data for feilsøking
        logger.LogInformation("Updating text: " + requestData);

        // Oppdater tekststrengen i Cosmos DB
        var filter = Builders<BsonDocument>.Filter.Eq("_id", objectId);
        var update = Builders<BsonDocument>.Update.Set("fact", requestData.Fact);
        var result = await collection.UpdateOneAsync(filter, update);

        if (result.ModifiedCount == 0)
        {
            logger.LogWarning("Fact not found.");
            return Results.NotFound(new { message = "Fact not found." });
        }

        logger.LogInformation("Fact updated: " + id);

        // Returner en suksessmelding
        return Results.Ok(new { message = "Fact updated successfully!" });
    }
    catch (Exception e)
    {
        // Håndter feil
        logger.LogError("Error updating text: " + e.Message);
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