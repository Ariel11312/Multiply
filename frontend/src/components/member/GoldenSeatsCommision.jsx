import React, { useState, useEffect } from "react";

const GoldenSeats = () => {
  const [goldenSeatersSpot, setGoldenSeatersSpot] = useState("");
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL+"/api/trans/commisions", {
          method: 'GET',
          headers: { "Content-Type": "application/json" },
          credentials: 'include'
        });
        const data = await response.json();
        
        // Check if the API response has the expected format
        if (data.success && data.totalCommission !== undefined) {
          setTotalCommission(data.totalCommission);
        }
        
        // If the API also returns golden seaters data in another field, set it
        // Assuming the data might be in a field like 'data' or 'goldenSeaters'
        if (data.spot) {
          setGoldenSeatersSpot(data.spot);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
<div>
<h2 className="text-lg font-bold mb-2">Golden Seater</h2>

      <div className="text-sm font-semibold">
        Spot: <span className="text-green-600">{goldenSeatersSpot.toLocaleString()}</span>
      </div>
      <div className="text-sm font-semibold">
        Total Commission: <span className="text-green-600">₱{totalCommission.toLocaleString()}</span>
      </div>
</div>
  );
};

export default GoldenSeats;