import React, { useCallback, useContext, useEffect, useState } from "react";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { maintenanceService } from "../features/maintenance/maintenanceService";

/* ── Backend enums ─────────────────────────────────────────────── */

const CATEGORIES = [
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "PLUMBING",   label: "Plumbing"   },
  { value: "FURNITURE",  label: "Furniture"  },
  { value: "APPLIANCE",  label: "Appliance"  },
  { value: "CLEANING",   label: "Cleaning"   },
  { value: "STRUCTURAL", label: "Structural" },
  { value: "OTHER",      label: "Other"      },
];

const PRIORITIES = [
  { value: "LOW",    label: "Low"    },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH",   label: "High"   },
  { value: "URGENT", label: "Urgent" },
];

const STATUS_TABS = [
  { value: "",            label: "All"          },
  { value: "OPEN",        label: "Open"         },
  { value: "ASSIGNED",    label: "Assigned"     },
  { value: "IN_PROGRESS", label: "In progress"  },
  { value: "COMPLETED",   label: "Completed"    },
  { value: "REJECTED",    label: "Rejected"     },
];

const PAGE_SIZE = 20;

const STATUS_TONE = {
  OPEN:        { color: "var(--danger)",  label: "Open"        },
  ASSIGNED:    { color: "var(--warning)", label: "Assigned"    },
  IN_PROGRESS: { color: "var(--accent)",  label: "In progress" },
  COMPLETED:   { color: "var(--success)", label: "Completed"   },
  REJECTED:    { color: "var(--muted)",   label: "Rejected"    },
};

const PRIORITY_TONE = {
  LOW:    "var(--success)",
  MEDIUM: "var(--accent)",
  HIGH:   "var(--warning)",
  URGENT: "var(--danger)",
};

const CATEGORY_LABEL  = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));
const PRIORITY_LABEL  = Object.fromEntries(PRIORITIES.map((p) => [p.value, p.label]));

const emptyForm = {
  title: "",
  description: "",
  category: "PLUMBING",
  priority: "MEDIUM",
  roomNumber: "",
  assignedTo: "",
  notes: "",
};

/* ── Page ──────────────────────────────────────────────────────── */

export default function Maintenance() {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyRowId, setBusyRowId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await maintenanceService.list({ page, size: PAGE_SIZE, status: statusFilter });
      setData(result || { content: [], totalElements: 0, totalPages: 0, number: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load maintenance requests.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { reload(); }, [reload]);

  function patchForm(patch) { setForm((f) => ({ ...f, ...patch })); }

  function openForm() {
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!form.title.trim()) {
      toast.error("A title is required.");
      return;
    }
    setSubmitting(true);
    try {
      await maintenanceService.create(form);
      toast.success("Maintenance request submitted.");
      setShowForm(false);
      setForm(emptyForm);
      // Switch to OPEN tab and refetch — newly created requests are OPEN
      setStatusFilter("");
      setPage(0);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(req, nextStatus) {
    if (busyRowId) return;
    setBusyRowId(req.id);
    try {
      await maintenanceService.update(req.id, { status: nextStatus });
      toast.success(`Status updated to ${STATUS_TONE[nextStatus]?.label || nextStatus}.`);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setBusyRowId(null);
    }
  }

  async function handleDelete(req) {
    if (busyRowId) return;
    if (!window.confirm(`Delete request "${req.title}"?`)) return;
    setBusyRowId(req.id);
    try {
      await maintenanceService.remove(req.id);
      toast.success("Request deleted.");
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to delete request.");
    } finally {
      setBusyRowId(null);
    }
  }

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      {/* Header */}
      <div style={headerRowStyle}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>
            Maintenance requests
          </h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Track and manage hostel maintenance issues.
          </p>
        </div>
        <button type="button" onClick={openForm} style={primaryButton(t)}>
          + New request
        </button>
      </div>

      {/* New request form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>
            Report a new issue
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <Field label="Title" required>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => patchForm({ title: e.target.value })}
                placeholder="e.g. Leaking faucet in room 101"
                disabled={submitting}
                style={inputStyle(t)}
              />
            </Field>

            <Field label="Room number">
              <input
                type="text"
                value={form.roomNumber}
                onChange={(e) => patchForm({ roomNumber: e.target.value })}
                placeholder="101 / Block-A / Common-1"
                disabled={submitting}
                style={inputStyle(t)}
              />
            </Field>

            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => patchForm({ category: e.target.value })}
                disabled={submitting}
                style={inputStyle(t)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => patchForm({ priority: e.target.value })}
                disabled={submitting}
                style={inputStyle(t)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => patchForm({ description: e.target.value })}
              placeholder="Describe the issue in detail."
              disabled={submitting}
              style={{ ...inputStyle(t), resize: "vertical", fontFamily: "inherit" }}
            />
          </Field>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={submitting}
              style={secondaryButton(t)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ ...primaryButton(t), opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}
            >
              {submitting ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </form>
      )}

      {/* Status tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {STATUS_TABS.map((s) => (
          <button
            key={s.value || "all"}
            type="button"
            onClick={() => { setStatusFilter(s.value); setPage(0); }}
            style={tabStyle(t, statusFilter === s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Body */}
      {error && !loading && (
        <div role="alert" style={errorBannerStyle}>
          {error}
          <button type="button" onClick={reload} style={linkButtonStyle}>Retry</button>
        </div>
      )}

      {loading ? (
        <div><LoadingSkeleton count={4} /></div>
      ) : data.content.length === 0 ? (
        <EmptyState t={t} hasFilter={!!statusFilter} onClear={() => { setStatusFilter(""); setPage(0); }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.content.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              t={t}
              busy={busyRowId === req.id}
              onStatusChange={handleStatusChange}
              onDelete={() => handleDelete(req)}
            />
          ))}
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
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function RequestCard({ req, t, busy, onStatusChange, onDelete }) {
  const tone = STATUS_TONE[req.status] || STATUS_TONE.OPEN;
  const priorityColor = PRIORITY_TONE[req.priority] || t.muted;

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderLeft: `4px solid ${tone.color}`,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: t.text }}>
              {req.title}
            </h3>
            <span style={badgeStyle(tone.color)}>{tone.label}</span>
            <span style={badgeStyle(priorityColor)}>
              {PRIORITY_LABEL[req.priority] || req.priority}
            </span>
          </div>
          {req.description && (
            <p style={{ margin: "0 0 10px", color: t.muted, fontSize: 13, lineHeight: 1.5 }}>
              {req.description}
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12 }}>
            {req.roomNumber && (
              <Meta label="Room" value={req.roomNumber} t={t} />
            )}
            <Meta label="Category" value={CATEGORY_LABEL[req.category] || req.category} t={t} />
            {req.reportedDate && (
              <Meta label="Reported" value={req.reportedDate} t={t} />
            )}
            {req.assignedTo && (
              <Meta label="Assigned to" value={req.assignedTo} t={t} />
            )}
            {req.completedDate && (
              <Meta label="Completed" value={req.completedDate} t={t} />
            )}
          </div>
          {req.notes && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: t.bg, borderRadius: 8, fontSize: 12, color: t.muted, fontStyle: "italic" }}>
              Note: {req.notes}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
          <select
            value={req.status}
            onChange={(e) => onStatusChange(req, e.target.value)}
            disabled={busy}
            aria-label={`Update status for ${req.title}`}
            style={{ ...inputStyle(t), padding: "6px 10px", fontSize: 12, minWidth: 140, cursor: "pointer" }}
          >
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            style={tinyButton(t, "var(--danger)")}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value, t }) {
  return (
    <div>
      <span style={{ color: t.muted }}>{label}: </span>
      <strong style={{ color: t.text }}>{value}</strong>
    </div>
  );
}

function EmptyState({ t, hasFilter, onClear }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", color: t.muted, background: t.surface, border: `1px dashed ${t.border}`, borderRadius: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
        No maintenance requests{hasFilter ? " match this filter" : ""}
      </div>
      <div style={{ fontSize: 13 }}>
        {hasFilter ? "Try a different status or clear the filter." : "Submit the first request with the New request button."}
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "8px 0" }}>
      <button type="button" onClick={() => onChange(Math.max(0, page - 1))} disabled={page === 0} style={pageBtn(t, page === 0)}>
        ← Prev
      </button>
      <span style={{ fontSize: 12, color: t.muted }}>
        Page <strong style={{ color: t.text }}>{page + 1}</strong> of {totalPages}
      </span>
      <button type="button" onClick={() => onChange(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} style={pageBtn(t, page >= totalPages - 1)}>
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

/* ── Style helpers ─────────────────────────────────────────────── */

const headerRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const errorBannerStyle = {
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

function tabStyle(t, active) {
  return {
    padding: "8px 14px",
    borderRadius: 10,
    border: `1px solid ${active ? t.accent : t.border}`,
    background: active ? t.accent : t.surface,
    color: active ? "#fff" : t.text,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  };
}

function tinyButton(t, color) {
  return {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${color}55`,
    background: `${color}11`,
    color,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
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

function pageBtn(t, disabled) {
  return {
    padding: "6px 14px",
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
