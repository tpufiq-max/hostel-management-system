import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";

const REMEMBER_KEY = "hms_login_email";

/**
 * Production login page.
 *
 * Design:
 *   - Single email + password form. No demo / quick-fill buttons.
 *   - Inline hint reminding students that their default password is
 *     their roll number.
 *   - Remember-me persists email (never password) in localStorage.
 *   - Forgot-password link routes to /forgot-password (backend
 *     endpoint already exists; UI is a stub).
 *   - Modern glassmorphism card with gradient backdrop, animated
 *     accents and a theme toggle that doesn't disturb the layout.
 *   - Loading spinner inside the submit button while authenticating.
 *   - 429 Too Many Requests is surfaced with the friendly retry-after
 *     hint that the backend supplies.
 */
export default function Login() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const { isDark, toggleTheme }     = useContext(ThemeContext);
  const toast                       = useNotification();
  const navigate                    = useNavigate();

  const [form, setForm] = useState({
    email:    typeof localStorage !== "undefined" ? localStorage.getItem(REMEMBER_KEY) || "" : "",
    password: "",
  });
  const [remember, setRemember] = useState(!!form.email);
  const [showPassword, setShow] = useState(false);
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState(false);
  const passwordRef             = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  // If we restored a remembered email, drop the cursor straight into the
  // password field so the user can sign in with one keystroke + Enter.
  useEffect(() => {
    if (form.email && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const user = await login(form.email.trim(), form.password);

      if (remember) localStorage.setItem(REMEMBER_KEY, form.email.trim());
      else          localStorage.removeItem(REMEMBER_KEY);

      toast.success(`Welcome back, ${user.name}`);
      navigate("/", { replace: true });
    } catch (err) {
      // Backend returns:
      //   401 Bad credentials → "Invalid email or password"
      //   429 too many       → "Too many login attempts. Try again in N minutes."
      //   400 disabled        → "Account is disabled"
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="hms-login-root" style={{
      minHeight: "100vh",
      position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 20px",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .hms-login-input:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--accent)33 !important;
        }
        .hms-login-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(99,102,241,0.4);
        }
        .hms-login-link:hover { text-decoration: underline; }
        @media (max-width: 480px) {
          .hms-login-card { padding: 22px 18px !important; }
          .hms-login-brand-icon { width: 56px !important; height: 56px !important; font-size: 22px !important; }
        }
      `}</style>

      {/* Decorative background blobs */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-12%", left: "-10%",
          width: 380, height: 380, borderRadius: "50%",
          background: "radial-gradient(closest-side, var(--accent)44, transparent)",
          filter: "blur(40px)",
          animation: "float 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "-15%", right: "-8%",
          width: 420, height: 420, borderRadius: "50%",
          background: "radial-gradient(closest-side, var(--purple)44, transparent)",
          filter: "blur(50px)",
          animation: "float 9s ease-in-out infinite reverse",
        }} />
      </div>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          position: "fixed", top: 20, right: 20,
          padding: "8px 14px", borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text)",
          fontSize: 13, fontWeight: 600,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          backdropFilter: "blur(8px)",
        }}
      >
        <span style={{ fontSize: 14 }}>{isDark ? "☀️" : "🌙"}</span>
        {isDark ? "Light" : "Dark"}
      </button>

      <div style={{
        width: "100%", maxWidth: 440, position: "relative", zIndex: 1,
        animation: "slideUp 0.45s ease both",
      }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="hms-login-brand-icon" aria-hidden="true" style={{
            width: 68, height: 68, borderRadius: 20,
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            color: "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, fontWeight: 800, letterSpacing: -0.5,
            margin: "0 auto 14px",
            boxShadow: "0 12px 32px rgba(99,102,241,0.45)",
          }}>HMS</div>
          <h1 style={{
            margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: -0.4,
          }}>
            Hostel Management
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
            Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="hms-login-card" style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          padding: "26px 24px",
          boxShadow: isDark
            ? "0 24px 48px rgba(0,0,0,0.45)"
            : "0 16px 40px rgba(15,23,42,0.08)",
          backdropFilter: "blur(8px)",
        }}>
          <form onSubmit={handleSubmit} noValidate style={{
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" style={labelStyle}>
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                autoFocus={!form.email}
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={busy}
                className="hms-login-input"
                style={inputStyle(!!error)}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label htmlFor="login-password" style={{ ...labelStyle, marginBottom: 0 }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="hms-login-link"
                  style={{
                    fontSize: 12, fontWeight: 600,
                    color: "var(--accent)",
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative", marginTop: 6 }}>
                <input
                  id="login-password"
                  ref={passwordRef}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={busy}
                  className="hms-login-input"
                  style={{ ...inputStyle(!!error), paddingRight: 64 }}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: 8, top: "50%", transform: "translateY(-50%)",
                    padding: "5px 10px",
                    border: "none", background: "transparent",
                    color: "var(--muted)",
                    fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Helpful hint for students */}
              <div style={{
                marginTop: 8, fontSize: 11, color: "var(--muted)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 13 }}>💡</span>
                Students: please enter your <b style={{ color: "var(--text)" }}>roll number</b> as password
                {" "}<span style={{ opacity: 0.7 }}>(default — change it in Settings).</span>
              </div>
            </div>

            {/* Remember me */}
            <label style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 13, color: "var(--text)",
              cursor: "pointer", userSelect: "none",
            }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                disabled={busy}
                style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }}
              />
              Remember me on this device
            </label>

            {error && (
              <div role="alert" style={{
                padding: "10px 12px", borderRadius: 10,
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.35)",
                color: "var(--danger)",
                fontSize: 13, lineHeight: 1.5,
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="hms-login-btn-primary"
              style={{
                marginTop: 6,
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: busy
                  ? "var(--muted)"
                  : "linear-gradient(135deg, var(--accent), var(--purple))",
                color: "#fff",
                fontSize: 14, fontWeight: 700, letterSpacing: 0.2,
                cursor: busy ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center", justifyContent: "center", gap: 10,
                opacity: busy ? 0.85 : 1,
                transition: "transform 0.15s, box-shadow 0.15s, opacity 0.15s",
                boxShadow: "0 6px 20px rgba(99,102,241,0.32)",
              }}
            >
              {busy ? (
                <>
                  <span aria-hidden="true" style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </form>

          <div style={{
            marginTop: 18, paddingTop: 14,
            borderTop: "1px solid var(--border)",
            fontSize: 12, color: "var(--muted)", textAlign: "center",
            lineHeight: 1.6,
          }}>
            Don't have an account? Ask your hostel administrator to register you.
            <br />
            By signing in you agree to the residence rules.
          </div>
        </div>

        <div style={{
          textAlign: "center", marginTop: 18,
          fontSize: 11, color: "var(--muted)",
        }}>
          Hostel Management System © 2025 · v1.0
        </div>
      </div>
    </div>
  );
}

/* ── styles ─────────────────────────────────────────────────────── */
const labelStyle = {
  display: "block",
  fontSize: 12, fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 6,
};

function inputStyle(hasError) {
  return {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 10,
    border: `1px solid ${hasError ? "var(--danger)" : "var(--border)"}`,
    background: "var(--card)",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
}
