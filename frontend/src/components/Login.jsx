import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { gapi } from "gapi-script";

// Phone Verification Modal Component


const Login = () => {
  const navigate = useNavigate();
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const PhoneVerificationModal = ({
    onClose,
    onResendVerification,
  }) => {
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);
  
    useEffect(() => {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      }
    }, [countdown]);
  
    const handleResendClick = async () => {
      if (countdown > 0) return;
  
      setIsResending(true);
      try {
        await onResendVerification();
        setResendSuccess(true);
        setCountdown(60); // Start 60 second countdown
      } catch (error) {
        console.error("Failed to resend verification:", error);
      } finally {
        setIsResending(false);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
  
            <h2 className="text-xl font-bold my-4 text-gray-800">
              Phone Number Not Verified
            </h2>
  
            <p className="mb-4 text-gray-600">
              Your phone number {number || ""} requires verification before
              you can log in.
            </p>
            <p className="mb-6 text-gray-600">
              We sent a verification code to your phone. Please check your
              messages and verify your account.
            </p>
  
            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                Verification code has been resent successfully! Please check your
                messages.
              </div>
            )}
  
            <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
              <button
                onClick={handleResendClick}
                disabled={isResending || countdown > 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300 transition-colors"
              >
                {isResending ? (
                  <>
                    <span className="inline-block animate-spin mr-2">↻</span>
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Resend Verification Code"
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Back to Login
              </button>
            </div>
  
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Having trouble? Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const clientId =
    "513245146221-lgbkt322ck1souljaq5jisvihv67am0s.apps.googleusercontent.com";

  useEffect(() => {
    const loadGoogleAPI = async () => {
      if (!gapi.client) {
        gapi.load("client:auth2", async () => {
          await gapi.client.init({
            clientId: clientId,
            scope:
              "profile email https://www.googleapis.com/auth/userinfo.profile",
          });
        });
      }
    };
    loadGoogleAPI();
  }, []);

  useEffect(() => {
    if (error === "Phone number not verified") {
      setShowVerificationModal(true);
    }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ number, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (localStorage.getItem("accepted")) {
          window.location.href = "/member-registration";
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/auth/google-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential: credentialResponse.credential }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Google Login Successful:", data);
        window.location.href = "/";
      } else {
        setError(data.message || "Google Login failed.");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      setError("An error occurred during Google login.");
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/resend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: number }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification code");
      }

      alert("A new verification code has been sent to your phone.");
      window.location.href = "/verification";
      return data;
    } catch (error) {
      console.error("Error resending verification code:", error);
      alert("Error: " + error.message);
      throw error;
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen w-full bg-gray-50 flex justify-center items-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Login Form Section */}
            <div className="w-full lg:w-1/2 p-8 sm:p-12">
              <div className="max-w-md mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">
                  Sign In
                </h1>

                {error && error !== "Phone number not verified" && (
                  <div className="mb-6 p-4 text-white font-semibold bg-red-500 rounded-lg text-center">
                    {error}
                  </div>
                )}

                <div id="SigninButton" className="mb-4">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => setError("Google Login Failed")}
                  />
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      placeholder="Phone Number (09123456789)"
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        // Visible eye icon SVG
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z"
                            fill="#4B5563"
                          />
                          <circle cx="12" cy="12" r="3" fill="#4B5563" />
                          <circle cx="10" cy="10" r="1" fill="white" />
                        </svg>
                      ) : (
                        // Hidden eye icon SVG
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z"
                            fill="#4B5563"
                          />
                          <line
                            x1="4"
                            y1="4"
                            x2="20"
                            y2="20"
                            stroke="#4B5563"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="text-center">
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-green-600 transition-colors"
                    >
                      Forgot Your Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 bg-green-600 text-white font-semibold rounded-lg
                    transition-all ${
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-green-700"
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? "SIGNING IN..." : "SIGN IN"}
                  </button>
                </form>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="relative w-full lg:w-1/2 bg-green-600 p-8 sm:p-12 text-center">
              <div className="absolute top-0 left-0 right-0 h-6 bg-white rounded-b-[100px] lg:hidden"></div>

              <div className="h-full flex flex-col justify-center items-center gap-6 text-white mt-6 lg:mt-0">
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Hello, Friend!
                </h2>
                <p className="text-lg max-w-sm">
                  Register with your personal details to use all site features
                </p>
                <button
                  onClick={() => navigate("/signup")}
                  disabled={isLoading}
                  className="px-8 py-3 border-2 border-white rounded-lg font-semibold
                  hover:bg-white hover:text-green-600 transition-colors"
                >
                  SIGN UP
                </button>
              </div>

              <div className="hidden lg:block absolute top-0 left-0 bottom-0 w-12 bg-white rounded-r-[100px]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Verification Modal */}
      {showVerificationModal && (
        <PhoneVerificationModal
          onClose={() => {
            setShowVerificationModal(false);
            setError("");
          }}
          onResendVerification={handleResendVerification}
        />
      )}
    </GoogleOAuthProvider>
  );
};

export default Login;
