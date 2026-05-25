// FeesTable
// ──────────────────────────────────────────────────────────────────────────────
// Pure presentational component. No fetching, no internal state beyond a tiny
// per-row "marking as paid" indicator. Parent owns data + sort + actions.

import React, { useContext, useState } from "react";
import { ThemeContext } from "../../../context/ThemeContext";

const COLUMNS = [
  { key: "studentName",   label: "Student",     sortable: false, width: "auto" },
  { key: "feeType",       label: "Type",        sortable: true,  width: 130   },
  { key: "amount",        label: "Amount",      sortable: true,  width: 130, align: "right" },
  { key: "dueDate",       label: "Due",         sortable: true,  width: 130   },
  { key: "paymentStatus", label: "Status",      sortable: false, width: 110   },
  { key: "paymentDate",   label: "Paid",        sortable: true,  width: 130   },
  { key: "actions",       label: "",            sortable: false, width: 160   },
];

export default function FeesTable({
  fees = [],
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onMarkPaid,
}) {
  const { t, isDark } = useContext(ThemeContext);
  const [paying, setPaying] = useState(null); // fee.id currently being marked paid

  async function handleMarkPaid(fee) {
    if (!onMarkPaid) return;
    setPaying(fee.id);
    try {
      await onMarkPaid(fee);
    } finally {
      setPaying(null);
    }
  }

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Inter, system-ui, sans-serif",
        }}>
          <thead style={{
            background:    isDark ? t.card : "#f8fafc",
            borderBottom:  `1px solid ${t.border}`,
          }}>
            <tr>
              {COLUMNS.map(col => {
                const isSorted = sort?.field === col.key;
                const dir      = isSorted ? sort.direction : null;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && onSortChange?.(col.key)}
                    style={{
                      textAlign:    col.align || "left",
                      padding:      "10px 14px",
                      fontSize:     11,
                      fontWeight:   700,
                      color:        t.muted,
                      textTransform:"uppercase",
                      letterSpacing: 0.5,
                      cursor:       col.sortable ? "pointer" : "default",
                      userSelect:   "none",
                      whiteSpace:   "nowrap",
                      width:        col.width,
                    }}
                  >
                    {col.label}
                    {col.sortable && (
                      <span style={{ marginLeft: 4, opacity: isSorted ? 1 : 0.3, fontSize: 10 }}>
                        {dir === "desc" ? "▼" : "▲"}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => {
              const status = (fee.paymentStatus || "PENDING").toUpperCase();
              const isPaid = status === "PAID";
              return (
                <tr
                  key={fee.id}
                  style={{ borderBottom: `1px solid ${t.border}`, transition: "background 0.12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? `${t.card}55` : "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Student */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={fee.studentName} t={t} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {fee.studentName || `Student #${fee.studentId}`}
                        </div>
                        {fee.semester && (
                          <div style={{ fontSize: 11, color: t.muted }}>{fee.semester}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: "12px 14px", fontSize: 12, color: t.text }}>
                    {labelEnum(fee.feeType || "HOSTEL")}
                  </td>

                  {/* Amount */}
                  <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 13, fontWeight: 700, color: t.text, fontVariantNumeric: "tabular-nums" }}>
                    {formatINR(fee.amount)}
                  </td>

                  {/* Due */}
                  <td style={{ padding: "12px 14px", fontSize: 12, color: t.muted, whiteSpace: "nowrap" }}>
                    {formatDate(fee.dueDate)}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "12px 14px" }}>
                    <StatusBadge status={status} t={t} />
                  </td>

                  {/* Paid */}
                  <td style={{ padding: "12px 14px", fontSize: 12, color: t.muted, whiteSpace: "nowrap" }}>
                    {fee.paymentDate ? formatDate(fee.paymentDate) : "—"}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      {onMarkPaid && !isPaid && (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(fee)}
                          disabled={paying === fee.id}
                          title="Mark as paid"
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: `1px solid ${t.success}55`,
                            background: `${t.success}1a`,
                            color: t.success,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: paying === fee.id ? "wait" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {paying === fee.id ? "…" : "✓ Paid"}
                        </button>
                      )}
                      {onEdit && (
                        <IconButton title="Edit" onClick={() => onEdit(fee)} t={t} color={t.accent}>✎</IconButton>
                      )}
                      {onDelete && (
                        <IconButton title="Delete" onClick={() => onDelete(fee)} t={t} color={t.danger}>🗑</IconButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {fees.length === 0 && (
        <div style={{ padding: "32px 24px", textAlign: "center", color: t.muted, fontSize: 13 }}>
          No fee records on this page.
        </div>
      )}
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function Avatar({ name, t }) {
  const initials = (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div style={{
      width:        32,
      height:       32,
      borderRadius: 8,
      background:   `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
      color:        "#fff",
      fontSize:     11,
      fontWeight:   700,
      display:      "flex",
      alignItems:   "center",
      justifyContent: "center",
      flexShrink:   0,
    }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status, t }) {
  const map = {
    PAID:    { color: t.success, bg: `${t.success}1a`, label: "Paid"    },
    PENDING: { color: t.warning, bg: `${t.warning}1a`, label: "Pending" },
    OVERDUE: { color: t.danger,  bg: `${t.danger}1a`,  label: "Overdue" },
    PARTIAL: { color: t.purple,  bg: `${t.purple}1a`,  label: "Partial" },
  };
  const cfg = map[status] || map.PENDING;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 6,
      background: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 600,
    }}>{cfg.label}</span>
  );
}

function IconButton({ children, title, onClick, t, color }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      style={{
        width: 28, height: 28,
        borderRadius: 6,
        border: `1px solid ${t.border}`,
        background: "transparent",
        color,
        fontSize: 13,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${color}1a`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >{children}</button>
  );
}

function formatINR(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function labelEnum(value) {
  return value
    .split("_")
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}
