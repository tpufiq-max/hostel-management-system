import { createContext, useState, useEffect, useCallback } from "react";

// ── Themes ────────────────────────────────────────────────────────────────────
const darkTheme = {
  bg: "#020617", surface: "#0b1220", card: "#0f172a",
  border: "#1e293b", text: "#f8fafc", muted: "#94a3b8",
  accent: "#3b82f6", success: "#22c55e", danger: "#f87171",
  warning: "#fbbf24", gold: "#f59e0b", purple: "#a855f7",
};
const lightTheme = {
  bg: "#f1f5f9", surface: "#ffffff", card: "#ffffff",
  border: "#e2e8f0", text: "#0f172a", muted: "#475569",
  accent: "#2563eb", success: "#16a34a", danger: "#ef4444",
  warning: "#f59e0b", gold: "#d97706", purple: "#9333ea",
};

// ── Context ───────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);
export const ThemeContext = createContext(null);

// ── AuthProvider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark]       = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginAnim, setLoginAnim] = useState(false);

  const t = dark ? darkTheme : lightTheme;

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("hms_token");
    const storedUser  = localStorage.getItem("hms_user");
    const storedDark  = localStorage.getItem("hms_dark");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    if (storedDark !== null) setDark(storedDark === "true");
    setLoading(false);
  }, []);

  // Persist dark preference
  useEffect(() => {
    localStorage.setItem("hms_dark", String(dark));
  }, [dark]);

  // Login function
  const login = useCallback(async (email, password) => {
    setLoginLoading(true);
    setLoginError("");

    await new Promise(r => setTimeout(r, 700)); // simulate network

    let mockUser = null;
    let mockToken = "";

    if (email === "admin@hostel.com" && password === "admin123") {
      mockUser  = { id: 1, name: "Admin User",  email, role: "admin"   };
      mockToken = "mock-jwt-token-admin";
    } else if (email === "student@hostel.com" && password === "student123") {
      mockUser  = { id: 2, name: "John Doe",    email, role: "student" };
      mockToken = "mock-jwt-token-student";
    } else if (email && password) {
      mockUser  = { id: Date.now(), name: email.split("@")[0], email, role: "admin" };
      mockToken = "mock-jwt-token-" + Date.now();
    } else {
      setLoginError("Please enter your email and password.");
      setLoginLoading(false);
      return null;
    }

    localStorage.setItem("hms_token", mockToken);
    localStorage.setItem("hms_user", JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
    setLoginLoading(false);
    setLoginAnim(true);
    setTimeout(() => setLoginAnim(false), 1000);
    return mockUser;
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    setToken(null);
    setUser(null);
    setLoginForm({ email: "", password: "" });
    setLoginError("");
  }, []);

  // Update user function
  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem("hms_user", JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  // Handle login form submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await login(loginForm.email, loginForm.password);
  };

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: darkTheme.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ width: 48, height: 48, border: `4px solid ${darkTheme.border}`, borderTop: `4px solid ${darkTheme.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: darkTheme.muted, fontSize: 14 }}>Loading Hostel Management...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.3s", padding: 20 }}>
        <style>{`
          @keyframes slideUp   { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
          @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
          @keyframes spin      { to { transform:rotate(360deg); } }
          @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
          @keyframes success   { 0% { transform:scale(0.8); opacity:0; } 100% { transform:scale(1); opacity:1; } }
          * { box-sizing: border-box; }
          input::placeholder { color: ${t.muted}; }
          select option { background: ${t.card}; color: ${t.text}; }
        `}</style>

        {/* Theme toggle */}
        <button onClick={() => setDark(!dark)} style={{ position: "fixed", top: 20, right: 20, padding: "8px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.surface, color: t.text, cursor: "pointer", fontSize: 13, zIndex: 10 }}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>

        {/* Background decoration */}
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -120, left: -120, width: 400, height: 400, borderRadius: "50%", background: `${t.accent}08`, filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: -100, right: -100, width: 350, height: 350, borderRadius: "50%", background: `${t.purple}08`, filter: "blur(60px)" }} />
        </div>

        <div style={{ width: "100%", maxWidth: 440, animation: "slideUp 0.6s ease both" }}>
          {/* Logo card */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: `0 8px 32px ${t.accent}44` }}>🏠</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>Hostel Management</div>
            <div style={{ fontSize: 14, color: t.muted, marginTop: 4 }}>Sign in to your account</div>
          </div>

          {/* Login card */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: 32, boxShadow: dark ? "0 24px 60px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.08)" }}>

            {/* Quick login hints */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[
                { label: "Admin", email: "admin@hostel.com", pass: "admin123", color: t.accent },
                { label: "Student", email: "student@hostel.com", pass: "student123", color: t.success },
              ].map(q => (
                <button key={q.label} onClick={() => setLoginForm({ email: q.email, password: q.pass })}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${q.color}44`, background: `${q.color}11`, color: q.color, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  {q.label === "Admin" ? "👑" : "🎓"} {q.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Email */}
              <div>
                <label style={{ fontSize: 13, color: t.muted, fontWeight: 500, display: "block", marginBottom: 6 }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>✉️</span>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={e => { setLoginForm(f => ({ ...f, email: e.target.value })); setLoginError(""); }}
                    placeholder="admin@hostel.com"
                    style={{ width: "100%", padding: "12px 14px 12px 42px", borderRadius: 12, border: `1px solid ${loginError ? t.danger : t.border}`, background: t.card, color: t.text, fontSize: 14, outline: "none", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = t.accent}
                    onBlur={e => e.target.style.borderColor = loginError ? t.danger : t.border}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: 13, color: t.muted, fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginForm.password}
                    onChange={e => { setLoginForm(f => ({ ...f, password: e.target.value })); setLoginError(""); }}
                    placeholder="••••••••"
                    style={{ width: "100%", padding: "12px 44px 12px 42px", borderRadius: 12, border: `1px solid ${loginError ? t.danger : t.border}`, background: t.card, color: t.text, fontSize: 14, outline: "none", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = t.accent}
                    onBlur={e => e.target.style.borderColor = loginError ? t.danger : t.border}
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: t.muted, padding: 0 }}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {loginError && (
                <div style={{ background: `${t.danger}18`, border: `1px solid ${t.danger}44`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: t.danger, display: "flex", alignItems: "center", gap: 8, animation: "fadeIn 0.2s ease" }}>
                  ⚠️ {loginError}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loginLoading}
                style={{ padding: "13px", borderRadius: 12, border: "none", background: loginLoading ? `${t.accent}88` : `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: loginLoading ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: loginLoading ? "none" : `0 4px 20px ${t.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 4 }}>
                {loginLoading
                  ? <><div style={{ width: 18, height: 18, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Signing in...</>
                  : "Sign In →"
                }
              </button>
            </form>

            {/* Divider + demo info */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 12, color: t.muted, textAlign: "center", marginBottom: 12 }}>Demo Credentials</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                {[
                  { role: "👑 Admin",   email: "admin@hostel.com",   pass: "admin123"   },
                  { role: "🎓 Student", email: "student@hostel.com", pass: "student123" },
                ].map(d => (
                  <div key={d.role} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600, color: t.text, marginBottom: 4 }}>{d.role}</div>
                    <div style={{ color: t.muted, lineHeight: 1.6 }}>{d.email}<br />{d.pass}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: t.muted }}>
            Hostel Management System © 2025
          </div>
        </div>
      </div>
    );
  }

  // ── Authenticated — render children ────────────────────────────────────────
  return (
    <ThemeContext.Provider value={{ dark, setDark, t, darkTheme, lightTheme }}>
      <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!token, login, logout, updateUser }}>
        {loginAnim && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease" }}>
            <div style={{ textAlign: "center", animation: "success 0.4s ease" }}>
              <div style={{ fontSize: 64 }}>✓</div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginTop: 12 }}>Welcome, {user?.name}!</div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>{user?.role === "admin" ? "👑 Admin" : "🎓 Student"} · Signing you in...</div>
            </div>
          </div>
        )}
        {children}
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
