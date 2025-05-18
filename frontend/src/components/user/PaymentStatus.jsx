import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const PaymentStatus = () => {
  const [paymentStatus, setPaymentStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const processedRef = useRef(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paymentIntentId = params.get("payment_intent_id");

  const storedData = localStorage.getItem("membershipData");
  
  const handleMember = async () => {
    const goldenSeatData = JSON.parse(localStorage.getItem("memberGoldenSeat"));
    const selectedSpot = JSON.parse(localStorage.getItem("selectedSpot"));
    const packageData = JSON.parse(localStorage.getItem("packages"));
    
    if (processedRef.current) {
      return; // Prevent duplicate processing
    }
    processedRef.current = true;

    try {
      // Determine if this is a Golden Seat update or a new membership/package
      const isGoldenSeat = goldenSeatData && goldenSeatData.GoldenSeat === "success";
      const isPackage = packageData !== null;
      
      let apiUrl;
      let method;
      let bodyData;
      
      if (isGoldenSeat) {
        // Golden Seat update flow
        const position = goldenSeatData?.position || "";
        const spot = selectedSpot?.name || "";
        const memberType = goldenSeatData?.position;
        
        console.log("Processing Golden Seat update with data:", { position, spot, memberType });
        
        apiUrl = `${import.meta.env.VITE_API_URL}/api/member/update-member`;
        method = "PUT";
        bodyData = { position, spot, memberType };
      } else if (isPackage) {
        // Package creation flow
        console.log("Processing package creation");
        
        apiUrl = `${import.meta.env.VITE_API_URL}/api/member/create-package`;
        method = "POST";
        bodyData = packageData;
      } else {
        // Standard member creation flow
        console.log("Processing standard membership creation");
        
        apiUrl = `${import.meta.env.VITE_API_URL}/api/member/create-member`;
        method = "POST";
        bodyData = storedData ? JSON.parse(storedData) : {};
      }

      console.log("Request URL:", apiUrl);
      console.log("Sending request body:", bodyData);

      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();
      console.log("Server response:", result);

      if (response.ok) {
        // Clean up local storage
        localStorage.removeItem("membershipData");
        localStorage.removeItem("memberGoldenSeat");
        localStorage.removeItem("selectedSpot");
        localStorage.removeItem("packages");
        localStorage.removeItem("referralCode");
        localStorage.removeItem("referralType");
        localStorage.removeItem("selectedLocation");
        localStorage.removeItem("totalCommission");
        localStorage.removeItem("memberType");
        
        // Redirect to member dashboard
        window.location.href = "/member";
      } else {
        processedRef.current = false; // Reset if failed
        setError(result.message || "Request failed. Please try again.");
      }
    } catch (error) {
      processedRef.current = false; // Reset if failed
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchPaymentStatus = async () => {
      if (!paymentIntentId) {
        setPaymentStatus("error");
        setError("No payment intent ID found");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`,
          {
            headers: {
              accept: "application/json",
              authorization:
                "Basic c2tfdGVzdF9MZlA1U1FpZzFicFlubnphempjY3hvWWY6",
            },
            signal: controller.signal,
          }
        );

        if (!isMounted) return;

        const status = response.data.data.attributes.status;
        setPaymentStatus(status);

        if (status === "succeeded" && !processedRef.current) {
          await handleMember();
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        if (!isMounted) return;

        console.error("Error fetching payment status:", error);
        setPaymentStatus("error");
        setError(error.message || "Failed to fetch payment status");
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [paymentIntentId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
      {isLoading ? (
        <p className="text-blue-500 font-bold">⏳ Checking payment status...</p>
      ) : error ? (
        <p className="text-red-500 font-bold">⚠️ {error}</p>
      ) : (
        <>
          {paymentStatus === "succeeded" && (
            <p className="text-green-500 font-bold">✅ Payment succeeded! Redirecting to your member dashboard...</p>
          )}
          {paymentStatus === "processing" && (
            <p className="text-blue-500 font-bold">
              ⏳ Payment is processing... Please wait, this might take a few moments.
            </p>
          )}
          {paymentStatus === "failed" && (
            <p className="text-red-500 font-bold">
              ❌ Payment failed. Please try again.
            </p>
          )}
          {paymentStatus === "error" && (
            <p className="text-orange-500 font-bold">
              ⚠️ Error fetching payment status.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentStatus;