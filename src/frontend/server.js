const express = require('express');
const path = require('path');
const { trace } = require('@opentelemetry/api');
const app = express();
const port = 3000;

// Import the OpenTelemetry configuration
require('./otelConfig');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a simple REST API endpoint
app.get('/api/button1', (req, res) => {
  const tracer = trace.getTracer('button-tracer');
  const span = tracer.startSpan('button1-clicked');
  try {
    // Simulate some work
    res.json({ message: 'Button 1 clicked!' });
  } catch (error) {
    span.setStatus({ code: trace.SpanStatusCode.ERROR, message: error.message });
    span.end();
    console.error('Error handling button1 click:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    span.end();
  }
});

app.get('/api/button2', (req, res) => {
  const tracer = trace.getTracer('button-tracer');
  const span = tracer.startSpan('button2-clicked');
  try {
    // Simulate some work
    res.json({ message: 'Button 2 clicked!' });
  } catch (error) {
    span.setStatus({ code: trace.SpanStatusCode.ERROR, message: error.message });
    span.end();
    console.error('Error handling button2 click:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    span.end();
  }
});

app.get('/api/button3', (req, res) => {
  const tracer = trace.getTracer('button-tracer');
  const span = tracer.startSpan('button3-clicked');
  try {
    // Simulate some work
    res.json({ message: 'Button 3 clicked!' });
  } catch (error) {
    span.setStatus({ code: trace.SpanStatusCode.ERROR, message: error.message });
    span.end();
    console.error('Error handling button3 click:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    span.end();
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
