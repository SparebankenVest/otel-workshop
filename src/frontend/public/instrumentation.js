
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces' || 'https://localhost:4318/v1/traces',
});

const traceProvider = new WebTracerProvider({
  resource: new Resource({                          // Define a custom resource attributes
    [ATTR_SERVICE_NAME]: 'otel-workshop-frontend2',
    [ATTR_SERVICE_VERSION]: '0.0.1',
  }),
  spanProcessors: [
    new SimpleSpanProcessor(traceExporter),
    new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ]
});

traceProvider.register({
  // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optiona
  contextManager: new ZoneContextManager(),
});

// Track user interactions
// Automatically captures interactions like button clicks
// and form submissions, helping you monitor user journeys
const userInteractionInstrumentation = new UserInteractionInstrumentation();
userInteractionInstrumentation.setTracerProvider(traceProvider);

// Registering instrumentations
registerInstrumentations({
  instrumentations: [new DocumentLoadInstrumentation()],
});

console.log("Opentelemetry initialized");