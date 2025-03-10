"use client"

import { useEffect } from "react";
import { FaUncharted } from 'react-icons/fa';  // Importer ikonet du vil bruke

import "./styles.css";
import { useRouter } from "next/navigation";
import { initInstrumentation } from "../otel/instrumentation.client";
import { metrics } from '@opentelemetry/api';
import { createFloatingEmoji } from "../utils/emoji";


// Font

export default function Home() {

  const router = useRouter();
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
      createFloatingEmoji();
      emojiCounter.add(1);
    }, 60000*5); // every 5 minutes

    return () => clearInterval(interval);
  }, []);



  const handleNavigate = (path: string) => {
    buttonClickCounter.add(1, { "path": path });
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


