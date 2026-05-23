import { useState, useEffect } from "react";

const darkTheme = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surfaceAlt: "#22263a",
  border: "#2e3248",
  text: "#e8eaf6",
  textMuted: "#7986cb",
  accent: "#7c6bff",
  accentHover: "#6a5acd",
  success: "#43e97b",
  danger: "#ff5c7c",
  warning: "#ffd166",
  muted: "#8892b0",
  cardShadow: "0 4px 24px rgba(0,0,0,0.4)",
};

const lightTheme = {
  bg: "#f0f2ff",
  surface: "#ffffff",
  surfaceAlt: "#eef0fa",
  border: "#d0d5f0",
  text: "#1a1d3a",
  textMuted: "#5c6bc0",
  accent: "#5c4ef5",
  accentHover: "#4a3ed0",
  success: "#1aaa55",
  danger: "#e53935",
  warning: "#e68a00",
  muted: "#78909c",
  cardShadow: "0 4px 24px rgba(92,78,245,0.08)",
};

const initialComplaints = [
  { id: 1, student: "John Doe", subject: "Room lighting issue", category: "Electrical", status: "Open", submitted: "2025-04-20", priority: "High" },
  { id: 2, student: "Jane Smith", subject: "Mess quality", category: "Food", status: "In Progress", submitted: "2025-04-18", priority: "Medium" },
  { id: 3, student: "Mike Johnson", subject: "Laundry delay", category: "Services", status: "Resolved", submitted: "2025-04-14", priority: "Low" },
  { id: 4, student: "Alice Brown", subject: "Broken window", category: "Maintenance", status: "Open", submitted: "2025-05-01", priority: "High" },
  { id: 5, student: "David Green", subject: "Noise complaint", category: "Discipline", status: "Closed", submitted: "2025-05-10", priority: "Medium" },
];
const studentList = ["John Doe", "Jane Smith", "Mike Johnson", "Alice Brown", "David Green", "Sara Khan"];
const statusList = ["Open", "In Progress", "Resolved", "Closed"];
const categoryList = ["Electrical", "Food", "Services", "Maintenance", "Discipline", "Other"];
const priorityList = ["High", "Medium", "Low"];


function useCountUp(target, duration = 1200) {
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
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${h} ${points} ${w},${h}`} fill={color} fillOpacity="0.13" stroke="none" />
    </svg>
  );
}

function StatCard({ icon, label, value, color, sparkData, trend, t }) {
  const animated = useCountUp(value);
  return (
    <div style={{
      background: t.surface, borderRadius: 16, padding: "20px 24px",
      boxShadow: t.cardShadow, border: `1px solid ${t.border}`,
      display: "flex", flexDirection: "column", gap: 8, flex: "1 1 180px",
      minWidth: 160, animation: "slideUp 0.5s ease"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 26 }}>{icon}</span>
        <span style={{ fontSize: 11, color: trend >= 0 ? t.success : t.danger, fontWeight: 700 }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{animated}</div>
      <div style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>{label}</div>
      <MiniSparkline data={sparkData} color={color} />
    </div>
  );
}


export default function Complaint() {
  const [dark, setDark] = useState(true);
  const t = dark ? darkTheme : lightTheme;
  const [period, setPeriod] = useState("Month");
  const [tab, setTab] = useState("overview");
  const [complaints, setComplaints] = useState(initialComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ student: "", subject: "", category: "", status: "Open", priority: "High", submitted: "" });

  const statusColor = (s) => ({ Open: t.danger, "In Progress": t.warning, Resolved: t.success, Closed: t.muted }[s] || t.muted);
  const priorityColor = (p) => ({ High: t.danger, Medium: t.warning, Low: t.success }[p] || t.muted);

  const total = complaints.length;
  const openCount = complaints.filter(c => c.status === "Open").length;
  const resolvedCount = complaints.filter(c => c.status === "Resolved").length;
  const inProgressCount = complaints.filter(c => c.status === "In Progress").length;

  const filtered = complaints.filter(c => {
    const matchSearch = c.student.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchPriority = priorityFilter === "All" || c.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? { ...item } : { student: studentList[0], subject: "", category: categoryList[0], status: "Open", priority: "High", submitted: new Date().toISOString().slice(0,10) });
    setShowModal(true);
  };

  const saveModal = () => {
    if (!form.subject.trim()) return;
    if (editItem) {
      setComplaints(complaints.map(c => c.id === editItem.id ? { ...form, id: editItem.id } : c));
    } else {
      setComplaints([...complaints, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    setComplaints(complaints.filter(c => c.id !== deleteId));
    setDeleteId(null);
  };

  const monthlyData = [3, 5, 2, 7, 4, 6, 5, 8, 3, 5, 6, total];
  const categories = categoryList.map(cat => ({ name: cat, count: complaints.filter(c => c.category === cat).length }));
  const statusBreakdown = statusList.map(s => ({ name: s, count: complaints.filter(c => c.status === s).length }));

  const btnStyle = (active, color) => ({
    padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
    background: active ? color : t.surfaceAlt, color: active ? "#fff" : t.textMuted, transition: "all 0.2s"
  });

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Inter',sans-serif", padding: "0 0 40px 0" }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        @keyframes slideIn { from { opacity:0; transform:scale(0.96) translateY(16px); } to { opacity:1; transform:none; } }
        .row-hover:hover { background: ${t.surfaceAlt} !important; }
        .complaint-chip:hover { opacity:0.85; }
      `}</style>


      {/* Header */}
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", animation: "slideUp 0.4s ease" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.accent }}>📋 Complaint Management</div>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>Track and resolve student complaints</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: t.surfaceAlt, borderRadius: 20, padding: 3, gap: 2 }}>
            {["Week","Month","Year"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={btnStyle(period===p, t.accent)}>{p}</button>
            ))}
          </div>
          <button onClick={() => setDark(!dark)} style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 20, padding: "7px 16px", cursor: "pointer", color: t.text, fontSize: 18 }}>
            {dark ? "☀️" : "🌙"}
          </button>
          <button onClick={() => openModal()} style={{ background: t.accent, border: "none", borderRadius: 20, padding: "9px 22px", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 14 }}>
            + New Complaint
          </button>
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>
        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 28 }}>
          <StatCard icon="📋" label="Total Complaints" value={total} color={t.accent} sparkData={[3,5,2,7,4,6,total]} trend={8} t={t} />
          <StatCard icon="🔴" label="Open" value={openCount} color={t.danger} sparkData={[1,3,1,2,3,2,openCount]} trend={-5} t={t} />
          <StatCard icon="✅" label="Resolved" value={resolvedCount} color={t.success} sparkData={[1,2,1,3,2,3,resolvedCount]} trend={12} t={t} />
          <StatCard icon="⏳" label="In Progress" value={inProgressCount} color={t.warning} sparkData={[1,2,2,1,2,1,inProgressCount]} trend={3} t={t} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: t.surfaceAlt, borderRadius: 24, padding: 4, width: "fit-content" }}>
          {["overview","complaints","analytics"].map(tb => (
            <button key={tb} onClick={() => setTab(tb)} style={{
              padding: "9px 26px", borderRadius: 20, border: "none", cursor: "pointer",
              background: tab===tb ? t.accent : "transparent", color: tab===tb ? "#fff" : t.textMuted,
              fontWeight: 700, fontSize: 14, transition: "all 0.2s", textTransform: "capitalize"
            }}>{tb.charAt(0).toUpperCase()+tb.slice(1)}</button>
          ))}
        </div>


        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {/* Left: Recent Complaints */}
            <div style={{ flex: "2 1 380px", background: t.surface, borderRadius: 16, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.cardShadow, animation: "slideUp 0.5s ease" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: t.text }}>🕒 Recent Complaints</div>
              {complaints.slice(0,5).map(c => (
                <div key={c.id} style={{ marginBottom: 10 }}>
                  <div onClick={() => setExpandedId(expandedId===c.id ? null : c.id)}
                    style={{ background: t.surfaceAlt, borderRadius: 12, padding: "12px 16px", cursor: "pointer", border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{c.subject}</div>
                      <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{c.student} · {c.submitted}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ background: statusColor(c.status)+"22", color: statusColor(c.status), borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{c.status}</span>
                      <span style={{ background: priorityColor(c.priority)+"22", color: priorityColor(c.priority), borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{c.priority}</span>
                      <span style={{ color: t.textMuted, fontSize: 14, transition: "transform 0.2s", display: "inline-block", transform: expandedId===c.id ? "rotate(180deg)" : "none" }}>▼</span>
                    </div>
                  </div>
                  {expandedId===c.id && (
                    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "12px 16px", animation: "slideUp 0.3s ease" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                        <div><span style={{ color: t.textMuted }}>Category: </span><span style={{ color: t.text, fontWeight: 600 }}>{c.category}</span></div>
                        <div><span style={{ color: t.textMuted }}>Status: </span><span style={{ color: statusColor(c.status), fontWeight: 600 }}>{c.status}</span></div>
                        <div><span style={{ color: t.textMuted }}>Priority: </span><span style={{ color: priorityColor(c.priority), fontWeight: 600 }}>{c.priority}</span></div>
                        <div><span style={{ color: t.textMuted }}>Submitted: </span><span style={{ color: t.text, fontWeight: 600 }}>{c.submitted}</span></div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button onClick={() => openModal(c)} style={{ background: t.accent, border: "none", borderRadius: 8, padding: "6px 16px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Edit</button>
                        <button onClick={() => setDeleteId(c.id)} style={{ background: t.danger+"22", border: "none", borderRadius: 8, padding: "6px 16px", color: t.danger, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Right: Status Breakdown + Category Distribution */}
            <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: t.surface, borderRadius: 16, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.cardShadow, animation: "slideUp 0.55s ease" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: t.text }}>📊 Status Breakdown</div>
                {statusBreakdown.map(s => (
                  <div key={s.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: t.text, fontWeight: 600 }}>{s.name}</span>
                      <span style={{ color: statusColor(s.name), fontWeight: 700 }}>{s.count}</span>
                    </div>
                    <div style={{ background: t.surfaceAlt, borderRadius: 8, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${total ? (s.count/total)*100 : 0}%`, background: statusColor(s.name), height: "100%", borderRadius: 8, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: t.surface, borderRadius: 16, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.cardShadow, animation: "slideUp 0.6s ease" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: t.text }}>🗂️ Category Distribution</div>
                {categories.filter(c => c.count > 0).map((cat, i) => (
                  <div key={cat.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < categories.length-1 ? `1px solid ${t.border}` : "none" }}>
                    <span style={{ fontSize: 13, color: t.text }}>{cat.name}</span>
                    <span style={{ background: t.accent+"22", color: t.accent, borderRadius: 12, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* COMPLAINTS TAB */}
        {tab === "complaints" && (
          <div style={{ background: t.surface, borderRadius: 16, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.cardShadow, animation: "slideUp 0.5s ease" }}>
            {/* Filters */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search by student or subject..."
                style={{ flex: "1 1 200px", background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 14px", color: t.text, fontSize: 14, outline: "none" }}
              />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 14px", color: t.text, fontSize: 14, outline: "none", cursor: "pointer" }}>
                <option value="All">All Status</option>
                {statusList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{ display: "flex", gap: 6 }}>
                {["All",...priorityList].map(p => (
                  <button key={p} className="complaint-chip" onClick={() => setPriorityFilter(p)}
                    style={{ padding: "7px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
                      background: priorityFilter===p ? (p==="All"?t.accent:priorityColor(p)) : t.surfaceAlt,
                      color: priorityFilter===p ? "#fff" : t.textMuted, transition: "all 0.2s" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${t.border}` }}>
                    {["Student","Subject","Category","Status","Priority","Submitted","Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: t.textMuted, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="row-hover" style={{ borderBottom: `1px solid ${t.border}`, transition: "background 0.15s" }}>
                      <td style={{ padding: "11px 12px", color: t.text, fontWeight: 600 }}>{c.student}</td>
                      <td style={{ padding: "11px 12px", color: t.text }}>{c.subject}</td>
                      <td style={{ padding: "11px 12px", color: t.textMuted }}>{c.category}</td>
                      <td style={{ padding: "11px 12px" }}>
                        <span style={{ background: statusColor(c.status)+"22", color: statusColor(c.status), borderRadius: 8, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>{c.status}</span>
                      </td>
                      <td style={{ padding: "11px 12px" }}>
                        <span style={{ background: priorityColor(c.priority)+"22", color: priorityColor(c.priority), borderRadius: 8, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>{c.priority}</span>
                      </td>
                      <td style={{ padding: "11px 12px", color: t.textMuted }}>{c.submitted}</td>
                      <td style={{ padding: "11px 12px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openModal(c)} style={{ background: t.accent+"22", border: "none", borderRadius: 8, padding: "5px 12px", color: t.accent, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Edit</button>
                          <button onClick={() => setDeleteId(c.id)} style={{ background: t.danger+"22", border: "none", borderRadius: 8, padding: "5px 12px", color: t.danger, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: t.textMuted }}>No complaints found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div style={{ animation: "slideUp 0.5s ease" }}>
            {/* Bar Chart: Complaints per Month */}
            <div style={{ background: t.surface, borderRadius: 16, padding: 28, border: `1px solid ${t.border}`, boxShadow: t.cardShadow, marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: t.text }}>📈 Complaints per Month</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140, padding: "0 8px" }}>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((mon, i) => {
                  const val = monthlyData[i] || 0;
                  const maxVal = Math.max(...monthlyData);
                  const h = maxVal ? (val / maxVal) * 120 : 0;
                  return (
                    <div key={mon} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 700 }}>{val}</div>
                      <div style={{ width: "100%", height: h, background: `linear-gradient(180deg, ${t.accent}, ${t.accent}88)`, borderRadius: "6px 6px 0 0", transition: "height 0.8s ease", minHeight: val > 0 ? 6 : 0 }} />
                      <div style={{ fontSize: 11, color: t.textMuted }}>{mon}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* 4 KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18 }}>
              {[
                { label: "Avg Resolution Time", value: "3.2 days", icon: "⏱️", color: t.accent },
                { label: "Resolution Rate", value: `${total ? Math.round((resolvedCount/total)*100) : 0}%`, icon: "✅", color: t.success },
                { label: "High Priority Open", value: complaints.filter(c=>c.priority==="High"&&c.status==="Open").length, icon: "🔴", color: t.danger },
                { label: "Most Common Category", value: categories.sort((a,b)=>b.count-a.count)[0]?.name || "N/A", icon: "🗂️", color: t.warning },
              ].map(kpi => (
                <div key={kpi.label} style={{ background: t.surface, borderRadius: 16, padding: "20px 22px", border: `1px solid ${t.border}`, boxShadow: t.cardShadow }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{kpi.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                  <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4, fontWeight: 600 }}>{kpi.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: t.surface, borderRadius: 20, padding: 32, minWidth: 420, maxWidth: 520, width: "90vw", boxShadow: t.cardShadow, border: `1px solid ${t.border}`, animation: "slideIn 0.35s ease" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text, marginBottom: 20 }}>{editItem ? "✏️ Edit Complaint" : "➕ New Complaint"}</div>
            {[
              { label: "Student", key: "student", type: "select", options: studentList },
              { label: "Subject", key: "subject", type: "text" },
              { label: "Category", key: "category", type: "select", options: categoryList },
              { label: "Status", key: "status", type: "select", options: statusList },
              { label: "Priority", key: "priority", type: "select", options: priorityList },
              { label: "Submitted", key: "submitted", type: "date" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: t.textMuted, fontWeight: 600, display: "block", marginBottom: 5 }}>{field.label}</label>
                {field.type === "select" ? (
                  <select value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})}
                    style={{ width: "100%", background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 12px", color: t.text, fontSize: 14, outline: "none" }}>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={field.type} value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})}
                    style={{ width: "100%", background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 12px", color: t.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 22px", color: t.text, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Cancel</button>
              <button onClick={saveModal} style={{ background: t.accent, border: "none", borderRadius: 10, padding: "9px 22px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: t.surface, borderRadius: 20, padding: 32, minWidth: 320, boxShadow: t.cardShadow, border: `1px solid ${t.border}`, textAlign: "center", animation: "slideIn 0.35s ease" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 8 }}>Delete Complaint?</div>
            <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 24 }}>This action cannot be undone.</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 22px", color: t.text, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Cancel</button>
              <button onClick={confirmDelete} style={{ background: t.danger, border: "none", borderRadius: 10, padding: "9px 22px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
