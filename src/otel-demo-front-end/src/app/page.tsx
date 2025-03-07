"use client"

import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Anton } from "next/font/google";
import "./styles.css";

// Floating emoji animation
const emojis: string[] = ['😊', '😂', '😍', '😎', '🤔', '😜', '😇', '🤩', '🥳', '😴'];

function createFloatingEmoji() {
  const emoji = document.createElement('div');
  emoji.classList.add('emoji');
  emoji.textContent = getRandomEmoji();
  document.body.appendChild(emoji);

  setTimeout(() => {
    document.body.removeChild(emoji);
  }, 10000); // 10s duration of the animation
}

function getRandomEmoji(): string {
  const randomIndex = Math.floor(Math.random() * emojis.length);
  return emojis[randomIndex];
}

// Font
const font = Anton( { weight: "400", style: "normal", subsets: ["latin"] } );

export default function Home() {
  const [facts, setFacts] = useState<{ id: string; fact: string }[]>([]);
  const [fact, setFact] = useState("");
  function handleClick() {
    fetch("https://otel-api.svai.dev/fact")
      .then((res) => res.json())
      .then((data) => setFact(data.text));
      console.log(fact);
  }

  async function saveFact() {
    console.log("saveFact");
    try {
      const response = fetch("https://otel-api.svai.dev/fact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{\"fact\":\"" + fact + "\"}",
      }).then((res) => res.json())
        .then((data) => setFacts(facts => ({
          ...facts,
          fact: fact,
          id: data.id,
        })));
      console.log(response);
      console.log(fact);
    } catch (error) {
      console.error(error);
    }
    setFacts(facts => ({ ...facts, fact }));
    console.log(facts);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      createFloatingEmoji();
    }, 20000); // every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <div className={font.className}>
        <h1 className="title">OpenTelemetry Workshop</h1>
        <p className="subtitle">This is a Next.js app with OpenTelemetry instrumentation</p>
        <div className="fact-section">
          <h2 className="fact-title">Your latest fact</h2>
          <p className="fact-text">{fact}</p>
        </div>
        <div className="button-section">
            <Button className="button" variant="contained" onClick={handleClick}>Get a new fact</Button>
        </div>
        <div style={{ margin: "20px 0" }}></div>
        <div className="button-section">
            <Button className="button" variant="contained" onClick={saveFact}>Save fact</Button>
        </div>
      </div>
    </div>
  );
}


