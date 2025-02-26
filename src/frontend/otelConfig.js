const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { MeterProvider, PeriodicExportingMetricReader, ConsoleMetricExporter } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

// Set up diagnostic logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: 'otel-workshop-frontend'
  }),
);

// Read the OTel collector URL from environment variables
const otelEndpoint = process.env.OTEL_COLLECTOR_URL;
if (!otelEndpoint) {
  console.error('OTEL_COLLECTOR_URL environment variable is not set.');
  process.exit(1);
}

// Configure the OTLP exporter
const traceExporter = new OTLPTraceExporter({
  url: `${otelEndpoint}/v1/traces`,
  headers: {
    Authorization: process.env.OTEL_AUTH_HEADER || '', // Optional: If authentication is required
  },
});

const metricExporter = new OTLPMetricExporter({
  url: `${otelEndpoint}/v1/metrics`,
  headers: {
    Authorization: process.env.OTEL_AUTH_HEADER || '', // Optional: If authentication is required
  },
});

// Initialize the OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: resource,
  traceExporter,
  metricExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'my-nodejs-service',
});

// Start the SDK
(async () => {
  try {
      await sdk.start();
      console.log('OpenTelemetry SDK started.');
  } catch (error) {
    console.error('Error starting OpenTelemetry SDK:', error);
  }
})();

// METRICS
// Set up the metric reader
const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),

  // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);


// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down'))
    .catch((error) => console.error('Error shutting down OpenTelemetry SDK:', error))
    .finally(() => process.exit(0));
});