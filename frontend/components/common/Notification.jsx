import React from "react";

const TYPE_STYLES = {
  success: { color: "var(--success)", icon: "✓" },
  error:   { color: "var(--danger)",  icon: "✕" },
  info:    { color: "var(--accent)",  icon: "i" },
  warning: { color: "var(--warning)", icon: "!" },
};

export default function Notification({ notification, onClose }) {
  const { type = "info", message } = notification;
  const { color, icon } = TYPE_STYLES[type] || TYPE_STYLES.info;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        background: "var(--surface)",
        color: "var(--text)",
        border: `1px solid ${color}55`,
        borderLeft: `4px solid ${color}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        minWidth: 240,
        maxWidth: 360,
        animation: "slideIn 0.25s ease both",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: `${color}22`,
          color,
          fontSize: 13,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.45 }}>{message}</div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: "none",
          border: "none",
          color: "var(--muted)",
          fontSize: 16,
          lineHeight: 1,
          cursor: "pointer",
          padding: 2,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
