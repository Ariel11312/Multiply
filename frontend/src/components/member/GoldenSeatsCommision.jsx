import { useEffect, useState } from "react";

const GoldenSeats = ({ onCommissionChange }) => {
  const [goldenSeatersSpots, setGoldenSeatersSpots] = useState([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Golden Owner Data
        const ownerResponse = await fetch(
          import.meta.env.VITE_API_URL + "/api/golden/goldenowner",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const ownerData = await ownerResponse.json();

        // Fetch Golden Seats Data
        const seatsResponse = await fetch(
          import.meta.env.VITE_API_URL + "/api/golden/golden-seats",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const seatsData = await seatsResponse.json();

        if (
          ownerData.success &&
          Array.isArray(ownerData.members) &&
          seatsData.success &&
          Array.isArray(seatsData.members)
        ) {
          // Filter only records belonging to the logged-in user
          const userPositions = ownerData.members.filter(
            (member) => member.userId
          );

          // Mapping position names to API field names
          const positionToField = {
            "e-Captain": "captain",
            "e-Mayor": "mayor",
            "e-Senator": "senator",
            "e-Governor": "governor",
            "e-Vice President": "vicePresident",
            "e-President": "President",
          };

          // Replace Philippines with President in the seatsData.members
          seatsData.members.forEach(member => {
            if (member.Philippines !== undefined) {
              member.President = member.Philippines;
              delete member.Philippines;
            }
          });

          // Calculate commissions dynamically
          const spotsWithCommission = [];
          const processedSpots = new Set();

          for (const owner of userPositions) {
            const position = owner.position;
            const spot = owner.spot;


            if (processedSpots.has(spot)) continue; // Prevent duplicates

            let fieldName = positionToField[position];
            
            // If fieldName is "Philippines", change it to "President"
            if (fieldName === "Philippines") {
              fieldName = "President";
            }
            
            let commission = 0;

            if (fieldName) {
              commission = seatsData.members
                .filter((seat) => seat[fieldName] === spot)
                .reduce((sum, seat) => sum + seat.commission, 0);
            }

            // Store the spot with the correct field name (President instead of Philippines)
            const displayFieldName = fieldName === "Philippines" ? "President" : fieldName;
            spotsWithCommission.push({ 
              spot, 
              commission,
              fieldName: displayFieldName  // Store the corrected field name
            });
            
            processedSpots.add(spot);
          }

          // Calculate total commission
          const total = spotsWithCommission.reduce(
            (sum, item) => sum + item.commission,
            0
          );

          setGoldenSeatersSpots(spotsWithCommission);
          setTotalCommission(total);
          localStorage.setItem("totalCommission", total);
          
          // Pass the total commission to the parent component
          if (onCommissionChange) {
            onCommissionChange(total);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onCommissionChange]);

  // Render function
  return (
    <div className="golden-seats-container">
      <h2>Golden Seater Spots:</h2>
      
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          {goldenSeatersSpots.map((item, index) => {
            // Handle displaying the field name, converting Philippines to President
            let displayField = item.fieldName;
            if (displayField === "Philippines") {
              displayField = "President";
            } else if (displayField === "vicePhilippines") {
              displayField = "Vice President";
            }
            return (
              <div key={index} className="spot-item">
                <div className="spot-name">{item.spot}</div>
                <div className="commission">
                  {/* Display President instead of Philippines in the commission label */}
                  {displayField}Commission: ₱{item.commission}
                </div>
              </div>
            );
          })}
          
          <div className="total-commission">
            Total Commission: ₱{totalCommission}
          </div>
        </>
      )}
    </div>
  );
};

export default GoldenSeats;