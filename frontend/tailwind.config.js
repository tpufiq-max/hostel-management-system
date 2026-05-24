/** @type {import('tailwindcss').Config} */
//
// Tailwind theme is wired to the CSS custom properties defined in
// styles/global.css. Toggling `class="dark"` on <html> flips the variables,
// which automatically flips every Tailwind utility that references them
// (e.g. `bg-surface`, `text-muted`, `border-border`).
//
// This is the production-grade pattern: design tokens once, both Tailwind
// classes AND inline `var(--token)` references stay in sync.
//
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./layouts/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
    "./contexts/**/*.{js,jsx}",
    "./features/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./utils/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // ── Semantic colors (each one resolves to a CSS variable so dark mode
      //    is a single class flip on <html>) ────────────────────────────────
      colors: {
        bg:      "var(--bg)",
        surface: "var(--surface)",
        card:    "var(--card)",
        border:  "var(--border)",
        text:    "var(--text)",
        muted:   "var(--muted)",

        // Brand / status — full palette so things like text-success-foreground
        // and bg-success/10 stay clean.
        accent: {
          DEFAULT: "var(--accent)",
          hover:   "var(--accent-hover)",
          fg:      "#ffffff",
        },
        success: {
          DEFAULT: "var(--success)",
          fg:      "#ffffff",
        },
        danger: {
          DEFAULT: "var(--danger)",
          fg:      "#ffffff",
        },
        warning: {
          DEFAULT: "var(--warning)",
          fg:      "#1f2937",
        },
        purple: {
          DEFAULT: "var(--purple)",
          fg:      "#ffffff",
        },
      },

      // ── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
      },
      fontSize: {
        // Tighter typographic scale than Tailwind defaults — fewer steps,
        // sized for dense SaaS dashboards.
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],     // 11px
        xs:   ["0.75rem",   { lineHeight: "1.125rem" }],  // 12px
        sm:   ["0.875rem",  { lineHeight: "1.25rem" }],   // 14px
        base: ["0.9375rem", { lineHeight: "1.5rem" }],    // 15px
        lg:   ["1.0625rem", { lineHeight: "1.625rem" }],  // 17px
        xl:   ["1.25rem",   { lineHeight: "1.75rem" }],   // 20px
        "2xl":["1.5rem",    { lineHeight: "2rem" }],      // 24px
        "3xl":["1.875rem",  { lineHeight: "2.25rem" }],   // 30px
      },

      // ── Radii ────────────────────────────────────────────────────────────
      borderRadius: {
        DEFAULT: "8px",
        sm:  "6px",
        md:  "10px",
        lg:  "12px",
        xl:  "16px",
        "2xl": "20px",
      },

      // ── Spacing extensions — handy for header/sidebar offsets ────────────
      spacing: {
        sidebar:           "260px",
        "sidebar-collapsed": "72px",
        navbar:            "64px",
      },

      // ── Shadows — softer than Tailwind defaults, two depth ranges ────────
      boxShadow: {
        card:    "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        popover: "0 8px 24px rgba(15, 23, 42, 0.12)",
        modal:   "0 24px 60px rgba(15, 23, 42, 0.25)",
        "card-dark":    "0 1px 3px rgba(0, 0, 0, 0.4)",
        "popover-dark": "0 8px 24px rgba(0, 0, 0, 0.45)",
        "modal-dark":   "0 24px 60px rgba(0, 0, 0, 0.55)",
      },

      // ── Animations used by Drawer/Modal/Toast in F4 ──────────────────────
      keyframes: {
        "fade-in":  { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: 0, transform: "translateY(-8px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in":        "fade-in 0.2s ease-out",
        "slide-up":       "slide-up 0.2s ease-out",
        "slide-down":     "slide-down 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
