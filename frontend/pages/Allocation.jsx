import React, { useCallback, useContext, useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { allocationService } from "../features/allocation/allocationService";
import { studentService } from "../features/student/studentService";
import { roomService } from "../features/room/roomService";

/* ── helpers ────────────────────────────────────────────────────── */

function initials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

const ROOM_STATUS_COLOR = {
  AVAILABLE:   "var(--success)",
  OCCUPIED:    "var(--accent)",
  MAINTENANCE: "var(--warning)",
};

const PAGE_SIZE = 20;

const emptyForm = { studentId: "", roomId: "" };

export default function Allocation() {
  const { t } = useContext(ThemeContext);
  const toast  = useNotification();

  /* current allocations */
  const [page, setPage]       = useState(0);
  const [data, setData]       = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [busyRowId, setBusyRowId] = useState(null);

  /* form data */
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState(emptyForm);
  const [submitting, setSubmitting]       = useState(false);
  const [students, setStudents]           = useState([]);
  const [rooms, setRooms]                 = useState([]);
  const [formLoading, setFormLoading]     = useState(false);

  /* ── fetch allocations ─────────────────────────────────────────── */

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await allocationService.list({ page, size: PAGE_SIZE });
      setData(result || { content: [], totalElements: 0, totalPages: 0, number: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load allocations.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { reload(); }, [reload]);

  /* ── lazy-load students + rooms when form opens ───────────────── */

  useEffect(() => {
    if (!showForm) return;
    if (students.length > 0 && rooms.length > 0) return;
    let cancelled = false;
    setFormLoading(true);
    Promise.allSettled([
      studentService.list({ page: 0, size: 500 }),
      roomService.list({ page: 0, size: 200 }),
    ]).then(([sRes, rRes]) => {
      if (cancelled) return;
      if (sRes.status === "fulfilled") setStudents(sRes.value?.content || []);
      if (rRes.status === "fulfilled") setRooms(rRes.value?.content || []);
    }).finally(() => { if (!cancelled) setFormLoading(false); });
    return () => { cancelled = true; };
  }, [showForm, students.length, rooms.length]);

  /* ── actions ───────────────────────────────────────────────────── */

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!form.studentId || !form.roomId) {
      toast.error("Choose both a student and a room.");
      return;
    }
    setSubmitting(true);
    try {
      await allocationService.allocate(Number(form.studentId), Number(form.roomId));
      toast.success("Room allocated successfully.");
      setShowForm(false);
      setForm(emptyForm);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to allocate room.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeallocate(allocation) {
    if (busyRowId) return;
    if (!window.confirm(`Remove ${allocation.studentName} from room ${allocation.roomNumber}?`)) return;
    setBusyRowId(allocation.studentId);
    try {
      await allocationService.deallocate(allocation.studentId);
      toast.success(`${allocation.studentName} removed from room ${allocation.roomNumber}.`);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to deallocate.");
    } finally {
      setBusyRowId(null);
    }
  }

  /* ── render ────────────────────────────────────────────────────── */

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      {/* Header */}
      <div style={headerRow}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Room Allocation</h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Manage student ↔ room assignments.
            {!loading && ` ${data.totalElements} student${data.totalElements !== 1 ? "s" : ""} currently allocated.`}
          </p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} style={primaryBtn(t)}>
          + Allocate room
        </button>
      </div>

      {error && !loading && (
        <div role="alert" style={errorBanner}>
          {error}
          <button type="button" onClick={reload} style={linkBtnStyle}>Retry</button>
        </div>
      )}

      {/* Table */}
      <div style={panel(t)}>
        <div style={panelHeader(t)}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: t.text }}>Current allocations</h3>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}><LoadingSkeleton count={4} /></div>
        ) : data.content.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: t.muted }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
              No allocations yet
            </div>
            <div style={{ fontSize: 13 }}>
              Use the Allocate room button to assign students to rooms.
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
                  <Th t={t}>Room</Th>
                  <Th t={t}>Block / Floor</Th>
                  <Th t={t}>Occupancy</Th>
                  <Th t={t}>Admitted</Th>
                  <Th t={t} style={{ textAlign: "right" }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((a) => (
                  <tr key={a.studentId} style={{ borderTop: `1px solid ${t.border}` }}>
                    <td style={cell}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={avatar(t)}>{initials(a.studentName)}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: t.text }}>{a.studentName}</div>
                          {a.studentEmail && <div style={{ fontSize: 11, color: t.muted }}>{a.studentEmail}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...cell, color: t.muted }}>{a.rollNumber || "—"}</td>
                    <td style={{ ...cell, color: t.muted }}>{a.course || "—"}</td>
                    <td style={cell}>
                      <span style={{ fontWeight: 700, color: t.accent }}>
                        {a.roomNumber || "—"}
                      </span>
                      {a.roomType && <div style={{ fontSize: 11, color: t.muted }}>{a.roomType}</div>}
                    </td>
                    <td style={{ ...cell, color: t.muted }}>
                      {[a.roomBlock, a.roomFloor != null ? `Floor ${a.roomFloor}` : null].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td style={cell}>
                      {a.roomCapacity != null ? (
                        <div>
                          <div style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>
                            {a.roomOccupied ?? "?"} / {a.roomCapacity}
                          </div>
                          <div style={{ marginTop: 3, height: 4, background: t.border, borderRadius: 4, width: 60, overflow: "hidden" }}>
                            <div style={{
                              width: `${Math.min(100, ((a.roomOccupied || 0) / a.roomCapacity) * 100)}%`,
                              height: "100%",
                              background: a.roomOccupied >= a.roomCapacity ? "var(--danger)" : "var(--success)",
                              borderRadius: 4,
                            }} />
                          </div>
                        </div>
                      ) : "—"}
                    </td>
                    <td style={{ ...cell, color: t.muted, whiteSpace: "nowrap" }}>{a.admissionDate || "—"}</td>
                    <td style={{ ...cell, textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleDeallocate(a)}
                        disabled={busyRowId === a.studentId}
                        style={tinyBtn(t, "var(--danger)")}
                        aria-label={`Remove ${a.studentName} from room`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data.totalPages > 1 && (
          <div style={pager(t)}>
            <button type="button" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={pageBtn(t, page === 0)}>← Prev</button>
            <span style={{ fontSize: 12, color: t.muted }}>
              Page <strong style={{ color: t.text }}>{page + 1}</strong> of {data.totalPages}
            </span>
            <button type="button" onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))} disabled={page >= data.totalPages - 1} style={pageBtn(t, page >= data.totalPages - 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* Allocate modal */}
      <Modal isOpen={showForm} onClose={() => !submitting && setShowForm(false)} title="Allocate a room" size="sm">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {formLoading ? (
            <LoadingSkeleton count={2} />
          ) : (
            <>
              <Field label="Student" required>
                <select
                  required
                  value={form.studentId}
                  onChange={(e) => setForm(f => ({ ...f, studentId: e.target.value }))}
                  disabled={submitting}
                  style={inputStyle(t)}
                >
                  <option value="">Select a student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}{s.rollNumber ? ` (${s.rollNumber})` : ""}
                      {s.roomNumber ? ` — currently in ${s.roomNumber}` : " — unallocated"}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Room" required>
                <select
                  required
                  value={form.roomId}
                  onChange={(e) => setForm(f => ({ ...f, roomId: e.target.value }))}
                  disabled={submitting}
                  style={inputStyle(t)}
                >
                  <option value="">Select a room</option>
                  {rooms.map(r => {
                    const isFull = r.occupied >= r.capacity;
                    const tone = isFull ? "var(--danger)" : ROOM_STATUS_COLOR[r.status] || t.muted;
                    return (
                      <option key={r.id} value={r.id} disabled={isFull}>
                        Room {r.roomNumber} — {r.type || "?"} — {r.occupied}/{r.capacity} beds{isFull ? " (FULL)" : ""}
                        {r.block ? ` · Block ${r.block}` : ""}
                      </option>
                    );
                  })}
                </select>
              </Field>
            </>
          )}

          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={() => setShowForm(false)} disabled={submitting} style={{ ...secondaryBtn(t), flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || formLoading} style={{ ...primaryBtn(t), flex: 1, opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}>
              {submitting ? "Allocating…" : "Allocate room"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ── Tiny sub-components ─────────────────────────────────────────── */

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

/* ── Style helpers ─────────────────────────────────────────────── */

const headerRow    = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" };
const cell         = { padding: "12px 16px", verticalAlign: "middle", color: "var(--text)" };
const errorBanner  = { padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.45)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 };
const linkBtnStyle = { marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 12 };

function panel(t)       { return { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16 }; }
function panelHeader(t) { return { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${t.border}`, background: t.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16 }; }
function avatar(t)      { return { width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }; }
function inputStyle(t)  { return { width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, outline: "none" }; }
function primaryBtn(t)  { return { padding: "9px 16px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${t.accent}44` }; }
function secondaryBtn(t){ return { padding: "9px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }; }
function tinyBtn(t, color){ return { padding: "5px 10px", borderRadius: 8, border: `1px solid ${color}55`, background: `${color}11`, color, fontSize: 11, fontWeight: 700, cursor: "pointer" }; }
function pager(t)       { return { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: `1px solid ${t.border}`, background: t.bg, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }; }
function pageBtn(t, d)  { return { padding: "6px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: d ? "transparent" : t.card, color: d ? t.muted : t.text, fontSize: 12, fontWeight: 600, cursor: d ? "not-allowed" : "pointer", opacity: d ? 0.5 : 1 }; }
