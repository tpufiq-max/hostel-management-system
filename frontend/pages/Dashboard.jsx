import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function useCountUp(target, duration = 1400, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let s = null;
    const startTime = performance.now();
    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) s = requestAnimationFrame(tick);
    };
    s = requestAnimationFrame(tick);
    return () => s && cancelAnimationFrame(s);
  }, [target, duration, start]);
  return val;
}

function MiniSparkline({ data, color, width = 80, height = 32 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const last = pts.split(" ").pop().split(",");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

function DonutChart({ segments, t }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 44, cx = 54, cy = 54, stroke = 12;
  const circ = 2 * Math.PI * r;
  let offset = circ * 0.25;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={108} height={108}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.border} strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const arc = (seg.value / total) * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${arc} ${circ}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          );
          offset += arc;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={t.text} fontSize={16} fontWeight={700}>
          {Math.round((segments[0]?.value / total) * 100)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={t.muted} fontSize={9}>occupied</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
            <span style={{ color: t.muted }}>{s.label}</span>
            <strong style={{ color: s.color, marginLeft: "auto", paddingLeft: 8 }}>{s.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

const mockStats = {
  totalStudents: 245, activeStudents: 238,
  totalRooms: 120, occupiedRooms: 115,
  totalRevenue: 125000, pendingPayments: 8500,
  totalComplaints: 23, resolvedComplaints: 18,
};

const mockActivities = [
  { id: 1, icon: "👤", action: "New student registered",  details: "John Doe joined Room 101",       time: "2h ago", color: "#3b82f6" },
  { id: 2, icon: "💰", action: "Payment received",        details: "₹2,500 from Jane Smith",         time: "4h ago", color: "#22c55e" },
  { id: 3, icon: "✓", action: "Complaint resolved",      details: "Room maintenance issue fixed",   time: "6h ago", color: "#22c55e" },
  { id: 4, icon: "📝", action: "Attendance marked",       details: "Evening attendance completed",   time: "8h ago", color: "#f59e0b" },
  { id: 5, icon: "📢", action: "New notice posted",       details: "Hostel rules updated",           time: "1d ago", color: "#a855f7" },
];

const notices = [
  { id: 1, title: "Hostel Maintenance Schedule", date: "Today",       message: "Electrical maintenance in Block A from 2–4 PM. Please cooperate.",         priority: "high"   },
  { id: 2, title: "Fee Payment Deadline",        date: "Tomorrow",    message: "Monthly fee deadline approaching. Pay before 25th to avoid late fees.",      priority: "medium" },
  { id: 3, title: "Sports Event Registration",   date: "25 Feb 2025", message: "Inter-hostel cricket tournament registration open. Register by 28th Feb.", priority: "low"    },
];

const quickActions = [
  { title: "Mark Attendance", icon: "📝", color: "#22c55e" },
  { title: "Record Payment",  icon: "💰", color: "#a855f7" },
  { title: "View Reports",    icon: "▪", color: "#f59e0b" },
  { title: "Manage Rooms",    icon: "🏠", color: "#3b82f6" },
];

export default function Dashboard() {
  const themeCtx = useContext(ThemeContext);
  const t = themeCtx?.t ?? {
    bg: "#020617", surface: "#0b1220", card: "#0f172a", border: "#1e293b",
    text: "#f8fafc", muted: "#94a3b8", accent: "#3b82f6",
    success: "#22c55e", danger: "#f87171", warning: "#fbbf24",
    gold: "#f59e0b", purple: "#a855f7",
  };

  const [stats, setStats]                       = useState(null);
  const [activities, setActivities]             = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [started, setStarted]                   = useState(false);
  const [period, setPeriod]                     = useState("Month");
  const [activeTab, setActiveTab]               = useState("overview");
  const [time, setTime]                         = useState(new Date());
  const [expandedActivity, setExpandedActivity] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const load = async () => {
      await new Promise(r => setTimeout(r, 900));
      setStats(mockStats);
      setActivities(mockActivities);
      setLoading(false);
      setTimeout(() => setStarted(true), 100);
    };
    load();
  }, []);

  const cStudents = useCountUp(stats?.totalStudents   ?? 0, 1400, started);
  const cRooms    = useCountUp(stats?.occupiedRooms   ?? 0, 1400, started);
  const cRevenue  = useCountUp(stats?.totalRevenue    ?? 0, 1600, started);
  const cPending  = useCountUp(stats?.pendingPayments ?? 0, 1400, started);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${t.border}`, borderTop: `3px solid ${t.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: t.muted, fontSize: 14 }}>Loading dashboard...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const occupancyPct      = Math.round((stats.occupiedRooms / stats.totalRooms) * 100);
  const resolvedPct       = Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100);
  const pendingComplaints = stats.totalComplaints - stats.resolvedComplaints;
  const priorityColor     = (p) => p === "high" ? t.danger : p === "medium" ? t.warning : t.accent;

  const statCards = [
    { label: "Total Students",    val: cStudents,                  icon: "👥", color: t.accent,  bg: `${t.accent}18`,  change: "+12% from last month",  trend: "up",   spark: [180,195,200,210,220,230,238,242,245] },
    { label: "Room Occupancy",    val: `${cRooms}/${stats.totalRooms}`, icon: "🚪", color: t.success, bg: `${t.success}18`, change: `${occupancyPct}% occupied`, trend: "up",   spark: [90,95,98,100,105,108,110,113,115]   },
    { label: "Monthly Revenue",   val: `₹${cRevenue.toLocaleString()}`, icon: "💰", color: t.purple,  bg: `${t.purple}18`,  change: "+8% from last month",   trend: "up",   spark: [90000,95000,100000,105000,110000,115000,120000,122000,125000] },
    { label: "Pending Payments",  val: `₹${cPending.toLocaleString()}`, icon: "⚠️", color: t.danger,  bg: `${t.danger}18`,  change: "5 students pending",    trend: "warn", spark: [12000,11000,10500,10000,9500,9000,8800,8600,8500] },
  ];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: t.text }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12, animation: "slideUp 0.5s ease both" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>🏠 Dashboard</div>
          <div style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Welcome back! Here's what's happening in your hostel today.</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 3, gap: 2 }}>
            {["Week","Month","Year"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: period === p ? t.accent : "transparent", color: period === p ? "#fff" : t.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{p}</button>
            ))}
          </div>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 14px", textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.accent, fontVariantNumeric: "tabular-nums" }}>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div style={{ fontSize: 10, color: t.muted }}>
              {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={card.label}
            style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, position: "relative", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", animation: `slideUp 0.5s ease ${i * 0.08}s both`, cursor: "default" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${card.color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ position: "absolute", top: 0, right: 0, width: 72, height: 72, background: card.bg, borderRadius: "0 16px 0 72px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 12, paddingTop: 12, fontSize: 22 }}>{card.icon}</div>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: card.color, letterSpacing: -1, marginBottom: 4 }}>{card.val}</div>
            <div style={{ fontSize: 11, color: card.trend === "up" ? t.success : card.trend === "warn" ? t.warning : t.danger, marginBottom: 10 }}>
              {card.trend === "up" ? "↑" : "⚠"} {card.change}
            </div>
            <MiniSparkline data={card.spark} color={card.color} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: t.surface, borderRadius: 12, padding: 4, width: "fit-content", border: `1px solid ${t.border}` }}>
        {["overview","activities","notices"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: activeTab === tab ? t.accent : "transparent", color: activeTab === tab ? "#fff" : t.muted, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize" }}>{tab}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, animation: "slideIn 0.3s ease" }}>
          {/* Activities */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>Recent Activities</h3>
              <button onClick={() => setActiveTab("activities")} style={{ fontSize: 12, color: t.accent, background: "none", border: "none", cursor: "pointer" }}>View all →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activities.map((a, i) => (
                <div key={a.id} onClick={() => setExpandedActivity(expandedActivity === a.id ? null : a.id)}
                  style={{ background: t.card, border: `1px solid ${expandedActivity === a.id ? t.accent : t.border}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s", animation: `slideIn 0.3s ease ${i * 0.05}s both` }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                  onMouseLeave={e => { if (expandedActivity !== a.id) e.currentTarget.style.borderColor = t.border; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{a.action}</div>
                      <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{a.details}</div>
                    </div>
                    <span style={{ fontSize: 11, color: t.muted, whiteSpace: "nowrap" }}>{a.time}</span>
                  </div>
                  {expandedActivity === a.id && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}`, fontSize: 12, color: t.muted, display: "flex", gap: 16 }}>
                      <span>Type: <strong style={{ color: a.color }}>Activity</strong></span>
                      <span>Time: <strong style={{ color: t.text }}>{a.time}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Quick Actions */}
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: t.text }}>Quick Actions</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {quickActions.map((qa, i) => (
                  <button key={i} style={{ padding: "14px 10px", borderRadius: 12, border: `1px solid ${qa.color}33`, background: `${qa.color}11`, cursor: "pointer", transition: "all 0.2s", textAlign: "center" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${qa.color}33`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{qa.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: qa.color }}>{qa.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Room Donut */}
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: t.text }}>Room Overview</h3>
              <DonutChart segments={[
                { label: "Occupied",  value: stats.occupiedRooms,                   color: t.accent  },
                { label: "Available", value: stats.totalRooms - stats.occupiedRooms, color: t.success },
              ]} t={t} />
            </div>

            {/* Complaints */}
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: t.text }}>Complaints Status</h3>
              {[
                { label: "Total",    val: stats.totalComplaints,    color: t.accent  },
                { label: "Resolved", val: stats.resolvedComplaints, color: t.success },
                { label: "Pending",  val: pendingComplaints,        color: t.danger  },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${t.border}55` }}>
                  <span style={{ fontSize: 13, color: t.muted }}>{row.label}</span>
                  <strong style={{ fontSize: 14, color: row.color }}>{row.val}</strong>
                </div>
              ))}
              <div style={{ marginTop: 12, height: 6, background: t.border, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${resolvedPct}%`, background: t.success, borderRadius: 4, transition: "width 1s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: t.muted, marginTop: 4, textAlign: "right" }}>{resolvedPct}% resolved</div>
            </div>
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === "activities" && (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, animation: "slideIn 0.3s ease" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: t.text }}>All Activities</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activities.map((a, i) => (
              <div key={a.id}
                style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, animation: `slideIn 0.25s ease ${i * 0.04}s both`, transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${a.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{a.action}</div>
                  <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{a.details}</div>
                </div>
                <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: `${a.color}22`, color: a.color, fontWeight: 600, whiteSpace: "nowrap" }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notices Tab */}
      {activeTab === "notices" && (
        <div style={{ animation: "slideIn 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>📢 Important Notices</h3>
            <span style={{ fontSize: 12, background: `${t.warning}22`, color: t.warning, padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>{notices.length} notices</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {notices.map((n, i) => (
              <div key={n.id}
                style={{ background: t.surface, border: `1px solid ${t.border}`, borderLeft: `4px solid ${priorityColor(n.priority)}`, borderRadius: 14, padding: 18, animation: `slideUp 0.3s ease ${i * 0.08}s both`, transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${priorityColor(n.priority)}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, flex: 1, paddingRight: 8 }}>{n.title}</div>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: `${priorityColor(n.priority)}22`, color: priorityColor(n.priority), fontWeight: 700, flexShrink: 0, textTransform: "capitalize" }}>{n.priority}</span>
                </div>
                <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.6, marginBottom: 10 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: t.muted }}>📅 {n.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
