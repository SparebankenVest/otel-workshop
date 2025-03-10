"use client"

import { useState, useEffect } from "react";
import "../../styles.css";
import { useParams, useRouter } from "next/navigation";
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

const logger = logs.getLogger('otel.workshop.client');

interface Params {
  id: string;
}

export default function FactPage() {
  const [fact, setFact] = useState("");
  const router = useRouter();
  const params = useParams();
  const apiUrl = process.env.API_URL;
  const id = params.id;

  useEffect(() => {
    if (id) {
      const fetchFact = async () => {
        try {
          const response = await fetch(`${apiUrl}/fact/${id}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          logger.emit({
            body: `Fetched fact with id: ${id}`,
            severityNumber: SeverityNumber.INFO,
          });
          setFact(data);
        } catch (error) {
          logger.emit({
            body: `Error fetching fact with id: ${id} - ${(error as Error).message}`,
            severityNumber: SeverityNumber.ERROR,
          });
          console.error('Error fetching fact:', error);
        }
      };
      fetchFact();
    }
  }, [id]);

  if (!fact) {
    return <div>Loading...</div>;
  }

  async function saveFact() {
    try {
      const response: Response = await fetch(`${apiUrl}/fact/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{\"fact\":\"" + fact + "\"}",
      });

      if (response.ok){
        const data = await response.json();
        logger.emit({
          body: `Fact with id: ${id} saved successfully`,
          severityNumber: SeverityNumber.INFO,
        });
        window.alert(data.message);
        router.push('/facts');
      }
    } catch (error) {
      logger.emit({
        body: `Error saving fact with id: ${id} - ${(error as Error).message}`,
        severityNumber: SeverityNumber.ERROR,
      });
      console.error(error);
    }
  }

  interface ChangeEvent {
    target: {
      value: string;
    };
  }

  const handleChange = (event: ChangeEvent) => {
    setFact(event.target.value);
  };

  async function deleteFact() {
    try {
      const response: Response = await fetch(`${apiUrl}/fact/${fact.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok){
        const data = await response.json();
        logger.emit({
          body: `Fact with id: ${fact.id} deleted successfully`,
          severityNumber: SeverityNumber.INFO,
        });
        window.alert(data.message);
        router.push('/facts');
        console.log(data.message);
      }
    } catch (error) {
      logger.emit({
        body: `Error deleting fact with id: ${fact.id} - ${(error as Error).message}`,
        severityNumber: SeverityNumber.ERROR,
      });
      console.error(error);
    }
  }

  return (
    <div className="container">
      {fact && (
        <div className="fact-section">
          <textarea value={fact.fact}
            onChange={handleChange} rows="4" cols="65"
            className="bg-stone-950 rounded-lg shadow-md p-4 "></textarea>
        </div>
      )}
      <button
        onClick={saveFact}
        className="bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-700 transition">
        Update fact
      </button>
      <button
        onClick={deleteFact}
        className="bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-700 transition">
        Delete fact
      </button>
    </div>
  );
}


