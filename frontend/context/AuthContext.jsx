import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

/* ─────────────────────────────────────────────────────────────────
 *  AuthContext — pure auth state and actions.
 *  Theme handling lives in ThemeContext.
 *  Login UI lives in pages/Login.jsx.
 *  ───────────────────────────────────────────────────────────────── */

const TOKEN_KEY = "hms_token";
const USER_KEY  = "hms_user";

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: async () => null,
  logout: () => {},
  updateUser: () => {},
});

// ── Mock backend (replace with real API once /auth endpoints are wired) ──
async function mockLogin(email, password) {
  // tiny artificial latency so the UI loading state is visible
  await new Promise((r) => setTimeout(r, 500));

  if (!email || !password) {
    throw new Error("Please enter your email and password.");
  }

  if (email === "admin@hostel.com" && password === "admin123") {
    return {
      user: { id: 1, name: "Admin User", email, role: "admin" },
      token: "mock-jwt-token-admin",
    };
  }

  if (email === "student@hostel.com" && password === "student123") {
    return {
      user: { id: 2, name: "John Doe", email, role: "student" },
      token: "mock-jwt-token-student",
    };
  }

  // Permissive fallback for demo: any non-empty creds become an admin user.
  // Remove this branch once the real backend is wired.
  return {
    user: {
      id: Date.now(),
      name: email.split("@")[0],
      email,
      role: "admin",
    },
    token: `mock-jwt-token-${Date.now()}`,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser  = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      // Corrupt localStorage — clear and continue.
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // eslint-disable-next-line no-console
      console.warn("AuthContext: failed to rehydrate session", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for session-expired events emitted from api.js on 401 refresh failure
  useEffect(() => {
    const onExpired = () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    };
    window.addEventListener("hms:session-expired", onExpired);
    return () => window.removeEventListener("hms:session-expired", onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: u, token: tok } = await mockLogin(email, password);
    localStorage.setItem(TOKEN_KEY, tok);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(tok);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      logout,
      updateUser,
    }),
    [user, token, loading, login, logout, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
