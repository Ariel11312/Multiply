// middleware/auth.js
export const checkAuth = async (setAuthState) => {
  try {
    // Set a timeout to prevent long waiting times
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout

    const response = await fetch(import.meta.env.VITE_API_URL+`/api/auth/check-auth`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: controller.signal, // Pass the abort signal
    });

    clearTimeout(timeout); // Clear timeout if request succeeds

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Authentication failed");
    }

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
      error: error.name === "AbortError" ? "Request timed out" : error.message,
    });
  }
};
