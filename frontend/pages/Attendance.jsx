import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { attendanceService } from "../features/attendance/attendanceService";
import { studentService } from "../features/student/studentService";

/* ── Backend enum: PRESENT / ABSENT / LEAVE / LATE ───────────────── */

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present", color: "var(--success)" },
  { value: "ABSENT",  label: "Absent",  color: "var(--danger)"  },
  { value: "LATE",    label: "Late",    color: "var(--warning)" },
  { value: "LEAVE",   label: "Leave",   color: "var(--accent)"  },
];

const STATUS_BY_VALUE = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function Attendance() {
  const { t } = useContext(ThemeContext);
  const toast = useNotification();

  const [date, setDate] = useState(todayIso());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [busyId, setBusyId] = useState(null);

  // Load all students once for the "mark for unrecorded students" panel.
  useEffect(() => {
    let cancelled = false;
    setStudentsLoading(true);
    studentService.list({ page: 0, size: 500 })
      .then((res) => { if (!cancelled) setStudents(res?.content || []); })
      .catch(() => { if (!cancelled) toast.error("Couldn't load student list."); })
      .finally(() => { if (!cancelled) setStudentsLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.byDate(date);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { reload(); }, [reload]);

  const summary = useMemo(() => {
    const acc = { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0 };
    for (const r of records) acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, [records]);

  const recordedIds = useMemo(() => new Set(records.map(r => r.studentId)), [records]);
  const unrecorded = useMemo(
    () => students.filter(s => s.isActive !== false && !recordedIds.has(s.id)),
    [students, recordedIds]
  );

  async function quickMark(student, status) {
    if (busyId) return;
    setBusyId(`new-${student.id}`);
    try {
      await attendanceService.mark({ studentId: student.id, date, status });
      toast.success(`Marked ${student.name}: ${STATUS_BY_VALUE[status].label}.`);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to mark attendance.");
    } finally {
      setBusyId(null);
    }
  }

  async function changeStatus(record, status) {
    if (busyId || record.status === status) return;
    setBusyId(record.id);
    try {
      await attendanceService.update(record.id, { ...record, status });
      toast.success(`Updated ${record.studentName}: ${STATUS_BY_VALUE[status].label}.`);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to update attendance.");
    } finally {
      setBusyId(null);
    }
  }

  async function markAllPresent() {
    if (!unrecorded.length) return;
    if (!window.confirm(`Mark all ${unrecorded.length} unrecorded student(s) as Present for ${date}?`)) return;
    setBusyId("bulk");
    try {
      await attendanceService.markBulk(
        unrecorded.map(s => ({ studentId: s.id, date, status: "PRESENT" }))
      );
      toast.success(`${unrecorded.length} students marked Present.`);
      await reload();
    } catch (err) {
      toast.error(err?.message || "Failed to bulk-mark attendance.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      <div style={headerRow}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Attendance</h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Daily student attendance. Pick a date to see records and mark missing ones.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle(t)}
            aria-label="Select attendance date"
          />
          <button
            type="button"
            onClick={() => setDate(todayIso())}
            disabled={date === todayIso()}
            style={secondaryButton(t)}
          >
            Today
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {STATUS_OPTIONS.map(s => (
          <SummaryCard key={s.value} t={t} label={s.label} count={summary[s.value] ?? 0} color={s.color} />
        ))}
      </div>

      {error && !loading && (
        <div role="alert" style={errorBanner}>
          {error}
          <button type="button" onClick={reload} style={linkButton}>Retry</button>
        </div>
      )}

      {/* Already-recorded section */}
      <div style={panel(t)}>
        <div style={cardHeader(t)}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: t.text }}>
            Records for {date}
          </h2>
          <span style={{ fontSize: 12, color: t.muted }}>
            {loading ? "Loading…" : `${records.length} record${records.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}><LoadingSkeleton count={4} /></div>
        ) : records.length === 0 ? (
          <div style={{ padding: "30px 16px", textAlign: "center", color: t.muted }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>
              No attendance taken for this date yet
            </div>
            <div style={{ fontSize: 13 }}>
              Use the panel below to mark students.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: t.bg }}>
                  <Th t={t}>Student</Th>
                  <Th t={t}>Roll</Th>
                  <Th t={t}>Status</Th>
                  <Th t={t}>Marked by</Th>
                  <Th t={t}>Remarks</Th>
                  <Th t={t} style={{ textAlign: "right" }}>Change to</Th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const tone = STATUS_BY_VALUE[r.status]?.color || t.muted;
                  return (
                    <tr key={r.id} style={{ borderTop: `1px solid ${t.border}` }}>
                      <td style={cell}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={avatar(t)}>{initials(r.studentName)}</div>
                          <div style={{ fontWeight: 600, color: t.text }}>{r.studentName}</div>
                        </div>
                      </td>
                      <td style={{ ...cell, color: t.muted }}>{r.rollNumber || "—"}</td>
                      <td style={cell}>
                        <span style={badge(tone)}>{STATUS_BY_VALUE[r.status]?.label || r.status}</span>
                      </td>
                      <td style={{ ...cell, color: t.muted }}>{r.markedBy || "—"}</td>
                      <td style={{ ...cell, color: t.muted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.remarks || "—"}
                      </td>
                      <td style={{ ...cell, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 4 }}>
                          {STATUS_OPTIONS.filter(s => s.value !== r.status).map(s => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => changeStatus(r, s.value)}
                              disabled={busyId !== null}
                              style={tinyBtn(t, s.color)}
                              aria-label={`Mark ${r.studentName} as ${s.label}`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unrecorded students */}
      <div style={panel(t)}>
        <div style={cardHeader(t)}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: t.text }}>
            Pending — students not yet marked
          </h2>
          <button
            type="button"
            onClick={markAllPresent}
            disabled={busyId !== null || unrecorded.length === 0}
            style={{ ...primaryButton(t), padding: "6px 14px", fontSize: 12, opacity: unrecorded.length === 0 ? 0.5 : 1 }}
          >
            Mark all present ({unrecorded.length})
          </button>
        </div>

        {studentsLoading ? (
          <div style={{ padding: 16 }}><LoadingSkeleton count={3} /></div>
        ) : unrecorded.length === 0 ? (
          <div style={{ padding: "20px 16px", textAlign: "center", color: t.muted, fontSize: 13 }}>
            All active students are recorded for {date}. ✓
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, padding: 14 }}>
            {unrecorded.map(s => (
              <div key={s.id} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={avatar(t)}>{initials(s.name)}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.name}
                    </div>
                    {s.rollNumber && <div style={{ fontSize: 11, color: t.muted }}>{s.rollNumber}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => quickMark(s, opt.value)}
                      disabled={busyId !== null}
                      style={{ ...tinyBtn(t, opt.color), flex: 1, minWidth: 60 }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ t, label, count, color }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderTop: `3px solid ${color}`, borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 4 }}>{count}</div>
    </div>
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
function inputStyle(t) { return { padding: "9px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, outline: "none" }; }
function primaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${t.accent}44` }; }
function secondaryButton(t) { return { padding: "9px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }; }
function tinyBtn(t, color) { return { padding: "5px 10px", borderRadius: 8, border: `1px solid ${color}55`, background: `${color}11`, color, fontSize: 11, fontWeight: 700, cursor: "pointer" }; }
