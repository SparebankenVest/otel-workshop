"use client"

import { useState, useEffect } from "react";


import "../../styles.css";
import { useParams, useRouter } from "next/navigation";



interface Params {
  id: string;
}

export default function FactPage() {
  const [fact, setFact] = useState("");
  const router = useRouter();
  const params = useParams();
  const apiUrl = process.env.API_URL;

  const id = params.id;



  useEffect(() => {
    if (id) {
      const fetchFact = async () => {
        try {
          const response = await fetch(`${apiUrl}/fact/${id}`);
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
      const response: Response = await fetch(`${apiUrl}/fact/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{\"fact\":\"" + fact + "\"}",
      });

      if (response.ok){
        console.log("Fact saved successfully");
        const data = await response.json();
        window.alert(data.message);
        router.push('/facts');


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
      const response: Response = await fetch(`${apiUrl}/fact/${fact.id}`, {
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
          <textarea value={fact.fact}        
           onChange={handleChange} rows="4" cols="65" 
           className="bg-stone-950 rounded-lg shadow-md p-4 "></textarea>
        </div>
      )}
  
   
        <button 
        onClick={saveFact} 
        className="bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-700 transition">
        Update fact
      </button>
      <button 
        onClick={deleteFact} 
        className="bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-700 transition">
        Delete fact
      </button>

      </div>
  );
}


