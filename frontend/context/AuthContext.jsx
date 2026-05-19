import { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("hms_token");
    const storedUser = localStorage.getItem("hms_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    // Admin login
    if (email === 'admin@hostel.com' && password === 'admin123') {
      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@hostel.com',
        role: 'admin'
      };
      const mockToken = 'mock-jwt-token-admin';

      localStorage.setItem("hms_token", mockToken);
      localStorage.setItem("hms_user", JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return mockUser;
    }

    // Student login
    if (email === 'student@hostel.com' && password === 'student123') {
      const mockUser = {
        id: 2,
        name: 'John Doe',
        email: 'student@hostel.com',
        role: 'student'
      };
      const mockToken = 'mock-jwt-token-student';

      localStorage.setItem("hms_token", mockToken);
      localStorage.setItem("hms_user", JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return mockUser;
    }

    // For demo, also accept any email/password combination as admin
    const mockUser = {
      id: Date.now(),
      name: email.split('@')[0],
      email: email,
      role: 'admin'
    };
    const mockToken = 'mock-jwt-token-' + Date.now();

    localStorage.setItem("hms_token", mockToken);
    localStorage.setItem("hms_user", JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
    return mockUser;
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("hms_token");
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