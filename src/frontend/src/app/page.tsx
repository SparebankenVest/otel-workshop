"use client"

import { useEffect } from "react";
import { FaUncharted } from 'react-icons/fa';  // Importer ikonet du vil bruke

import "./styles.css";
import { useRouter } from "next/navigation";
import { initInstrumentation } from "../otel/instrumentation.client";
import { metrics, Counter } from '@opentelemetry/api';

// Font
export default function Home(buttonClickCounter: Counter) {

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== undefined) {
      initInstrumentation();
      console.log('Instrumentation initialized');
    }
  }, []);

  const handleNavigate = (path: string, buttonClickCounter: Counter) => {
    router.push(path);
  }

  return (
    <div className="text-center p-4">
      <h1 className="text-8xl font-bold mb-4">
      <FaUncharted className="inline mr-2 text-brown-500" />  {/* Bruk ikonet her */}
      Hello OTEL !
      </h1>
      <button
        onClick={() => handleNavigate('/facts')}
        className="bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-700 transition">
        View existing facts
      </button>
      <button
        onClick={() => handleNavigate('/fact')}
        className="bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-700 transition">
        Add new facts
      </button>
    </div>
  );
}


