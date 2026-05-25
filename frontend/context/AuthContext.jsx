// AuthContext
// ──────────────────────────────────────────────────────────────────────────────
// Single responsibility: authentication state.
//
//   * Holds the current user object and "is authenticated" flag
//   * Exposes login / register / logout / refreshUser / updateUser actions
//   * Hydrates from localStorage on mount and verifies the token by hitting
//     /auth/me — so a stale or revoked token cannot keep the user "logged in"
//   * Listens for the `hms:session-expired` event the API layer fires when
//     refresh fails, and forces a clean logout in that case
//
// Theme is owned by ThemeContext. Login/register UI lives in pages/Login.jsx.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import authService from "../features/auth/authService";
import { tokenService } from "../api/api";

const USER_KEY = "hms_user";

export const AuthContext = createContext({
  user:            null,
  isAuthenticated: false,
  loading:         true,
  login:           async () => {},
  register:        async () => {},
  logout:          () => {},
  refreshUser:     async () => {},
  updateUser:      () => {},
});

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── 1. Hydrate from localStorage and verify the token on mount ──────────
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const accessToken = tokenService.getAccess();
      const cachedUser  = localStorage.getItem(USER_KEY);

      // Optimistically render with the cached user so the app doesn't flash
      // the login screen for users with a still-valid session.
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      if (!accessToken) {
        if (!cancelled) setLoading(false);
        return;
      }

      // Verify the token with the backend. /auth/me also returns the latest
      // copy of the user record, so we always store fresh data.
      try {
        const me = await authService.me();
        if (cancelled) return;
        if (me) {
          setUser(me);
          localStorage.setItem(USER_KEY, JSON.stringify(me));
        } else {
          // /me succeeded but returned no user — treat as invalid
          tokenService.clearTokens();
          localStorage.removeItem(USER_KEY);
          setUser(null);
        }
      } catch {
        // 401, network error, or anything else → log out cleanly
        tokenService.clearTokens();
        localStorage.removeItem(USER_KEY);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  // ── 2. React to API-layer "session expired" events ──────────────────────
  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    };
    window.addEventListener("hms:session-expired", handleSessionExpired);
    return () => window.removeEventListener("hms:session-expired", handleSessionExpired);
  }, []);

  // ── 3. Actions ──────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    const payload = await authService.login(email, password);
    if (!payload?.user) {
      throw new Error("Login response did not include a user");
    }
    setUser(payload.user);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    return payload.user;
  }, []);

  const register = useCallback(async (body) => {
    const payload = await authService.register(body);
    if (!payload?.user) {
      throw new Error("Registration response did not include a user");
    }
    setUser(payload.user);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    return payload.user;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.me();
      if (me) {
        setUser(me);
        localStorage.setItem(USER_KEY, JSON.stringify(me));
      }
      return me;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  const updateUser = useCallback((patch) => {
    setUser(prev => {
      const next = { ...(prev ?? {}), ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook so components don't need to import { useContext } separately. */
export function useAuth() {
  return useContext(AuthContext);
}
