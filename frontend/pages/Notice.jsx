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

const initialNotices = [
  { id: 1, title: "Hostel Fee Due Reminder", content: "All students are reminded that hostel fees for June 2025 are due by June 5th. Late payment will incur a penalty.", category: "Finance", priority: "High", date: "2025-05-20", author: "Admin", audience: "All Students" },
  { id: 2, title: "Water Supply Interruption", content: "Water supply will be interrupted on May 25th from 10 AM to 2 PM for maintenance work.", category: "Maintenance", priority: "Medium", date: "2025-05-19", author: "Warden", audience: "All Students" },
  { id: 3, title: "Cultural Fest Registration", content: "Registration open for annual cultural fest. Last date: May 30th. Contact the student coordinator.", category: "Event", priority: "Low", date: "2025-05-18", author: "Student Council", audience: "Interested Students" },
  { id: 4, title: "Curfew Time Update", content: "Hostel curfew time has been updated to 10:30 PM effective immediately. All students must comply.", category: "Rules", priority: "High", date: "2025-05-15", author: "Warden", audience: "All Students" },
  { id: 5, title: "Mess Menu Change", content: "New mess menu will be effective from June 1st. The menu has been improved based on student feedback.", category: "Mess Committee", priority: "Low", date: "2025-05-14", author: "Mess Committee", audience: "All Students" },
];
const categoryList = ["Finance", "Maintenance", "Event", "Rules", "Food", "General", "Emergency"];
const priorityList = ["High", "Medium", "Low"];
const audienceList = ["All Students", "Interested Students", "Staff Only", "Specific Floor"];

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


const categoryColor = (cat, t) => ({
  Finance: t.gold, Maintenance: t.warning, Event: t.purple,
  Rules: t.danger, Food: t.success, General: t.accent, Emergency: t.danger,
}[cat] || t.accent);

const categoryIcon = (cat) => ({
  Finance: "💰", Maintenance: "🔧", Event: "🎉",
  Rules: "📜", Food: "🍽️", General: "📢", Emergency: "🚨",
}[cat] || "📢");

const priorityColor = (p, t) => ({ High: t.danger, Medium: t.warning, Low: t.success }[p] || t.muted);

const sparkData = {
  total: [3, 4, 3, 5, 4, 5, 5],
  high: [1, 2, 1, 2, 2, 2, 2],
  week: [1, 0, 2, 1, 2, 1, 3],
  cats: [3, 4, 4, 5, 5, 5, 5],
};

const emptyForm = { title: "", category: "Finance", priority: "High", audience: "All Students", content: "", date: new Date().toISOString().slice(0,10), author: "" };

export default function Notice() {
  const [dark, setDark] = useState(true);
  const t = dark ? darkTheme : lightTheme;
  const [period, setPeriod] = useState("Week");
  const [tab, setTab] = useState("overview");
  const [notices, setNotices] = useState(initialNotices);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data }
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [priFilter, setPriFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [composeForm, setComposeForm] = useState(emptyForm);
  const [composeMsg, setComposeMsg] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [modalForm, setModalForm] = useState(emptyForm);

  const totalCount = useCountUp(notices.length);
  const highCount = useCountUp(notices.filter(n => n.priority === "High").length);
  const weekCount = useCountUp(notices.filter(n => {
    const d = new Date(n.date), now = new Date();
    return (now - d) / 86400000 <= 7;
  }).length);
  const catCount = useCountUp(new Set(notices.map(n => n.category)).size);

  const statCards = [
    { label: "Total Notices", value: totalCount, color: t.accent, spark: sparkData.total },
    { label: "High Priority", value: highCount, color: t.danger, spark: sparkData.high },
    { label: "This Week", value: weekCount, color: t.success, spark: sparkData.week },
    { label: "Categories", value: catCount, color: t.purple, spark: sparkData.cats },
  ];


  const filtered = notices
    .filter(n => catFilter === "All" || n.category === catFilter)
    .filter(n => priFilter === "All" || n.priority === priFilter)
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.author.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "date" ? new Date(b.date) - new Date(a.date) : priorityList.indexOf(a.priority) - priorityList.indexOf(b.priority));

  const openAdd = () => { setModalForm(emptyForm); setModal({ mode: "add" }); };
  const openEdit = (n) => { setModalForm({ ...n }); setModal({ mode: "edit", id: n.id }); };
  const saveModal = () => {
    if (!modalForm.title.trim()) return;
    if (modal.mode === "add") {
      setNotices(prev => [...prev, { ...modalForm, id: Date.now() }]);
    } else {
      setNotices(prev => prev.map(n => n.id === modal.id ? { ...modalForm, id: modal.id } : n));
    }
    setModal(null);
  };
  const confirmDelete = () => {
    setNotices(prev => prev.filter(n => n.id !== deleteId));
    setDeleteId(null);
  };
  const publishNotice = () => {
    if (!composeForm.title.trim() || !composeForm.content.trim()) return;
    setNotices(prev => [...prev, { ...composeForm, id: Date.now() }]);
    setComposeForm(emptyForm);
    setComposeMsg("Notice published successfully!");
    setTimeout(() => setComposeMsg(""), 3000);
  };

  const priorityCounts = priorityList.map(p => ({ p, count: notices.filter(n => n.priority === p).length }));
  const maxPri = Math.max(...priorityCounts.map(x => x.count), 1);

  const s = {
    page: { minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Inter','Segoe UI',sans-serif", padding: "24px", transition: "background 0.3s,color 0.3s" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
    title: { fontSize: "24px", fontWeight: 700, color: t.text, margin: 0 },
    sub: { fontSize: "13px", color: t.subtext, marginTop: "2px" },
    btn: (bg, c="#fff") => ({ background: bg, color: c, border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }),
    toggleBtn: { background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: t.text, fontSize: "13px" },
    periodRow: { display: "flex", gap: "6px" },
    periodBtn: (active) => ({ background: active ? t.accent : t.cardBg, color: active ? "#fff" : t.subtext, border: `1px solid ${active ? t.accent : t.border}`, borderRadius: "6px", padding: "5px 14px", cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "all 0.2s" }),
    statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px", marginBottom: "24px" },
    statCard: (hovered) => ({ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px", cursor: "default", transition: "transform 0.2s,box-shadow 0.2s", transform: hovered ? "translateY(-4px)" : "none", boxShadow: hovered ? `0 8px 24px rgba(0,0,0,0.2)` : "none" }),
    statVal: (c) => ({ fontSize: "32px", fontWeight: 800, color: c, lineHeight: 1 }),
    statLabel: { fontSize: "12px", color: t.subtext, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
    tabs: { display: "flex", gap: "4px", background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "4px", marginBottom: "24px", width: "fit-content" },
    tabBtn: (active) => ({ background: active ? t.accent : "transparent", color: active ? "#fff" : t.subtext, border: "none", borderRadius: "7px", padding: "8px 20px", cursor: "pointer", fontWeight: 600, fontSize: "13px", transition: "all 0.2s", textTransform: "capitalize" }),
    card: { background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px" },
    row: (exp) => ({ background: exp ? t.hover : "transparent", border: `1px solid ${exp ? t.border : "transparent"}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "6px", cursor: "pointer", transition: "background 0.2s" }),
    badge: (c) => ({ background: c + "22", color: c, borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }),
    inputStyle: { background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "9px 12px", color: t.text, fontSize: "14px", width: "100%", outline: "none", boxSizing: "border-box" },
    label: { fontSize: "12px", color: t.subtext, fontWeight: 600, marginBottom: "4px", display: "block" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
    modalBox: { background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "28px", width: "520px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", animation: "slideUp 0.25s ease" },
  };


  const NoticeFormFields = ({ form, setForm }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <label style={s.label}>Title *</label>
        <input style={s.inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notice title..." />
      </div>
      <div style={s.grid2}>
        <div>
          <label style={s.label}>Category</label>
          <select style={s.inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {categoryList.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Priority</label>
          <select style={s.inputStyle} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            {priorityList.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div style={s.grid2}>
        <div>
          <label style={s.label}>Audience</label>
          <select style={s.inputStyle} value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
            {audienceList.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={s.label}>Date</label>
          <input type="date" style={s.inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
      </div>
      <div>
        <label style={s.label}>Author</label>
        <input style={s.inputStyle} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Author name..." />
      </div>
      <div>
        <label style={s.label}>Content *</label>
        <textarea style={{ ...s.inputStyle, minHeight: "100px", resize: "vertical" }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write the notice content here..." />
      </div>
    </div>
  );

  const renderOverview = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Recent Notices</h3>
          <span style={{ fontSize: "12px", color: t.subtext }}>{notices.length} total</span>
        </div>
        {[...notices].sort((a, b) => new Date(b.date) - new Date(a.date)).map(n => (
          <div key={n.id} style={s.row(expanded === n.id)} onClick={() => setExpanded(expanded === n.id ? null : n.id)}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "18px" }}>{categoryIcon(n.category)}</span>
              <span style={{ fontWeight: 600, fontSize: "14px", flex: 1 }}>{n.title}</span>
              <span style={s.badge(categoryColor(n.category, t))}>{n.category}</span>
              <span style={s.badge(priorityColor(n.priority, t))}>{n.priority}</span>
              <span style={{ fontSize: "12px", color: t.subtext }}>{n.date}</span>
              <span style={{ fontSize: "11px", color: t.subtext }}>— {n.author}</span>
              <span style={{ marginLeft: "auto", color: t.subtext, fontSize: "12px" }}>{expanded === n.id ? "▲" : "▼"}</span>
            </div>
            {expanded === n.id && (
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${t.border}`, animation: "slideUp 0.2s ease" }}>
                <p style={{ margin: "0 0 8px", fontSize: "14px", color: t.text, lineHeight: "1.6" }}>{n.content}</p>
                <span style={{ fontSize: "12px", color: t.subtext }}>👥 Audience: <strong style={{ color: t.text }}>{n.audience}</strong></span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={s.card}>
          <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 700 }}>Priority Breakdown</h3>
          {priorityCounts.map(({ p, count }) => (
            <div key={p} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: priorityColor(p, t) }}>{p}</span>
                <span style={{ fontSize: "12px", color: t.subtext }}>{count}</span>
              </div>
              <div style={{ background: t.border, borderRadius: "4px", height: "6px" }}>
                <div style={{ width: `${(count / maxPri) * 100}%`, height: "100%", background: priorityColor(p, t), borderRadius: "4px", transition: "width 0.8s ease" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={s.card}>
          <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 700 }}>Recent Activity</h3>
          {[...notices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((n, i) => (
            <div key={n.id} style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "flex-start" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: categoryColor(n.category, t), marginTop: "3px", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{n.title}</div>
                <div style={{ fontSize: "11px", color: t.subtext }}>{n.date} · {n.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );


  const renderNotices = () => (
    <div style={s.card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1 }}>
          <input style={{ ...s.inputStyle, width: "200px" }} placeholder="Search notices..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={{ ...s.inputStyle, width: "150px" }} value={priFilter} onChange={e => setPriFilter(e.target.value)}>
            <option value="All">All Priority</option>
            {priorityList.map(p => <option key={p}>{p}</option>)}
          </select>
          <select style={{ ...s.inputStyle, width: "130px" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">Sort: Date</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>
        <button style={s.btn(t.accent)} onClick={openAdd}>+ Add Notice</button>
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
        {["All", ...categoryList].map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{ background: catFilter === c ? categoryColor(c === "All" ? "General" : c, t) : t.inputBg, color: catFilter === c ? "#fff" : t.subtext, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "4px 12px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
            {c !== "All" && <span>{categoryIcon(c)} </span>}{c}
          </button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: "center", color: t.subtext, padding: "40px" }}>No notices found.</div>}
      {filtered.map(n => (
        <div key={n.id} style={{ ...s.row(expanded === n.id), position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }} onClick={() => setExpanded(expanded === n.id ? null : n.id)}>
            <span style={{ fontSize: "18px" }}>{categoryIcon(n.category)}</span>
            <span style={{ fontWeight: 600, fontSize: "14px", flex: 1 }}>{n.title}</span>
            <span style={s.badge(categoryColor(n.category, t))}>{n.category}</span>
            <span style={s.badge(priorityColor(n.priority, t))}>{n.priority}</span>
            <span style={{ fontSize: "12px", color: t.subtext }}>{n.date}</span>
            <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
              <button style={s.btn(t.accent + "22", t.accent)} onClick={() => openEdit(n)}>Edit</button>
              <button style={s.btn(t.danger + "22", t.danger)} onClick={() => setDeleteId(n.id)}>Remove</button>
            </div>
          </div>
          {expanded === n.id && (
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${t.border}`, animation: "slideUp 0.2s ease" }}>
              <p style={{ margin: "0 0 8px", fontSize: "14px", color: t.text, lineHeight: "1.6" }}>{n.content}</p>
              <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: t.subtext }}>
                <span>👥 {n.audience}</span><span>✍️ {n.author}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderCompose = () => (
    <div style={{ maxWidth: "680px" }}>
      <div style={{ ...s.card, animation: "slideIn 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <span style={{ fontSize: "24px" }}>📝</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Compose Notice</h3>
            <p style={{ margin: 0, fontSize: "13px", color: t.subtext }}>Create and publish a new notice to students</p>
          </div>
        </div>
        <NoticeFormFields form={composeForm} setForm={setComposeForm} />
        <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={{ ...s.btn(t.accent), padding: "10px 24px", fontSize: "14px" }} onClick={publishNotice}>📢 Publish Notice</button>
          <button style={{ ...s.btn(t.inputBg, t.subtext), padding: "10px 24px", fontSize: "14px", border: `1px solid ${t.border}` }} onClick={() => setComposeForm(emptyForm)}>Clear</button>
          {composeMsg && <span style={{ color: t.success, fontWeight: 600, fontSize: "13px", animation: "slideIn 0.3s ease" }}>✓ {composeMsg}</span>}
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
          <h1 style={s.title}>📋 Notice Board</h1>
          <p style={s.sub}>Manage and publish hostel notices</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={s.periodRow}>
            {["Week","Month","Year"].map(p => (
              <button key={p} style={s.periodBtn(period === p)} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
          <button style={s.toggleBtn} onClick={() => setDark(d => !d)}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
          <button style={s.btn(t.accent)} onClick={openAdd}>+ New Notice</button>
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
        {["overview","notices","compose"].map(tb => (
          <button key={tb} style={s.tabBtn(tab === tb)} onClick={() => setTab(tb)}>{tb.charAt(0).toUpperCase() + tb.slice(1)}</button>
        ))}
      </div>

      <div style={{ animation: "slideIn 0.25s ease" }}>
        {tab === "overview" && renderOverview()}
        {tab === "notices" && renderNotices()}
        {tab === "compose" && renderCompose()}
      </div>

      {modal && (
        <div style={s.backdrop} onClick={() => setModal(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{modal.mode === "add" ? "Add Notice" : "Edit Notice"}</h2>
              <button style={{ background: "none", border: "none", color: t.subtext, fontSize: "20px", cursor: "pointer" }} onClick={() => setModal(null)}>×</button>
            </div>
            <NoticeFormFields form={modalForm} setForm={setModalForm} />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button style={{ ...s.btn(t.inputBg, t.text), border: `1px solid ${t.border}` }} onClick={() => setModal(null)}>Cancel</button>
              <button style={s.btn(t.accent)} onClick={saveModal}>{modal.mode === "add" ? "Add Notice" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={s.backdrop} onClick={() => setDeleteId(null)}>
          <div style={{ ...s.modalBox, width: "380px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>Delete Notice?</h3>
            <p style={{ color: t.subtext, fontSize: "14px", margin: "0 0 20px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button style={{ ...s.btn(t.inputBg, t.text), border: `1px solid ${t.border}` }} onClick={() => setDeleteId(null)}>Cancel</button>
              <button style={s.btn(t.danger)} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
