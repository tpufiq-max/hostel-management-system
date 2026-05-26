import React, { useCallback, useContext, useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import Card from "../components/common/Card";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { visitorService } from "../features/visitor/visitorService";

/* ── Constants matching the backend enums ──────────────────────── */

const RELATIONS = [
  { value: "PARENT",   label: "Parent"   },
  { value: "SIBLING",  label: "Sibling"  },
  { value: "FRIEND",   label: "Friend"   },
  { value: "RELATIVE", label: "Relative" },
  { value: "GUARDIAN", label: "Guardian" },
  { value: "OTHER",    label: "Other"    },
];

const STATUS_FILTERS = [
  { value: "",             label: "All visitors" },
  { value: "CHECKED_IN",   label: "Checked in"   },
  { value: "CHECKED_OUT",  label: "Checked out"  },
  { value: "REJECTED",     label: "Rejected"     },
];

const PAGE_SIZE = 20;

const STATUS_TONE = {
  CHECKED_IN:  { color: "var(--success)", label: "Checked in"  },
  CHECKED_OUT: { color: "var(--muted)",   label: "Checked out" },
  REJECTED:    { color: "var(--danger)",  label: "Rejected"    },
};

const RELATION_LABEL = Object.fromEntries(RELATIONS.map((r) => [r.value, r.label]));

/* ── Helpers ───────────────────────────────────────────────────── */

const emptyForm = {
  visitorName: "",
  relation: "PARENT",
  purpose: "",
  phoneNumber: "",
  idProof: "",
  notes: "",
};

function formatCheckIn(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function Visitor() {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyRowId, setBusyRowId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await visitorService.list({ page, size: PAGE_SIZE, status: statusFilter });
      setData(result || { content: [], totalElements: 0, totalPages: 0, number: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load visitors.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    reload();
  }, [reload]);

  /* ── Modal form handlers ─────────────────────────────────────── */

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEdit(v) {
    setEditing(v);
    setForm({
      visitorName: v.visitorName || "",
      relation:    v.relation    || "PARENT",
      purpose:     v.purpose     || "",
      phoneNumber: v.phoneNumber || "",
      idProof:     v.idProof     || "",
      notes:       v.notes       || "",
    });
    setIsFormOpen(true);
  }

  function patchForm(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!form.visitorName.trim()) {
      toast.error("Visitor name is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await visitorService.update(editing.id, form);
        toast.success("Visitor updated.");
      } else {
        await visitorService.create(form);
        toast.success("Visitor checked in.");
      }
      setIsFormOpen(false);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to save visitor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckout(v) {
    if (busyRowId) return;
    setBusyRowId(v.id);
    try {
      await visitorService.checkout(v.id);
      toast.success(`${v.visitorName} checked out.`);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to check out visitor.");
    } finally {
      setBusyRowId(null);
    }
  }

  async function handleDelete(v) {
    if (busyRowId) return;
    if (!window.confirm(`Remove visitor record for ${v.visitorName}?`)) return;
    setBusyRowId(v.id);
    try {
      await visitorService.remove(v.id);
      toast.success("Visitor removed.");
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to remove visitor.");
    } finally {
      setBusyRowId(null);
    }
  }

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>
            Visitor Log
          </h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Track recent visitors and their check-in status.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            style={selectStyle(t)}
            aria-label="Filter visitors by status"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value || "all"} value={s.value}>{s.label}</option>
            ))}
          </select>

          <button type="button" onClick={openCreate} style={primaryButton(t)}>
            + Add visitor
          </button>
        </div>
      </div>

      {/* Body */}
      <Card style={{ background: t.surface, border: `1px solid ${t.border}` }}>
        <div style={cardHeaderStyle(t)}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: t.text }}>
            Visitor records
          </h3>
          <span style={{ fontSize: 12, color: t.muted }}>
            {loading ? "Loading…" : `${data.totalElements ?? data.content.length} total`}
          </span>
        </div>

        {error && !loading && (
          <div role="alert" style={errorBannerStyle}>
            {error}
            <button type="button" onClick={reload} style={linkButtonStyle}>Retry</button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 16 }}>
            <LoadingSkeleton count={5} />
          </div>
        ) : data.content.length === 0 ? (
          <EmptyState t={t} hasFilter={!!statusFilter} onClear={() => { setStatusFilter(""); setPage(0); }} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: t.bg }}>
                  <Th t={t}>Visitor</Th>
                  <Th t={t}>Relation</Th>
                  <Th t={t}>Purpose</Th>
                  <Th t={t}>Check-in</Th>
                  <Th t={t}>Status</Th>
                  <Th t={t} style={{ textAlign: "right" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((v) => (
                  <VisitorRow
                    key={v.id}
                    v={v}
                    t={t}
                    busy={busyRowId === v.id}
                    onCheckout={() => handleCheckout(v)}
                    onEdit={() => openEdit(v)}
                    onDelete={() => handleDelete(v)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data.totalPages > 1 && (
          <Pagination
            t={t}
            page={data.number}
            totalPages={data.totalPages}
            onChange={setPage}
          />
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !submitting && setIsFormOpen(false)}
        title={editing ? "Edit visitor" : "Check in a new visitor"}
        size="md"
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Visitor name" required>
            <input
              type="text"
              required
              value={form.visitorName}
              onChange={(e) => patchForm({ visitorName: e.target.value })}
              placeholder="e.g. Rajesh Kumar"
              disabled={submitting}
              style={inputStyle(t)}
            />
          </Field>

          <Field label="Relation" required>
            <select
              required
              value={form.relation}
              onChange={(e) => patchForm({ relation: e.target.value })}
              disabled={submitting}
              style={selectStyle(t)}
            >
              {RELATIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Phone">
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => patchForm({ phoneNumber: e.target.value })}
                placeholder="9876543210"
                disabled={submitting}
                style={inputStyle(t)}
              />
            </Field>
            <Field label="ID proof">
              <input
                type="text"
                value={form.idProof}
                onChange={(e) => patchForm({ idProof: e.target.value })}
                placeholder="AADHAAR-XXXX-1234"
                disabled={submitting}
                style={inputStyle(t)}
              />
            </Field>
          </div>

          <Field label="Purpose">
            <input
              type="text"
              value={form.purpose}
              onChange={(e) => patchForm({ purpose: e.target.value })}
              placeholder="Weekend visit, document delivery, …"
              disabled={submitting}
              style={inputStyle(t)}
            />
          </Field>

          <Field label="Notes">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => patchForm({ notes: e.target.value })}
              placeholder="Optional"
              disabled={submitting}
              style={{ ...inputStyle(t), resize: "vertical", fontFamily: "inherit" }}
            />
          </Field>

          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              disabled={submitting}
              style={{ ...secondaryButton(t), flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ ...primaryButton(t), flex: 1, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}
            >
              {submitting
                ? (editing ? "Updating…" : "Checking in…")
                : (editing ? "Update visitor" : "Check in visitor")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function VisitorRow({ v, t, busy, onCheckout, onEdit, onDelete }) {
  const tone = STATUS_TONE[v.status] || STATUS_TONE.CHECKED_OUT;
  const canCheckout = v.status === "CHECKED_IN";

  return (
    <tr style={{ borderTop: `1px solid ${t.border}` }}>
      <td style={cellStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={avatarStyle(t)}>{initials(v.visitorName)}</div>
          <div>
            <div style={{ fontWeight: 600, color: t.text }}>{v.visitorName}</div>
            {v.phoneNumber && (
              <div style={{ fontSize: 11, color: t.muted }}>{v.phoneNumber}</div>
            )}
          </div>
        </div>
      </td>
      <td style={cellStyle}>{RELATION_LABEL[v.relation] ?? v.relation}</td>
      <td style={{ ...cellStyle, color: t.muted }}>{v.purpose || "—"}</td>
      <td style={{ ...cellStyle, color: t.muted, whiteSpace: "nowrap" }}>
        {formatCheckIn(v.checkInTime)}
      </td>
      <td style={cellStyle}>
        <span style={badgeStyle(tone.color)}>{tone.label}</span>
      </td>
      <td style={{ ...cellStyle, textAlign: "right" }}>
        <div style={{ display: "inline-flex", gap: 6 }}>
          {canCheckout && (
            <button
              type="button"
              onClick={onCheckout}
              disabled={busy}
              style={tinyButton(t, "var(--success)")}
              aria-label={`Check out ${v.visitorName}`}
            >
              {busy ? "…" : "Check out"}
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            style={tinyButton(t, t.accent)}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            style={tinyButton(t, "var(--danger)")}
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}

function EmptyState({ t, hasFilter, onClear }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", color: t.muted }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
        No visitors{hasFilter ? " match this filter" : " yet"}
      </div>
      <div style={{ fontSize: 13 }}>
        {hasFilter
          ? "Try a different status or clear the filter."
          : "Add the first visitor with the Add visitor button above."}
      </div>
      {hasFilter && (
        <button type="button" onClick={onClear} style={{ ...secondaryButton(t), marginTop: 14 }}>
          Clear filter
        </button>
      )}
    </div>
  );
}

function Pagination({ t, page, totalPages, onChange }) {
  return (
    <div style={paginationStyle(t)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        style={pageBtn(t, page === 0)}
      >
        ← Prev
      </button>
      <span style={{ fontSize: 12, color: t.muted }}>
        Page <strong style={{ color: t.text }}>{page + 1}</strong> of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        style={pageBtn(t, page >= totalPages - 1)}
      >
        Next →
      </button>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
      {label}{required && <span style={{ color: "var(--danger)" }}> *</span>}
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}

function Th({ t, children, style }) {
  return (
    <th
      style={{
        textAlign: "left",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontSize: 11,
        fontWeight: 700,
        color: t.muted,
        padding: "12px 16px",
        ...style,
      }}
    >
      {children}
    </th>
  );
}

/* ── Inline style helpers (CSS-var driven, theme-aware) ─────────── */

const headerStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const cellStyle = { padding: "12px 16px", verticalAlign: "middle", color: "var(--text)" };

const errorBannerStyle = {
  margin: 16,
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(248,113,113,0.12)",
  border: "1px solid rgba(248,113,113,0.45)",
  color: "var(--danger)",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const linkButtonStyle = {
  marginLeft: "auto",
  background: "none",
  border: "none",
  color: "var(--danger)",
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: 12,
};

function cardHeaderStyle(t) {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    borderBottom: `1px solid ${t.border}`,
    background: t.bg,
  };
}

function avatarStyle(t) {
  return {
    width: 32,
    height: 32,
    borderRadius: 10,
    flexShrink: 0,
    background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function badgeStyle(color) {
  return {
    display: "inline-block",
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 999,
    color,
    background: `${color}22`,
    border: `1px solid ${color}55`,
  };
}

function inputStyle(t) {
  return {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: t.text,
    fontSize: 13,
    outline: "none",
  };
}

function selectStyle(t) {
  return {
    ...inputStyle(t),
    width: "auto",
    minWidth: 140,
    paddingRight: 28,
    cursor: "pointer",
  };
}

function primaryButton(t) {
  return {
    padding: "9px 16px",
    borderRadius: 10,
    border: "none",
    background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: `0 4px 14px ${t.accent}44`,
  };
}

function secondaryButton(t) {
  return {
    padding: "9px 16px",
    borderRadius: 10,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: t.text,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };
}

function tinyButton(t, color) {
  return {
    padding: "5px 10px",
    borderRadius: 8,
    border: `1px solid ${color}55`,
    background: `${color}11`,
    color,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}

function paginationStyle(t) {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    borderTop: `1px solid ${t.border}`,
    background: t.bg,
  };
}

function pageBtn(t, disabled) {
  return {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: disabled ? "transparent" : t.card,
    color: disabled ? t.muted : t.text,
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}
