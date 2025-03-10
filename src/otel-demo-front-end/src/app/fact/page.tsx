"use client"

import { useState } from "react";
import "../styles.css";
import { useRouter } from "next/navigation";
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

const logger = logs.getLogger('otel.workshop.client');

export default function FactPage() {
  const [fact, setFact] = useState("");
  const router = useRouter();
  const apiUrl = process.env.API_URL;

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
    try {
      const response: Response = await fetch(`${apiUrl}/fact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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


