"use client"

import { useState } from "react";
import "../styles.css";
import { useRouter } from "next/navigation";
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { metrics, trace } from '@opentelemetry/api';
const logger = logs.getLogger('otel.workshop.client');

export default function FactPage() {
  const [fact, setFact] = useState("");
  const [startTime, setStartTime] = useState(0)
  const router = useRouter();
  const apiUrl = process.env.API_URL;

  const meter = metrics.getMeter('otel.workshop.client');
  const typingDuration = meter.createHistogram('fact.typing.duration', {
    description: 'Time spent typing a fact',
  });

  function getRandomFact() {
    fetch(`${apiUrl}/fact`)
      .then((res) => res.json())
      .then((data) => {
        setFact(data.text);
        logger.emit({
          body: 'Fetched a random fact',
          severityNumber: SeverityNumber.INFO,
        });
      })
      .catch((error) => {
        logger.emit({
          body: `Error fetching random fact: ${(error as Error).message}`,
          severityNumber: SeverityNumber.ERROR,
        });
        console.error('Error fetching random fact:', error);
      });
  }

  async function saveFact() {
    if(startTime){
      const endTime = performance.now();
      const duration = endTime - startTime;
      typingDuration.record(duration/1000); // convert to seconds
    
    }

    try {
      const response: Response = await fetch(`${apiUrl}/fact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json" 
        },
        body: "{\"fact\":\"" + fact + "\"}",
      });

      if (response.ok){
        const data = await response.json();
        logger.emit({
          body: 'Fact saved successfully',
          severityNumber: SeverityNumber.INFO,
        });
        window.alert(data.message);
        router.push('/facts');
      }
    } catch (error) {
      logger.emit({
        body: `Error saving fact: ${(error as Error).message}`,
        severityNumber: SeverityNumber.ERROR,
      });
      console.error('Error saving fact:', error);
    }
  }

  const handleChange = (event) => {
    if(!startTime){
      setStartTime(performance.now());
    }
    setFact(event.target.value);
  };

  return (
    <div className="container">
      <div className="fact-section">
        <textarea value={fact}
          onChange={handleChange} rows="4" cols="65"
          className="bg-stone-950 rounded-lg shadow-md p-4 "></textarea>
      </div>
      <button
        onClick={saveFact}
        className="bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-700 transition">
        Save fact
      </button>
      <button
        onClick={getRandomFact}
        className="bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-700 transition">
        Get random fact
      </button>
    </div>
  );
}


