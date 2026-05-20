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
      tokenService.clearTokens();
      localStorage.removeItem("hms_user");
      setToken(null);
      setUser(null);
    };
    window.addEventListener("hms:session-expired", handleSessionExpired);
    return () => window.removeEventListener("hms:session-expired", handleSessionExpired);
  }, []);

  // Mock login fallback when backend is unavailable
  const mockLogin = useCallback((email, password, expectedRole) => {
    const adminCreds = email === "admin@hostel.com" && password === "admin123";
    const studentCreds = email === "student@hostel.com" && password === "student123";

    let mockUser;
    if (adminCreds) {
      mockUser = { id: 1, name: "Admin User", email, role: "admin" };
    } else if (studentCreds) {
      mockUser = { id: 2, name: "John Doe", email, role: "student" };
    } else {
      // Accept any email/password — assign role based on which portal they came from
      const defaultRole = expectedRole || "admin";
      mockUser = {
        id: Date.now(),
        name: email.split("@")[0],
        email,
        role: defaultRole,
      };
    }

    const mockToken = "mock-jwt-token-" + Date.now();
    tokenService.setTokens(mockToken, "mock-refresh-" + Date.now());
    localStorage.setItem("hms_user", JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
    return mockUser;
  }, []);

  /**
   * Login function
   * @param {string} email
   * @param {string} password
   * @param {'admin'|'student'} expectedRole - the portal user is logging in from
   */
  const login = useCallback(async (email, password, expectedRole) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data || response;
      const { accessToken, refreshToken, user: userData } = data;

      tokenService.setTokens(accessToken, refreshToken);
      localStorage.setItem("hms_user", JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);
      return userData;
    } catch (error) {
      // Fallback to mock auth when backend is offline
      if (error.code === "NETWORK_ERROR" || error.status === 0) {
        return mockLogin(email, password, expectedRole);
      }
      throw error;
    }
  }, [mockLogin]);

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

  // Helper to check role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin" || user?.role === "warden",
        isStudent: user?.role === "student",
        login,
        logout,
        updateUser,
        hasRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
