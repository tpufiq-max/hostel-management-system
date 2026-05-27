import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { post } from "../api/api";

/**
 * /settings
 *
 * Working settings page:
 *   • Change password         → POST /api/auth/change-password
 *   • Appearance (theme)      → ThemeContext
 *   • Notification preferences → localStorage (hms_prefs)
 */

const PREFS_KEY = "hms_prefs";

const DEFAULT_PREFS = {
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: false,
  reduceMotion: false,
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export default function Settings() {
  const { t, isDark, toggleTheme } = useContext(ThemeContext);
  const { user, logout }           = useContext(AuthContext);
  const navigate                   = useNavigate();

  // ── change-password form state ───────────────────────────────────────
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg]   = useState(null); // { kind, text }
  const [pwDone, setPwDone] = useState(false); // stays true after a successful change

  // simple client-side strength meter (0-4)
  const pwStrength = useMemo(() => scorePassword(pw.newPassword), [pw.newPassword]);

  // ── prefs state (localStorage) ───────────────────────────────────────
  const [prefs, setPrefs] = useState(loadPrefs);
  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  }, [prefs]);

  function setPref(key, value) {
    setPrefs(p => ({ ...p, [key]: value }));
  }

  // ── change-password handler ──────────────────────────────────────────
  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMsg(null);

    const { currentPassword, newPassword, confirmPassword } = pw;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwMsg({ kind: "danger", text: "Please fill in all password fields." });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ kind: "danger", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ kind: "danger", text: "New password and confirmation don't match." });
      return;
    }
    if (newPassword === currentPassword) {
      setPwMsg({ kind: "danger", text: "New password must be different from current password." });
      return;
    }

    setPwBusy(true);
    try {
      await post("/auth/change-password", { currentPassword, newPassword });
      setPwMsg({ kind: "success", text: "Password changed. You'll need it the next time you sign in." });
      setPwDone(true);
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      // Backend returns helpful messages like "Current password is incorrect"
      // or "New password must be different from current password". Surface them
      // verbatim — the api/api.js interceptor already normalises into err.message.
      setPwMsg({
        kind: "danger",
        text: err?.message || "Couldn't change password. Please try again.",
      });
    } finally {
      setPwBusy(false);
    }
  }

  function handleSignOut() {
    logout?.();
    navigate("/login", { replace: true });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader t={t} title="Settings" subtitle="Manage your account, security and preferences." />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 24,
        alignItems: "flex-start",
      }}>

        {/* ── Appearance ───────────────────────────────────────── */}
        <Panel t={t}>
          <SectionTitle t={t}>Appearance</SectionTitle>

          <Row t={t}
               label="Theme"
               description={isDark ? "Currently using dark theme." : "Currently using light theme."}>
            <button
              onClick={toggleTheme}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.card,
                color: t.text,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>{isDark ? "☀️" : "🌙"}</span>
              Switch to {isDark ? "light" : "dark"}
            </button>
          </Row>

          <Toggle t={t}
                  label="Reduce motion"
                  description="Minimise non-essential animations."
                  checked={prefs.reduceMotion}
                  onChange={v => setPref("reduceMotion", v)} />
        </Panel>

        {/* ── Notifications ────────────────────────────────────── */}
        <Panel t={t}>
          <SectionTitle t={t}>Notifications</SectionTitle>

          <Toggle t={t}
                  label="Email notifications"
                  description="Receive important alerts by email."
                  checked={prefs.emailNotifications}
                  onChange={v => setPref("emailNotifications", v)} />

          <Toggle t={t}
                  label="In-app notifications"
                  description="Show the notification badge in the navbar."
                  checked={prefs.pushNotifications}
                  onChange={v => setPref("pushNotifications", v)} />

          <Toggle t={t}
                  label="Weekly digest"
                  description="Get a summary of activity every Monday."
                  checked={prefs.weeklyDigest}
                  onChange={v => setPref("weeklyDigest", v)} />

          <div style={{ fontSize: 11, color: t.muted, marginTop: 8 }}>
            Saved automatically to this device.
          </div>
        </Panel>

        {/* ── Change password ──────────────────────────────────── */}
        <Panel t={t} style={{ gridColumn: "1 / -1" }}>
          <SectionTitle t={t}>Security · Change password</SectionTitle>

          {pwMsg && <Alert t={t} kind={pwMsg.kind}>{pwMsg.text}</Alert>}

          <form onSubmit={handleChangePassword} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14, marginTop: pwMsg ? 12 : 0,
          }}>
            <Input t={t}
                   label="Current password"
                   type="password"
                   autoComplete="current-password"
                   value={pw.currentPassword}
                   onChange={v => { setPw(p => ({ ...p, currentPassword: v })); if (pwDone) setPwDone(false); }} />

            <div>
              <Input t={t}
                     label="New password"
                     type="password"
                     autoComplete="new-password"
                     hint="Minimum 6 characters."
                     value={pw.newPassword}
                     onChange={v => { setPw(p => ({ ...p, newPassword: v })); if (pwDone) setPwDone(false); }} />
              {pw.newPassword.length > 0 && (
                <PasswordStrength t={t} score={pwStrength} />
              )}
            </div>

            <Input t={t}
                   label="Confirm new password"
                   type="password"
                   autoComplete="new-password"
                   value={pw.confirmPassword}
                   onChange={v => { setPw(p => ({ ...p, confirmPassword: v })); if (pwDone) setPwDone(false); }} />

            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              flexWrap: "wrap",
              gridColumn: "1 / -1", marginTop: 4,
            }}>
              <button
                type="submit"
                disabled={pwBusy}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: `1px solid ${t.accent}`,
                  background: t.accent,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: pwBusy ? "wait" : "pointer",
                  opacity: pwBusy ? 0.7 : 1,
                }}
              >
                {pwBusy ? "Saving…" : "Update password"}
              </button>

              {pwDone && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: `1px solid ${t.border}`,
                    background: t.card,
                    color: t.text,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Sign out and re-login
                </button>
              )}

              <span style={{ fontSize: 12, color: t.muted }}>
                Signed in as <b style={{ color: t.text }}>{user?.email ?? "—"}</b>
              </span>
            </div>
          </form>
        </Panel>

      </div>
    </div>
  );
}

/* ── helpers ───────────────────────────────────────────────────────── */

function PageHeader({ t, title, subtitle }) {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>{title}</h1>
      <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>{subtitle}</p>
    </div>
  );
}

function Panel({ t, children, style }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 16,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ t, children }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: t.muted,
      letterSpacing: 0.6, textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

function Row({ t, label, description, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 14, padding: "10px 0", borderBottom: `1px solid ${t.border}`,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{label}</div>
        {description && (
          <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{description}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ t, label, description, checked, onChange }) {
  return (
    <Row t={t} label={label} description={description}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        style={{
          width: 44, height: 24,
          borderRadius: 999,
          border: `1px solid ${checked ? t.accent : t.border}`,
          background: checked ? t.accent : t.card,
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        <span style={{
          position: "absolute", top: 2,
          left: checked ? 22 : 2,
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </Row>
  );
}

function Input({ t, label, value, onChange, type = "text", autoComplete, hint }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: t.muted }}>{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: `1px solid ${t.border}`,
          background: t.card,
          color: t.text,
          fontSize: 13,
          outline: "none",
        }}
        onFocus={e => e.currentTarget.style.borderColor = t.accent}
        onBlur={e => e.currentTarget.style.borderColor = t.border}
      />
      {hint && <span style={{ fontSize: 11, color: t.muted }}>{hint}</span>}
    </label>
  );
}

function Alert({ t, kind, children }) {
  const color = kind === "danger" ? t.danger : kind === "success" ? t.success : t.accent;
  return (
    <div role="alert" style={{
      padding: "10px 14px",
      borderRadius: 12,
      background: `${color}18`,
      border: `1px solid ${color}55`,
      color,
      fontSize: 13,
    }}>
      {children}
    </div>
  );
}

/* ── password strength helpers ──────────────────────────────────────────
 * Cheap scoring: length tier + variety of character classes used. Mirrors
 * what the user could realistically reason about, not a real entropy
 * estimate. The number maps to a label and a colour-coded bar.
 * ───────────────────────────────────────────────────────────────────── */

function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw))   score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

function PasswordStrength({ t, score }) {
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const colors = [t.danger, t.danger, t.warning, t.accent, t.success];
  const label  = labels[score];
  const color  = colors[score];
  const filled = Math.max(1, score);
  return (
    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", gap: 3 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i < filled ? color : t.border,
            transition: "background 0.2s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color }}>{label}</span>
    </div>
  );
}
