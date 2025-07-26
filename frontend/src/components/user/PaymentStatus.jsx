import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const PaymentStatus = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const processedRef = useRef(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const invoiceId = params.get("invoiceId");

  const storedData = localStorage.getItem("membershipData");

  const handleMember = async () => {
    const goldenSeatData = JSON.parse(localStorage.getItem("memberGoldenSeat"));
    const selectedSpot = JSON.parse(localStorage.getItem("selectedSpot"));
    const packageData = JSON.parse(localStorage.getItem("packages"));

    if (processedRef.current) return;
    processedRef.current = true;

    try {
      let apiUrl;
      let method;
      let bodyData;

      const isGoldenSeat = goldenSeatData && goldenSeatData.GoldenSeat === "success";
      const isPackage = packageData !== null;

      if (isGoldenSeat) {
        const position = goldenSeatData?.position || "";
        const spot = selectedSpot?.name || "";
        const memberType = goldenSeatData?.position;

        apiUrl = `${import.meta.env.VITE_API_URL}/api/member/update-member`;
        method = "PUT";
        bodyData = { position, spot, memberType };
      } else if (isPackage) {
        apiUrl = `${import.meta.env.VITE_API_URL}/api/member/create-package`;
        method = "POST";
        bodyData = packageData;
      } else {
        apiUrl = `${import.meta.env.VITE_API_URL}/api/member/createpayment`;
        method = "POST";
        bodyData = storedData ? JSON.parse(storedData) : {};
      }

      // Get authentication token from localStorage or cookies
      const authToken = localStorage.getItem("authToken") || localStorage.getItem("token");
      
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token exists
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(apiUrl, {
        method,
        headers,
        credentials: "include",
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        localStorage.clear();
        setTimeout(() => {
          window.location.href = "/payment-transaction";
        }, 2000);
      } else if (response.status === 401) {
        processedRef.current = false;
        setError("Authentication required. Please log in first.");
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        processedRef.current = false;
        setError(result.message || "Request failed. Please try again.");
      }
    } catch (err) {
      processedRef.current = false;
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Go directly to API call
    handleMember();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Processing Your Request</h1>
      {isLoading ? (
        <p className="text-blue-500 font-bold">⏳ Processing your membership...</p>
      ) : error ? (
        <p className="text-red-500 font-bold">⚠️ {error}</p>
      ) : success ? (
        <p className="text-green-500 font-bold">✅ Success! Redirecting to your member dashboard...</p>
      ) : null}
    </div>
  );
};

export default PaymentStatus;