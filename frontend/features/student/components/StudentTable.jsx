// StudentTable
// ──────────────────────────────────────────────────────────────────────────────
// Pure presentational component:
//   * Receives `students` from the parent (which fetched them from the backend)
//   * Sorting bubbles up to the parent (which re-queries the server)
//   * Edit / delete actions are passed in as props
//   * No internal mock data, no internal filtering
//
// Styled inline using the ThemeContext palette so it matches the rest of
// the app today; will migrate to Tailwind utility classes when F4 design-
// system PR is merged.

import React, { useContext } from "react";
import { ThemeContext } from "../../../context/ThemeContext";

const COLUMNS = [
  { key: "name",          label: "Student",     sortable: true,  width: "auto" },
  { key: "email",         label: "Contact",     sortable: true,  width: "auto" },
  { key: "rollNumber",    label: "Roll #",      sortable: true,  width: 120   },
  { key: "roomNumber",    label: "Room",        sortable: true,  width: 100   },
  { key: "course",        label: "Course",      sortable: true,  width: "auto" },
  { key: "admissionDate", label: "Admitted",    sortable: true,  width: 130   },
  { key: "feesStatus",    label: "Fees",        sortable: false, width: 110   },
  { key: "isActive",      label: "Status",      sortable: false, width: 100   },
  { key: "actions",       label: "",            sortable: false, width: 80    },
];

export default function StudentTable({
  students = [],
  sort,                  // { field, direction }
  onSortChange,          // (field) => void
  onEdit,                // (student) => void
  onDelete,              // (student) => void
}) {
  const { t, isDark } = useContext(ThemeContext);

  const handleHeaderClick = (col) => {
    if (!col.sortable || !onSortChange) return;
    onSortChange(col.key);
  };

  return (
    <div style={{
      background: t.surface,
      border:     `1px solid ${t.border}`,
      borderRadius: 12,
      overflow:   "hidden",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width:           "100%",
          borderCollapse:  "collapse",
          fontFamily:      "Inter, system-ui, sans-serif",
        }}>
          <thead style={{
            background:    isDark ? `${t.card}` : "#f8fafc",
            borderBottom:  `1px solid ${t.border}`,
          }}>
            <tr>
              {COLUMNS.map(col => {
                const isSorted = sort?.field === col.key;
                const dir      = isSorted ? sort.direction : null;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col)}
                    style={{
                      textAlign:    "left",
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
                      <span style={{
                        marginLeft: 4,
                        opacity: isSorted ? 1 : 0.3,
                        fontSize: 10,
                      }}>
                        {dir === "desc" ? "▼" : "▲"}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.id}
                style={{
                  borderBottom: `1px solid ${t.border}`,
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? `${t.card}55` : "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Student (avatar + name + year) */}
                <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={s.name} t={t} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: t.muted }}>
                        {s.year ? `Year ${s.year}` : "—"}
                        {s.department ? ` · ${s.department}` : ""}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                  <div style={{ fontSize: 12, color: t.text }}>{s.email}</div>
                  <div style={{ fontSize: 11, color: t.muted }}>{s.phone || "—"}</div>
                </td>

                {/* Roll number */}
                <td style={{ padding: "12px 14px", fontSize: 12, color: t.text, fontFamily: "monospace" }}>
                  {s.rollNumber || "—"}
                </td>

                {/* Room */}
                <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                  {s.roomNumber ? (
                    <span style={{
                      display:      "inline-block",
                      padding:      "2px 8px",
                      borderRadius: 6,
                      background:   `${t.accent}1a`,
                      color:        t.accent,
                      fontSize:     12,
                      fontWeight:   600,
                    }}>
                      {s.roomNumber}{s.bedNumber ? `/${s.bedNumber}` : ""}
                    </span>
                  ) : <span style={{ fontSize: 12, color: t.muted }}>—</span>}
                </td>

                {/* Course */}
                <td style={{ padding: "12px 14px", fontSize: 12, color: t.text }}>
                  {s.course || "—"}
                </td>

                {/* Admission */}
                <td style={{ padding: "12px 14px", fontSize: 12, color: t.muted, whiteSpace: "nowrap" }}>
                  {formatDate(s.admissionDate)}
                </td>

                {/* Fees */}
                <td style={{ padding: "12px 14px" }}>
                  <FeesBadge status={s.feesStatus} t={t} />
                </td>

                {/* Active toggle */}
                <td style={{ padding: "12px 14px" }}>
                  <span style={{
                    display:      "inline-flex",
                    alignItems:   "center",
                    gap:          6,
                    padding:      "2px 8px",
                    borderRadius: 6,
                    background:   s.isActive ? `${t.success}1a` : `${t.muted}1a`,
                    color:        s.isActive ? t.success : t.muted,
                    fontSize:     11,
                    fontWeight:   600,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: s.isActive ? t.success : t.muted,
                    }} />
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {onEdit && (
                      <IconButton title="Edit" onClick={() => onEdit(s)} t={t} color={t.accent}>✎</IconButton>
                    )}
                    {onDelete && (
                      <IconButton title="Delete" onClick={() => onDelete(s)} t={t} color={t.danger}>🗑</IconButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty body — parent decides whether to render an empty state on top */}
      {students.length === 0 && (
        <div style={{
          padding:    "32px 24px",
          textAlign:  "center",
          color:      t.muted,
          fontSize:   13,
        }}>
          No students to show on this page.
        </div>
      )}
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function Avatar({ name, t }) {
  const initials = (name || "")
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
      fontSize:     12,
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

function FeesBadge({ status, t }) {
  if (!status) return <span style={{ fontSize: 12, color: t.muted }}>—</span>;
  const map = {
    PAID:    { color: t.success, bg: `${t.success}1a`, label: "Paid"    },
    PENDING: { color: t.warning, bg: `${t.warning}1a`, label: "Pending" },
    OVERDUE: { color: t.danger,  bg: `${t.danger}1a`,  label: "Overdue" },
  };
  const cfg = map[status] || { color: t.muted, bg: `${t.muted}1a`, label: status };
  return (
    <span style={{
      display:      "inline-block",
      padding:      "2px 8px",
      borderRadius: 6,
      background:   cfg.bg,
      color:        cfg.color,
      fontSize:     11,
      fontWeight:   600,
    }}>
      {cfg.label}
    </span>
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
        width:        28,
        height:       28,
        borderRadius: 6,
        border:       `1px solid ${t.border}`,
        background:   "transparent",
        color:        color,
        fontSize:     13,
        cursor:       "pointer",
        display:      "inline-flex",
        alignItems:   "center",
        justifyContent: "center",
        transition:   "background 0.15s, transform 0.1s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}1a`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
