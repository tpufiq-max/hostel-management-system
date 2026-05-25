// StudentForm
// ──────────────────────────────────────────────────────────────────────────────
// Field names match the backend StudentDTO exactly so we never have to do
// awkward translations on submit:
//   name, email, phone, rollNumber, course, department, year (1-4),
//   roomNumber, bedNumber, dateOfBirth (yyyy-mm-dd), gender, bloodGroup,
//   guardianName, guardianPhone, address, feesStatus (PAID|PENDING|OVERDUE),
//   isActive, admissionDate (yyyy-mm-dd)
//
// `error` (from the parent) carries the normalised API error object after a
// failed save, which we render at the bottom of the form.

import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../../context/ThemeContext";

const FEE_STATUS = ["PENDING", "PAID", "OVERDUE"];
const YEARS      = [1, 2, 3, 4, 5];
const GENDERS    = ["Male", "Female", "Other"];

const EMPTY = {
  name:           "",
  email:          "",
  phone:          "",
  rollNumber:     "",
  course:         "",
  department:     "",
  year:           "",
  roomNumber:     "",
  bedNumber:      "",
  dateOfBirth:    "",
  gender:         "",
  bloodGroup:     "",
  guardianName:   "",
  guardianPhone:  "",
  address:        "",
  feesStatus:     "PENDING",
  isActive:       true,
  admissionDate:  new Date().toISOString().slice(0, 10),
};

export default function StudentForm({ student, onClose, onSubmit, error: serverError }) {
  const { t } = useContext(ThemeContext);

  const isEdit = Boolean(student?.id);

  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from the row passed in for editing
  useEffect(() => {
    if (!student) {
      setFormData(EMPTY);
      return;
    }
    setFormData({
      ...EMPTY,
      ...student,
      year:           student.year ?? "",
      isActive:       student.isActive !== false,
      feesStatus:     student.feesStatus || "PENDING",
      // Date fields can come back as either yyyy-mm-dd strings or full ISO
      // strings; trim to yyyy-mm-dd for the date input.
      dateOfBirth:    (student.dateOfBirth   || "").slice(0, 10),
      admissionDate:  (student.admissionDate || "").slice(0, 10),
    });
  }, [student]);

  function setField(name, value) {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const e = {};
    if (!formData.name?.trim())  e.name  = "Name is required";
    if (!formData.email?.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Email is not valid";

    if (formData.year && (Number(formData.year) < 1 || Number(formData.year) > 5))
      e.year = "Year must be between 1 and 5";

    if (formData.guardianPhone && !/^[+\-()\s\d]{6,20}$/.test(formData.guardianPhone))
      e.guardianPhone = "Phone format looks invalid";
    if (formData.phone && !/^[+\-()\s\d]{6,20}$/.test(formData.phone))
      e.phone = "Phone format looks invalid";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    const payload = {
      ...formData,
      // Send empty strings as undefined so backend partial-update logic
      // (NullValuePropertyMappingStrategy.IGNORE) keeps existing values.
      ...Object.fromEntries(
        Object.entries(formData).map(([k, v]) =>
          v === "" ? [k, null] : [k, v]
        )
      ),
      year: formData.year === "" ? null : Number(formData.year),
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  // ── styles helpers ─────────────────────────────────────────────────────────
  const inputStyle = (hasError) => ({
    width:        "100%",
    padding:      "10px 12px",
    borderRadius: 10,
    border:       `1px solid ${hasError ? t.danger : t.border}`,
    background:   t.card,
    color:        t.text,
    fontSize:     14,
    outline:      "none",
    transition:   "border-color 0.2s",
  });

  const labelStyle = {
    display:    "block",
    fontSize:   12,
    fontWeight: 600,
    color:      t.muted,
    marginBottom: 6,
  };

  const sectionTitleStyle = {
    fontSize:    11,
    fontWeight:  700,
    color:       t.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop:    20,
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Identity ──────────────────────────────────────────────────────── */}
      <div style={sectionTitleStyle}>Identity</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Full name *" error={errors.name}>
          <input
            value={formData.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Priya Sharma"
            style={inputStyle(errors.name)}
            autoFocus
          />
        </Field>
        <Field label="Email *" error={errors.email}>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="student@example.com"
            style={inputStyle(errors.email)}
          />
        </Field>
        <Field label="Roll number">
          <input
            value={formData.rollNumber}
            onChange={(e) => setField("rollNumber", e.target.value)}
            placeholder="e.g. 2024001"
            style={inputStyle(false)}
          />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input
            value={formData.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="+91 98765 43210"
            style={inputStyle(errors.phone)}
          />
        </Field>
      </div>

      {/* ── Academic ─────────────────────────────────────────────────────── */}
      <div style={sectionTitleStyle}>Academic</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 14 }}>
        <Field label="Course">
          <input
            value={formData.course}
            onChange={(e) => setField("course", e.target.value)}
            placeholder="e.g. B.Tech CSE"
            style={inputStyle(false)}
          />
        </Field>
        <Field label="Department">
          <input
            value={formData.department}
            onChange={(e) => setField("department", e.target.value)}
            placeholder="e.g. Engineering"
            style={inputStyle(false)}
          />
        </Field>
        <Field label="Year" error={errors.year}>
          <select
            value={formData.year}
            onChange={(e) => setField("year", e.target.value)}
            style={inputStyle(errors.year)}
          >
            <option value="">—</option>
            {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </Field>
      </div>

      {/* ── Hostel ───────────────────────────────────────────────────────── */}
      <div style={sectionTitleStyle}>Hostel</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Field label="Room number">
          <input
            value={formData.roomNumber}
            onChange={(e) => setField("roomNumber", e.target.value)}
            placeholder="e.g. 101"
            style={inputStyle(false)}
          />
        </Field>
        <Field label="Bed number">
          <input
            value={formData.bedNumber}
            onChange={(e) => setField("bedNumber", e.target.value)}
            placeholder="e.g. A"
            style={inputStyle(false)}
          />
        </Field>
        <Field label="Admission date">
          <input
            type="date"
            value={formData.admissionDate}
            onChange={(e) => setField("admissionDate", e.target.value)}
            style={inputStyle(false)}
          />
        </Field>
      </div>

      {/* ── Personal ─────────────────────────────────────────────────────── */}
      <div style={sectionTitleStyle}>Personal</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Field label="Date of birth">
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setField("dateOfBirth", e.target.value)}
            style={inputStyle(false)}
          />
        </Field>
        <Field label="Gender">
          <select
            value={formData.gender}
            onChange={(e) => setField("gender", e.target.value)}
            style={inputStyle(false)}
          >
            <option value="">—</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Blood group">
          <input
            value={formData.bloodGroup}
            onChange={(e) => setField("bloodGroup", e.target.value)}
            placeholder="e.g. O+"
            style={inputStyle(false)}
          />
        </Field>
      </div>

      {/* ── Guardian ─────────────────────────────────────────────────────── */}
      <div style={sectionTitleStyle}>Guardian</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Guardian name">
          <input
            value={formData.guardianName}
            onChange={(e) => setField("guardianName", e.target.value)}
            placeholder="Parent / guardian"
            style={inputStyle(false)}
          />
        </Field>
        <Field label="Guardian phone" error={errors.guardianPhone}>
          <input
            value={formData.guardianPhone}
            onChange={(e) => setField("guardianPhone", e.target.value)}
            placeholder="+91 98765 43210"
            style={inputStyle(errors.guardianPhone)}
          />
        </Field>
      </div>
      <Field label="Address">
        <textarea
          value={formData.address}
          onChange={(e) => setField("address", e.target.value)}
          rows={2}
          placeholder="Street, city, state, pincode"
          style={{ ...inputStyle(false), resize: "vertical" }}
        />
      </Field>

      {/* ── Status ───────────────────────────────────────────────────────── */}
      <div style={sectionTitleStyle}>Status</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "end" }}>
        <Field label="Fees status">
          <select
            value={formData.feesStatus}
            onChange={(e) => setField("feesStatus", e.target.value)}
            style={inputStyle(false)}
          >
            {FEE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <label style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: 10,
          border: `1px solid ${t.border}`, background: t.card,
          cursor: "pointer",
        }}>
          <input
            type="checkbox"
            checked={!!formData.isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
            style={{ accentColor: t.accent, width: 16, height: 16 }}
          />
          <span style={{ fontSize: 14, color: t.text }}>
            {formData.isActive ? "Active" : "Inactive"}
          </span>
        </label>
      </div>

      {/* ── Server error ─────────────────────────────────────────────────── */}
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
          {serverError.message || "Failed to save student."}
          {Array.isArray(serverError.errors) && serverError.errors.length > 0 && (
            <ul style={{ marginTop: 6, marginLeft: 16 }}>
              {serverError.errors.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 22,
        paddingTop: 16,
        borderTop: `1px solid ${t.border}`,
      }}>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: t.text,
            fontSize: 14,
            fontWeight: 600,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: t.accent,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: submitting ? "wait" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {submitting && (
            <span style={{
              display: "inline-block",
              width: 14, height: 14,
              border: "2px solid rgba(255,255,255,0.4)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "hms-spin 0.7s linear infinite",
            }} />
          )}
          {isEdit ? (submitting ? "Saving…" : "Save changes") : (submitting ? "Adding…" : "Add student")}
        </button>
      </div>

      <style>{`@keyframes hms-spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

/** Tiny presentational helper — label + control + optional error text. */
function Field({ label, error, children }) {
  const { t } = useContext(ThemeContext);
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: t.muted,
        marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ marginTop: 4, fontSize: 12, color: t.danger }}>
          {error}
        </div>
      )}
    </div>
  );
}
