"use client"

import { useState, useEffect } from "react";
import { Button } from "@mui/material";


import "../../styles.css";
import { useRouter } from "next/navigation";



interface Params {
  id: string;
}

export default function FactPage({ params }: { params: Params }) {
  const [fact, setFact] = useState("");
  const router = useRouter();
  const { id } = params
  console.log(id);


  function handleClick() {
    fetch("https://otel-api.svai.dev/fact")
      .then((res) => res.json())
      .then((data) => setFact(data.text));
      console.log(fact);
  }


  useEffect(() => {
    if (id) {
      const fetchFact = async () => {
        try {
          const response = await fetch(`https://otel-api.svai.dev/fact/${id}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          console.log(data);
          setFact(data);
        } catch (error) {
          console.error('Error fetching fact:', error);
        }
      };

      fetchFact();
    }
  }, [id]);

  if (!fact) {
    return <div>Loading...</div>;
  }



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


      }
    } catch (error) {
      console.error(error);
    }

  }



  const handleChange = (event) => {
    setFact(event.target.value);
  };


  async function deleteFact() {
    try {
      const response: Response = await fetch(`https://otel-api.svai.dev/fact/${fact.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        
      });

      if (response.ok){
        const data = await response.json();
        window.alert(data.message);
        router.push('/facts');
 
        console.log(data.message);



      }
    } catch (error) {
      console.error(error);
    }

  }

  return (
    <div className="container">
     
        {fact !="" && (
        <div className="fact-section">
          <textarea value={fact.fact}         onChange={handleChange} rows="4" cols="25" className="fact-text"></textarea>
        </div>
      )}
  
        <div style={{ margin: "20px 0" }}></div>
        {fact !="" && (
        <div className="button-section">
            <Button className="button" variant="contained" onClick={saveFact}>Save fact</Button>
            <Button className="button" variant="contained" onClick={deleteFact}>Delete fact</Button>
            
        </div>
        )}

      </div>
  );
}


