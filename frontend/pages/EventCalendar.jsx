import React, { useCallback, useContext, useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { eventService } from "../features/events/eventService";

/* ── Backend enums ─────────────────────────────────────────────── */

const CATEGORIES = [
  { value: "CULTURAL", label: "Cultural", color: "var(--purple)"  },
  { value: "SPORTS",   label: "Sports",   color: "var(--success)" },
  { value: "ACADEMIC", label: "Academic", color: "var(--accent)"  },
  { value: "SOCIAL",   label: "Social",   color: "var(--warning)" },
  { value: "OTHER",    label: "Other",    color: "var(--muted)"   },
];

const STATUSES = [
  { value: "UPCOMING",  label: "Upcoming"  },
  { value: "ONGOING",   label: "Ongoing"   },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_TONE = {
  UPCOMING:  "var(--accent)",
  ONGOING:   "var(--success)",
  COMPLETED: "var(--muted)",
  CANCELLED: "var(--danger)",
};

const CATEGORY_BY_VALUE = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

const emptyForm = {
  title: "",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  venue: "",
  organizer: "",
  category: "CULTURAL",
  status: "UPCOMING",
  maxParticipants: "",
};

/* ── Date helpers ──────────────────────────────────────────────── */

function pad(n) { return String(n).padStart(2, "0"); }

function ymd(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function monthRange(date) {
  const year  = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  return {
    from: ymd(year, month, 1),
    to:   ymd(year, month, lastDay.getDate()),
    daysInMonth: lastDay.getDate(),
    firstWeekday: firstDay.getDay(),
  };
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function EventCalendar() {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();

  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const range = monthRange(cursor);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.listInRange(range.from, range.to);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => { reload(); }, [reload]);

  /* ── Calendar grid layout ───────────────────────────────────── */

  const cells = [];
  for (let i = 0; i < range.firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= range.daysInMonth; d++) cells.push(d);

  const eventsByDay = {};
  for (const ev of events) {
    if (!ev.eventDate) continue;
    const day = parseInt(ev.eventDate.split("-")[2], 10);
    if (!Number.isFinite(day)) continue;
    (eventsByDay[day] ||= []).push(ev);
  }

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === cursor.getMonth() && today.getFullYear() === cursor.getFullYear();

  /* ── Form handlers ──────────────────────────────────────────── */

  function openCreate(prefilledDate) {
    setEditingId(null);
    setForm({ ...emptyForm, eventDate: prefilledDate || "" });
    setShowForm(true);
  }

  function openEdit(ev) {
    setEditingId(ev.id);
    setForm({
      title:           ev.title           || "",
      description:     ev.description     || "",
      eventDate:       ev.eventDate       || "",
      startTime:       (ev.startTime || "").slice(0, 5),
      endTime:         (ev.endTime   || "").slice(0, 5),
      venue:           ev.venue           || "",
      organizer:       ev.organizer       || "",
      category:        ev.category        || "CULTURAL",
      status:          ev.status          || "UPCOMING",
      maxParticipants: ev.maxParticipants ?? "",
    });
    setShowForm(true);
  }

  function patchForm(p) { setForm((f) => ({ ...f, ...p })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!form.title.trim() || !form.eventDate) {
      toast.error("Title and event date are required.");
      return;
    }
    const payload = {
      ...form,
      maxParticipants: form.maxParticipants === "" ? null : Number(form.maxParticipants),
      // Backend accepts empty strings as null via the parser, but be explicit:
      startTime: form.startTime || null,
      endTime:   form.endTime   || null,
    };
    setSubmitting(true);
    try {
      if (editingId) {
        await eventService.update(editingId, payload);
        toast.success("Event updated.");
      } else {
        await eventService.create(payload);
        toast.success("Event added.");
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to save event.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(ev) {
    if (!window.confirm(`Delete event "${ev.title}"?`)) return;
    try {
      await eventService.remove(ev.id);
      toast.success("Event deleted.");
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to delete event.");
    }
  }

  /* ── Render ──────────────────────────────────────────────────── */

  const sortedSidebar = [...events].sort((a, b) => (a.eventDate || "").localeCompare(b.eventDate || ""));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Event calendar</h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Hostel events and important dates.
          </p>
        </div>
        <button type="button" onClick={() => openCreate()} style={primaryButton(t)}>
          + Add event
        </button>
      </div>

      {error && !loading && (
        <div role="alert" style={errorBannerStyle}>
          {error}
          <button type="button" onClick={reload} style={linkButtonStyle}>Retry</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)", gap: 24, alignItems: "flex-start" }}>
        {/* Calendar */}
        <div style={panelStyle(t)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.text }}>
              {cursor.toLocaleDateString([], { month: "long", year: "numeric" })}
            </h2>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} style={navButton(t)}>
                ← Prev
              </button>
              <button type="button" onClick={() => setCursor(new Date())} style={navButton(t)}>
                Today
              </button>
              <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} style={navButton(t)}>
                Next →
              </button>
            </div>
          </div>

          {/* Weekday header */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: t.muted, padding: "4px 0" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          {loading ? (
            <LoadingSkeleton count={4} />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {cells.map((day, i) => {
                const isToday = day && isCurrentMonth && day === today.getDate();
                const dayEvents = day ? (eventsByDay[day] || []) : [];
                const dateStr = day ? ymd(cursor.getFullYear(), cursor.getMonth(), day) : null;

                return (
                  <div
                    key={i}
                    onClick={day ? () => openCreate(dateStr) : undefined}
                    style={{
                      minHeight: 88,
                      padding: 6,
                      borderRadius: 10,
                      border: `1px solid ${isToday ? t.accent : t.border}`,
                      background: day ? (isToday ? `${t.accent}11` : t.bg) : "transparent",
                      cursor: day ? "pointer" : "default",
                      transition: "border-color 0.15s",
                      overflow: "hidden",
                    }}
                  >
                    {day && (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isToday ? t.accent : t.text, marginBottom: 4 }}>
                          {day}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {dayEvents.slice(0, 3).map((ev) => {
                            const cat = CATEGORY_BY_VALUE[ev.category] || CATEGORY_BY_VALUE.OTHER;
                            return (
                              <div
                                key={ev.id}
                                onClick={(e) => { e.stopPropagation(); openEdit(ev); }}
                                title={`${ev.title}${ev.startTime ? " — " + ev.startTime.slice(0,5) : ""}`}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  padding: "2px 6px",
                                  borderRadius: 6,
                                  background: `${cat.color}22`,
                                  color: cat.color,
                                  border: `1px solid ${cat.color}55`,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  cursor: "pointer",
                                }}
                              >
                                {ev.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <div style={{ fontSize: 10, color: t.muted, fontStyle: "italic" }}>
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={panelStyle(t)}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: t.text }}>
            This month's events
          </h3>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : sortedSidebar.length === 0 ? (
            <div style={{ padding: "20px 14px", textAlign: "center", color: t.muted, background: t.bg, borderRadius: 10, border: `1px dashed ${t.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4 }}>No events this month</div>
              <div style={{ fontSize: 12 }}>Click any day on the calendar to add one.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 520, overflowY: "auto" }}>
              {sortedSidebar.map((ev) => {
                const cat = CATEGORY_BY_VALUE[ev.category] || CATEGORY_BY_VALUE.OTHER;
                const tone = STATUS_TONE[ev.status] || t.muted;
                return (
                  <div
                    key={ev.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: t.bg,
                      border: `1px solid ${t.border}`,
                      borderLeft: `3px solid ${cat.color}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {ev.title}
                      </div>
                      <span style={smallTag(tone)}>{ev.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 6 }}>
                      {ev.eventDate}
                      {ev.startTime && ` • ${ev.startTime.slice(0, 5)}`}
                      {ev.endTime && `–${ev.endTime.slice(0, 5)}`}
                      {ev.venue && ` • ${ev.venue}`}
                    </div>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => openEdit(ev)} style={tinyButton(t, t.accent)}>Edit</button>
                      <button type="button" onClick={() => handleDelete(ev)} style={tinyButton(t, "var(--danger)")}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit modal */}
      <Modal
        isOpen={showForm}
        onClose={() => !submitting && setShowForm(false)}
        title={editingId ? "Edit event" : "Add event"}
        size="md"
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Title" required>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => patchForm({ title: e.target.value })}
              placeholder="e.g. Annual Cultural Fest"
              disabled={submitting}
              style={inputStyle(t)}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => patchForm({ description: e.target.value })}
              disabled={submitting}
              style={{ ...inputStyle(t), resize: "vertical", fontFamily: "inherit" }}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="Date" required>
              <input
                type="date"
                required
                value={form.eventDate}
                onChange={(e) => patchForm({ eventDate: e.target.value })}
                disabled={submitting}
                style={inputStyle(t)}
              />
            </Field>
            <Field label="Start time">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => patchForm({ startTime: e.target.value })}
                disabled={submitting}
                style={inputStyle(t)}
              />
            </Field>
            <Field label="End time">
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => patchForm({ endTime: e.target.value })}
                disabled={submitting}
                style={inputStyle(t)}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Venue">
              <input
                type="text"
                value={form.venue}
                onChange={(e) => patchForm({ venue: e.target.value })}
                placeholder="Main Auditorium"
                disabled={submitting}
                style={inputStyle(t)}
              />
            </Field>
            <Field label="Organizer">
              <input
                type="text"
                value={form.organizer}
                onChange={(e) => patchForm({ organizer: e.target.value })}
                placeholder="Cultural Committee"
                disabled={submitting}
                style={inputStyle(t)}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => patchForm({ category: e.target.value })}
                disabled={submitting}
                style={inputStyle(t)}
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => patchForm({ status: e.target.value })}
                disabled={submitting}
                style={inputStyle(t)}
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Max participants">
              <input
                type="number"
                min={0}
                value={form.maxParticipants}
                onChange={(e) => patchForm({ maxParticipants: e.target.value })}
                placeholder="Optional"
                disabled={submitting}
                style={inputStyle(t)}
              />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
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
                ? (editingId ? "Updating…" : "Adding…")
                : (editingId ? "Update event" : "Add event")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ── Small UI helpers ──────────────────────────────────────────── */

function Field({ label, required, children }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
      {label}{required && <span style={{ color: "var(--danger)" }}> *</span>}
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}

function panelStyle(t) {
  return {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 16,
    padding: 20,
  };
}

function inputStyle(t) {
  return {
    width: "100%",
    padding: "8px 12px",
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

function navButton(t) {
  return {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: t.text,
    fontSize: 12,
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

function smallTag(color) {
  return {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: "1px 8px",
    borderRadius: 999,
    color,
    background: `${color}22`,
    border: `1px solid ${color}55`,
    flexShrink: 0,
  };
}

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
