import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader, ConsoleMetricExporter, MeterProvider } from '@opentelemetry/sdk-metrics';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import opentelemetry from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import { LoggerProvider, SimpleLogRecordProcessor, ConsoleLogRecordExporter } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';

export const initInstrumentation = () => {
  const resource = new Resource({
    [ATTR_SERVICE_NAME]: 'otel-workshop-client',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  });

  // Exporters
  const traceConsoleExporter = new ConsoleSpanExporter();
  const metricConsoleExporter = new ConsoleMetricExporter();
  const traceOtelExporter = new OTLPTraceExporter({
    url: 'https://http.monitoring.svai.dev/v1/traces',
  });
  const metricOtelExporter = new OTLPMetricExporter({
    url: 'https://http.monitoring.svai.dev/v1/metrics',
  });
  const logOtelExporter = new OTLPLogExporter({
    url: 'https://http.monitoring.svai.dev/v1/logs',
  });

  // Tracing setup
  const provider = new WebTracerProvider({
    resource: resource,
    spanProcessors: [
      new SimpleSpanProcessor(traceOtelExporter),       // Enable OTLP exporter
    ],
  });

  // initialize the provider
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // Register instrumentations / plugins
  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation(),
    ]
  });

  const otelMetricReader = new PeriodicExportingMetricReader({
    exporter: metricOtelExporter,
    exportIntervalMillis: 10000,
  });

  const meterProvider = new MeterProvider({
    resource: resource,
    readers: [
      otelMetricReader
    ],
  });

  // Set this MeterProvider to be global to the app being instrumented.
  opentelemetry.metrics.setGlobalMeterProvider(meterProvider);

  // Logging setup
  const loggerProvider = new LoggerProvider({
    resource: resource,
  });

  loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logOtelExporter));
  //loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()));

  logs.setGlobalLoggerProvider(loggerProvider);
}