import React from "react";

/**
 * Tiny shared UI primitives for the /me/* student pages.
 * Kept dependency-free (no router, no axios) so each page can import only
 * what it needs.
 */

export function PageHeader({ t, title, subtitle, right }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "flex-start", flexWrap: "wrap", gap: 12,
    }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>{title}</h1>
        {subtitle && <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Panel({ t, children, style }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 16,
      padding: 20,
      display: "flex", flexDirection: "column", gap: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionTitle({ t, children }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: t.muted,
      letterSpacing: 0.6, textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

export function Field({ t, label, value }) {
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: "12px 14px",
    }}>
      <div style={{
        fontSize: 11, color: t.muted, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: 0.4,
      }}>
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 14, color: t.text, wordBreak: "break-word" }}>
        {value || "—"}
      </div>
    </div>
  );
}

export function Button({ t, children, onClick, disabled, type = "button", variant = "default" }) {
  const isPrimary = variant === "primary";
  const isDanger  = variant === "danger";
  const bg     = isPrimary ? t.accent : isDanger ? t.danger : t.card;
  const fg     = isPrimary || isDanger ? "#fff" : t.text;
  const border = isPrimary ? t.accent : isDanger ? t.danger : t.border;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "9px 16px", borderRadius: 10,
        border: `1px solid ${border}`, background: bg, color: fg,
        fontWeight: 600, fontSize: 13,
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

export function Alert({ t, kind = "info", children }) {
  const color = kind === "danger"  ? t.danger
              : kind === "success" ? t.success
              : kind === "warning" ? t.warning
              : t.accent;
  return (
    <div role="alert" style={{
      padding: "10px 14px", borderRadius: 12,
      background: `${color}18`, border: `1px solid ${color}55`,
      color, fontSize: 13,
    }}>
      {children}
    </div>
  );
}

export function StatusPill({ t, status }) {
  const map = {
    PAID:        { fg: t.success, label: "Paid" },
    PENDING:     { fg: t.warning, label: "Pending" },
    OVERDUE:     { fg: t.danger,  label: "Overdue" },
    PARTIAL:     { fg: t.accent,  label: "Partial" },
    OPEN:        { fg: t.warning, label: "Open" },
    IN_PROGRESS: { fg: t.accent,  label: "In progress" },
    RESOLVED:    { fg: t.success, label: "Resolved" },
    CLOSED:      { fg: t.muted,   label: "Closed" },
    PRESENT:     { fg: t.success, label: "Present" },
    ABSENT:      { fg: t.danger,  label: "Absent" },
    LEAVE:       { fg: t.accent,  label: "Leave" },
    LATE:        { fg: t.warning, label: "Late" },
    ASSIGNED:    { fg: t.accent,  label: "Assigned" },
    COMPLETED:   { fg: t.success, label: "Completed" },
    REJECTED:    { fg: t.danger,  label: "Rejected" },
    LOW:         { fg: t.muted,   label: "Low" },
    MEDIUM:      { fg: t.accent,  label: "Medium" },
    HIGH:        { fg: t.warning, label: "High" },
    URGENT:      { fg: t.danger,  label: "Urgent" },
    NORMAL:      { fg: t.muted,   label: "Normal" },
  };
  const m = map[(status || "").toUpperCase()] || { fg: t.muted, label: status || "—" };
  return (
    <span style={{
      display: "inline-block",
      fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
      textTransform: "uppercase",
      padding: "3px 10px", borderRadius: 999,
      background: `${m.fg}1a`, color: m.fg,
      border: `1px solid ${m.fg}40`,
      whiteSpace: "nowrap",
    }}>
      {m.label}
    </span>
  );
}

export function EmptyState({ t, icon = "📭", title, subtitle, action }) {
  return (
    <div style={{
      padding: "40px 16px", textAlign: "center",
      color: t.muted, background: t.card,
      border: `1px dashed ${t.border}`, borderRadius: 14,
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, marginTop: 4 }}>{subtitle}</div>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

export function Loading({ t, message = "Loading…" }) {
  return (
    <div style={{
      padding: "30px 16px", textAlign: "center",
      color: t.muted, fontSize: 13,
    }}>
      {message}
    </div>
  );
}

export function Input({ t, label, value, onChange, type = "text", required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: t.muted }}>
        {label}{required && " *"}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "10px 12px", borderRadius: 10,
          border: `1px solid ${t.border}`, background: t.card, color: t.text,
          fontSize: 13, outline: "none",
        }}
        onFocus={e => e.currentTarget.style.borderColor = t.accent}
        onBlur ={e => e.currentTarget.style.borderColor = t.border}
      />
    </label>
  );
}

export function Textarea({ t, label, value, onChange, rows = 3, required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: t.muted }}>
        {label}{required && " *"}
      </span>
      <textarea
        rows={rows}
        value={value}
        required={required}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "10px 12px", borderRadius: 10,
          border: `1px solid ${t.border}`, background: t.card, color: t.text,
          fontSize: 13, outline: "none", resize: "vertical",
          fontFamily: "inherit",
        }}
        onFocus={e => e.currentTarget.style.borderColor = t.accent}
        onBlur ={e => e.currentTarget.style.borderColor = t.border}
      />
    </label>
  );
}

export function Select({ t, label, value, onChange, options, required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: t.muted }}>
        {label}{required && " *"}
      </span>
      <select
        value={value}
        required={required}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "10px 12px", borderRadius: 10,
          border: `1px solid ${t.border}`, background: t.card, color: t.text,
          fontSize: 13, outline: "none", cursor: "pointer",
        }}
        onFocus={e => e.currentTarget.style.borderColor = t.accent}
        onBlur ={e => e.currentTarget.style.borderColor = t.border}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function formatCurrency(n) {
  const v = Number(n) || 0;
  return `₹ ${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatDate(s) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return s; }
}
