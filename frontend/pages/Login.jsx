import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";

const DEMO_ACCOUNTS = [
  { label: "Admin",   email: "admin@hostel.com",   password: "admin123",   tone: "accent"  },
  { label: "Student", email: "student@hostel.com", password: "student123", tone: "success" },
];

export default function Login() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const { isDark, toggleTheme }     = useContext(ThemeContext);
  const toast                       = useNotification();
  const navigate                    = useNavigate();

  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPassword, setShow] = useState(false);
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState(false);

  // If already authenticated (e.g. user hits /login while logged in), redirect home.
  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name}`);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function fillDemo(acc) {
    setForm({ email: acc.email, password: acc.password });
    setError("");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          padding: "8px 14px",
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text)",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        {isDark ? "Light mode" : "Dark mode"}
      </button>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          animation: "slideUp 0.4s ease both",
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            aria-hidden="true"
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, var(--accent), var(--purple))",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              margin: "0 auto 14px",
              boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
            }}
          >
            HMS
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: -0.3,
            }}
          >
            Hostel Management
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "var(--muted)",
            }}
          >
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
          }}
        >
          {/* Demo creds quick-fill */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {DEMO_ACCOUNTS.map((a) => {
              const color = a.tone === "accent" ? "var(--accent)" : "var(--success)";
              return (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => fillDemo(a)}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: `1px solid ${color}55`,
                    background: "transparent",
                    color,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Use {a.label}
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <Field
              label="Email address"
              htmlFor="login-email"
              error={error}
            >
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={busy}
                style={inputStyle(!!error)}
              />
            </Field>

            <Field
              label="Password"
              htmlFor="login-password"
              error={error}
            >
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={busy}
                  style={{
                    ...inputStyle(!!error),
                    paddingRight: 56,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    padding: "4px 10px",
                    border: "none",
                    background: "transparent",
                    color: "var(--muted)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            {error && (
              <div
                role="alert"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "var(--danger)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{
                marginTop: 4,
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: busy
                  ? "var(--muted)"
                  : "linear-gradient(135deg, var(--accent), var(--purple))",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: busy ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: busy ? 0.85 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {busy ? (
                <>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Demo info */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid var(--border)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {DEMO_ACCOUNTS.map((a) => (
              <div
                key={a.label}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 4,
                  }}
                >
                  {a.label}
                </div>
                <div style={{ color: "var(--muted)", lineHeight: 1.5, wordBreak: "break-all" }}>
                  {a.email}
                  <br />
                  {a.password}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 11,
            color: "var(--muted)",
          }}
        >
          Hostel Management System © 2025
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────── */
function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

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
