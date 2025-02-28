const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const { trace, metrics } = require('@opentelemetry/api');

// Aquire a Tracer and a Meter for the frontend service
const tracer = trace.getTracer('otel-workshop-frontend','0.0.1');
const meter = metrics.getMeter('otel-workshop-frontend','0.0.1');

// Define some counter metrics
const counter = meter.createCounter(
  'otel.workshop.button.click.counter',
  {
    description: 'A counter of button clicks',
  },
);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a simple REST API endpoint
app.get('/api/button1', (req, res) => {
  counter.add(1, { button: 'button1' });
  try {
    // Simulate some work
    res.json({ message: 'Button 1 clicked!' });
  } catch (error) {
    console.error('Error handling button1 click:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/button2', (req, res) => {
  counter.add(1, { button: 'button2' });
  try {
    // Simulate some work
    res.json({ message: 'Button 2 clicked!' });
  } catch (error) {
    console.error('Error handling button2 click:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/button3', (req, res) => {
  counter.add(1, { button: 'button3' });
  try {
    // Simulate some work
    res.json({ message: 'Button 3 clicked!' });
  } catch (error) {
    console.error('Error handling button3 click:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
