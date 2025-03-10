import { metrics, trace, Span } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

const tracer = trace.getTracer('otel.workshop.client');
const logger = logs.getLogger('otel.workshop.client');
//const meter = metrics.getMeter('otel.workshop.client');

// const buttonClickCounter = meter.createCounter('button.clicks.total', {
//   description: 'Total number of button clicks',
// });

export function fetchFact(setFact: (fact: string) => void) {
  //buttonClickCounter.add(1, { button: 'fetchFact' });
  return tracer.startActiveSpan('fetchFact', async (span: Span) => {
    try {
      const response = await fetch('https://otel-api.svai.dev/fact');
      logger.emit({
        body: 'fetchFact was called',
        severityNumber: SeverityNumber.INFO,
      });
      const data = await response.json();
      setFact(data.text);
      span.addEvent('fetchFact was called');
    } catch (error) {
      span.recordException(error as Error);
      logger.emit({
        body: `Error in fetchFact: ${(error as Error).message}`,
        severityNumber: SeverityNumber.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

export async function saveFact(fact: string, facts: { id: string; fact: string }[], setFacts: (facts: { id: string; fact: string }[]) => void) {
  //buttonClickCounter.add(1, { button: 'saveFact' });
  await tracer.startActiveSpan('saveFact', async (span: Span) => {
    try {
      const response = await fetch('https://otel-api.svai.dev/fact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fact }),
      });
      const data = await response.json();
      setFacts([...(Array.isArray(facts) ? facts : []), { fact, id: data.id as string }]);
      span.addEvent('saveFact was called');
    } catch (error) {
      span.recordException(error as Error);
      logger.emit({
        body: `Error in saveFact: ${(error as Error).message}`,
        severityNumber: SeverityNumber.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}