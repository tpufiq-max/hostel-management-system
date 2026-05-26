import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Modal from "../components/common/Modal";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { feesService } from "../features/fees/feesService";
import { studentService } from "../features/student/studentService";

const PAGE_SIZE = 20;

const PAYMENT_STATUSES = [
  { value: "PAID",    label: "Paid",    color: "var(--success)" },
  { value: "PENDING", label: "Pending", color: "var(--warning)" },
  { value: "OVERDUE", label: "Overdue", color: "var(--danger)"  },
];

const PAYMENT_METHODS = [
  { value: "CASH",    label: "Cash"    },
  { value: "ONLINE",  label: "Online"  },
  { value: "CHEQUE",  label: "Cheque"  },
  { value: "CARD",    label: "Card"    },
];

const FEE_TYPES = [
  { value: "HOSTEL",      label: "Hostel"      },
  { value: "MESS",        label: "Mess"        },
  { value: "SECURITY",    label: "Security"    },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER",       label: "Other"       },
];

const STATUS_BY_VALUE = Object.fromEntries(PAYMENT_STATUSES.map(s => [s.value, s]));

const emptyForm = {
  studentId: "",
  amount: "",
  dueDate: "",
  paymentDate: "",
  paymentStatus: "PENDING",
  paymentMethod: "ONLINE",
  transactionId: "",
  description: "",
  feeType: "HOSTEL",
  semester: "",
};

function initials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function Fees() {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();

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
      const result = await feesService.list({ page, size: PAGE_SIZE });
      setData(result || { content: [], totalElements: 0, totalPages: 0, number: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load fee records.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { reload(); }, [reload]);

  // Lazy-load student list when the form first opens (so the dropdown has options)
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
    return data.content.filter(f => f.paymentStatus === statusFilter);
  }, [data.content, statusFilter]);

  const totals = useMemo(() => {
    const acc = { paid: 0, pending: 0, overdue: 0 };
    for (const f of data.content) {
      const amt = Number(f.amount) || 0;
      if (f.paymentStatus === "PAID") acc.paid += amt;
      else if (f.paymentStatus === "OVERDUE") acc.overdue += amt;
      else acc.pending += amt;
    }
    return acc;
  }, [data.content]);

  function patch(p) { setForm(f => ({ ...f, ...p })); }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(fee) {
    setEditing(fee);
    setForm({
      studentId: fee.studentId ?? "",
      amount: fee.amount ?? "",
      dueDate: fee.dueDate || "",
      paymentDate: fee.paymentDate || "",
      paymentStatus: fee.paymentStatus || "PENDING",
      paymentMethod: fee.paymentMethod || "ONLINE",
      transactionId: fee.transactionId || "",
      description: fee.description || "",
      feeType: fee.feeType || "HOSTEL",
      semester: fee.semester || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!form.studentId) { toast.error("Pick a student."); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error("Amount must be greater than zero."); return; }

    const payload = {
      ...form,
      studentId: Number(form.studentId),
      amount: Number(form.amount),
      // Empty strings -> null so backend doesn't try to parse them
      dueDate: form.dueDate || null,
      paymentDate: form.paymentDate || null,
      transactionId: form.transactionId || null,
      description: form.description || null,
      semester: form.semester || null,
    };

    setSubmitting(true);
    try {
      if (editing) {
        await feesService.update(editing.id, payload);
        toast.success("Fee record updated.");
      } else {
        await feesService.create(payload);
        toast.success("Fee record added.");
      }
      setShowForm(false);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to save fee record.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(fee) {
    if (busyRowId) return;
    if (!window.confirm(`Delete fee record for ${fee.studentName || `student #${fee.studentId}`}?`)) return;
    setBusyRowId(fee.id);
    try {
      await feesService.remove(fee.id);
      toast.success("Fee record deleted.");
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to delete fee record.");
    } finally {
      setBusyRowId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      <div style={headerRow}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Fees management</h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Track payments and outstanding balances.
            {!loading && ` ${data.totalElements ?? data.content.length} record${data.content.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle(t)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button type="button" onClick={openCreate} style={primaryButton(t)}>+ Add record</button>
        </div>
      </div>

      {/* Summary cards (this page only — sums are over the visible page) */}
      {!loading && data.content.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <SummaryCard t={t} label="Paid"    value={totals.paid}    color="var(--success)" />
          <SummaryCard t={t} label="Pending" value={totals.pending} color="var(--warning)" />
          <SummaryCard t={t} label="Overdue" value={totals.overdue} color="var(--danger)"  />
        </div>
      )}

      {error && !loading && (
        <div role="alert" style={errorBanner}>
          {error}
          <button type="button" onClick={reload} style={linkButton}>Retry</button>
        </div>
      )}

      <div style={panel(t)}>
        <div style={{ ...cardHeader(t) }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: t.text }}>Fee records</h3>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}><LoadingSkeleton count={5} /></div>
        ) : visible.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: t.muted }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
              No fee records{statusFilter ? " match this filter" : ""}
            </div>
            <div style={{ fontSize: 13 }}>
              {statusFilter ? "Try a different status." : "Add the first record with the button above."}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: t.bg }}>
                  <Th t={t}>Student</Th>
                  <Th t={t}>Type</Th>
                  <Th t={t}>Amount</Th>
                  <Th t={t}>Due</Th>
                  <Th t={t}>Paid</Th>
                  <Th t={t}>Status</Th>
                  <Th t={t} style={{ textAlign: "right" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {visible.map((f) => {
                  const tone = STATUS_BY_VALUE[f.paymentStatus]?.color || t.muted;
                  return (
                    <tr key={f.id} style={{ borderTop: `1px solid ${t.border}` }}>
                      <td style={cell}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={avatar(t)}>{initials(f.studentName)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: t.text }}>{f.studentName || `Student #${f.studentId}`}</div>
                            {f.semester && <div style={{ fontSize: 11, color: t.muted }}>{f.semester}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ ...cell, color: t.muted }}>{f.feeType || "—"}</td>
                      <td style={{ ...cell, fontWeight: 700, color: t.text }}>₹ {Number(f.amount || 0).toLocaleString()}</td>
                      <td style={{ ...cell, color: t.muted }}>{f.dueDate || "—"}</td>
                      <td style={{ ...cell, color: t.muted }}>{f.paymentDate || "—"}</td>
                      <td style={cell}>
                        <span style={badge(tone)}>{STATUS_BY_VALUE[f.paymentStatus]?.label || f.paymentStatus || "—"}</span>
                      </td>
                      <td style={{ ...cell, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button type="button" onClick={() => openEdit(f)} disabled={busyRowId === f.id} style={tinyBtn(t, t.accent)}>Edit</button>
                          <button type="button" onClick={() => handleDelete(f)} disabled={busyRowId === f.id} style={tinyBtn(t, "var(--danger)")}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data.totalPages > 1 && (
          <div style={pager(t)}>
            <button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={pageBtn(t, page === 0)}>← Prev</button>
            <span style={{ fontSize: 12, color: t.muted }}>
              Page <strong style={{ color: t.text }}>{page + 1}</strong> of {data.totalPages}
            </span>
            <button type="button" onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))} disabled={page >= data.totalPages - 1} style={pageBtn(t, page >= data.totalPages - 1)}>Next →</button>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => !submitting && setShowForm(false)} title={editing ? "Edit fee record" : "Add fee record"} size="md">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Student" required>
            <select required value={form.studentId} onChange={(e) => patch({ studentId: e.target.value })} disabled={submitting || studentsLoading} style={inputStyle(t)}>
              <option value="">{studentsLoading ? "Loading students…" : "Select a student"}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}{s.rollNumber ? ` (${s.rollNumber})` : ""}</option>
              ))}
            </select>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Amount (₹)" required>
              <input type="number" required min={0} step="0.01" value={form.amount} onChange={(e) => patch({ amount: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Fee type">
              <select value={form.feeType} onChange={(e) => patch({ feeType: e.target.value })} disabled={submitting} style={inputStyle(t)}>
                {FEE_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
            </Field>
            <Field label="Due date">
              <input type="date" value={form.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Payment date">
              <input type="date" value={form.paymentDate} onChange={(e) => patch({ paymentDate: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Status">
              <select value={form.paymentStatus} onChange={(e) => patch({ paymentStatus: e.target.value })} disabled={submitting} style={inputStyle(t)}>
                {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Method">
              <select value={form.paymentMethod} onChange={(e) => patch({ paymentMethod: e.target.value })} disabled={submitting} style={inputStyle(t)}>
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Transaction ID">
              <input type="text" value={form.transactionId} onChange={(e) => patch({ transactionId: e.target.value })} disabled={submitting} style={inputStyle(t)} placeholder="Optional" />
            </Field>
            <Field label="Semester">
              <input type="text" value={form.semester} onChange={(e) => patch({ semester: e.target.value })} disabled={submitting} style={inputStyle(t)} placeholder="2025-I" />
            </Field>
          </div>

          <Field label="Description">
            <input type="text" value={form.description} onChange={(e) => patch({ description: e.target.value })} disabled={submitting} style={inputStyle(t)} placeholder="Optional" />
          </Field>

          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={() => setShowForm(false)} disabled={submitting} style={{ ...secondaryButton(t), flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ ...primaryButton(t), flex: 1, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}>
              {submitting ? (editing ? "Updating…" : "Saving…") : (editing ? "Update record" : "Add record")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function SummaryCard({ t, label, value, color }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderTop: `3px solid ${color}`, borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>₹ {Number(value).toLocaleString()}</div>
      <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>this page</div>
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
    <th style={{ textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11, fontWeight: 700, color: t.muted, padding: "12px 16px", ...style }}>
      {children}
    </th>
  );
}

const headerRow = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" };
const cell = { padding: "12px 16px", verticalAlign: "middle", color: "var(--text)" };
const errorBanner = { padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.45)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 };
const linkButton = { marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 12 };

function panel(t) { return { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16 }; }
function cardHeader(t) { return { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${t.border}`, background: t.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16 }; }
function avatar(t) { return { width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }; }
function badge(color) { return { display: "inline-block", padding: "3px 10px", fontSize: 11, fontWeight: 700, borderRadius: 999, color, background: `${color}22`, border: `1px solid ${color}55` }; }
function inputStyle(t) { return { width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, outline: "none" }; }
function primaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${t.accent}44` }; }
function secondaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }; }
function tinyBtn(t, color) { return { padding: "5px 10px", borderRadius: 8, border: `1px solid ${color}55`, background: `${color}11`, color, fontSize: 11, fontWeight: 700, cursor: "pointer" }; }
function pager(t) { return { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: `1px solid ${t.border}`, background: t.bg, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }; }
function pageBtn(t, disabled) { return { padding: "6px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: disabled ? "transparent" : t.card, color: disabled ? t.muted : t.text, fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }; }
