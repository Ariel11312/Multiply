import React, { useState, useRef } from "react";

const Verification = () => {
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""));
  const [error, setError] = useState(""); // New error state
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newVerificationCode = [...verificationCode];
    [...pastedData].forEach((char, index) => {
      if (index < 6) {
        newVerificationCode[index] = char;
      }
    });
    setVerificationCode(newVerificationCode);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newVerificationCode.findIndex((code) => code === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex].current.focus();
  };

  const handleSubmit = async () => {
    const code = verificationCode.join("");
    console.log("Verification code:", code);

    if (isLoading) return; // Prevent submitting while loading
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      const response = await fetch(import.meta.env.VITE_API_URL+"/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This is crucial for cookies to work
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect on success
        document.location.href = "./";
      } else {
        setError(data.message || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("An error occurred during verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-[500px] rounded-lg bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              SMS Verification
            </h2>
            <p className="mt-2 text-gray-600">
              Enter the 6-digit code sent to your phone
            </p>
          </div>

          {error && (
            <div className="w-full bg-red-500 text-white text-center p-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-center">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs.current[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-semibold 
                          border-2 border-green-500 rounded-lg 
                          focus:outline-none focus:border-green-600 
                          bg-white text-gray-900"
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 
                      text-white font-semibold rounded-lg 
                      transition duration-200 ease-in-out flex justify-center items-center" 
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-t-4 border-white rounded-full animate-spin flex justify-center items-center"></div>
            ) : (
              "Verify"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verification;
