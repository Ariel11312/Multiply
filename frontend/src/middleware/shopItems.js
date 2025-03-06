export const fetchItems = async (setItems) => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL+"/api/item/get-all", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
  
      if (!response.ok) throw new Error("Failed to fetch data");
  
      const result = await response.json();
      console.log("Fetched Items:", result);
  
      // Check if response contains an array inside "data"
      if (result.success && Array.isArray(result.data)) {
        setItems(result.data); // Set only the 'data' array
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  