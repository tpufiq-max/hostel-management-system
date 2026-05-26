import React, { useCallback, useContext, useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { studentService } from "../features/student/studentService";

const PAGE_SIZE = 20;

const FEES_TONE = {
  PAID:    "var(--success)",
  PENDING: "var(--warning)",
  OVERDUE: "var(--danger)",
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  rollNumber: "",
  course: "",
  department: "",
  year: "",
  roomNumber: "",
  gender: "Male",
  feesStatus: "PENDING",
  isActive: true,
};

function initials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function Students() {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyRowId, setBusyRowId] = useState(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = debouncedSearch
        ? await studentService.search({ query: debouncedSearch, page, size: PAGE_SIZE })
        : await studentService.list({ page, size: PAGE_SIZE });
      setData(result || { content: [], totalElements: 0, totalPages: 0, number: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { reload(); }, [reload]);

  // Reset to page 0 whenever the search changes
  useEffect(() => { setPage(0); }, [debouncedSearch]);

  function patch(p) { setForm(f => ({ ...f, ...p })); }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(s) {
    setEditing(s);
    setForm({
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      rollNumber: s.rollNumber || "",
      course: s.course || "",
      department: s.department || "",
      year: s.year ?? "",
      roomNumber: s.roomNumber || "",
      gender: s.gender || "Male",
      feesStatus: s.feesStatus || "PENDING",
      isActive: s.isActive ?? true,
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, year: form.year === "" ? null : Number(form.year) };
      if (editing) {
        await studentService.update(editing.id, payload);
        toast.success("Student updated.");
      } else {
        await studentService.create(payload);
        toast.success("Student created.");
      }
      setShowForm(false);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to save student.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(s) {
    if (busyRowId) return;
    if (!window.confirm(`Delete student "${s.name}"?`)) return;
    setBusyRowId(s.id);
    try {
      await studentService.remove(s.id);
      toast.success("Student deleted.");
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to delete student.");
    } finally {
      setBusyRowId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      <div style={headerRow}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Students</h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Manage student records.
            {!loading && ` ${data.totalElements ?? data.content.length} total.`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, roll…"
            style={{ ...inputStyle(t), minWidth: 240 }}
            aria-label="Search students"
          />
          <button type="button" onClick={openCreate} style={primaryButton(t)}>
            + Add student
          </button>
        </div>
      </div>

      <div style={panel(t)}>
        <div style={{ ...cardHeader(t) }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: t.text }}>Roster</h3>
        </div>

        {error && !loading && (
          <div role="alert" style={errorBanner}>
            {error}
            <button type="button" onClick={reload} style={linkButton}>Retry</button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 16 }}><LoadingSkeleton count={5} /></div>
        ) : data.content.length === 0 ? (
          <div style={empty(t)}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
              No students{debouncedSearch ? " match this search" : ""}
            </div>
            <div style={{ fontSize: 13, color: t.muted }}>
              {debouncedSearch ? "Try a different query." : "Add the first student with the button above."}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: t.bg }}>
                  <Th t={t}>Student</Th>
                  <Th t={t}>Roll</Th>
                  <Th t={t}>Course</Th>
                  <Th t={t}>Year</Th>
                  <Th t={t}>Room</Th>
                  <Th t={t}>Fees</Th>
                  <Th t={t} style={{ textAlign: "right" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((s) => {
                  const tone = FEES_TONE[s.feesStatus] || t.muted;
                  return (
                    <tr key={s.id} style={{ borderTop: `1px solid ${t.border}` }}>
                      <td style={cell}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={avatar(t)}>{initials(s.name)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: t.text }}>{s.name}</div>
                            {s.email && <div style={{ fontSize: 11, color: t.muted }}>{s.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ ...cell, color: t.muted }}>{s.rollNumber || "—"}</td>
                      <td style={{ ...cell, color: t.muted }}>{s.course || "—"}{s.department ? ` (${s.department})` : ""}</td>
                      <td style={{ ...cell, color: t.muted }}>{s.year ?? "—"}</td>
                      <td style={{ ...cell, color: t.muted }}>{s.roomNumber || "—"}</td>
                      <td style={cell}><span style={badge(tone)}>{s.feesStatus || "—"}</span></td>
                      <td style={{ ...cell, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button type="button" onClick={() => openEdit(s)} disabled={busyRowId === s.id} style={tinyBtn(t, t.accent)}>Edit</button>
                          <button type="button" onClick={() => handleDelete(s)} disabled={busyRowId === s.id} style={tinyBtn(t, "var(--danger)")}>Delete</button>
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

      <Modal isOpen={showForm} onClose={() => !submitting && setShowForm(false)} title={editing ? "Edit student" : "Add student"} size="md">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Full name" required>
              <input type="text" required value={form.name} onChange={(e) => patch({ name: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Email" required>
              <input type="email" required value={form.email} onChange={(e) => patch({ email: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Phone">
              <input type="tel" value={form.phone} onChange={(e) => patch({ phone: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Roll number">
              <input type="text" value={form.rollNumber} onChange={(e) => patch({ rollNumber: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Course">
              <input type="text" value={form.course} onChange={(e) => patch({ course: e.target.value })} disabled={submitting} style={inputStyle(t)} placeholder="B.Tech CSE" />
            </Field>
            <Field label="Department">
              <input type="text" value={form.department} onChange={(e) => patch({ department: e.target.value })} disabled={submitting} style={inputStyle(t)} placeholder="Engineering" />
            </Field>
            <Field label="Year">
              <input type="number" min={1} max={6} value={form.year} onChange={(e) => patch({ year: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Room number">
              <input type="text" value={form.roomNumber} onChange={(e) => patch({ roomNumber: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={(e) => patch({ gender: e.target.value })} disabled={submitting} style={inputStyle(t)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Fees status">
              <select value={form.feesStatus} onChange={(e) => patch({ feesStatus: e.target.value })} disabled={submitting} style={inputStyle(t)}>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </Field>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.text, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => patch({ isActive: e.target.checked })} disabled={submitting} style={{ width: 16, height: 16 }} />
            Active
          </label>

          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={() => setShowForm(false)} disabled={submitting} style={{ ...secondaryButton(t), flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ ...primaryButton(t), flex: 1, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}>
              {submitting ? (editing ? "Updating…" : "Saving…") : (editing ? "Update student" : "Add student")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────── */

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
const errorBanner = { margin: 16, padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.45)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 };
const linkButton = { marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 12 };

function panel(t) { return { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16 }; }
function cardHeader(t) { return { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${t.border}`, background: t.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16 }; }
function avatar(t) { return { width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }; }
function badge(color) { return { display: "inline-block", padding: "3px 10px", fontSize: 11, fontWeight: 700, borderRadius: 999, color, background: `${color}22`, border: `1px solid ${color}55` }; }
function inputStyle(t) { return { width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, outline: "none" }; }
function primaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${t.accent}44` }; }
function secondaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }; }
function tinyBtn(t, color) { return { padding: "5px 10px", borderRadius: 8, border: `1px solid ${color}55`, background: `${color}11`, color, fontSize: 11, fontWeight: 700, cursor: "pointer" }; }
function empty(t) { return { padding: "40px 20px", textAlign: "center", color: t.muted }; }
function pager(t) { return { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: `1px solid ${t.border}`, background: t.bg, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }; }
function pageBtn(t, disabled) { return { padding: "6px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: disabled ? "transparent" : t.card, color: disabled ? t.muted : t.text, fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }; }
