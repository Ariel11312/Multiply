import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { gapi } from "gapi-script";

const Login = () => {
  const navigate = useNavigate();
  const [number, setnumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(import.meta.env.VITE_API_URL+"/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ number, password }),
      });

      const data = await response.json();

      if (response.ok) {
        {localStorage.getItem("accepted") && (window.location.href = "/member-registration")}
        navigate("/");
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
        import.meta.env.VITE_API_URL+"/api/auth/google-login",
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
        navigate("/");
      } else {
        setError(data.message || "Google Login failed.");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      setError("An error occurred during Google login.");
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

                {error && (
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
                      onChange={(e) => setnumber(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
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
    </GoogleOAuthProvider>
  );
};

export default Login;
