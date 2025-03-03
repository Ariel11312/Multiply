

// middleware/auth.js
export const checkAuth = async (setAuthState) => {
  try {
    const response = await fetch(`https://multiply-backend.onrender.com/api/auth/check-auth`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Authentication failed");

    const data = await response.json();

    setAuthState({
      isAuthenticated: true,
      user: data.user,
      isCheckingAuth: false,
      error: null,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    setAuthState({
      isAuthenticated: false,
      user: null,
      isCheckingAuth: false,
      error: error.message,
    });
  }
};