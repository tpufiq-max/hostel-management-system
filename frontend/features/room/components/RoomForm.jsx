// RoomForm
// ──────────────────────────────────────────────────────────────────────────────
// Field names match the backend RoomDTO exactly:
//   roomNumber (required), capacity (required, >=1), occupied,
//   block, floor (integer), type (SINGLE|DOUBLE|TRIPLE|DORMITORY),
//   status (AVAILABLE|OCCUPIED|MAINTENANCE|RESERVED),
//   monthlyRent (number), amenities (comma-separated string).
//
// `error` is the normalised API error object surfaced after a failed save.

import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../../context/ThemeContext";

const TYPES    = ["SINGLE", "DOUBLE", "TRIPLE", "DORMITORY"];
const STATUSES = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"];

const CAPACITY_HINT = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, DORMITORY: 6 };

const EMPTY = {
  roomNumber:  "",
  capacity:    1,
  occupied:    0,
  block:       "",
  floor:       "",
  type:        "DOUBLE",
  status:      "AVAILABLE",
  monthlyRent: "",
  amenities:   "",
};

export default function RoomForm({ room, onClose, onSubmit, error: serverError }) {
  const { t } = useContext(ThemeContext);
  const isEdit = Boolean(room?.id);

  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!room) {
      setFormData(EMPTY);
      return;
    }
    setFormData({
      ...EMPTY,
      ...room,
      // Make sure numeric inputs are rendered as the actual numbers (not null)
      capacity:    room.capacity    ?? 1,
      occupied:    room.occupied    ?? 0,
      floor:       room.floor       ?? "",
      monthlyRent: room.monthlyRent ?? "",
      type:        room.type   || "DOUBLE",
      status:      room.status || "AVAILABLE",
    });
  }, [room]);

  function setField(name, value) {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  /** When the user picks a room type, suggest a sensible default capacity if
   *  they haven't manually set one yet. */
  function setType(value) {
    setFormData(prev => {
      const next = { ...prev, type: value };
      // Only override capacity if the current value matches the previous default
      if (Number(prev.capacity) === CAPACITY_HINT[prev.type]) {
        next.capacity = CAPACITY_HINT[value] ?? prev.capacity;
      }
      return next;
    });
  }

  function validate() {
    const e = {};
    if (!String(formData.roomNumber || "").trim()) e.roomNumber = "Room number is required";
    const cap = Number(formData.capacity);
    if (!cap || cap < 1)                e.capacity = "Capacity must be at least 1";
    const occ = Number(formData.occupied || 0);
    if (occ < 0)                        e.occupied = "Occupied cannot be negative";
    if (occ > cap)                      e.occupied = `Occupied cannot exceed capacity (${cap})`;
    if (formData.floor !== "" && formData.floor != null) {
      const f = Number(formData.floor);
      if (Number.isNaN(f) || f < 0)     e.floor = "Floor must be a non-negative number";
    }
    if (formData.monthlyRent !== "" && formData.monthlyRent != null) {
      const r = Number(formData.monthlyRent);
      if (Number.isNaN(r) || r < 0)     e.monthlyRent = "Rent must be a non-negative number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    const payload = {
      roomNumber:  String(formData.roomNumber).trim(),
      capacity:    Number(formData.capacity),
      occupied:    Number(formData.occupied) || 0,
      block:       formData.block?.trim() || null,
      floor:       formData.floor === "" ? null : Number(formData.floor),
      type:        formData.type,
      status:      formData.status,
      monthlyRent: formData.monthlyRent === "" ? null : Number(formData.monthlyRent),
      amenities:   formData.amenities?.trim() || null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  // ── styles ─────────────────────────────────────────────────────────────────
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
      {/* ── Identity ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 14 }}>
        <Field label="Room number *" error={errors.roomNumber}>
          <input
            value={formData.roomNumber}
            onChange={(e) => setField("roomNumber", e.target.value)}
            placeholder="e.g. 101"
            style={input(errors.roomNumber)}
            autoFocus
          />
        </Field>
        <Field label="Block">
          <input
            value={formData.block || ""}
            onChange={(e) => setField("block", e.target.value)}
            placeholder="e.g. A"
            style={input(false)}
          />
        </Field>
        <Field label="Floor" error={errors.floor}>
          <input
            type="number"
            min={0}
            value={formData.floor}
            onChange={(e) => setField("floor", e.target.value)}
            placeholder="0"
            style={input(errors.floor)}
          />
        </Field>
      </div>

      {/* ── Type + status ────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <Field label="Type">
          <select
            value={formData.type}
            onChange={(e) => setType(e.target.value)}
            style={input(false)}
          >
            {TYPES.map(v => <option key={v} value={v}>{capitalise(v)}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={formData.status}
            onChange={(e) => setField("status", e.target.value)}
            style={input(false)}
          >
            {STATUSES.map(v => <option key={v} value={v}>{capitalise(v)}</option>)}
          </select>
        </Field>
      </div>

      {/* ── Capacity / occupied / rent ───────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14 }}>
        <Field label="Capacity *" error={errors.capacity}>
          <input
            type="number"
            min={1}
            value={formData.capacity}
            onChange={(e) => setField("capacity", e.target.value)}
            style={input(errors.capacity)}
          />
        </Field>
        <Field
          label="Occupied"
          error={errors.occupied}
          hint="Auto-updated when students are assigned to the room."
        >
          <input
            type="number"
            min={0}
            value={formData.occupied}
            onChange={(e) => setField("occupied", e.target.value)}
            style={input(errors.occupied)}
          />
        </Field>
        <Field label="Monthly rent (₹)" error={errors.monthlyRent}>
          <input
            type="number"
            min={0}
            step={100}
            value={formData.monthlyRent}
            onChange={(e) => setField("monthlyRent", e.target.value)}
            placeholder="0"
            style={input(errors.monthlyRent)}
          />
        </Field>
      </div>

      {/* ── Amenities ────────────────────────────────────────────────── */}
      <Field label="Amenities" hint="Comma-separated. e.g. WiFi, AC, Attached Bathroom">
        <textarea
          value={formData.amenities || ""}
          onChange={(e) => setField("amenities", e.target.value)}
          rows={2}
          placeholder="WiFi, AC, Attached Bathroom"
          style={{ ...input(false), resize: "vertical" }}
        />
      </Field>

      {/* ── Server error ─────────────────────────────────────────────── */}
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
          {serverError.message || "Failed to save room."}
          {Array.isArray(serverError.errors) && serverError.errors.length > 0 && (
            <ul style={{ marginTop: 6, marginLeft: 16 }}>
              {serverError.errors.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
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
          {isEdit ? (submitting ? "Saving…" : "Save changes") : (submitting ? "Adding…" : "Add room")}
        </button>
      </div>

      <style>{`@keyframes hms-spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

function Field({ label, error, hint, children }) {
  const { t } = useContext(ThemeContext);
  return (
    <div style={{ marginTop: 4 }}>
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
      {error  && <div style={{ marginTop: 4, fontSize: 12, color: t.danger }}>{error}</div>}
      {!error && hint && <div style={{ marginTop: 4, fontSize: 11, color: t.muted }}>{hint}</div>}
    </div>
  );
}

function capitalise(value) {
  if (!value) return "";
  return value.charAt(0) + value.slice(1).toLowerCase();
}
