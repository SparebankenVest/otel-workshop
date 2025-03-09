"use client"

import { useEffect } from "react";
import { FaUncharted } from 'react-icons/fa';  // Importer ikonet du vil bruke

import "./styles.css";
import { useRouter } from "next/navigation";

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

export default function Home() {

  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      createFloatingEmoji();
    }, 20000); // every 5 minutes

    return () => clearInterval(interval);
  }, []);



  const handleNavigate = (path: string) => {
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


