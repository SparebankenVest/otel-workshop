'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

const logger = logs.getLogger('otel.workshop.client');

export default function Home() {
  const [facts, setFacts] = useState([]);
  const apiUrl = process.env.API_URL;

  useEffect(() => {
    // Function to fetch facts from the API
    const fetchFacts = async () => {
      try {
        const response = await fetch(`${apiUrl}/facts`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        logger.emit({
          body: 'Fetched all facts',
          severityNumber: SeverityNumber.INFO,
        });
        setFacts(data);
      } catch (error) {
        logger.emit({
          body: `Error fetching facts: ${(error as Error).message}`,
          severityNumber: SeverityNumber.ERROR,
        });
        console.error('Error fetching facts:', error);
      }
    };

    fetchFacts();
  }, []); // Empty dependency array means this useEffect runs only once, when the component mounts

  return (
    <table className="border-gray-400 border-spacing-5 table-auto w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead className="p-2 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th className='p-2 text-white font-bold'>Fact</th>
          <th className='p-2 text-white font-bold'>Action</th>
        </tr>
      </thead>
      <tbody>
        {facts.map((fact) => (
          <tr key={fact.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
            <td className='p-2'>{fact.fact}</td>
            <td className='p-2'>
              <Link href={`/fact/${fact.id}`}>Edit</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
