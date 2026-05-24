// Dashboard page
// ──────────────────────────────────────────────────────────────────────────────
// Real-data dashboard. Every number on this page comes from a live backend
// query (GET /api/dashboard/stats); nothing is hard-coded.
//
// States:
//   - loading       → skeleton shimmer
//   - error         → recoverable error card with retry
//   - empty         → friendly "no data yet" state
//   - ready         → metric cards + occupancy donut + complaints summary
//
// Sections that previously showed fake "recent activities" / "notices" /
// "sparklines" have been removed — there is no backend support for them
// today, and showing fake numbers contradicts the whole point of this PR.
// They will return in later PRs once the backend exposes the underlying
// data (activity log, notices, time-series).

import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { getDashboardStats } from "../features/dashboard/dashboardService";

// ── Tiny count-up helper ─────────────────────────────────────────────────────
function useCountUp(target, duration = 1000, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (typeof target !== "number" || Number.isNaN(target)) {
      setVal(0);
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

// ── Donut chart (occupied vs available rooms) ────────────────────────────────
function DonutChart({ occupied, available, t }) {
  const total = (occupied || 0) + (available || 0);
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const r = 44, cx = 54, cy = 54, stroke = 12;
  const circ = 2 * Math.PI * r;
  const occArc = total > 0 ? (occupied / total) * circ : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={108} height={108}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.border} strokeWidth={stroke} />
        {/* Occupied arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={t.accent}
          strokeWidth={stroke}
          strokeDasharray={`${occArc} ${circ}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x={cx} y={cy - 2} textAnchor="middle" fill={t.text} fontSize={18} fontWeight={700}>{pct}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={t.muted} fontSize={9}>occupied</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <LegendRow color={t.accent}  label="Occupied"  value={occupied} />
        <LegendRow color={t.success} label="Available" value={available} />
        <LegendRow color={t.muted}   label="Total"     value={total} subtle />
      </div>
    </div>
  );
}

function LegendRow({ color, label, value, subtle = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <strong style={{ marginLeft: "auto", paddingLeft: 12, color: subtle ? "var(--muted)" : color }}>
        {Number(value || 0).toLocaleString()}
      </strong>
    </div>
  );
}

// ── Number formatting helpers ────────────────────────────────────────────────
const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const themeCtx = useContext(ThemeContext);
  const authCtx  = useContext(AuthContext);
  const navigate = useNavigate();

  // The themes provider always supplies these, but defaulting keeps the page
  // resilient if Dashboard is rendered outside the layout (e.g. in tests).
  const t = themeCtx?.t ?? {
    bg: "#020617", surface: "#0b1220", card: "#0f172a", border: "#1e293b",
    text: "#f8fafc", muted: "#94a3b8", accent: "#3b82f6",
    success: "#22c55e", danger: "#f87171", warning: "#fbbf24", purple: "#a855f7",
  };

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [animateIn, setAnimateIn]   = useState(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
      // Trigger count-up animation on the next frame
      setTimeout(() => setAnimateIn(true), 50);
    } catch (err) {
      setError(err?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return <DashboardSkeleton t={t} />;
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return <DashboardError t={t} message={error} onRetry={() => load()} />;
  }

  // ── Empty state (genuinely no data — fresh DB) ─────────────────────────────
  if (
    stats &&
    stats.totalStudents === 0 &&
    stats.totalRooms === 0 &&
    stats.totalComplaints === 0
  ) {
    return <DashboardEmpty t={t} navigate={navigate} />;
  }

  return (
    <DashboardReady
      t={t}
      stats={stats}
      animateIn={animateIn}
      refreshing={refreshing}
      onRefresh={() => load({ silent: true })}
      userName={authCtx?.user?.name}
    />
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function DashboardReady({ t, stats, animateIn, refreshing, onRefresh, userName }) {
  const navigate = useNavigate();

  // Count-up animations for the four headline metrics
  const cStudents = useCountUp(stats.totalStudents,    900, animateIn);
  const cRooms    = useCountUp(stats.occupiedRooms,    900, animateIn);
  const cRevenue  = useCountUp(Math.round(stats.totalRevenue),    1100, animateIn);
  const cPending  = useCountUp(Math.round(stats.pendingPayments), 900, animateIn);

  const occupancyPct = Math.round(stats.occupancyRate || 0);
  const resolvedPct  = stats.totalComplaints > 0
    ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100)
    : 0;

  const cards = [
    {
      label:    "Total Students",
      value:    formatNumber(cStudents),
      subline:  `${formatNumber(stats.activeStudents)} active`,
      icon:     "👥",
      color:    t.accent,
      onClick:  () => navigate("/students"),
    },
    {
      label:    "Room Occupancy",
      value:    `${formatNumber(cRooms)} / ${formatNumber(stats.totalRooms)}`,
      subline:  `${occupancyPct}% occupied`,
      icon:     "🚪",
      color:    t.success,
      onClick:  () => navigate("/rooms"),
    },
    {
      label:    "Total Revenue",
      value:    formatINR(cRevenue),
      subline:  "Lifetime collected",
      icon:     "💰",
      color:    t.purple,
      onClick:  () => navigate("/fees"),
    },
    {
      label:    "Pending Payments",
      value:    formatINR(cPending),
      subline:  "Pending or overdue",
      icon:     "⚠️",
      color:    t.danger,
      onClick:  () => navigate("/fees"),
    },
  ];

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: t.text }}>
      <style>{`
        @keyframes hms-slide-up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .hms-card-tile {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .hms-card-tile:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
        }
        .hms-section-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 12,
        animation: "hms-slide-up 0.4s ease both",
      }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: t.muted, margin: "4px 0 0" }}>
            {userName ? `Welcome back, ${userName.split(" ")[0]}.` : "Welcome back."}
            {" "}Live overview of your hostel — refreshed from the database.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh dashboard data"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: refreshing ? t.muted : t.text,
            fontSize: 13,
            fontWeight: 600,
            cursor: refreshing ? "wait" : "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span style={{
            display: "inline-block",
            animation: refreshing ? "hms-spin 0.8s linear infinite" : "none",
          }}>↻</span>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
        <style>{`@keyframes hms-spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Stat tiles */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}>
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="hms-card-tile"
            style={{ animation: `hms-slide-up 0.45s ease ${i * 0.05}s both` }}
            onClick={card.onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && card.onClick()}
          >
            {/* Decorative corner */}
            <div style={{
              position: "absolute",
              top: 0, right: 0,
              width: 72, height: 72,
              background: `${card.color}1a`,
              borderRadius: "0 16px 0 72px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              paddingRight: 12,
              paddingTop: 12,
              fontSize: 22,
            }}>{card.icon}</div>

            <div style={{
              fontSize: 11,
              color: t.muted,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 6,
            }}>
              {card.label}
            </div>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: card.color,
              letterSpacing: -1,
              marginBottom: 4,
            }}>
              {card.value}
            </div>
            <div style={{ fontSize: 11, color: t.muted }}>
              {card.subline}
            </div>
          </div>
        ))}
      </div>

      {/* Lower row: occupancy + complaints */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
      }}>
        {/* Occupancy */}
        <div className="hms-section-card" style={{ animation: "hms-slide-up 0.5s ease 0.2s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Room Occupancy</h3>
            <button
              type="button"
              onClick={() => navigate("/rooms")}
              style={{ background: "none", border: "none", color: t.accent, fontSize: 12, cursor: "pointer" }}
            >
              View rooms →
            </button>
          </div>

          {stats.totalRooms === 0 ? (
            <p style={{ color: t.muted, fontSize: 13, margin: 0 }}>
              No rooms yet. Add rooms in the Rooms section to see occupancy.
            </p>
          ) : (
            <DonutChart
              occupied={stats.occupiedRooms}
              available={stats.totalRooms - stats.occupiedRooms}
              t={t}
            />
          )}
        </div>

        {/* Complaints */}
        <div className="hms-section-card" style={{ animation: "hms-slide-up 0.5s ease 0.25s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Complaints</h3>
            <button
              type="button"
              onClick={() => navigate("/complaint")}
              style={{ background: "none", border: "none", color: t.accent, fontSize: 12, cursor: "pointer" }}
            >
              View all →
            </button>
          </div>

          {stats.totalComplaints === 0 ? (
            <p style={{ color: t.muted, fontSize: 13, margin: 0 }}>
              No complaints yet. The system is quiet — that's a good sign.
            </p>
          ) : (
            <>
              <ComplaintRow label="Total"    value={stats.totalComplaints}    color={t.accent} />
              <ComplaintRow label="Resolved" value={stats.resolvedComplaints} color={t.success} />
              <ComplaintRow label="Open"     value={stats.openComplaints}     color={t.danger} />

              <div style={{ marginTop: 14 }}>
                <div style={{
                  height: 6,
                  background: t.border,
                  borderRadius: 4,
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${resolvedPct}%`,
                    background: t.success,
                    borderRadius: 4,
                    transition: "width 0.6s ease",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: t.muted, textAlign: "right", marginTop: 6 }}>
                  {resolvedPct}% resolved
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ComplaintRow({ label, value, color }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
      <strong style={{ fontSize: 14, color }}>{formatNumber(value)}</strong>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────────────
function DashboardSkeleton({ t }) {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @keyframes hms-shimmer { 0% { opacity: 0.5; } 50% { opacity: 0.85; } 100% { opacity: 0.5; } }
        .hms-skeleton {
          background: var(--border);
          border-radius: 8px;
          animation: hms-shimmer 1.4s ease-in-out infinite;
        }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <div className="hms-skeleton" style={{ height: 28, width: 200, marginBottom: 8 }} />
        <div className="hms-skeleton" style={{ height: 14, width: 320 }} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: 20,
          }}>
            <div className="hms-skeleton" style={{ height: 11, width: "50%", marginBottom: 14 }} />
            <div className="hms-skeleton" style={{ height: 28, width: "70%", marginBottom: 8 }} />
            <div className="hms-skeleton" style={{ height: 10, width: "40%" }} />
          </div>
        ))}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
      }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            padding: 20,
            minHeight: 180,
          }}>
            <div className="hms-skeleton" style={{ height: 16, width: "40%", marginBottom: 18 }} />
            <div className="hms-skeleton" style={{ height: 12, width: "100%", marginBottom: 8 }} />
            <div className="hms-skeleton" style={{ height: 12, width: "85%", marginBottom: 8 }} />
            <div className="hms-skeleton" style={{ height: 12, width: "60%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Error state ──────────────────────────────────────────────────────────────
function DashboardError({ t, message, onRetry }) {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      padding: 24,
      textAlign: "center",
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: `${t.danger}1a`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
      }}>⚠️</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: t.text }}>
        Couldn't load the dashboard
      </h2>
      <p style={{ fontSize: 13, color: t.muted, margin: 0, maxWidth: 420 }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: "10px 20px",
          borderRadius: 10,
          border: "none",
          background: t.accent,
          color: "#fff",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function DashboardEmpty({ t, navigate }) {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 14,
      padding: 24,
      textAlign: "center",
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: `${t.accent}1a`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
      }}>🏠</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text }}>
        Your hostel is ready to go
      </h2>
      <p style={{ fontSize: 13, color: t.muted, margin: 0, maxWidth: 460, lineHeight: 1.6 }}>
        There&apos;s nothing in the database yet. Add your first rooms and students,
        and the dashboard will start showing real numbers automatically.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => navigate("/rooms")}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: t.accent,
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Add rooms
        </button>
        <button
          type="button"
          onClick={() => navigate("/students")}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: t.text,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Add students
        </button>
      </div>
    </div>
  );
}
