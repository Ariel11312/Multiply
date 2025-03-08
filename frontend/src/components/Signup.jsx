import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const Signup = () => {
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); // Changed from email to phone number
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const handleSignup = async (e) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{9,}$/;

    const phoneRegex = /^[0-9]{10}$/; // Basic validation for a 10-digit phone number

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 9 characters long and include uppercase, lowercase, numbers, and special characters. example:(1234Juan@)"
      );
      return;
    }

    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL+"/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ firstName, lastName, phoneNumber, password }), // Send phone number instead of email
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/verification");
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An error occurred during signup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Welcome Section */}
        <div className="welcome-box w-full md:w-1/2 p-8 bg-green-600 text-center flex flex-col justify-center items-center gap-6 md:rounded-tr-[30%] md:rounded-br-[30%]">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Welcome Back!
          </h1>
          <p className="text-base md:text-lg font-semibold text-white max-w-sm">
            Enter your personal details to use all of site features
          </p>
          <button
            className="border-2 px-8 py-2 rounded-lg border-white text-white hover:bg-white hover:text-green-600 transition-colors"
            onClick={() => navigate("/login")}
          >
            SIGN IN
          </button>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Sign Up
          </h2>

          {error && (
            <div className="w-full p-4 mb-6 text-white font-semibold bg-red-500 rounded-lg text-center">
              {error}
            </div>
          )}

          <form
            className="space-y-4 w-full max-w-md mx-auto"
            onSubmit={handleSignup}
          >
            <input
              type="text"
              className="w-full h-12 px-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
              placeholder="First Name"
              required
              onChange={(e) => setFirstname(e.target.value)}
            />
            <input
              type="text"
              className="w-full h-12 px-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
              placeholder="Last Name"
              required
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              type="text" // Change type from email to text
              className="w-full h-12 px-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
              placeholder="Phone Number"
              required
              onChange={(e) => setPhoneNumber(e.target.value)}
              pattern="[0-9]{10}" // Basic phone number pattern (10 digits)
              title="Please enter a valid 10-digit phone number"
            />
  <div className="space-y-4 w-full">
      {/* Create Password Field */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full h-12 px-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
          placeholder="Create Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-500"
            >
              <path 
                d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" 
                fill="currentColor"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          ) : (
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-500"
            >
              <path 
                d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" 
                fill="currentColor"
              />
              <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>
      
      {/* Confirm Password Field */}
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          className="w-full h-12 px-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
          placeholder="Confirm Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
        >
          {showConfirmPassword ? (
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-500"
            >
              <path 
                d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" 
                fill="currentColor"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          ) : (
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-500"
            >
              <path 
                d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" 
                fill="currentColor"
              />
              <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
              <button
              type="submit"
              className="w-full h-12 bg-green-600 text-white font-semibold rounded-lg flex justify-center items-center hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-t-4 border-white rounded-full animate-spin" />
              ) : (
                "SIGN UP"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
