import { useState, useEffect } from "react";

const darkTheme = {
  bg: "#020617", surface: "#0b1220", card: "#0f172a",
  border: "#1e293b", text: "#f8fafc", muted: "#94a3b8",
  accent: "#3b82f6", success: "#22c55e", danger: "#f87171",
  warning: "#fbbf24", gold: "#f59e0b", purple: "#a855f7",
};
const lightTheme = {
  bg: "#f1f5f9", surface: "#ffffff", card: "#ffffff",
  border: "#e2e8f0", text: "#0f172a", muted: "#475569",
  accent: "#2563eb", success: "#16a34a", danger: "#ef4444",
  warning: "#f59e0b", gold: "#d97706", purple: "#9333ea",
};

function useCountUp(target, duration = 1200, start = false) {
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


const initialRecords = [
  { id: 1, student: "John Doe", date: "2025-05-20", status: "Present" },
  { id: 2, student: "Jane Smith", date: "2025-05-20", status: "Absent" },
  { id: 3, student: "Mike Johnson", date: "2025-05-20", status: "Present" },
  { id: 4, student: "Alice Brown", date: "2025-05-19", status: "Late" },
  { id: 5, student: "David Green", date: "2025-05-19", status: "Present" },
  { id: 6, student: "Sara Khan", date: "2025-05-18", status: "Excused" },
];
const studentList = ["John Doe", "Jane Smith", "Mike Johnson", "Alice Brown", "David Green", "Sara Khan"];
const statusList = ["Present", "Absent", "Late", "Excused"];
const statusColor = (s, t) => s === "Present" ? t.success : s === "Absent" ? t.danger : s === "Late" ? t.warning : t.purple;
const statusIcon = (s) => s === "Present" ? "✅" : s === "Absent" ? "❌" : s === "Late" ? "⏰" : "📋";
const monthlyAttendance = [88, 76, 92, 85, 90, 78, 95, 82, 88, 91, 87, 93];

export default function Attendance() {
  const [dark, setDark] = useState(true);
  const [period, setPeriod] = useState("Month");
  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [records, setRecords] = useState(initialRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({ student: "", date: new Date().toISOString().split("T")[0], status: "Present" });
  const t = dark ? darkTheme : lightTheme;

  useEffect(() => { setTimeout(() => setStarted(true), 100); }, []);

  const total = records.length;
  const present = records.filter(r => r.status === "Present").length;
  const absent = records.filter(r => r.status === "Absent").length;
  const late = records.filter(r => r.status === "Late").length;

  const cTotal = useCountUp(total, 1200, started);
  const cPresent = useCountUp(present, 1200, started);
  const cAbsent = useCountUp(absent, 1200, started);
  const cLate = useCountUp(late, 1200, started);

  const filtered = records
    .filter(r => filterStatus === "all" ? true : r.status === filterStatus)
    .filter(r => r.student.toLowerCase().includes(searchTerm.toLowerCase()) || r.date.includes(searchTerm));

  const handleAdd = () => { setEditing(null); setFormData({ student: "", date: new Date().toISOString().split("T")[0], status: "Present" }); setShowForm(true); };
  const handleEdit = (r) => { setEditing(r); setFormData(r); setShowForm(true); };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) setRecords(records.map(r => r.id === editing.id ? { ...r, ...formData } : r));
    else setRecords([...records, { ...formData, id: Date.now() }]);
    setShowForm(false);
  };
  const handleDelete = (id) => { setRecords(records.filter(r => r.id !== id)); setConfirmDelete(null); };
  const initials = (name) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const statCards = [
    { label: "Total Records", val: cTotal, icon: "📋", color: t.accent, bg: `${t.accent}18`, change: "All time entries", trend: "up", spark: [3,5,4,6,8,7,9,6,5,4,7,8] },
    { label: "Present", val: cPresent, icon: "✅", color: t.success, bg: `${t.success}18`, change: `${total > 0 ? Math.round((present/total)*100) : 0}% attendance rate`, trend: "up", spark: [5,6,7,8,7,8,9,8,9,8,9,10] },
    { label: "Absent", val: cAbsent, icon: "❌", color: t.danger, bg: `${t.danger}18`, change: "Missed days", trend: "down", spark: [3,2,3,2,1,2,1,2,1,1,0,1] },
    { label: "Late / Excused", val: cLate, icon: "⏰", color: t.warning, bg: `${t.warning}18`, change: "Needs follow-up", trend: "warn", spark: [1,2,1,2,3,2,1,2,1,1,2,1] },
  ];


  return (
    <div style={{ background: t.bg, minHeight: "100vh", color: t.text, fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.3s" }}>
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(8px)" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>Attendance</div>
          <div style={{ fontSize: 12, color: t.muted }}>Review and manage student attendance records</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {["Week","Month","Year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: period === p ? t.accent : t.card, color: period === p ? "#fff" : t.muted, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>{p}</button>
          ))}
          <button onClick={() => setDark(!dark)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, cursor: "pointer" }}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
          <button onClick={handleAdd} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: t.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 14px ${t.accent}55` }}>+ Mark Attendance</button>
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          {statCards.map((card, i) => (
            <div key={card.label} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, position: "relative", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", animation: `slideUp 0.5s ease ${i * 0.1}s both` }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${card.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: card.bg, borderRadius: "0 16px 0 80px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 14, paddingTop: 14, fontSize: 24 }}>{card.icon}</div>
              <div style={{ fontSize: 12, color: t.muted, marginBottom: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{card.label}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: card.color, letterSpacing: -1, marginBottom: 6 }}>{card.val}</div>
              <div style={{ fontSize: 12, color: card.trend === "up" ? t.success : card.trend === "down" ? t.danger : t.warning }}>{card.trend === "up" ? "↑" : card.trend === "down" ? "↓" : "⚠"} {card.change}</div>
              <div style={{ marginTop: 12 }}><MiniSparkline data={card.spark} color={card.color} /></div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 2, marginBottom: 20, background: t.surface, borderRadius: 12, padding: 4, width: "fit-content", border: `1px solid ${t.border}` }}>
          {["overview","records","analytics"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: activeTab === tab ? t.accent : "transparent", color: activeTab === tab ? "#fff" : t.muted, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize" }}>{tab}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Records</h3>
                <button onClick={() => setActiveTab("records")} style={{ fontSize: 12, color: t.accent, background: "none", border: "none", cursor: "pointer" }}>View all →</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {["all", ...statusList].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${filterStatus === s ? t.accent : t.border}`, background: filterStatus === s ? `${t.accent}22` : "transparent", color: filterStatus === s ? t.accent : t.muted, fontSize: 12, cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize" }}>{s}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.slice(0, 5).map((r, i) => (
                  <div key={r.id} onClick={() => setExpandedRow(expandedRow === r.id ? null : r.id)}
                    style={{ background: t.card, border: `1px solid ${expandedRow === r.id ? t.accent : t.border}`, borderRadius: 12, padding: "12px 16px", cursor: "pointer", transition: "all 0.2s", animation: `slideIn 0.3s ease ${i * 0.05}s both` }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                    onMouseLeave={e => { if (expandedRow !== r.id) e.currentTarget.style.borderColor = t.border; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${statusColor(r.status, t)}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{statusIcon(r.status)}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{r.student}</div>
                          <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{r.date}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: `${statusColor(r.status, t)}22`, color: statusColor(r.status, t), fontWeight: 600 }}>{r.status}</span>
                    </div>
                    {expandedRow === r.id && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}`, fontSize: 12, color: t.muted, display: "flex", gap: 16 }}>
                        <span>Student: <strong style={{ color: t.text }}>{r.student}</strong></span>
                        <span>Date: <strong style={{ color: t.text }}>{r.date}</strong></span>
                        <span>Status: <strong style={{ color: statusColor(r.status, t) }}>{r.status}</strong></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>Attendance Rate</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {statusList.map(s => {
                    const cnt = records.filter(r => r.status === s).length;
                    const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
                    return (
                      <div key={s}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                          <span style={{ color: t.text }}>{s}</span>
                          <span style={{ color: statusColor(s, t), fontWeight: 600 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 6, background: `${t.border}`, borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: statusColor(s, t), borderRadius: 4, transition: "width 1s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 14px" }}>By Student</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {studentList.map(student => {
                    const studentRecords = records.filter(r => r.student === student);
                    const pPresent = studentRecords.filter(r => r.status === "Present").length;
                    const pct = studentRecords.length > 0 ? Math.round((pPresent / studentRecords.length) * 100) : 0;
                    return (
                      <div key={student} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: t.card, borderRadius: 8, padding: "8px 12px" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${t.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: t.accent }}>{initials(student)}</div>
                          <span style={{ fontSize: 13, color: t.text }}>{student.split(" ")[0]}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: pct >= 75 ? t.success : t.danger }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === "records" && (
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by student or date..." style={{ flex: 1, minWidth: 200, padding: "8px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, outline: "none" }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14 }}>
                <option value="all">All Statuses</option>
                {statusList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {["all", ...statusList].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${filterStatus === s ? t.accent : t.border}`, background: filterStatus === s ? `${t.accent}22` : "transparent", color: filterStatus === s ? t.accent : t.muted, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>{s === "all" ? "All" : s}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((r, i) => (
                <div key={r.id} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: `slideIn 0.25s ease ${i * 0.03}s both`, transition: "border-color 0.2s", flexWrap: "wrap", gap: 10 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${statusColor(r.status, t)}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{statusIcon(r.status)}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{r.student}</div>
                      <div style={{ fontSize: 12, color: t.muted }}>{r.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: `${statusColor(r.status, t)}22`, color: statusColor(r.status, t), fontWeight: 600 }}>{r.status}</span>
                    <button onClick={() => handleEdit(r)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: `${t.accent}22`, color: t.accent, border: "none", cursor: "pointer", fontWeight: 500 }}>Edit</button>
                    <button onClick={() => setConfirmDelete(r)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: `${t.danger}22`, color: t.danger, border: "none", cursor: "pointer", fontWeight: 500 }}>Remove</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: t.muted, fontSize: 14 }}>No records match your filter.</div>}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Monthly Attendance Rate (%)</h3>
                <span style={{ fontSize: 12, color: t.muted }}>FY 2025</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, paddingBottom: 24, minWidth: 480, overflowX: "auto" }}>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                  <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", minWidth: 30 }}>
                    <div style={{ width: "70%", background: `${t.success}99`, borderRadius: "4px 4px 0 0", height: `${(monthlyAttendance[i] / 100) * 96}px`, transition: "all 0.3s" }} />
                    <span style={{ fontSize: 10, color: t.muted }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
            {[
              { label: "Avg Attendance Rate", val: "87%", icon: "📊", color: t.success },
              { label: "Best Month", val: "Jul — 95%", icon: "🏆", color: t.gold },
              { label: "Total Students", val: studentList.length, icon: "👥", color: t.accent },
              { label: "Needs Attention", val: `${records.filter(r => r.status === "Absent").length} absences`, icon: "⚠️", color: t.warning },
            ].map(c => (
              <div key={c.label} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ fontSize: 32 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 12, color: t.muted }}>{c.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.val}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)", padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: 28, width: 420, maxWidth: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{editing ? "Edit Record" : "Mark Attendance"}</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: t.muted, fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: t.muted, marginBottom: 20 }}>{editing ? "Update attendance record" : "Add a new attendance entry"}</div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["Student", "student", "select", studentList], ["Status", "status", "select", statusList]].map(([label, key, type, opts]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 6, fontWeight: 500 }}>{label}</label>
                  <select required value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, outline: "none" }}>
                    {key === "student" && <option value="">Select student</option>}
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 6, fontWeight: 500 }}>Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.text, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: t.accent, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>{editing ? "Update" : "Mark"} ✓</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)", padding: 20 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: 28, width: 360, maxWidth: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Remove Record?</div>
            <div style={{ fontSize: 13, color: t.muted, marginBottom: 20 }}>{confirmDelete.student} · {confirmDelete.date}</div>
            <div style={{ background: `${t.danger}15`, border: `1px solid ${t.danger}55`, borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 13, color: t.danger }}>⚠ This action cannot be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.text, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: t.danger, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        * { box-sizing: border-box; }
        select option { background: ${t.card}; color: ${t.text}; }
        input::placeholder { color: ${t.muted}; }
      `}</style>
    </div>
  );
}
