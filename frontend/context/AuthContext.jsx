import { createContext, useState, useEffect, useCallback } from "react";
import api, { tokenService } from "../api/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = tokenService.getAccess();
    const storedUser = localStorage.getItem("hms_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // Listen for session expired event from API interceptor
    const handleSessionExpired = () => {
      logout();
    };
    window.addEventListener("hms:session-expired", handleSessionExpired);
    return () => window.removeEventListener("hms:session-expired", handleSessionExpired);
  }, []);

  // Login function - connects to backend API
  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data || response;

      const { accessToken, refreshToken, user: userData } = data;

      // Store tokens
      tokenService.setTokens(accessToken, refreshToken);
      localStorage.setItem("hms_user", JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);
      return userData;
    } catch (error) {
      // Fallback to mock auth for demo when backend is not running
      if (error.code === "NETWORK_ERROR" || error.status === 0) {
        return mockLogin(email, password);
      }
      throw error;
    }
  }, []);

  // Mock login fallback when backend is unavailable
  const mockLogin = useCallback((email, password) => {
    if (email === "admin@hostel.com" && password === "admin123") {
      const mockUser = { id: 1, name: "Admin User", email: "admin@hostel.com", role: "admin" };
      const mockToken = "mock-jwt-token-admin-" + Date.now();
      tokenService.setTokens(mockToken, "mock-refresh-" + Date.now());
      localStorage.setItem("hms_user", JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return mockUser;
    }
    if (email === "student@hostel.com" && password === "student123") {
      const mockUser = { id: 2, name: "John Doe", email: "student@hostel.com", role: "student" };
      const mockToken = "mock-jwt-token-student-" + Date.now();
      tokenService.setTokens(mockToken, "mock-refresh-" + Date.now());
      localStorage.setItem("hms_user", JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return mockUser;
    }
    // Accept any email/password for demo
    const mockUser = { id: Date.now(), name: email.split("@")[0], email, role: "admin" };
    const mockToken = "mock-jwt-token-" + Date.now();
    tokenService.setTokens(mockToken, "mock-refresh-" + Date.now());
    localStorage.setItem("hms_user", JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
    return mockUser;
  }, []);

  // Logout function
  const logout = useCallback(() => {
    tokenService.clearTokens();
    localStorage.removeItem("hms_user");
    setToken(null);
    setUser(null);
  }, []);

  // Update user function
  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem("hms_user", JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
