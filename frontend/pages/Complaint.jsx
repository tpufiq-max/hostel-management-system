import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Modal from "../components/common/Modal";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { complaintService } from "../features/complaint/complaintService";
import { studentService } from "../features/student/studentService";

const PAGE_SIZE = 20;

const CATEGORIES = [
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "ELECTRICAL",  label: "Electrical"  },
  { value: "PLUMBING",    label: "Plumbing"    },
  { value: "CLEANLINESS", label: "Cleanliness" },
  { value: "FOOD",        label: "Food"        },
  { value: "SECURITY",    label: "Security"    },
  { value: "NOISE",       label: "Noise"       },
  { value: "OTHER",       label: "Other"       },
];

const STATUSES = [
  { value: "OPEN",        label: "Open",        color: "var(--danger)"  },
  { value: "IN_PROGRESS", label: "In progress", color: "var(--warning)" },
  { value: "RESOLVED",    label: "Resolved",    color: "var(--success)" },
  { value: "CLOSED",      label: "Closed",      color: "var(--muted)"   },
];

const PRIORITIES = [
  { value: "LOW",    label: "Low",    color: "var(--success)" },
  { value: "MEDIUM", label: "Medium", color: "var(--accent)"  },
  { value: "HIGH",   label: "High",   color: "var(--warning)" },
  { value: "URGENT", label: "Urgent", color: "var(--danger)"  },
];

const STATUS_BY_VALUE = Object.fromEntries(STATUSES.map(s => [s.value, s]));
const PRIORITY_BY_VALUE = Object.fromEntries(PRIORITIES.map(p => [p.value, p]));
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));

const emptyForm = {
  studentId: "",
  title: "",
  description: "",
  category: "OTHER",
  priority: "MEDIUM",
  complaintStatus: "OPEN",
  resolutionNotes: "",
  assignedTo: "",
};

export default function Complaint() {
  const { t } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const toast = useNotification();

  const isAdmin = user?.role === "admin" || user?.role === "warden";

  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyRowId, setBusyRowId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await complaintService.list({ page, size: PAGE_SIZE });
      setData(result || { content: [], totalElements: 0, totalPages: 0, number: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { reload(); }, [reload]);

  // Lazy-load students for the form
  useEffect(() => {
    if (!showForm || students.length > 0) return;
    setStudentsLoading(true);
    studentService.list({ page: 0, size: 200 })
      .then((res) => setStudents(res?.content || []))
      .catch(() => toast.error("Couldn't load students for the form."))
      .finally(() => setStudentsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  const visible = useMemo(() => {
    if (!statusFilter) return data.content;
    return data.content.filter(c => c.complaintStatus === statusFilter);
  }, [data.content, statusFilter]);

  function patch(p) { setForm(f => ({ ...f, ...p })); }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      studentId: c.studentId ?? "",
      title: c.title || "",
      description: c.description || "",
      category: c.category || "OTHER",
      priority: c.priority || "MEDIUM",
      complaintStatus: c.complaintStatus || "OPEN",
      resolutionNotes: c.resolutionNotes || "",
      assignedTo: c.assignedTo || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!form.studentId) { toast.error("Pick a student."); return; }
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        studentId: Number(form.studentId),
        description: form.description || null,
        resolutionNotes: form.resolutionNotes || null,
        assignedTo: form.assignedTo || null,
      };
      if (editing) {
        await complaintService.update(editing.id, payload);
        toast.success("Complaint updated.");
      } else {
        await complaintService.create(payload);
        toast.success("Complaint submitted.");
      }
      setShowForm(false);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to save complaint.");
    } finally {
      setSubmitting(false);
    }
  }

  async function quickStatusChange(c, nextStatus) {
    if (busyRowId || c.complaintStatus === nextStatus) return;
    setBusyRowId(c.id);
    try {
      await complaintService.update(c.id, { ...c, complaintStatus: nextStatus });
      toast.success(`Marked as ${STATUS_BY_VALUE[nextStatus].label}.`);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setBusyRowId(null);
    }
  }

  async function handleDelete(c) {
    if (busyRowId) return;
    if (!window.confirm(`Delete complaint "${c.title}"?`)) return;
    setBusyRowId(c.id);
    try {
      await complaintService.remove(c.id);
      toast.success("Complaint deleted.");
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to delete complaint.");
    } finally {
      setBusyRowId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      <div style={headerRow}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Complaints</h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Monitor and manage student complaints with clear status updates.
            {!loading && ` ${data.totalElements ?? data.content.length} total.`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle(t)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button type="button" onClick={openCreate} style={primaryButton(t)}>+ Add complaint</button>
        </div>
      </div>

      {error && !loading && (
        <div role="alert" style={errorBanner}>
          {error}
          <button type="button" onClick={reload} style={linkButton}>Retry</button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : visible.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: t.muted, background: t.surface, border: `1px dashed ${t.border}`, borderRadius: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
            No complaints{statusFilter ? " match this filter" : ""}
          </div>
          <div style={{ fontSize: 13 }}>
            {statusFilter ? "Try a different status." : "Submit the first complaint with the button above."}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
          {visible.map((c) => {
            const statusTone = STATUS_BY_VALUE[c.complaintStatus]?.color || t.muted;
            const priorityTone = PRIORITY_BY_VALUE[c.priority]?.color || t.muted;
            return (
              <div
                key={c.id}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderLeft: `4px solid ${priorityTone}`,
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: t.text }}>{c.title}</h3>
                    <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>
                      By <strong style={{ color: t.text }}>{c.studentName || `student #${c.studentId}`}</strong>
                      {c.createdAt && <> · {c.createdAt.split("T")[0]}</>}
                    </div>
                  </div>
                  <span style={badge(statusTone)}>{STATUS_BY_VALUE[c.complaintStatus]?.label || c.complaintStatus}</span>
                </div>

                {c.description && (
                  <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.5, margin: "8px 0" }}>{c.description}</p>
                )}

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  <Tag color={priorityTone}>{PRIORITY_BY_VALUE[c.priority]?.label || c.priority}</Tag>
                  <Tag color={t.muted}>{CATEGORY_LABEL[c.category] || c.category}</Tag>
                  {c.assignedTo && <Tag color={t.accent}>→ {c.assignedTo}</Tag>}
                </div>

                {c.resolutionNotes && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: t.bg, borderRadius: 8, fontSize: 12, color: t.muted, fontStyle: "italic" }}>
                    {c.resolutionNotes}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {isAdmin && c.complaintStatus !== "RESOLVED" && (
                    <button type="button" onClick={() => quickStatusChange(c, "RESOLVED")} disabled={busyRowId === c.id} style={tinyBtn(t, "var(--success)")}>
                      Mark resolved
                    </button>
                  )}
                  {isAdmin && c.complaintStatus === "OPEN" && (
                    <button type="button" onClick={() => quickStatusChange(c, "IN_PROGRESS")} disabled={busyRowId === c.id} style={tinyBtn(t, "var(--warning)")}>
                      Start work
                    </button>
                  )}
                  <button type="button" onClick={() => openEdit(c)} disabled={busyRowId === c.id} style={tinyBtn(t, t.accent)}>
                    Edit
                  </button>
                  {isAdmin && (
                    <button type="button" onClick={() => handleDelete(c)} disabled={busyRowId === c.id} style={tinyBtn(t, "var(--danger)")}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && data.totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={pageBtn(t, page === 0)}>← Prev</button>
          <span style={{ fontSize: 12, color: t.muted }}>
            Page <strong style={{ color: t.text }}>{page + 1}</strong> of {data.totalPages}
          </span>
          <button type="button" onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))} disabled={page >= data.totalPages - 1} style={pageBtn(t, page >= data.totalPages - 1)}>Next →</button>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => !submitting && setShowForm(false)} title={editing ? "Edit complaint" : "Add complaint"} size="md">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Student" required>
            <select required value={form.studentId} onChange={(e) => patch({ studentId: e.target.value })} disabled={submitting || studentsLoading} style={inputStyle(t)}>
              <option value="">{studentsLoading ? "Loading students…" : "Select a student"}</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}{s.rollNumber ? ` (${s.rollNumber})` : ""}</option>)}
            </select>
          </Field>

          <Field label="Title" required>
            <input type="text" required value={form.title} onChange={(e) => patch({ title: e.target.value })} disabled={submitting} style={inputStyle(t)} placeholder="Short summary" />
          </Field>

          <Field label="Description">
            <textarea rows={3} value={form.description} onChange={(e) => patch({ description: e.target.value })} disabled={submitting} style={{ ...inputStyle(t), resize: "vertical", fontFamily: "inherit" }} placeholder="Details about the issue" />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Category">
              <select value={form.category} onChange={(e) => patch({ category: e.target.value })} disabled={submitting} style={inputStyle(t)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => patch({ priority: e.target.value })} disabled={submitting} style={inputStyle(t)}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
          </div>

          {isAdmin && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Status">
                  <select value={form.complaintStatus} onChange={(e) => patch({ complaintStatus: e.target.value })} disabled={submitting} style={inputStyle(t)}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Assigned to">
                  <input type="text" value={form.assignedTo} onChange={(e) => patch({ assignedTo: e.target.value })} disabled={submitting} style={inputStyle(t)} placeholder="Staff name" />
                </Field>
              </div>
              <Field label="Resolution notes">
                <textarea rows={2} value={form.resolutionNotes} onChange={(e) => patch({ resolutionNotes: e.target.value })} disabled={submitting} style={{ ...inputStyle(t), resize: "vertical", fontFamily: "inherit" }} placeholder="What was done" />
              </Field>
            </>
          )}

          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={() => setShowForm(false)} disabled={submitting} style={{ ...secondaryButton(t), flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ ...primaryButton(t), flex: 1, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}>
              {submitting ? (editing ? "Updating…" : "Submitting…") : (editing ? "Update complaint" : "Submit complaint")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
      padding: "2px 8px", borderRadius: 999, color, background: `${color}22`, border: `1px solid ${color}55`
    }}>
      {children}
    </span>
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

const headerRow = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" };
const errorBanner = { padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.45)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 };
const linkButton = { marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 12 };

function badge(color) { return { display: "inline-block", padding: "3px 10px", fontSize: 11, fontWeight: 700, borderRadius: 999, color, background: `${color}22`, border: `1px solid ${color}55` }; }
function inputStyle(t) { return { width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, outline: "none" }; }
function primaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${t.accent}44` }; }
function secondaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }; }
function tinyBtn(t, color) { return { padding: "5px 10px", borderRadius: 8, border: `1px solid ${color}55`, background: `${color}11`, color, fontSize: 11, fontWeight: 700, cursor: "pointer" }; }
function pageBtn(t, disabled) { return { padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: disabled ? "transparent" : t.card, color: disabled ? t.muted : t.text, fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }; }
