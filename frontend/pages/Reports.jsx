import { useState, useEffect } from "react";

const darkTheme = {
  bg: "#0f1117", cardBg: "#1a1d27", border: "#2a2d3e", text: "#e2e8f0",
  subtext: "#8892a4", accent: "#6c63ff", success: "#22c55e", danger: "#ef4444",
  warning: "#f59e0b", purple: "#a855f7", gold: "#eab308", muted: "#64748b",
  inputBg: "#12151f", navBg: "#1a1d27", hover: "#22263a",
};
const lightTheme = {
  bg: "#f0f2f8", cardBg: "#ffffff", border: "#e2e8f0", text: "#1e2433",
  subtext: "#64748b", accent: "#6c63ff", success: "#16a34a", danger: "#dc2626",
  warning: "#d97706", purple: "#9333ea", gold: "#ca8a04", muted: "#94a3b8",
  inputBg: "#f8fafc", navBg: "#ffffff", hover: "#f1f5f9",
};

const reportData = {
  occupancy: { rate: 84, occupied: 12, total: 14 },
  fees: { collected: 98000, pending: 16500, overdue: 12500, collectionRate: 86 },
  complaints: { total: 18, open: 3, resolved: 15 },
  attendance: { rate: 87, present: 245, total: 282 },
  maintenance: { open: 5, inProgress: 2, completed: 28 },
  visitors: { today: 18, thisWeek: 94 },
};
const monthlyOccupancy = [78, 82, 79, 85, 88, 90, 87, 92, 89, 84, 91, 84];
const monthlyFees = [82000, 91000, 78000, 95000, 88000, 97000, 85000, 101000, 92000, 83000, 98000, 98000];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function MiniSparkline({ data, color }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 80, h = 32, pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${pad},${h} ${pts} ${w - pad},${h}`} fill={color} fillOpacity="0.15" stroke="none" />
    </svg>
  );
}


export default function Reports() {
  const [dark, setDark] = useState(true);
  const t = dark ? darkTheme : lightTheme;
  const [period, setPeriod] = useState("Year");
  const [tab, setTab] = useState("overview");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  const occRate = useCountUp(reportData.occupancy.rate);
  const feeRate = useCountUp(reportData.fees.collectionRate);
  const openComplaints = useCountUp(reportData.complaints.open);
  const attRate = useCountUp(reportData.attendance.rate);

  const statCards = [
    { label: "Occupancy Rate", value: occRate + "%", color: t.accent, spark: monthlyOccupancy },
    { label: "Fee Collection Rate", value: feeRate + "%", color: t.success, spark: [82,86,81,88,84,87,83,89,86,83,87,86] },
    { label: "Open Complaints", value: openComplaints, color: t.danger, spark: [4,3,5,4,3,4,3,4,3,4,3,3] },
    { label: "Attendance Rate", value: attRate + "%", color: t.warning, spark: [84,86,83,88,85,87,84,89,86,84,88,87] },
  ];

  const s = {
    page: { minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Inter','Segoe UI',sans-serif", padding: "24px", transition: "background 0.3s,color 0.3s" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
    btn: (bg, c="#fff") => ({ background: bg, color: c, border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }),
    toggleBtn: { background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: t.text, fontSize: "13px" },
    periodBtn: (active) => ({ background: active ? t.accent : t.cardBg, color: active ? "#fff" : t.subtext, border: `1px solid ${active ? t.accent : t.border}`, borderRadius: "6px", padding: "5px 14px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }),
    statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px", marginBottom: "24px" },
    statCard: (hovered) => ({ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px", transition: "transform 0.2s,box-shadow 0.2s", transform: hovered ? "translateY(-4px)" : "none", boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.2)" : "none" }),
    statVal: (c) => ({ fontSize: "32px", fontWeight: 800, color: c, lineHeight: 1 }),
    statLabel: { fontSize: "12px", color: t.subtext, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
    tabs: { display: "flex", gap: "4px", background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "4px", marginBottom: "24px", width: "fit-content" },
    tabBtn: (active) => ({ background: active ? t.accent : "transparent", color: active ? "#fff" : t.subtext, border: "none", borderRadius: "7px", padding: "8px 20px", cursor: "pointer", fontWeight: 600, fontSize: "13px", transition: "all 0.2s" }),
    card: { background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px" },
    bigVal: (c) => ({ fontSize: "40px", fontWeight: 900, color: c, lineHeight: 1 }),
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  };

  const reportCards = [
    {
      icon: "🏠", title: "Occupancy", color: t.accent,
      main: `${reportData.occupancy.rate}%`, sub: `${reportData.occupancy.occupied}/${reportData.occupancy.total} rooms occupied`,
      spark: monthlyOccupancy,
    },
    {
      icon: "💰", title: "Fee Collection", color: t.success,
      main: `${reportData.fees.collectionRate}%`, sub: `₹${reportData.fees.collected.toLocaleString()} collected`,
      spark: [82,86,81,88,84,87,83,89,86,83,87,86],
    },
    {
      icon: "📣", title: "Complaints", color: t.danger,
      main: reportData.complaints.total, sub: `${reportData.complaints.open} open · ${reportData.complaints.resolved} resolved`,
      spark: [4,3,5,4,3,4,3,4,3,4,3,3],
    },
    {
      icon: "📊", title: "Attendance", color: t.warning,
      main: `${reportData.attendance.rate}%`, sub: `${reportData.attendance.present}/${reportData.attendance.total} present`,
      spark: [84,86,83,88,85,87,84,89,86,84,88,87],
    },
    {
      icon: "🔧", title: "Maintenance", color: t.purple,
      main: reportData.maintenance.completed, sub: `${reportData.maintenance.open} open · ${reportData.maintenance.inProgress} in progress`,
      spark: [3,4,3,5,4,4,3,5,4,3,4,4],
    },
    {
      icon: "👥", title: "Visitors", color: t.gold,
      main: reportData.visitors.thisWeek, sub: `${reportData.visitors.today} today · ${reportData.visitors.thisWeek} this week`,
      spark: [3,5,4,6,5,3,4,5,4,3,5,4],
    },
  ];


  const renderOverview = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "20px" }}>
      {reportCards.map((rc, i) => (
        <div key={i} style={{ ...s.card, display: "flex", flexDirection: "column", gap: "14px", animation: "slideIn 0.3s ease", animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>{rc.icon}</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: t.text }}>{rc.title}</span>
            </div>
            <MiniSparkline data={rc.spark} color={rc.color} />
          </div>
          <div style={s.bigVal(rc.color)}>{rc.main}</div>
          <div style={{ fontSize: "13px", color: t.subtext }}>{rc.sub}</div>
        </div>
      ))}
    </div>
  );

  const maxFee = Math.max(...monthlyFees);
  const renderFinancial = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={s.card}>
        <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700 }}>📈 Monthly Fee Collection (₹)</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "160px" }}>
          {monthlyFees.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              {hoveredBar === i && (
                <div style={{ background: t.accent, color: "#fff", borderRadius: "4px", padding: "2px 6px", fontSize: "10px", fontWeight: 700, whiteSpace: "nowrap" }}>₹{(v/1000).toFixed(0)}k</div>
              )}
              <div
                style={{ width: "100%", background: hoveredBar === i ? t.accent : t.accent + "bb", borderRadius: "4px 4px 0 0", height: `${(v / maxFee) * 120}px`, transition: "height 0.6s ease, background 0.2s", cursor: "pointer" }}
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              />
              <span style={{ fontSize: "10px", color: t.subtext }}>{months[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px" }}>
        {[
          { label: "Total Collected", value: `₹${reportData.fees.collected.toLocaleString()}`, color: t.success, icon: "✅" },
          { label: "Pending", value: `₹${reportData.fees.pending.toLocaleString()}`, color: t.warning, icon: "⏳" },
          { label: "Overdue", value: `₹${reportData.fees.overdue.toLocaleString()}`, color: t.danger, icon: "🚨" },
          { label: "Collection Rate", value: `${reportData.fees.collectionRate}%`, color: t.accent, icon: "📊" },
        ].map((kpi, i) => (
          <div key={i} style={{ ...s.card, display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "24px" }}>{kpi.icon}</div>
            <div style={{ fontSize: "12px", color: t.subtext, fontWeight: 600, textTransform: "uppercase" }}>{kpi.label}</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const donutStroke = (value, total, color, r = 40) => {
    const circ = 2 * Math.PI * r;
    const dash = (value / total) * circ;
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke={t.border} strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x="50" y="55" textAnchor="middle" fill={color} fontSize="16" fontWeight="bold" style={{ transform: "rotate(90deg)", transformOrigin: "50px 50px" }}>{value}</text>
      </svg>
    );
  };

  const renderOperations = () => (
    <div style={s.grid2}>
      <div style={s.card}>
        <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700 }}>🔧 Maintenance</h3>
        {[
          { label: "Open", value: reportData.maintenance.open, color: t.danger, max: 10 },
          { label: "In Progress", value: reportData.maintenance.inProgress, color: t.warning, max: 10 },
          { label: "Completed", value: reportData.maintenance.completed, color: t.success, max: 35 },
        ].map(m => (
          <div key={m.label} style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: m.color }}>{m.label}</span>
              <span style={{ fontSize: "12px", color: t.subtext }}>{m.value}</span>
            </div>
            <div style={{ background: t.border, borderRadius: "4px", height: "8px" }}>
              <div style={{ width: `${(m.value / m.max) * 100}%`, height: "100%", background: m.color, borderRadius: "4px", transition: "width 0.8s ease" }} />
            </div>
          </div>
        ))}
      </div>
      <div style={s.card}>
        <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700 }}>📊 Attendance</h3>
        <div style={{ fontSize: "48px", fontWeight: 900, color: t.warning }}>{reportData.attendance.rate}%</div>
        <p style={{ color: t.subtext, fontSize: "14px", margin: "4px 0 0" }}>{reportData.attendance.present} present out of {reportData.attendance.total} students</p>
        <div style={{ background: t.border, borderRadius: "4px", height: "10px", marginTop: "14px" }}>
          <div style={{ width: `${reportData.attendance.rate}%`, height: "100%", background: t.warning, borderRadius: "4px", transition: "width 0.8s ease" }} />
        </div>
      </div>
      <div style={s.card}>
        <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700 }}>👥 Visitors</h3>
        <div style={{ display: "flex", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "13px", color: t.subtext, fontWeight: 600 }}>TODAY</div>
            <div style={{ fontSize: "36px", fontWeight: 800, color: t.accent }}>{reportData.visitors.today}</div>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: t.subtext, fontWeight: 600 }}>THIS WEEK</div>
            <div style={{ fontSize: "36px", fontWeight: 800, color: t.purple }}>{reportData.visitors.thisWeek}</div>
          </div>
        </div>
        <MiniSparkline data={[3,5,4,6,5,3,4,5,4,3,5,4]} color={t.accent} />
      </div>
      <div style={s.card}>
        <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700 }}>📣 Complaints</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {donutStroke(reportData.complaints.resolved, reportData.complaints.total, t.success)}
          <div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: t.success, marginRight: "6px" }} />
              <span style={{ fontSize: "13px" }}>Resolved: <strong style={{ color: t.success }}>{reportData.complaints.resolved}</strong></span>
            </div>
            <div>
              <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: t.danger, marginRight: "6px" }} />
              <span style={{ fontSize: "13px" }}>Open: <strong style={{ color: t.danger }}>{reportData.complaints.open}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div style={s.page}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        select option { background: ${t.cardBg}; color: ${t.text}; }
      `}</style>

      <div style={s.header}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>📊 Reports & Analytics</h1>
          <p style={{ fontSize: "13px", color: t.subtext, marginTop: "2px" }}>Hostel performance overview and statistics</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {["Week","Month","Year"].map(p => <button key={p} style={s.periodBtn(period === p)} onClick={() => setPeriod(p)}>{p}</button>)}
          </div>
          <button style={s.toggleBtn} onClick={() => setDark(d => !d)}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
          <button
            style={{ ...s.btn(t.success), padding: "8px 18px" }}
            onClick={() => alert("Report downloaded!")}
          >
            ⬇️ Download Report
          </button>
        </div>
      </div>

      <div style={s.statGrid}>
        {statCards.map((c, i) => (
          <div key={i} style={s.statCard(hoveredCard === i)} onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}>
            <div style={s.statLabel}>{c.label}</div>
            <div style={s.statVal(c.color)}>{c.value}</div>
            <MiniSparkline data={c.spark} color={c.color} />
          </div>
        ))}
      </div>

      <div style={s.tabs}>
        {["overview","financial","operations"].map(tb => (
          <button key={tb} style={s.tabBtn(tab === tb)} onClick={() => setTab(tb)}>{tb.charAt(0).toUpperCase() + tb.slice(1)}</button>
        ))}
      </div>

      <div style={{ animation: "slideIn 0.25s ease" }}>
        {tab === "overview" && renderOverview()}
        {tab === "financial" && renderFinancial()}
        {tab === "operations" && renderOperations()}
      </div>
    </div>
  );
}
