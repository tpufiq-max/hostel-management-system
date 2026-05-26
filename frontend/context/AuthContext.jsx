import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { post, get, tokenService } from "../api/api";

/* ─────────────────────────────────────────────────────────────────
 *  AuthContext — pure auth state and actions backed by /api/auth.
 *
 *  Tokens (access + refresh) are owned by api/api.js's tokenService
 *  so the request interceptor automatically attaches a Bearer token
 *  to every API call and handles 401 -> refresh -> retry. The user
 *  profile is the only thing stored directly here, under hms_user.
 *  ───────────────────────────────────────────────────────────────── */

const USER_KEY = "hms_user";

// Legacy key from earlier mock-only auth — clear it on first run so
// stale data doesn't confuse the api.js interceptor.
const LEGACY_TOKEN_KEY = "hms_token";

export const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => null,
  logout: () => {},
  updateUser: () => {},
  refreshUser: async () => null,
});

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session on mount.
  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      // Drop the legacy mock-era key if it's hanging around.
      try { localStorage.removeItem(LEGACY_TOKEN_KEY); } catch { /* ignore */ }

      const token = tokenService.getAccess();
      const stored = localStorage.getItem(USER_KEY);

      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      // Optimistically rehydrate user from localStorage so the app
      // can render immediately.
      if (stored) {
        try { if (!cancelled) setUser(JSON.parse(stored)); }
        catch { localStorage.removeItem(USER_KEY); }
      }

      // Quietly verify the token is still valid by calling /auth/me.
      // If it fails, api.js will try a refresh; if that also fails it
      // dispatches hms:session-expired which our other effect handles.
      try {
        const me = await get("/auth/me");
        if (cancelled) return;
        if (me) {
          setUser(me);
          localStorage.setItem(USER_KEY, JSON.stringify(me));
        }
      } catch (err) {
        // /auth/me failed even after refresh attempt — treat as logged out.
        if (!cancelled) {
          tokenService.clearTokens();
          localStorage.removeItem(USER_KEY);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    rehydrate();
    return () => { cancelled = true; };
  }, []);

  // Listen for session-expired (emitted from api.js on refresh failure).
  useEffect(() => {
    const onExpired = () => {
      tokenService.clearTokens();
      localStorage.removeItem(USER_KEY);
      setUser(null);
    };
    window.addEventListener("hms:session-expired", onExpired);
    return () => window.removeEventListener("hms:session-expired", onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    // post() returns response.data via the unwrap interceptor in api.js.
    // For wrapped responses ({success, data, message}) it returns the
    // inner `data`, which is the AuthResponse DTO.
    const response = await post("/auth/login", { email, password });

    if (!response?.accessToken || !response?.user) {
      throw new Error("Unexpected response from server.");
    }

    tokenService.setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    tokenService.clearTokens();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await get("/auth/me");
      if (me) {
        setUser(me);
        localStorage.setItem(USER_KEY, JSON.stringify(me));
        return me;
      }
    } catch {
      // Caller decides what to do; we just don't crash here.
    }
    return null;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser,
      refreshUser,
    }),
    [user, loading, login, logout, updateUser, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
