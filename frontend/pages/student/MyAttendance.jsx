import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { get } from "../../api/api";
import {
  PageHeader, Panel, SectionTitle, Alert, Loading, Button,
  StatusPill, EmptyState, formatDate,
} from "./_meShared";

/**
 * /me/attendance — own attendance, scoped server-side.
 * Shows summary + scrollable table sorted newest-first.
 */
export default function MyAttendance() {
  const { t } = useContext(ThemeContext);

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get("/me/attendance");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const summary = useMemo(() => {
    const total = rows.length;
    const present = rows.filter(r => r.status === "PRESENT").length;
    const absent  = rows.filter(r => r.status === "ABSENT").length;
    const late    = rows.filter(r => r.status === "LATE").length;
    const leave   = rows.filter(r => r.status === "LEAVE").length;
    const pct     = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, leave, pct };
  }, [rows]);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [rows]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader t={t}
        title="My Attendance"
        subtitle="Your hostel attendance log."
        right={<Button t={t} onClick={reload}>Refresh</Button>} />

      {error && <Alert t={t} kind="danger">{error}</Alert>}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12,
      }}>
        <Stat t={t} label="Attendance" value={`${summary.pct}%`} color={t.success}
              progress={summary.pct} />
        <Stat t={t} label="Present" value={summary.present} color={t.success} />
        <Stat t={t} label="Absent"  value={summary.absent}  color={t.danger}  />
        <Stat t={t} label="Late"    value={summary.late}    color={t.warning} />
        <Stat t={t} label="Leave"   value={summary.leave}   color={t.accent}  />
      </div>

      {loading ? <Loading t={t} /> :
       sorted.length === 0 ? (
        <EmptyState t={t} icon="📅" title="No attendance recorded yet" subtitle="Your check-ins will show up here." />
      ) : (
        <Panel t={t}>
          <SectionTitle t={t}>Recent days</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
              <thead>
                <tr>
                  {["Date", "Status", "Check-in", "Check-out", "Remarks"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "10px 12px", color: t.muted,
                      fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                      textTransform: "uppercase",
                      borderBottom: `1px solid ${t.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => (
                  <tr key={r.id}>
                    <td style={td(t)}>{formatDate(r.date)}</td>
                    <td style={td(t)}><StatusPill t={t} status={r.status} /></td>
                    <td style={td(t)}>{r.checkInTime  || "—"}</td>
                    <td style={td(t)}>{r.checkOutTime || "—"}</td>
                    <td style={td(t)}>{r.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

const td = (t) => ({
  padding: "10px 12px", borderBottom: `1px solid ${t.border}`,
  color: t.text, verticalAlign: "middle",
});

function Stat({ t, label, value, color, progress }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderTop: `3px solid ${color}`, borderRadius: 14, padding: 14,
    }}>
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 6 }}>{value}</div>
      {typeof progress === "number" && (
        <div style={{ marginTop: 8, height: 5, background: t.border, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${Math.min(100, Math.max(0, progress))}%`, height: "100%", background: color, transition: "width 0.6s" }} />
        </div>
      )}
    </div>
  );
}
