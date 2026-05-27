import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { get } from "../api/api";

/**
 * /profile
 *
 * Read-only view of the currently authenticated user, sourced from
 * GET /api/auth/me. Refresh re-fetches; "Change Password" deep-links
 * to /settings.
 */
export default function Profile() {
  const { t, isDark } = useContext(ThemeContext);
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [me, setMe]           = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await get("/auth/me");
      if (fresh) {
        setMe(fresh);
        updateUser(fresh);
      }
    } catch (err) {
      setError(err?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => { refresh(); }, [refresh]);

  const initials = me?.name
    ? me.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const fields = [
    { label: "Full name",   value: me?.name },
    { label: "Email",       value: me?.email },
    { label: "Username",    value: me?.username },
    { label: "Phone",       value: me?.phone || "—" },
    { label: "Role",        value: me?.role
        ? me.role.charAt(0).toUpperCase() + me.role.slice(1)
        : "—" },
    { label: "User ID",     value: me?.id ? `#${me.id}` : "—" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader t={t} title="My Profile" subtitle="Your account details and identity." />

      {error && <Alert t={t} kind="danger">{error}</Alert>}

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) minmax(0, 2fr)",
        gap: 24,
        alignItems: "flex-start",
      }}>

        {/* ── Avatar / identity card ────────────────────────────── */}
        <Panel t={t}>
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center", gap: 14,
            padding: "8px 4px",
          }}>
            <div style={{
              width: 96, height: 96, borderRadius: 24,
              background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 36, fontWeight: 700,
              boxShadow: isDark
                ? "0 12px 32px rgba(0,0,0,0.5)"
                : "0 8px 24px rgba(0,0,0,0.12)",
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: t.text }}>
                {me?.name ?? "—"}
              </div>
              <div style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>
                {me?.email ?? ""}
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "4px 12px",
              borderRadius: 8, letterSpacing: 0.4, textTransform: "uppercase",
              background: me?.role === "admin" ? `${t.accent}22` : `${t.success}22`,
              color: me?.role === "admin" ? t.accent : t.success,
            }}>
              {me?.role === "admin" ? "Administrator" : (me?.role || "User")}
            </span>

            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
              <Button t={t} onClick={refresh} disabled={loading}>
                {loading ? "Refreshing…" : "Refresh"}
              </Button>
              <Button t={t} variant="primary" onClick={() => navigate("/settings")}>
                Change Password
              </Button>
            </div>
          </div>
        </Panel>

        {/* ── Field grid ────────────────────────────────────────── */}
        <Panel t={t}>
          <SectionTitle t={t}>Account information</SectionTitle>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}>
            {fields.map(f => (
              <Field key={f.label} t={t} label={f.label} value={f.value} />
            ))}
          </div>

          <div style={{ height: 1, background: t.border, margin: "20px 0" }} />

          <SectionTitle t={t}>Quick actions</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Button t={t} onClick={() => navigate("/settings")}>⚙️ Settings</Button>
            <Button t={t} onClick={() => navigate("/notice")}>📢 Notices</Button>
            <Button t={t} onClick={() => navigate("/")}>🏠 Dashboard</Button>
            <Button t={t} onClick={() => navigate("/help")}>❓ Help &amp; Support</Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ── small UI helpers (kept local — match the style used elsewhere) ── */

function PageHeader({ t, title, subtitle }) {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>{title}</h1>
      <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>{subtitle}</p>
    </div>
  );
}

function Panel({ t, children }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 16,
      padding: 20,
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
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function Field({ t, label, value }) {
  return (
    <div style={{
      background: t.card,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: "12px 14px",
    }}>
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 14, color: t.text, wordBreak: "break-word" }}>
        {value || "—"}
      </div>
    </div>
  );
}

function Button({ t, children, onClick, disabled, variant = "default" }) {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "8px 14px",
        borderRadius: 10,
        border: `1px solid ${isPrimary ? t.accent : t.border}`,
        background: isPrimary ? t.accent : t.card,
        color: isPrimary ? "#fff" : t.text,
        fontWeight: 600,
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "transform 0.15s, opacity 0.15s",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
    >
      {children}
    </button>
  );
}

function Alert({ t, kind, children }) {
  const color = kind === "danger" ? t.danger : kind === "success" ? t.success : t.accent;
  return (
    <div style={{
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
