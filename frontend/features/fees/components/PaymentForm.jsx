// PaymentForm
// ──────────────────────────────────────────────────────────────────────────────
// Field names match the backend FeeDTO exactly:
//   studentId (required), amount (required, positive), dueDate, paymentDate,
//   paymentStatus (PAID|PENDING|OVERDUE|PARTIAL), paymentMethod, transactionId,
//   description, feeType (HOSTEL|MESS|MAINTENANCE|SECURITY_DEPOSIT|OTHER),
//   semester
//
// The student picker is a simple debounced search over /api/students/search,
// rendering the matched students as a dropdown. Cheap, native, and works with
// thousands of students because the backend does the filtering.

import React, { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
import studentService from "../../student/studentService";

const STATUSES = ["PENDING", "PAID", "OVERDUE", "PARTIAL"];
const TYPES    = ["HOSTEL", "MESS", "MAINTENANCE", "SECURITY_DEPOSIT", "OTHER"];

const EMPTY = {
  studentId:       "",
  studentName:     "",
  amount:          "",
  dueDate:         "",
  paymentDate:     "",
  paymentStatus:   "PENDING",
  paymentMethod:   "",
  transactionId:   "",
  description:     "",
  feeType:         "HOSTEL",
  semester:        "",
};

export default function PaymentForm({ fee, onClose, onSubmit, error: serverError }) {
  const { t } = useContext(ThemeContext);
  const isEdit = Boolean(fee?.id);

  const [formData, setFormData]     = useState(EMPTY);
  const [errors,   setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ─── Hydrate ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fee) {
      setFormData(EMPTY);
      return;
    }
    setFormData({
      ...EMPTY,
      ...fee,
      amount:        fee.amount        ?? "",
      paymentStatus: fee.paymentStatus || "PENDING",
      feeType:       fee.feeType       || "HOSTEL",
      dueDate:       (fee.dueDate     || "").slice(0, 10),
      paymentDate:   (fee.paymentDate || "").slice(0, 10),
    });
  }, [fee]);

  function setField(name, value) {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const e = {};
    if (!formData.studentId) e.studentId = "Pick a student";
    const amt = Number(formData.amount);
    if (!amt || amt <= 0)    e.amount = "Amount must be positive";

    if (formData.paymentStatus === "PAID" && !formData.paymentDate) {
      e.paymentDate = "Set a payment date for PAID status";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    const payload = {
      studentId:     Number(formData.studentId),
      amount:        Number(formData.amount),
      dueDate:       formData.dueDate     || null,
      paymentDate:   formData.paymentDate || null,
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod?.trim() || null,
      transactionId: formData.transactionId?.trim() || null,
      description:   formData.description?.trim()   || null,
      feeType:       formData.feeType,
      semester:      formData.semester?.trim()      || null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── styles ─────────────────────────────────────────────────────────────
  const input = (hasError) => ({
    width:        "100%",
    padding:      "10px 12px",
    borderRadius: 10,
    border:       `1px solid ${hasError ? t.danger : t.border}`,
    background:   t.card,
    color:        t.text,
    fontSize:     14,
    outline:      "none",
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Student */}
      <Field label="Student *" error={errors.studentId}>
        <StudentPicker
          value={{ id: formData.studentId, name: formData.studentName }}
          onChange={(s) => {
            setField("studentId",   s?.id ?? "");
            setField("studentName", s?.name ?? "");
          }}
          disabled={isEdit /* don't let admins re-attribute existing fees */}
          inputStyle={input(errors.studentId)}
        />
      </Field>

      {/* Amount + type */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <Field label="Amount (₹) *" error={errors.amount}>
          <input
            type="number"
            min={1}
            step="0.01"
            value={formData.amount}
            onChange={(e) => setField("amount", e.target.value)}
            placeholder="e.g. 5000"
            style={input(errors.amount)}
          />
        </Field>
        <Field label="Fee type">
          <select
            value={formData.feeType}
            onChange={(e) => setField("feeType", e.target.value)}
            style={input(false)}
          >
            {TYPES.map(v => <option key={v} value={v}>{labelEnum(v)}</option>)}
          </select>
        </Field>
      </div>

      {/* Status + dates */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14 }}>
        <Field label="Payment status">
          <select
            value={formData.paymentStatus}
            onChange={(e) => setField("paymentStatus", e.target.value)}
            style={input(false)}
          >
            {STATUSES.map(v => <option key={v} value={v}>{labelEnum(v)}</option>)}
          </select>
        </Field>
        <Field label="Due date">
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
            style={input(false)}
          />
        </Field>
        <Field label="Payment date" error={errors.paymentDate}>
          <input
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setField("paymentDate", e.target.value)}
            style={input(errors.paymentDate)}
          />
        </Field>
      </div>

      {/* Payment method + transaction id */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <Field label="Payment method">
          <input
            value={formData.paymentMethod || ""}
            onChange={(e) => setField("paymentMethod", e.target.value)}
            placeholder="UPI / Cash / Bank transfer"
            style={input(false)}
          />
        </Field>
        <Field label="Transaction ID">
          <input
            value={formData.transactionId || ""}
            onChange={(e) => setField("transactionId", e.target.value)}
            placeholder="Reference / receipt number"
            style={input(false)}
          />
        </Field>
      </div>

      {/* Semester + description */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, marginTop: 14 }}>
        <Field label="Semester">
          <input
            value={formData.semester || ""}
            onChange={(e) => setField("semester", e.target.value)}
            placeholder="e.g. Spring 2025"
            style={input(false)}
          />
        </Field>
        <Field label="Description / notes">
          <input
            value={formData.description || ""}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Optional"
            style={input(false)}
          />
        </Field>
      </div>

      {/* Server error */}
      {serverError && (
        <div role="alert" style={{
          marginTop: 18,
          padding:   "10px 14px",
          background: `${t.danger}1a`,
          border:     `1px solid ${t.danger}55`,
          borderRadius: 10,
          color:      t.danger,
          fontSize:   13,
        }}>
          {serverError.message || "Failed to save fee record."}
          {Array.isArray(serverError.errors) && serverError.errors.length > 0 && (
            <ul style={{ marginTop: 6, marginLeft: 16 }}>
              {serverError.errors.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "flex-end", gap: 10,
        marginTop: 22, paddingTop: 16,
        borderTop: `1px solid ${t.border}`,
      }}>
        <button
          type="button" onClick={onClose} disabled={submitting}
          style={{
            padding: "10px 18px", borderRadius: 10,
            border: `1px solid ${t.border}`, background: t.surface,
            color: t.text, fontSize: 14, fontWeight: 600,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >Cancel</button>
        <button
          type="submit" disabled={submitting}
          style={{
            padding: "10px 18px", borderRadius: 10,
            border: "none", background: t.accent, color: "#fff",
            fontSize: 14, fontWeight: 600,
            cursor: submitting ? "wait" : "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}
        >
          {submitting && <Spinner />}
          {isEdit ? (submitting ? "Saving…" : "Save changes") : (submitting ? "Adding…" : "Add fee record")}
        </button>
      </div>

      <style>{`@keyframes hms-spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

// ─── Student picker ─────────────────────────────────────────────────────────
//
// Shows the currently-selected student as a pill. Clicking the pill opens an
// inline search over /api/students/search?query=. Picking a result snaps the
// pill to that student. Backed by the real backend; no hardcoded student list.

function StudentPicker({ value, onChange, inputStyle, disabled }) {
  const { t } = useContext(ThemeContext);
  const [query, setQuery]   = useState("");
  const [open,  setOpen]    = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await studentService.search({ query, page: 0, size: 10 });
        setResults(result.items || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [query, open]);

  const selected = value?.id ? { id: value.id, name: value.name } : null;

  if (disabled && selected) {
    return (
      <div style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 8, cursor: "not-allowed", opacity: 0.7 }}>
        <span style={{
          width: 24, height: 24, borderRadius: 6,
          background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
          color: "#fff", fontSize: 11, fontWeight: 700,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>{(selected.name || "?").charAt(0).toUpperCase()}</span>
        <span>{selected.name || `Student #${selected.id}`}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ ...inputStyle, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        {selected ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 24, height: 24, borderRadius: 6,
              background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
              color: "#fff", fontSize: 11, fontWeight: 700,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>{(selected.name || "?").charAt(0).toUpperCase()}</span>
            {selected.name || `Student #${selected.id}`}
          </span>
        ) : (
          <span style={{ color: t.muted }}>Search and pick a student…</span>
        )}
        <span style={{ color: t.muted, fontSize: 11 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 10, boxShadow: "0 12px 32px rgba(0,0,0,0.20)",
          zIndex: 110, overflow: "hidden",
        }}>
          <div style={{ padding: 8, borderBottom: `1px solid ${t.border}` }}>
            <input
              autoFocus
              placeholder="Search students by name, email, or roll #…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 8,
                border: `1px solid ${t.border}`, background: t.card,
                color: t.text, fontSize: 13, outline: "none",
              }}
            />
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 12, textAlign: "center", color: t.muted, fontSize: 12 }}>
                Searching…
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: 12, textAlign: "center", color: t.muted, fontSize: 12 }}>
                {query ? "No students match." : "Start typing to search."}
              </div>
            ) : results.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onChange({ id: s.id, name: s.name });
                  setOpen(false);
                  setQuery("");
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "8px 12px",
                  border: "none", background: "transparent",
                  color: t.text, fontSize: 13, cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${t.accent}1a`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
                  color: "#fff", fontSize: 11, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>{(s.name || "?").charAt(0).toUpperCase()}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 11, color: t.muted }}>
                    {s.rollNumber ? `#${s.rollNumber}` : s.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function Field({ label, error, hint, children }) {
  const { t } = useContext(ThemeContext);
  return (
    <div style={{ marginTop: 4 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: t.muted, marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
      {error  && <div style={{ marginTop: 4, fontSize: 12, color: t.danger }}>{error}</div>}
      {!error && hint && <div style={{ marginTop: 4, fontSize: 11, color: t.muted }}>{hint}</div>}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block",
      width: 14, height: 14,
      border: "2px solid rgba(255,255,255,0.4)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "hms-spin 0.7s linear infinite",
    }} />
  );
}

function labelEnum(value) {
  return value
    .split("_")
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}
