import React, { useCallback, useContext, useEffect, useState } from "react";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { analyticsService } from "../features/analytics/analyticsService";

/**
 * Analytics Dashboard — single call to GET /api/analytics.
 * All data is real; no setTimeout / hardcoded mock objects.
 */
export default function Analytics() {
  const { t } = useContext(ThemeContext);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await analyticsService.get());
    } catch (err) {
      setError(err?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt  = (n) => `₹ ${Number(n || 0).toLocaleString()}`;
  const fmtN = (n) => Number(n || 0).toLocaleString();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Analytics</h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Comprehensive insights across all hostel modules — live from the database.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} style={navBtn(t, loading)}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {error && !loading && (
        <div role="alert" style={errorBanner}>
          {error}
          <button type="button" onClick={load} style={linkBtnStyle}>Retry</button>
        </div>
      )}

      {loading ? (
        <div>
          <LoadingSkeleton count={8} />
        </div>
      ) : !data ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: t.muted, background: t.surface, border: `1px dashed ${t.border}`, borderRadius: 14 }}>
          No analytics data available.
        </div>
      ) : (
        <>
          {/* ── Top 4 headline cards ──────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <MetricCard t={t} label="Total revenue"     value={fmt(data.totalRevenue)}  color="var(--success)" hint={`${fmt(data.pendingRevenue)} outstanding`} />
            <MetricCard t={t} label="Room occupancy"    value={`${data.occupancyRate ?? 0}%`} color="var(--accent)"  hint={`${data.occupiedRooms ?? 0}/${data.totalRooms ?? 0} rooms`} progress={data.occupancyRate} />
            <MetricCard t={t} label="Active students"   value={fmtN(data.activeStudents)} color={t.purple}      hint={`${fmtN(data.totalStudents)} total`} />
            <MetricCard t={t} label="Open complaints"   value={fmtN(data.openComplaints)} color="var(--danger)"  hint={`${fmtN(data.resolvedComplaints)} resolved`} />
          </div>

          {/* ── Secondary metrics row ─────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <SmallCard t={t} label="Checked-in visitors"      value={fmtN(data.checkedInVisitors)}        color="var(--warning)" />
            <SmallCard t={t} label="Open maintenance"         value={fmtN(data.openMaintenanceRequests)}  color="var(--danger)"  />
            <SmallCard t={t} label="Completed maintenance"    value={fmtN(data.completedMaintenanceRequests)} color="var(--success)" />
            <SmallCard t={t} label="Active notices"           value={fmtN(data.activeNotices)}            color={t.accent}       />
            <SmallCard t={t} label="Upcoming events"          value={fmtN(data.upcomingEvents)}           color={t.purple}       />
          </div>

          {/* ── Main charts grid ──────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)", gap: 16 }}>

            {/* Monthly revenue bar chart */}
            <div style={panel(t)}>
              <h2 style={panelTitle(t)}>Monthly revenue (last 6 months)</h2>
              {!data.monthlyRevenue?.length ? (
                <EmptyChart t={t} msg="No paid fee records yet." />
              ) : (
                <BarChart t={t} items={data.monthlyRevenue.map(m => ({ label: m.month, value: m.amount }))} color="var(--accent)" formatValue={(v) => `₹${(v / 1000).toFixed(1)}k`} />
              )}
            </div>

            {/* Complaints by category */}
            <div style={panel(t)}>
              <h2 style={panelTitle(t)}>Complaints by category</h2>
              {!data.complaintsByCategory?.length ? (
                <EmptyChart t={t} msg="No complaints recorded." />
              ) : (
                <HorizontalBars t={t} items={data.complaintsByCategory.map(c => ({ label: c.category, value: c.count }))} color="var(--warning)" />
              )}
            </div>

          </div>

          {/* ── Attendance last 7 days ────────────────────────── */}
          <div style={panel(t)}>
            <h2 style={panelTitle(t)}>Daily attendance — last 7 days</h2>
            {!data.dailyAttendance?.length ? (
              <EmptyChart t={t} msg="No attendance records in the past 7 days." />
            ) : (
              <AttendanceTable t={t} rows={data.dailyAttendance} />
            )}
          </div>

          {/* ── Complaints status breakdown ───────────────────── */}
          <div style={panel(t)}>
            <h2 style={panelTitle(t)}>Complaints overview</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "0 0 4px" }}>
              {[
                { label: "Open",        value: data.openComplaints,       color: "var(--danger)"  },
                { label: "In progress", value: data.inProgressComplaints, color: "var(--warning)" },
                { label: "Resolved",    value: data.resolvedComplaints,   color: "var(--success)" },
                { label: "Total",       value: data.totalComplaints,      color: t.muted          },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ flex: "1 1 120px", textAlign: "center", background: t.bg, borderRadius: 10, padding: "14px 10px", border: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color }}>{fmtN(value)}</div>
                  <div style={{ fontSize: 11, color: t.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

        </>
      )}
    </div>
  );
}

/* ── Chart components ──────────────────────────────────────────── */

function BarChart({ t, items, color, formatValue }) {
  const maxVal = Math.max(...items.map(i => i.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: "0 0 8px", height: 180 }}>
      {items.map(({ label, value }) => {
        const pct = (value / maxVal) * 100;
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
            <div style={{ fontSize: 11, color, fontWeight: 700 }}>{formatValue ? formatValue(value) : value}</div>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
              <div
                title={`${label}: ${value}`}
                style={{
                  width: "100%",
                  height: `${Math.max(pct, 4)}%`,
                  background: `linear-gradient(to top, ${color}, ${color}bb)`,
                  borderRadius: "6px 6px 0 0",
                  minHeight: 6,
                  transition: "height 0.5s ease",
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: t.muted, fontWeight: 600 }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBars({ t, items, color }) {
  const maxVal = Math.max(...items.map(i => i.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map(({ label, value }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: t.text, fontWeight: 600 }}>{label}</span>
            <span style={{ color, fontWeight: 700 }}>{value}</span>
          </div>
          <div style={{ height: 8, background: t.border, borderRadius: 6, overflow: "hidden" }}>
            <div style={{
              width: `${(value / maxVal) * 100}%`,
              height: "100%",
              background: `linear-gradient(to right, ${color}, ${color}88)`,
              borderRadius: 6,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AttendanceTable({ t, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: t.bg }}>
            {["Date", "Present", "Absent", "Late", "Leave", "Total", "Present %"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date} style={{ borderTop: `1px solid ${t.border}` }}>
              <td style={{ padding: "10px 12px", color: t.text, fontWeight: 600 }}>{r.date}</td>
              <td style={{ padding: "10px 12px", color: "var(--success)", fontWeight: 600 }}>{r.present ?? 0}</td>
              <td style={{ padding: "10px 12px", color: "var(--danger)" }}>{r.absent  ?? 0}</td>
              <td style={{ padding: "10px 12px", color: "var(--warning)" }}>{r.late   ?? 0}</td>
              <td style={{ padding: "10px 12px", color: t.muted }}>{r.leave ?? 0}</td>
              <td style={{ padding: "10px 12px", color: t.text }}>{r.total ?? 0}</td>
              <td style={{ padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: t.border, borderRadius: 4, overflow: "hidden", minWidth: 50 }}>
                    <div style={{ width: `${r.presentPct ?? 0}%`, height: "100%", background: "var(--success)", borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--success)", minWidth: 36 }}>{r.presentPct ?? 0}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyChart({ t, msg }) {
  return (
    <div style={{ padding: "30px 12px", textAlign: "center", color: t.muted, fontSize: 13 }}>
      {msg}
    </div>
  );
}

/* ── Metric cards ──────────────────────────────────────────────── */

function MetricCard({ t, label, value, color, hint, progress }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderTop: `3px solid ${color}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color, marginTop: 4, letterSpacing: -1 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>{hint}</div>}
      {typeof progress === "number" && (
        <div style={{ marginTop: 10, height: 5, background: t.border, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${Math.min(100, Math.max(0, progress))}%`, height: "100%", background: color, transition: "width 0.6s ease" }} />
        </div>
      )}
    </div>
  );
}

function SmallCard({ t, label, value, color }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 10, color: t.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

/* ── Style helpers ─────────────────────────────────────────────── */

const errorBanner  = { padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.45)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 };
const linkBtnStyle = { marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 12 };

function navBtn(t, disabled) { return { padding: "8px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, fontWeight: 600, cursor: disabled ? "wait" : "pointer", opacity: disabled ? 0.6 : 1 }; }
function panel(t)     { return { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: "16px 18px" }; }
function panelTitle(t){ return { margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: t.text }; }
