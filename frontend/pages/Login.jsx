import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

/**
 * Login page.
 *
 * F1 scope: wire to the real backend via AuthContext.login. The visual design
 * stays minimal — a polished redesign comes in a later PR (F8).
 */
export default function Login() {
  const { login } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await login(formData.email.trim(), formData.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // The api layer normalises errors to { message, status, errors }.
      setError(err?.message || "Sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary, #f1f5f9)" }}
    >
      {/* Theme toggle in the corner */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        className="fixed top-5 right-5 px-3 py-2 rounded-lg text-sm border transition-colors"
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
        }}
      >
        {isDark ? "☀️ Light" : "🌙 Dark"}
      </button>

      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white text-3xl"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            🏠
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Hostel Management
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl shadow-xl p-8"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg outline-none transition-colors"
                style={{
                  background: "var(--bg-primary)",
                  border: `1px solid ${error ? "#ef4444" : "var(--border-color)"}`,
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-lg outline-none transition-colors"
                  style={{
                    background: "var(--bg-primary)",
                    border: `1px solid ${error ? "#ef4444" : "var(--border-color)"}`,
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg p-3 text-sm flex items-start gap-2"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-white"
              style={{
                background: submitting
                  ? "rgba(59, 130, 246, 0.7)"
                  : "linear-gradient(135deg, #3b82f6, #6366f1)",
                boxShadow: submitting
                  ? "none"
                  : "0 4px 14px rgba(59, 130, 246, 0.35)",
              }}
            >
              {submitting ? (
                <>
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p
            className="mt-6 text-xs text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            Forgot your password? Contact your administrator.
          </p>
        </div>

        <p
          className="text-center mt-6 text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          Hostel Management System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
