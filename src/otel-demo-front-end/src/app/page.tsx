"use client"

import { Button } from "@/components/Button";
import { useState } from "react";



export default function Home() {
  const [facts,setFacts] = useState([]);
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
          body: "{\"fact\":\""+fact+"\"}",
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
    setFacts(facts => ({...facts, fact}));

    console.log(facts);
  }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
          <h1 className="text-4xl font-bold text-center">Welcome to the OpenTelemetry Workshop</h1>
          <p className="text-lg text-center">This is a Next.js app with OpenTelemetry instrumentation</p>
        </div>
        <div className="relative overflow-x-auto">
        <h2 className="text-2xl font-bold text-center">Your latest fact</h2>
        <p className="text-lg text-center">{fact}</p>
        <Button className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded" onClick={saveFact} >Save this fact</Button> 

        </div>
        <div className="relative overflow-x-auto">
        <table className="table-auto max-h-px w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 ">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="x-6 py-3">ID</th>
            <th className="x-6 py-3">Fact</th>
            <th className="x-6 py-3">Actions</th>
          </tr>
          </thead>
          <tbody >
          {facts.map((fact) => (
          <tr><td>{fact.id}</td><td>{fact.fact}</td><td>"sas"</td></tr>
        ))}
          </tbody>
        </table>
        </div>
      <Button className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded" onClick={handleClick} >Fetch a random fact</Button>
      </main>
    </div>
  );
}


