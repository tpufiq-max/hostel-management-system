import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Modal from "../components/common/Modal";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { roomService } from "../features/room/roomService";

const PAGE_SIZE = 24;

const ROOM_TYPES = [
  { value: "SINGLE",     label: "Single",     defaultCapacity: 1 },
  { value: "DOUBLE",     label: "Double",     defaultCapacity: 2 },
  { value: "TRIPLE",     label: "Triple",     defaultCapacity: 3 },
  { value: "DORMITORY",  label: "Dormitory",  defaultCapacity: 8 },
];

const STATUSES = [
  { value: "AVAILABLE",   label: "Available"   },
  { value: "OCCUPIED",    label: "Occupied"    },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const STATUS_TONE = {
  AVAILABLE:   "var(--success)",
  OCCUPIED:    "var(--accent)",
  MAINTENANCE: "var(--warning)",
};

const STATUS_LABEL = Object.fromEntries(STATUSES.map(s => [s.value, s.label]));
const TYPE_LABEL = Object.fromEntries(ROOM_TYPES.map(r => [r.value, r.label]));

const emptyForm = {
  roomNumber: "",
  type: "SINGLE",
  capacity: 1,
  status: "AVAILABLE",
  block: "",
  floor: 1,
  monthlyRent: "",
  amenities: "",
};

export default function Rooms() {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();

  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyRowId, setBusyRowId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await roomService.list({ page, size: PAGE_SIZE });
      setData(result || { content: [], totalElements: 0, totalPages: 0, number: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { reload(); }, [reload]);

  // Client-side filter (the backend doesn't expose a status filter on /rooms)
  const visible = useMemo(() => {
    if (!statusFilter) return data.content;
    return data.content.filter(r => r.status === statusFilter);
  }, [data.content, statusFilter]);

  function patch(p) { setForm(f => ({ ...f, ...p })); }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(r) {
    setEditing(r);
    setForm({
      roomNumber: r.roomNumber || "",
      type: r.type || "SINGLE",
      capacity: r.capacity ?? 1,
      status: r.status || "AVAILABLE",
      block: r.block || "",
      floor: r.floor ?? 1,
      monthlyRent: r.monthlyRent ?? "",
      amenities: r.amenities || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!form.roomNumber.trim()) {
      toast.error("Room number is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity) || 1,
        floor: form.floor === "" ? null : Number(form.floor),
        monthlyRent: form.monthlyRent === "" ? null : Number(form.monthlyRent),
      };
      if (editing) {
        await roomService.update(editing.id, payload);
        toast.success("Room updated.");
      } else {
        await roomService.create(payload);
        toast.success("Room created.");
      }
      setShowForm(false);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to save room.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(r) {
    if (busyRowId) return;
    if (!window.confirm(`Delete room ${r.roomNumber}?`)) return;
    setBusyRowId(r.id);
    try {
      await roomService.remove(r.id);
      toast.success("Room deleted.");
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to delete room.");
    } finally {
      setBusyRowId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      <div style={headerRow}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Rooms</h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Manage room inventory and availability.
            {!loading && ` ${data.totalElements ?? data.content.length} total.`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle(t)} aria-label="Filter rooms by status">
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button type="button" onClick={openCreate} style={primaryButton(t)}>+ Add room</button>
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
            No rooms{statusFilter ? " match this filter" : ""}
          </div>
          <div style={{ fontSize: 13 }}>
            {statusFilter ? "Try a different status." : "Add the first room with the button above."}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {visible.map((r) => {
            const tone = STATUS_TONE[r.status] || t.muted;
            const occupied = r.occupied ?? 0;
            const capacity = r.capacity ?? 0;
            const occRate = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
            return (
              <div
                key={r.id}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderTop: `3px solid ${tone}`,
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Room {r.roomNumber}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginTop: 2 }}>
                      {TYPE_LABEL[r.type] || r.type || "—"}
                    </div>
                  </div>
                  <span style={badge(tone)}>{STATUS_LABEL[r.status] || r.status}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: t.muted }}>
                  <div>Capacity: <strong style={{ color: t.text }}>{occupied}/{capacity}</strong></div>
                  {r.block && <div>Block: <strong style={{ color: t.text }}>{r.block}</strong></div>}
                  {r.floor != null && <div>Floor: <strong style={{ color: t.text }}>{r.floor}</strong></div>}
                  {r.monthlyRent != null && <div>Rent: <strong style={{ color: t.text }}>₹ {Number(r.monthlyRent).toLocaleString()}</strong>/month</div>}
                  {r.amenities && <div style={{ fontSize: 11, fontStyle: "italic", marginTop: 2 }}>{r.amenities}</div>}
                </div>

                <div style={{ marginTop: 10, height: 5, background: t.border, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${occRate}%`, height: "100%", background: tone, transition: "width 0.5s ease" }} />
                </div>

                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 10 }}>
                  <button type="button" onClick={() => openEdit(r)} disabled={busyRowId === r.id} style={tinyBtn(t, t.accent)}>Edit</button>
                  <button type="button" onClick={() => handleDelete(r)} disabled={busyRowId === r.id} style={tinyBtn(t, "var(--danger)")}>Delete</button>
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

      <Modal isOpen={showForm} onClose={() => !submitting && setShowForm(false)} title={editing ? "Edit room" : "Add room"} size="md">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Room number" required>
              <input type="text" required value={form.roomNumber} onChange={(e) => patch({ roomNumber: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => {
                  const next = ROOM_TYPES.find(rt => rt.value === e.target.value);
                  patch({ type: e.target.value, capacity: next?.defaultCapacity ?? form.capacity });
                }}
                disabled={submitting}
                style={inputStyle(t)}
              >
                {ROOM_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
              </select>
            </Field>
            <Field label="Capacity">
              <input type="number" min={1} value={form.capacity} onChange={(e) => patch({ capacity: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => patch({ status: e.target.value })} disabled={submitting} style={inputStyle(t)}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Block">
              <input type="text" value={form.block} onChange={(e) => patch({ block: e.target.value })} disabled={submitting} style={inputStyle(t)} placeholder="A" />
            </Field>
            <Field label="Floor">
              <input type="number" min={0} value={form.floor} onChange={(e) => patch({ floor: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Monthly rent (₹)">
              <input type="number" min={0} step="0.01" value={form.monthlyRent} onChange={(e) => patch({ monthlyRent: e.target.value })} disabled={submitting} style={inputStyle(t)} />
            </Field>
            <Field label="Amenities">
              <input type="text" value={form.amenities} onChange={(e) => patch({ amenities: e.target.value })} disabled={submitting} style={inputStyle(t)} placeholder="WiFi, AC" />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={() => setShowForm(false)} disabled={submitting} style={{ ...secondaryButton(t), flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ ...primaryButton(t), flex: 1, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}>
              {submitting ? (editing ? "Updating…" : "Saving…") : (editing ? "Update room" : "Add room")}
            </button>
          </div>
        </form>
      </Modal>
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

const headerRow = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" };
const errorBanner = { padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.45)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 };
const linkButton = { marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 12 };

function inputStyle(t) { return { width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, outline: "none" }; }
function primaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${t.accent}44` }; }
function secondaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }; }
function tinyBtn(t, color) { return { padding: "5px 10px", borderRadius: 8, border: `1px solid ${color}55`, background: `${color}11`, color, fontSize: 11, fontWeight: 700, cursor: "pointer" }; }
function badge(color) { return { display: "inline-block", padding: "3px 10px", fontSize: 11, fontWeight: 700, borderRadius: 999, color, background: `${color}22`, border: `1px solid ${color}55` }; }
function pageBtn(t, disabled) { return { padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: disabled ? "transparent" : t.card, color: disabled ? t.muted : t.text, fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }; }
