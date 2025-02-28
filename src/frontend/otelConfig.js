const opentelemetry = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const { MeterProvider, PeriodicExportingMetricReader, ConsoleMetricExporter } = require('@opentelemetry/sdk-metrics');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { Resource } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');

// Set up diagnostic logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Read the OTel collector URL from environment variables
const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
if (!otelEndpoint) {
  console.error('OTEL_EXPORTER_OTLP_ENDPOINT environment variable is not set.');
  process.exit(1);
}

// Define a custom resource attributes
const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: 'otel-workshop-frontend',
    [ATTR_SERVICE_VERSION]: '0.0.1',
  }),
);

// A custom trace exporter that sends traces to the OTel collector
const traceExporter = new OTLPTraceExporter({
  // optional - default url is http://localhost:4318/v1/traces
  url: `${otelEndpoint}/v1/traces`,
  // optional - collection of custom headers to be sent with each request, empty by default
  headers: {},
})

// A custom metric reader that exports metrics every 10 seconds
const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    url: `${otelEndpoint}/v1/metrics`, // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
    headers: {}, // an optional object containing custom headers to be sent with each request
    concurrencyLimit: 1, // an optional limit on pending requests
  }),
  // Default is 60000ms (60 seconds). Set to 30 seconds for demonstrative purposes only.
  exportIntervalMillis: 30000,
})

// Create a MeterProvider with the custom metric reader
const meterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(meterProvider);

// // Initialize the OpenTelemetry SDK
// const sdk = new NodeSDK({
//   resource: resource,
//   traceExporter: traceExporter,
//   metricReader: metricReader,
//   instrumentations: [getNodeAutoInstrumentations()],
// });

// // Start the SDK
// (async () => {
//   try {
//       await sdk.start();
//       console.log('OpenTelemetry SDK started.');
//   } catch (error) {
//     console.error('Error starting OpenTelemetry SDK:', error);
//   }
// })();

// // Gracefully shut down the SDK on process exit
// process.on('SIGTERM', () => {
//   sdk.shutdown()
//     .then(() => console.log('OpenTelemetry SDK shut down'))
//     .catch((error) => console.error('Error shutting down OpenTelemetry SDK:', error))
//     .finally(() => process.exit(0));
// });