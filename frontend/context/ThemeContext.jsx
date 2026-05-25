// ThemeContext
// ──────────────────────────────────────────────────────────────────────────────
// Owns the dark/light mode state. The actual color values live in
// styles/global.css as CSS custom properties under `:root` and `.dark` —
// this provider's only job is to:
//
//   1. Pick the initial mode (saved preference → system preference → dark)
//   2. Toggle `class="dark"` on <html>
//   3. Persist the choice to localStorage
//   4. Expose a `useTheme()` hook + a backwards-compat `t` palette object
//      so legacy components that read `t.bg` / `t.accent` keep working until
//      they get migrated to Tailwind classes / CSS variables.
//
// We do NOT inject CSS variables from JS anymore — global.css owns them and
// flipping the class is enough to switch every variable atomically.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const THEME_STORAGE_KEY = "hms_theme";
const TRANSITION_CLASS  = "theme-transition";
const TRANSITION_MS     = 400;

// ── Backwards-compat palette objects (for code still using `t.bg` etc.) ──────
// These values must stay in sync with the variables in styles/global.css.
export const lightTheme = Object.freeze({
  bg:      "#f1f5f9",
  surface: "#ffffff",
  card:    "#ffffff",
  border:  "#e2e8f0",
  text:    "#0f172a",
  muted:   "#475569",
  accent:  "#2563eb",
  success: "#16a34a",
  danger:  "#ef4444",
  warning: "#f59e0b",
  gold:    "#d97706",
  purple:  "#9333ea",
});

export const darkTheme = Object.freeze({
  bg:      "#020617",
  surface: "#0b1220",
  card:    "#0f172a",
  border:  "#1e293b",
  text:    "#f8fafc",
  muted:   "#94a3b8",
  accent:  "#3b82f6",
  success: "#22c55e",
  danger:  "#f87171",
  warning: "#fbbf24",
  gold:    "#f59e0b",
  purple:  "#a855f7",
});

// ── Context ──────────────────────────────────────────────────────────────────
export const ThemeContext = createContext({
  theme:       "dark",
  isDark:      true,
  toggleTheme: () => {},
  setTheme:    () => {},
  t:           darkTheme,
  darkTheme,
  lightTheme,
});

/** Convenience hook — `const { isDark, toggleTheme, t } = useTheme();` */
export function useTheme() {
  return useContext(ThemeContext);
}

function getInitialTheme() {
  // Saved preference always wins.
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // localStorage unavailable (SSR / private mode) — fall through.
  }
  // Otherwise fall back to system preference, defaulting to dark for SSR.
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  // Initialise lazily so the very first render already has the right mode —
  // no flash of the wrong theme before useEffect fires.
  const [theme, setThemeState] = useState(getInitialTheme);

  // Apply the class to <html> any time the theme changes (and once on mount).
  useEffect(() => {
    if (typeof document === "undefined") return;

    const html = document.documentElement;

    html.classList.add(TRANSITION_CLASS);
    if (theme === "dark") html.classList.add("dark");
    else                  html.classList.remove("dark");

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Best-effort persistence; swallow quota / privacy errors.
    }

    const id = setTimeout(() => html.classList.remove(TRANSITION_CLASS), TRANSITION_MS);
    return () => clearTimeout(id);
  }, [theme]);

  // Listen for system-preference changes ONLY when the user hasn't picked a
  // mode explicitly. Once they toggle, their choice sticks.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    let saved = null;
    try { saved = localStorage.getItem(THEME_STORAGE_KEY); } catch { /* ignore */ }
    if (saved === "dark" || saved === "light") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setThemeState(e.matches ? "dark" : "light");
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  const toggleTheme = useCallback(
    () => setThemeState(prev => (prev === "dark" ? "light" : "dark")),
    []
  );

  const setTheme = useCallback((next) => {
    if (next === "dark" || next === "light") setThemeState(next);
  }, []);

  const value = useMemo(() => {
    const isDark = theme === "dark";
    return {
      theme,
      isDark,
      toggleTheme,
      setTheme,
      t: isDark ? darkTheme : lightTheme,
      darkTheme,
      lightTheme,
    };
  }, [theme, toggleTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
