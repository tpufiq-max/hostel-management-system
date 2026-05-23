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

const initialVisitors = [
  { id: 1, name: "Alice Brown", relation: "Parent", visitingStudent: "John Doe", room: "101", checkIn: "09:30 AM", checkOut: "11:30 AM", status: "Checked Out", date: "2025-05-20", purpose: "Family visit" },
  { id: 2, name: "Ramesh Patel", relation: "Parent", visitingStudent: "Sara Khan", room: "203", checkIn: "02:15 PM", checkOut: null, status: "Checked In", date: "2025-05-20", purpose: "Document submission" },
  { id: 3, name: "Priya Sharma", relation: "Sibling", visitingStudent: "Mike Johnson", room: "103", checkIn: "11:00 AM", checkOut: "01:00 PM", status: "Checked Out", date: "2025-05-19", purpose: "Personal" },
  { id: 4, name: "David Wilson", relation: "Friend", visitingStudent: "Jane Smith", room: "102", checkIn: "04:00 PM", checkOut: null, status: "Checked In", date: "2025-05-19", purpose: "Study group" },
  { id: 5, name: "Sunita Verma", relation: "Guardian", visitingStudent: "Alice Brown", room: "202", checkIn: "10:00 AM", checkOut: "12:00 PM", status: "Checked Out", date: "2025-05-18", purpose: "Fee payment" },
];
const relationList = ["Parent", "Guardian", "Sibling", "Friend", "Relative", "Other"];
const studentList = ["John Doe", "Jane Smith", "Mike Johnson", "Alice Brown", "David Green", "Sara Khan"];
const purposeList = ["Family visit", "Document submission", "Personal", "Study group", "Fee payment", "Medical", "Other"];

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
      <polyline points={`${pad},${h} ${pts} ${w - pad},${h}`} fill={color} fillOpacity="0.12" stroke="none" />
    </svg>
  );
}


const relationColors = { Parent: "#6c63ff", Guardian: "#f59e0b", Sibling: "#22c55e", Friend: "#a855f7", Relative: "#06b6d4", Other: "#64748b" };
const sparkData = {
  total:  [4, 5, 3, 6, 5, 4, 5],
  inside: [1, 2, 1, 2, 2, 1, 2],
  today:  [2, 3, 2, 4, 3, 3, 3],
  out:    [3, 3, 2, 4, 3, 3, 3],
};
const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const visitorsPerDay = [3, 5, 4, 6, 5, 3, 4];

const emptyForm = { name: "", relation: "Parent", visitingStudent: "John Doe", room: "", checkIn: "", checkOut: "", status: "Checked In", purpose: "Family visit", date: new Date().toISOString().slice(0,10) };

const avatarGrad = (name) => {
  const colors = [["#6c63ff","#a855f7"],["#22c55e","#06b6d4"],["#f59e0b","#ef4444"],["#a855f7","#6c63ff"]];
  const idx = name.charCodeAt(0) % colors.length;
  return `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`;
};

export default function Visitor() {
  const [dark, setDark] = useState(true);
  const t = dark ? darkTheme : lightTheme;
  const [period, setPeriod] = useState("Week");
  const [tab, setTab] = useState("overview");
  const [visitors, setVisitors] = useState(initialVisitors);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [relFilter, setRelFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [modalForm, setModalForm] = useState(emptyForm);

  const totalCount = useCountUp(visitors.length);
  const insideCount = useCountUp(visitors.filter(v => v.status === "Checked In").length);
  const todayCount = useCountUp(visitors.filter(v => v.date === "2025-05-20").length);
  const outCount = useCountUp(visitors.filter(v => v.status === "Checked Out").length);

  const statCards = [
    { label: "Total Visitors", value: totalCount, color: t.accent, spark: sparkData.total },
    { label: "Currently Inside", value: insideCount, color: t.success, spark: sparkData.inside },
    { label: "Today's Visits", value: todayCount, color: t.warning, spark: sparkData.today },
    { label: "Checked Out", value: outCount, color: t.purple, spark: sparkData.out },
  ];

  const filtered = visitors
    .filter(v => statusFilter === "All" || v.status === statusFilter)
    .filter(v => relFilter === "All" || v.relation === relFilter)
    .filter(v => {
      if (dateFilter === "today") return v.date === "2025-05-20";
      if (dateFilter === "week") return ["2025-05-14","2025-05-15","2025-05-16","2025-05-17","2025-05-18","2025-05-19","2025-05-20"].includes(v.date);
      return true;
    })
    .filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.visitingStudent.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setModalForm(emptyForm); setModal({ mode: "add" }); };
  const openEdit = (v) => { setModalForm({ ...v }); setModal({ mode: "edit", id: v.id }); };
  const saveModal = () => {
    if (!modalForm.name.trim()) return;
    if (modal.mode === "add") {
      setVisitors(prev => [...prev, { ...modalForm, id: Date.now() }]);
    } else {
      setVisitors(prev => prev.map(v => v.id === modal.id ? { ...modalForm, id: modal.id } : v));
    }
    setModal(null);
  };
  const confirmDelete = () => { setVisitors(prev => prev.filter(v => v.id !== deleteId)); setDeleteId(null); };
  const checkOut = (id) => setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: "Checked Out", checkOut: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : v));

  const relCounts = relationList.map(r => ({ r, count: visitors.filter(v => v.relation === r).length }));

  const s = {
    page: { minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Inter','Segoe UI',sans-serif", padding: "24px", transition: "background 0.3s,color 0.3s" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
    btn: (bg, c="#fff") => ({ background: bg, color: c, border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }),
    toggleBtn: { background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: t.text, fontSize: "13px" },
    periodBtn: (active) => ({ background: active ? t.accent : t.cardBg, color: active ? "#fff" : t.subtext, border: `1px solid ${active ? t.accent : t.border}`, borderRadius: "6px", padding: "5px 14px", cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "all 0.2s" }),
    statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px", marginBottom: "24px" },
    statCard: (hovered) => ({ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px", transition: "transform 0.2s,box-shadow 0.2s", transform: hovered ? "translateY(-4px)" : "none", boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.2)" : "none" }),
    statVal: (c) => ({ fontSize: "32px", fontWeight: 800, color: c, lineHeight: 1 }),
    statLabel: { fontSize: "12px", color: t.subtext, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
    tabs: { display: "flex", gap: "4px", background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "4px", marginBottom: "24px", width: "fit-content" },
    tabBtn: (active) => ({ background: active ? t.accent : "transparent", color: active ? "#fff" : t.subtext, border: "none", borderRadius: "7px", padding: "8px 20px", cursor: "pointer", fontWeight: 600, fontSize: "13px", transition: "all 0.2s" }),
    card: { background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px" },
    row: (exp) => ({ background: exp ? t.hover : "transparent", border: `1px solid ${exp ? t.border : "transparent"}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "6px", cursor: "pointer", transition: "background 0.2s" }),
    badge: (c) => ({ background: c + "22", color: c, borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: 700 }),
    inputStyle: { background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "9px 12px", color: t.text, fontSize: "14px", width: "100%", outline: "none", boxSizing: "border-box" },
    label: { fontSize: "12px", color: t.subtext, fontWeight: 600, marginBottom: "4px", display: "block" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
    modalBox: { background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "28px", width: "520px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", animation: "slideUp 0.25s ease" },
  };


  const VisitorFormFields = ({ form, setForm }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={s.grid2}>
        <div>
          <label style={s.label}>Visitor Name *</label>
          <input style={s.inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name..." />
        </div>
        <div>
          <label style={s.label}>Relation</label>
          <select style={s.inputStyle} value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}>
            {relationList.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div style={s.grid2}>
        <div>
          <label style={s.label}>Visiting Student</label>
          <select style={s.inputStyle} value={form.visitingStudent} onChange={e => setForm(f => ({ ...f, visitingStudent: e.target.value }))}>
            {studentList.map(st => <option key={st}>{st}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Room</label>
          <input style={s.inputStyle} value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} placeholder="Room number..." />
        </div>
      </div>
      <div style={s.grid2}>
        <div>
          <label style={s.label}>Check-In Time</label>
          <input style={s.inputStyle} value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} placeholder="e.g. 09:30 AM" />
        </div>
        <div>
          <label style={s.label}>Check-Out Time (optional)</label>
          <input style={s.inputStyle} value={form.checkOut || ""} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} placeholder="e.g. 11:00 AM" />
        </div>
      </div>
      <div style={s.grid2}>
        <div>
          <label style={s.label}>Status</label>
          <select style={s.inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option>Checked In</option><option>Checked Out</option>
          </select>
        </div>
        <div>
          <label style={s.label}>Date</label>
          <input type="date" style={s.inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
      </div>
      <div>
        <label style={s.label}>Purpose</label>
        <select style={s.inputStyle} value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}>
          {purposeList.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Visitor Log</h3>
          <span style={{ fontSize: "12px", color: t.subtext }}>{visitors.length} total</span>
        </div>
        {[...visitors].sort((a, b) => new Date(b.date) - new Date(a.date)).map(v => {
          const initials = v.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
          return (
            <div key={v.id} style={s.row(expanded === v.id)} onClick={() => setExpanded(expanded === v.id ? null : v.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: avatarGrad(v.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{v.name}</div>
                  <div style={{ fontSize: "12px", color: t.subtext }}>→ {v.visitingStudent}</div>
                </div>
                <span style={{ ...s.badge(relationColors[v.relation] || t.muted) }}>{v.relation}</span>
                <span style={{ ...s.badge(v.status === "Checked In" ? t.success : t.muted) }}>{v.status}</span>
                <span style={{ fontSize: "12px", color: t.subtext }}>{v.checkIn}</span>
                <span style={{ color: t.subtext, fontSize: "12px" }}>{expanded === v.id ? "▲" : "▼"}</span>
              </div>
              {expanded === v.id && (
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${t.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", animation: "slideUp 0.2s ease" }}>
                  <div><span style={{ fontSize: "12px", color: t.subtext }}>Room: </span><strong>{v.room}</strong></div>
                  <div><span style={{ fontSize: "12px", color: t.subtext }}>Check-out: </span><strong>{v.checkOut || "—"}</strong></div>
                  <div><span style={{ fontSize: "12px", color: t.subtext }}>Purpose: </span><strong>{v.purpose}</strong></div>
                  <div><span style={{ fontSize: "12px", color: t.subtext }}>Date: </span><strong>{v.date}</strong></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={s.card}>
          <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 700 }}>🟢 Currently Inside</h3>
          {visitors.filter(v => v.status === "Checked In").length === 0
            ? <p style={{ color: t.subtext, fontSize: "13px" }}>No visitors currently inside.</p>
            : visitors.filter(v => v.status === "Checked In").map(v => (
              <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", background: t.success + "11", borderRadius: "8px", marginBottom: "8px", border: `1px solid ${t.success}33` }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.success }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{v.name}</div>
                  <div style={{ fontSize: "11px", color: t.subtext }}>Room {v.room} · since {v.checkIn}</div>
                </div>
              </div>
            ))
          }
        </div>
        <div style={s.card}>
          <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 700 }}>Relation Breakdown</h3>
          {relCounts.filter(x => x.count > 0).map(({ r, count }) => (
            <div key={r} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: relationColors[r] || t.muted, fontWeight: 600 }}>{r}</span>
              <span style={{ ...s.badge(relationColors[r] || t.muted), fontSize: "12px" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );


  const renderVisitors = () => (
    <div style={s.card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1 }}>
          <input style={{ ...s.inputStyle, width: "200px" }} placeholder="Search visitors..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={{ ...s.inputStyle, width: "150px" }} value={relFilter} onChange={e => setRelFilter(e.target.value)}>
            <option value="All">All Relations</option>
            {relationList.map(r => <option key={r}>{r}</option>)}
          </select>
          <select style={{ ...s.inputStyle, width: "140px" }} value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>
        <button style={s.btn(t.accent)} onClick={openAdd}>+ Register Visitor</button>
      </div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {["All","Checked In","Checked Out"].map(st => (
          <button key={st} onClick={() => setStatusFilter(st)} style={{ background: statusFilter === st ? (st === "Checked In" ? t.success : st === "Checked Out" ? t.muted : t.accent) : t.inputBg, color: statusFilter === st ? "#fff" : t.subtext, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "4px 14px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>{st}</button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: "center", color: t.subtext, padding: "40px" }}>No visitors found.</div>}
      {filtered.map(v => {
        const initials = v.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
        return (
          <div key={v.id} style={s.row(expanded === v.id)}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }} onClick={() => setExpanded(expanded === v.id ? null : v.id)}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: avatarGrad(v.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{v.name}</div>
                <div style={{ fontSize: "12px", color: t.subtext }}>{v.relation} · {v.visitingStudent} · Room {v.room}</div>
              </div>
              <span style={s.badge(v.status === "Checked In" ? t.success : t.muted)}>{v.status}</span>
              <span style={{ fontSize: "12px", color: t.subtext }}>{v.date}</span>
              <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
                {v.status === "Checked In" && <button style={s.btn(t.success + "22", t.success)} onClick={() => checkOut(v.id)}>Check Out</button>}
                <button style={s.btn(t.accent + "22", t.accent)} onClick={() => openEdit(v)}>Edit</button>
                <button style={s.btn(t.danger + "22", t.danger)} onClick={() => setDeleteId(v.id)}>Remove</button>
              </div>
            </div>
            {expanded === v.id && (
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${t.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", animation: "slideUp 0.2s ease" }}>
                <div><span style={{ fontSize: "12px", color: t.subtext }}>Check-In: </span><strong>{v.checkIn}</strong></div>
                <div><span style={{ fontSize: "12px", color: t.subtext }}>Check-Out: </span><strong>{v.checkOut || "—"}</strong></div>
                <div><span style={{ fontSize: "12px", color: t.subtext }}>Purpose: </span><strong>{v.purpose}</strong></div>
                <div><span style={{ fontSize: "12px", color: t.subtext }}>Date: </span><strong>{v.date}</strong></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const maxBar = Math.max(...visitorsPerDay);
  const renderAnalytics = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={s.card}>
        <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700 }}>Visitors Per Day (This Week)</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "120px", padding: "0 8px" }}>
          {visitorsPerDay.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: t.subtext }}>{v}</span>
              <div style={{ width: "100%", background: t.accent, borderRadius: "4px 4px 0 0", height: `${(v / maxBar) * 80}px`, transition: "height 0.6s ease", opacity: 0.85 }} />
              <span style={{ fontSize: "11px", color: t.subtext }}>{weekDays[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px" }}>
        {[
          { label: "Avg Visit Duration", value: "~2h 10m", color: t.accent, icon: "⏱️" },
          { label: "Most Common Relation", value: "Parent", color: t.purple, icon: "👨‍👩‍👧" },
          { label: "Peak Hour", value: "10:00 AM", color: t.warning, icon: "🕙" },
          { label: "Today's Count", value: todayCount, color: t.success, icon: "📅" },
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

  return (
    <div style={s.page}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        select option { background: ${t.cardBg}; color: ${t.text}; }
      `}</style>

      <div style={s.header}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>👥 Visitor Management</h1>
          <p style={{ fontSize: "13px", color: t.subtext, marginTop: "2px" }}>Track and manage hostel visitor logs</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {["Week","Month","Year"].map(p => <button key={p} style={s.periodBtn(period === p)} onClick={() => setPeriod(p)}>{p}</button>)}
          </div>
          <button style={s.toggleBtn} onClick={() => setDark(d => !d)}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
          <button style={s.btn(t.accent)} onClick={openAdd}>+ Register Visitor</button>
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
        {["overview","visitors","analytics"].map(tb => (
          <button key={tb} style={s.tabBtn(tab === tb)} onClick={() => setTab(tb)}>{tb.charAt(0).toUpperCase() + tb.slice(1)}</button>
        ))}
      </div>

      <div style={{ animation: "slideIn 0.25s ease" }}>
        {tab === "overview" && renderOverview()}
        {tab === "visitors" && renderVisitors()}
        {tab === "analytics" && renderAnalytics()}
      </div>

      {modal && (
        <div style={s.backdrop} onClick={() => setModal(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{modal.mode === "add" ? "Register Visitor" : "Edit Visitor"}</h2>
              <button style={{ background: "none", border: "none", color: t.subtext, fontSize: "20px", cursor: "pointer" }} onClick={() => setModal(null)}>×</button>
            </div>
            <VisitorFormFields form={modalForm} setForm={setModalForm} />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button style={{ ...s.btn(t.inputBg, t.text), border: `1px solid ${t.border}` }} onClick={() => setModal(null)}>Cancel</button>
              <button style={s.btn(t.accent)} onClick={saveModal}>{modal.mode === "add" ? "Register" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={s.backdrop} onClick={() => setDeleteId(null)}>
          <div style={{ ...s.modalBox, width: "380px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>Remove Visitor Record?</h3>
            <p style={{ color: t.subtext, fontSize: "14px", margin: "0 0 20px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button style={{ ...s.btn(t.inputBg, t.text), border: `1px solid ${t.border}` }} onClick={() => setDeleteId(null)}>Cancel</button>
              <button style={s.btn(t.danger)} onClick={confirmDelete}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
