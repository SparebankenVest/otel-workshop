'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [facts, setFacts] = useState([]);

  useEffect(() => {
    // Funksjon for å hente fakta fra API-en
    const fetchFacts = async () => {
      try {
        const response = await fetch('https://otel-api.svai.dev/facts');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFacts(data);
      } catch (error) {
        console.error('Error fetching facts:', error);
      }
    };

    fetchFacts();
  }, []); // Tomt avhengighetsarray betyr at useEffect kjører bare en gang, når komponenten monteres

  return (
    <div>
      {facts.length>0 && (
        <div className="fact-list relative voerflow-x-auto">
          <h2>Saved Facts</h2>
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
            <th>Fact</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {facts.map((fact) => (
            <tr key={fact.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
           
              <td>{fact.fact}</td>
              <td>
               <Link href={`/fact/${fact.id}`}>View Fact</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
          </div>
          )}
    </div>
  );
}
