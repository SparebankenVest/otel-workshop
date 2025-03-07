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
  const addFact = (newFact: { id: string; fact: string }) => {
    setFacts((prevFacts) => [...prevFacts, newFact]);
    console.log(facts);
    console.log(fact);
  };

  const getFact = (id: string) => {
    fetch(`https://otel-api.svai.dev/fact/${id}`, {
      method: "GET",
    })
    .then((res) => res.json())
    .then((data) => setFact(data.fact));
    console.log(fact);
  };


  async function saveFact() {
    try {
      const response: Response = await fetch("https://otel-api.svai.dev/fact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{\"fact\":\"" + fact + "\"}",
      });

      if (response.ok){
        console.log("Fact saved successfully");
        const data = await response.json();
        addFact({ id: data.id, fact: fact });


      }
    } catch (error) {
      console.error(error);
    }

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
        {fact !="" && (
        <div className="fact-section">
          <p className="fact-text">{fact}</p>
        </div>
      )}
        <div className="button-section">
            <Button className="button" variant="contained" onClick={handleClick}>Get a new fact</Button>
        </div>
        <div style={{ margin: "20px 0" }}></div>
        {fact !="" && (
        <div className="button-section">
            <Button className="button" variant="contained" onClick={saveFact}>Save fact</Button>
        </div>
        )}
      {facts.length>0 && (
        <div className="fact-list">
          <h2>Saved Facts</h2>
      <table className="table-auto">
        <thead>
          <tr>
            <th>Fact</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {facts.map((fact) => (
            <tr key={fact.id}>
              <td>{fact.fact}</td>
              <td>
                <button className="table-button" onClick={() => getFact(fact.id)}>Get fact</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
          </div>
          )}
      </div>
    </div>
  );
}


