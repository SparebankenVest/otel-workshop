"use client"
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import "../styles/styles.css";
import { saveFact, fetchFact } from "../utils/fact";
import { createFloatingEmoji } from "../utils/emoji";
import { initInstrumentation } from "../otel/instrumentation.client";
import { metrics } from '@opentelemetry/api';


export default function Home() {
  const buttonMeter = metrics.getMeter('otel.workshop.client');
  const buttonClickCounter = buttonMeter.createCounter('button.clicks.total', {
    description: 'Total number of button clicks',
  });


  useEffect(() => {
    if (typeof window !== undefined) {
        initInstrumentation();
    }
    const meter = metrics.getMeter('otel.workshop.client');
    const emojiCounter = meter.createCounter('emoji.count.total', {
      description: 'Total number of emojis displayed',
    });
    const interval = setInterval(() => {
      const emoji = createFloatingEmoji();
      emojiCounter.add(1, { 'emoji': "somestring" });
    }, 60000); // every 20 seconds

    return () => clearInterval(interval);
  }, []);

  const [facts, setFacts] = useState<{ id: string; fact: string }[]>([]);
  const [fact, setFact] = useState("");

  const handleFetchFact = () => {
    buttonClickCounter.add(1, { button: 'fetchFact' });
    fetchFact(setFact);
  };

  const handleSaveFact = () => {
    buttonClickCounter.add(1, { button: 'saveFact' });
    saveFact(fact, facts, setFacts);
  };

  return (
    <div className="container">
      <h1 className="title">OpenTelemetry Workshop</h1>
      <p className="subtitle">This is a Next.js app with OpenTelemetry instrumentation</p>
      <div className="fact-section">
        <h2 className="fact-title">Your latest fact</h2>
        {fact && <p className="fact-text">{fact}</p>}
      </div>
      <div className="button-section">
        <Button className="button" variant="contained" onClick={handleFetchFact}>Get a new fact</Button>
      </div>
      <div style={{ margin: "20px 0" }}></div>
      <div className="button-section">
        <Button className="button" variant="contained" onClick={handleSaveFact}>Save fact</Button>
      </div>
    </div>
  );
}


