import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { dashboardService } from "../features/dashboard/dashboardService";

/**
 * Dashboard — single live request to /api/dashboard/stats.
 * The previous version pulled data from a hardcoded mock object
 * with fake activities and notice cards.
 */
export default function Dashboard() {
  const { t } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.stats();
      setStats(data || null);
    } catch (err) {
      setError(err?.message || "Failed to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const greeting = (() => {
    const h = time.getHours();
    if (h < 5)  return "Up late";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, color: t.text }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>
            {greeting}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p style={{ margin: "4px 0 0", color: t.muted, fontSize: 13 }}>
            Here's what's happening in your hostel today.
          </p>
        </div>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 14px", textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.accent, fontVariantNumeric: "tabular-nums" }}>
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div style={{ fontSize: 10, color: t.muted }}>
            {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>

      {error && !loading && (
        <div role="alert" style={errorBanner}>
          {error}
          <button type="button" onClick={reload} style={linkButton}>Retry</button>
        </div>
      )}

      {/* Top stat cards */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : !stats ? (
        <div style={{ padding: "30px 16px", textAlign: "center", color: t.muted, background: t.surface, border: `1px dashed ${t.border}`, borderRadius: 14 }}>
          No dashboard data available.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <StatCard
              t={t} color={t.accent}
              label="Total students"
              value={stats.totalStudents}
              hint={`${stats.activeStudents} active`}
              onClick={() => navigate("/students")}
            />
            <StatCard
              t={t} color={t.success}
              label="Room occupancy"
              value={`${stats.occupiedRooms}/${stats.totalRooms}`}
              hint={`${Math.round(stats.occupancyRate ?? 0)}% occupied`}
              progress={stats.occupancyRate}
              onClick={() => navigate("/rooms")}
            />
            <StatCard
              t={t} color={t.purple}
              label="Total revenue"
              value={`₹ ${formatNum(stats.totalRevenue)}`}
              hint="all-time, paid"
              onClick={() => navigate("/fees")}
            />
            <StatCard
              t={t} color={t.warning}
              label="Pending payments"
              value={`₹ ${formatNum(stats.pendingPayments)}`}
              hint="outstanding"
              onClick={() => navigate("/fees")}
            />
          </div>

          {/* Bottom panels: complaints + quick links */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 1fr)", gap: 16 }}>
            <ComplaintsPanel t={t} stats={stats} onClick={() => navigate("/complaint")} />
            <QuickLinksPanel t={t} navigate={navigate} />
          </div>
        </>
      )}
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function StatCard({ t, label, value, hint, color, progress, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: 18,
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderTop: `3px solid ${color}`,
        borderRadius: 14,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 20px ${color}22`; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ fontSize: 11, color: t.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginTop: 6, letterSpacing: -0.5 }}>
        {value}
      </div>
      {hint && <div style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>{hint}</div>}
      {typeof progress === "number" && (
        <div style={{ marginTop: 10, height: 5, background: t.border, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${Math.min(100, Math.max(0, progress))}%`, height: "100%", background: color, transition: "width 0.6s ease" }} />
        </div>
      )}
    </button>
  );
}

function ComplaintsPanel({ t, stats, onClick }) {
  const total    = stats.totalComplaints || 0;
  const resolved = stats.resolvedComplaints || 0;
  const open     = stats.openComplaints || 0;
  const pct      = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>Complaints</h3>
        <button type="button" onClick={onClick} style={{ background: "none", border: "none", color: t.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          View all →
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Pill color={t.accent}  label="Total"    value={total} />
        <Pill color="var(--success)" label="Resolved" value={resolved} />
        <Pill color="var(--danger)"  label="Open"     value={open} />
      </div>

      <div style={{ marginTop: 14, height: 6, background: t.border, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--success)", transition: "width 0.6s ease" }} />
      </div>
      <div style={{ fontSize: 11, color: t.muted, marginTop: 4, textAlign: "right" }}>
        {pct}% resolution rate
      </div>
    </div>
  );
}

function QuickLinksPanel({ t, navigate }) {
  const links = [
    { label: "Students",     to: "/students",        emoji: "👥", color: t.accent  },
    { label: "Rooms",        to: "/rooms",           emoji: "🚪", color: t.success },
    { label: "Fees",         to: "/fees",            emoji: "₹",  color: t.purple  },
    { label: "Attendance",   to: "/attendance",      emoji: "📅", color: t.warning },
    { label: "Complaints",   to: "/complaint",       emoji: "⚠",  color: "var(--danger)" },
    { label: "Notices",      to: "/notice",          emoji: "📢", color: t.accent  },
  ];
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 18 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: t.text }}>Quick links</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {links.map((l) => (
          <button
            key={l.to}
            type="button"
            onClick={() => navigate(l.to)}
            style={{
              padding: "12px",
              borderRadius: 10,
              border: `1px solid ${l.color}33`,
              background: `${l.color}0d`,
              color: t.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              textAlign: "left",
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${l.color}1c`; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${l.color}0d`; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <span style={{ fontSize: 16 }}>{l.emoji}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Pill({ color, label, value }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "10px 6px", borderRadius: 10, background: `${color}11`, border: `1px solid ${color}33` }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>
        {label}
      </div>
    </div>
  );
}

function formatNum(n) {
  const v = Number(n) || 0;
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const errorBanner = { padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.45)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 12 };
const linkButton = { marginLeft: "auto", background: "none", border: "none", color: "var(--danger)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: 12 };
