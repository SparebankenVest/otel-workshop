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
   
          

    <table className="border-gray-400 border-spacing-5 table-auto w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="p-2 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
            <th className='p-2  text-white  font-bold'>Fact</th>
            <th className='p-2  text-white font-bold'>Action</th>
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
