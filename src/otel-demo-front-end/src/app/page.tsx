"use client"

import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Anton } from "next/font/google";
import Link from 'next/link';
import { FaUncharted } from 'react-icons/fa';  // Importer ikonet du vil bruke

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
  }, []); 

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
  const handleChange = (event) => {
    setFact(event.target.value);
  };


  return (
    
    <h1 className="text-3xl font-bold underline">
        <FaUncharted className="inline mr-2 text-brown-500" />  {/* Bruk ikonet her */}

      
    Hello OTEL !
  </h1>


  );
}


