import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

// ── Theme palettes ────────────────────────────────────────────────────────────
export const darkTheme = {
  bg: "#020617", surface: "#0b1220", card: "#0f172a",
  border: "#1e293b", text: "#f8fafc", muted: "#94a3b8",
  accent: "#3b82f6", success: "#22c55e", danger: "#f87171",
  warning: "#fbbf24", gold: "#f59e0b", purple: "#a855f7",
};

export const lightTheme = {
  bg: "#f1f5f9", surface: "#ffffff", card: "#ffffff",
  border: "#e2e8f0", text: "#0f172a", muted: "#475569",
  accent: "#2563eb", success: "#16a34a", danger: "#ef4444",
  warning: "#f59e0b", gold: "#d97706", purple: "#9333ea",
};

// ── CSS variables map — keeps Tailwind/CSS classes working alongside ──────────
const CSS_VARS = {
  dark: {
    "--bg":      "#020617",
    "--surface": "#0b1220",
    "--card":    "#0f172a",
    "--border":  "#1e293b",
    "--text":    "#f8fafc",
    "--muted":   "#94a3b8",
    "--accent":  "#3b82f6",
    "--success": "#22c55e",
    "--danger":  "#f87171",
    "--warning": "#fbbf24",
    "--gold":    "#f59e0b",
    "--purple":  "#a855f7",
    "--background": "#020617",
  },
  light: {
    "--bg":      "#f1f5f9",
    "--surface": "#ffffff",
    "--card":    "#ffffff",
    "--border":  "#e2e8f0",
    "--text":    "#0f172a",
    "--muted":   "#475569",
    "--accent":  "#2563eb",
    "--success": "#16a34a",
    "--danger":  "#ef4444",
    "--warning": "#f59e0b",
    "--gold":    "#d97706",
    "--purple":  "#9333ea",
    "--background": "#f1f5f9",
  },
};

// ── Context ───────────────────────────────────────────────────────────────────
export const ThemeContext = createContext({
  theme:       "dark",
  toggleTheme: () => {},
  t:           darkTheme,
  darkTheme,
  lightTheme,
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [theme,   setTheme]   = useState("dark");
  const [mounted, setMounted] = useState(false);

  // ── 1. Rehydrate on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("hms_theme");

    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    setMounted(true);
  }, []);

  // ── 2. Apply classes, CSS vars & localStorage whenever theme changes ──────
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    const body = document.body;

    // Smooth transition class (your existing behaviour preserved)
    html.classList.add("theme-transition");
    body.classList.add("theme-transition");

    // dark / light class on <html> (Tailwind dark-mode compatible)
    if (theme === "dark") {
      html.classList.add("dark");
      body.classList.add("dark");
    } else {
      html.classList.remove("dark");
      body.classList.remove("dark");
    }

    // Inject CSS custom properties so legacy CSS (var(--accent) etc.) still works
    const vars = CSS_VARS[theme];
    Object.entries(vars).forEach(([k, v]) => {
      html.style.setProperty(k, v);
    });

    // Also set background so the page never shows a white flash in dark mode
    body.style.background    = vars["--bg"];
    body.style.color         = vars["--text"];
    body.style.transition    = "background 0.3s, color 0.3s";

    localStorage.setItem("hms_theme", theme);

    const timeout = setTimeout(() => {
      html.classList.remove("theme-transition");
      body.classList.remove("theme-transition");
    }, 400);

    return () => clearTimeout(timeout);
  }, [theme, mounted]);

  // ── 3. Toggle ─────────────────────────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  }, []);

  // ── 4. Memoised context value ─────────────────────────────────────────────
  const value = useMemo(() => ({
    theme,
    toggleTheme,
    t:         theme === "dark" ? darkTheme : lightTheme,
    darkTheme,
    lightTheme,
    isDark:    theme === "dark",
  }), [theme, toggleTheme]);

  // ── 5. Block render until mounted (avoids SSR / hydration flash) ──────────
  if (!mounted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{
          width: 44, height: 44,
          border: "3px solid #1e293b",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ color: "#94a3b8", fontSize: 13 }}>Initialising theme…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {/* Inject global styles once */}
      <style>{`
        /* Smooth theme transitions */
        .theme-transition,
        .theme-transition * {
          transition:
            background-color 0.3s ease,
            border-color     0.3s ease,
            color            0.3s ease,
            fill             0.3s ease,
            stroke           0.3s ease !important;
        }

        /* Scrollbar — dark */
        html.dark ::-webkit-scrollbar        { width: 6px; height: 6px; }
        html.dark ::-webkit-scrollbar-track  { background: #0b1220; }
        html.dark ::-webkit-scrollbar-thumb  { background: #1e293b; border-radius: 4px; }
        html.dark ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }

        /* Scrollbar — light */
        html:not(.dark) ::-webkit-scrollbar        { width: 6px; height: 6px; }
        html:not(.dark) ::-webkit-scrollbar-track  { background: #f1f5f9; }
        html:not(.dark) ::-webkit-scrollbar-thumb  { background: #cbd5e1; border-radius: 4px; }
        html:not(.dark) ::-webkit-scrollbar-thumb:hover { background: #2563eb; }

        /* Selection highlight */
        html.dark  ::selection { background: #3b82f644; color: #f8fafc; }
        html:not(.dark) ::selection { background: #2563eb44; color: #0f172a; }

        /* Prevent layout shift from scrollbar appearing/disappearing */
        html { scrollbar-gutter: stable; }

        /* Base reset */
        *, *::before, *::after { box-sizing: border-box; }

        /* Select option theming */
        html.dark  select option { background: #0f172a; color: #f8fafc; }
        html:not(.dark) select option { background: #ffffff; color: #0f172a; }

        /* Input autofill override */
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px var(--card) inset !important;
          -webkit-text-fill-color: var(--text) !important;
          transition: background-color 9999s ease;
        }

        /* Animations */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0);      }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.5; }
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}
