import { useState, useEffect } from "react";

// ── themes ────────────────────────────────────────────────────────────────────
const darkTheme = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3e", text: "#e2e8f0",
  subtext: "#94a3b8", input: "#12151f", accent: "#6366f1",
  accentHover: "#4f46e5", danger: "#ef4444", warning: "#f59e0b",
  success: "#10b981", gold: "#f59e0b", purple: "#8b5cf6",
  toggleBg: "#1e2130", headerBg: "#13161f", shadow: "0 4px 24px rgba(0,0,0,0.4)",
};
const lightTheme = {
  bg: "#f1f5f9", card: "#ffffff", border: "#e2e8f0", text: "#1e293b",
  subtext: "#64748b", input: "#f8fafc", accent: "#6366f1",
  accentHover: "#4f46e5", danger: "#ef4444", warning: "#f59e0b",
  success: "#10b981", gold: "#f59e0b", purple: "#8b5cf6",
  toggleBg: "#e2e8f0", headerBg: "#ffffff", shadow: "0 4px 24px rgba(0,0,0,0.08)",
};

// ── data ──────────────────────────────────────────────────────────────────────
const initialRequests = [
  { id: 1, title: "Leaking Faucet", description: "Bathroom faucet leaking", room: "101", priority: "High", status: "In Progress", category: "Plumbing", reportedBy: "Rahul Kumar", reportedDate: "2025-05-15", assignedTo: "John - Staff" },
  { id: 2, title: "AC Not Cooling", description: "AC running but not cooling", room: "205", priority: "High", status: "Open", category: "Electrical", reportedBy: "Priya Sharma", reportedDate: "2025-05-18", assignedTo: null },
  { id: 3, title: "Broken Door Lock", description: "Main door lock broken", room: "310", priority: "Medium", status: "Open", category: "Hardware", reportedBy: "Aditya Patel", reportedDate: "2025-05-17", assignedTo: null },
  { id: 4, title: "Light Bulb Replacement", description: "Two bulbs need replacement", room: "215", priority: "Low", status: "Completed", category: "Electrical", reportedBy: "Neha Singh", reportedDate: "2025-05-10", assignedTo: "Mike - Staff" },
  { id: 5, title: "Clogged Drain", description: "Bathroom drain clogged", room: "103", priority: "Medium", status: "Open", category: "Plumbing", reportedBy: "Vikram Das", reportedDate: "2025-05-19", assignedTo: null },
];
const categoryList = ["Plumbing", "Electrical", "Hardware", "Cleaning", "Carpentry", "Other"];
const priorityList = ["High", "Medium", "Low"];
const statusList = ["Open", "In Progress", "Completed"];

const monthlyData = [
  { month: "Jan", count: 8 }, { month: "Feb", count: 12 }, { month: "Mar", count: 7 },
  { month: "Apr", count: 15 }, { month: "May", count: 10 }, { month: "Jun", count: 5 },
  { month: "Jul", count: 9 }, { month: "Aug", count: 14 }, { month: "Sep", count: 11 },
  { month: "Oct", count: 6 }, { month: "Nov", count: 13 }, { month: "Dec", count: 8 },
];

const sparkData = {
  accent: [3,5,4,7,6,8,9],
  danger: [5,4,6,3,7,4,5],
  warning: [2,4,3,5,4,6,3],
  success: [1,3,2,4,3,5,4],
};

// ── useCountUp hook ───────────────────────────────────────────────────────────
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


// ── MiniSparkline ─────────────────────────────────────────────────────────────
function MiniSparkline({ data, color }) {
  const w = 80, h = 32, pad = 2;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
      <circle cx={pts.split(" ").pop().split(",")[0]}
        cy={pts.split(" ").pop().split(",")[1]}
        r="3" fill={color} />
    </svg>
  );
}

// ── helper badge styles ───────────────────────────────────────────────────────
function priorityColor(p, t) {
  if (p === "High") return t.danger;
  if (p === "Medium") return t.warning;
  return t.success;
}
function statusColor(s, t) {
  if (s === "Open") return t.danger;
  if (s === "In Progress") return t.warning;
  return t.success;
}
function priorityIcon(p) {
  if (p === "High") return "🔴";
  if (p === "Medium") return "🟡";
  return "🟢";
}
function badge(label, color) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600,
    }}>{label}</span>
  );
}


// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, sparkKey, t }) {
  const animated = useCountUp(value);
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`, borderRadius: 16,
      padding: "20px 24px", flex: "1 1 160px", minWidth: 150,
      boxShadow: t.shadow, display: "flex", flexDirection: "column", gap: 8,
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 13, color: t.subtext, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{animated}</div>
      <MiniSparkline data={sparkData[sparkKey]} color={color} />
    </div>
  );
}

// ── Modal backdrop ────────────────────────────────────────────────────────────
function Backdrop({ children, onClose, t }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(4px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: t.card, border: `1px solid ${t.border}`, borderRadius: 18,
        padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        animation: "slideUp 0.25s ease",
      }}>
        {children}
      </div>
    </div>
  );
}

// ── input style helper ────────────────────────────────────────────────────────
function inputStyle(t) {
  return {
    width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
    background: t.input, border: `1px solid ${t.border}`, color: t.text,
    outline: "none", boxSizing: "border-box",
  };
}
function labelStyle(t) {
  return { fontSize: 13, fontWeight: 600, color: t.subtext, display: "block", marginBottom: 4 };
}


// ── AddEditModal ──────────────────────────────────────────────────────────────
function AddEditModal({ item, onSave, onClose, t }) {
  const empty = { title: "", description: "", room: "", category: "Plumbing", priority: "Medium", status: "Open", assignedTo: "" };
  const [form, setForm] = useState(item || empty);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Backdrop onClose={onClose} t={t}>
      <div style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 20 }}>
        {item ? "Edit Request" : "New Maintenance Request"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle(t)}>Title</label>
          <input style={inputStyle(t)} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Leaking Faucet" />
        </div>
        <div>
          <label style={labelStyle(t)}>Description</label>
          <textarea style={{ ...inputStyle(t), minHeight: 72, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the issue..." />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle(t)}>Room</label>
            <input style={inputStyle(t)} value={form.room} onChange={e => set("room", e.target.value)} placeholder="e.g. 101" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle(t)}>Category</label>
            <select style={inputStyle(t)} value={form.category} onChange={e => set("category", e.target.value)}>
              {categoryList.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle(t)}>Priority</label>
            <select style={inputStyle(t)} value={form.priority} onChange={e => set("priority", e.target.value)}>
              {priorityList.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle(t)}>Status</label>
            <select style={inputStyle(t)} value={form.status} onChange={e => set("status", e.target.value)}>
              {statusList.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle(t)}>Assigned To (optional)</label>
          <input style={inputStyle(t)} value={form.assignedTo || ""} onChange={e => set("assignedTo", e.target.value)} placeholder="e.g. John - Staff" />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 4, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: t.accent, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Save</button>
        </div>
      </div>
    </Backdrop>
  );
}


// ── DeleteModal ───────────────────────────────────────────────────────────────
function DeleteModal({ item, onConfirm, onClose, t }) {
  return (
    <Backdrop onClose={onClose} t={t}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 8 }}>Delete Request?</div>
        <div style={{ color: t.subtext, marginBottom: 24, fontSize: 14 }}>
          Are you sure you want to delete <strong style={{ color: t.text }}>"{item.title}"</strong>? This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "10px 26px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "10px 26px", borderRadius: 10, border: "none", background: t.danger, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Delete</button>
        </div>
      </div>
    </Backdrop>
  );
}


// ── OverviewTab ───────────────────────────────────────────────────────────────
function OverviewTab({ requests, t }) {
  const [expanded, setExpanded] = useState(null);
  const toggle = id => setExpanded(e => e === id ? null : id);

  const statusGroups = statusList.map(s => ({ status: s, count: requests.filter(r => r.status === s).length }));
  const total = requests.length;
  const catGroups = categoryList.map(c => ({ cat: c, count: requests.filter(r => r.category === c).length })).filter(c => c.count > 0);

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {/* Left: recent requests */}
      <div style={{ flex: "2 1 380px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 14 }}>Recent Requests</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {requests.slice(0, 5).map(r => (
            <div key={r.id} style={{
              background: t.card, border: `1px solid ${t.border}`, borderRadius: 14,
              overflow: "hidden", boxShadow: t.shadow, animation: "slideIn 0.3s ease",
            }}>
              <div onClick={() => toggle(r.id)} style={{
                padding: "14px 18px", cursor: "pointer", display: "flex",
                alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <span style={{ fontSize: 16 }}>{priorityIcon(r.priority)}</span>
                <span style={{ fontWeight: 600, color: t.text, flex: 1, minWidth: 120 }}>{r.title}</span>
                <span style={{ background: t.accent + "22", color: t.accent, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>Rm {r.room}</span>
                {badge(r.priority, priorityColor(r.priority, t))}
                {badge(r.status, statusColor(r.status, t))}
                <span style={{ background: t.border, color: t.subtext, borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>{r.category}</span>
                <span style={{ color: t.subtext, fontSize: 16, marginLeft: "auto" }}>{expanded === r.id ? "▲" : "▼"}</span>
              </div>
              {expanded === r.id && (
                <div style={{ padding: "0 18px 16px", borderTop: `1px solid ${t.border}`, paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><span style={{ color: t.subtext, fontSize: 12 }}>Description: </span><span style={{ color: t.text, fontSize: 13 }}>{r.description}</span></div>
                  <div><span style={{ color: t.subtext, fontSize: 12 }}>Reported By: </span><span style={{ color: t.text, fontSize: 13 }}>{r.reportedBy}</span></div>
                  <div><span style={{ color: t.subtext, fontSize: 12 }}>Reported Date: </span><span style={{ color: t.text, fontSize: 13 }}>{r.reportedDate}</span></div>
                  <div><span style={{ color: t.subtext, fontSize: 12 }}>Assigned To: </span><span style={{ color: t.text, fontSize: 13 }}>{r.assignedTo || "Unassigned"}</span></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Right: breakdowns */}
      <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "18px 20px", boxShadow: t.shadow }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 14 }}>Status Breakdown</div>
          {statusGroups.map(sg => (
            <div key={sg.status} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{sg.status}</span>
                <span style={{ fontSize: 13, color: t.subtext }}>{sg.count}</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: t.border, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  background: statusColor(sg.status, t),
                  width: `${total ? (sg.count / total) * 100 : 0}%`,
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "18px 20px", boxShadow: t.shadow }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 12 }}>By Category</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {catGroups.map(cg => (
              <div key={cg.cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: t.text }}>{cg.cat}</span>
                <span style={{ background: t.accent + "22", color: t.accent, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{cg.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// ── RequestsTab ───────────────────────────────────────────────────────────────
function RequestsTab({ requests, onEdit, onDelete, t }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.room.includes(q) || r.reportedBy.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchPriority = priorityFilter === "All" || r.priority === priorityFilter;
    const matchCat = catFilter === "All" || r.category === catFilter;
    return matchSearch && matchStatus && matchPriority && matchCat;
  });

  const chipStyle = (active, color) => ({
    padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: active ? "none" : `1px solid ${color}44`,
    background: active ? color : color + "18",
    color: active ? "#fff" : color,
    transition: "all 0.2s",
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search by title, room, reporter…"
          style={{ ...inputStyle(t), flex: "1 1 200px", maxWidth: 300 }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inputStyle(t), maxWidth: 160 }}>
          <option>All</option>
          {categoryList.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        {["All", ...statusList].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={chipStyle(statusFilter === s, s === "All" ? t.accent : statusColor(s, t))}>
            {s}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["All", ...priorityList].map(p => (
          <button key={p} onClick={() => setPriorityFilter(p)}
            style={chipStyle(priorityFilter === p, p === "All" ? t.accent : priorityColor(p, t))}>
            {p}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: t.subtext }}>No requests match your filters.</div>
        )}
        {filtered.map(r => (
          <div key={r.id} style={{
            background: t.card, border: `1px solid ${t.border}`, borderRadius: 12,
            padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
            flexWrap: "wrap", boxShadow: t.shadow, animation: "slideIn 0.25s ease",
          }}>
            <span style={{ fontSize: 15 }}>{priorityIcon(r.priority)}</span>
            <div style={{ flex: "2 1 160px" }}>
              <div style={{ fontWeight: 600, color: t.text, fontSize: 14 }}>{r.title}</div>
              <div style={{ color: t.subtext, fontSize: 12, marginTop: 2 }}>{r.reportedBy} · {r.reportedDate}</div>
            </div>
            <span style={{ background: t.accent + "22", color: t.accent, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>Rm {r.room}</span>
            {badge(r.priority, priorityColor(r.priority, t))}
            {badge(r.status, statusColor(r.status, t))}
            <span style={{ color: t.subtext, fontSize: 12, flex: "1 1 80px" }}>{r.category}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onEdit(r)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.accent}44`, background: t.accent + "18", color: t.accent, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Edit</button>
              <button onClick={() => onDelete(r)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.danger}44`, background: t.danger + "18", color: t.danger, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── AnalyticsTab ──────────────────────────────────────────────────────────────
function AnalyticsTab({ requests, t }) {
  const maxCount = Math.max(...monthlyData.map(m => m.count));
  const openRate = requests.length ? Math.round((requests.filter(r => r.status === "Open").length / requests.length) * 100) : 0;
  const completed = requests.filter(r => r.status === "Completed").length;
  const catCounts = categoryList.map(c => ({ c, n: requests.filter(r => r.category === c).length }));
  const topCat = catCounts.sort((a, b) => b.n - a.n)[0]?.c || "N/A";
  const thisMonth = requests.filter(r => r.reportedDate?.startsWith("2025-05")).length;

  const kpiCards = [
    { label: "Open Rate", value: `${openRate}%`, color: t.danger, icon: "📊" },
    { label: "Avg Resolution", value: `${completed > 0 ? "2.4d" : "N/A"}`, color: t.success, icon: "⏱️" },
    { label: "Most Common", value: topCat, color: t.accent, icon: "📂" },
    { label: "Total This Month", value: String(thisMonth), color: t.warning, icon: "📅" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Bar chart */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "24px 28px", boxShadow: t.shadow }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 20 }}>Requests Per Month</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140, overflowX: "auto" }}>
          {monthlyData.map(m => (
            <div key={m.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: "1 1 40px", minWidth: 40 }}>
              <div style={{ fontSize: 11, color: t.subtext }}>{m.count}</div>
              <div style={{
                width: "100%", maxWidth: 40,
                height: `${(m.count / maxCount) * 110}px`,
                background: `linear-gradient(to top, ${t.accent}, ${t.accent}88)`,
                borderRadius: "6px 6px 0 0",
                transition: "height 0.8s ease",
                minHeight: 4,
              }} />
              <div style={{ fontSize: 11, color: t.subtext }}>{m.month}</div>
            </div>
          ))}
        </div>
      </div>
      {/* KPI cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {kpiCards.map(k => (
          <div key={k.label} style={{
            flex: "1 1 160px", background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 14, padding: "20px", boxShadow: t.shadow, borderTop: `3px solid ${k.color}`,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: t.subtext, marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function Maintenance() {
  const [dark, setDark] = useState(true);
  const [period, setPeriod] = useState("Month");
  const [activeTab, setActiveTab] = useState("overview");
  const [requests, setRequests] = useState(initialRequests);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const t = dark ? darkTheme : lightTheme;

  const stats = {
    total: requests.length,
    open: requests.filter(r => r.status === "Open").length,
    inProgress: requests.filter(r => r.status === "In Progress").length,
    completed: requests.filter(r => r.status === "Completed").length,
  };

  function handleSave(form) {
    if (editItem) {
      setRequests(rs => rs.map(r => r.id === editItem.id ? { ...r, ...form } : r));
      setEditItem(null);
    } else {
      setRequests(rs => [...rs, { ...form, id: Date.now(), reportedDate: new Date().toISOString().slice(0, 10), reportedBy: "Admin" }]);
      setShowAdd(false);
    }
  }
  function handleDelete() {
    setRequests(rs => rs.filter(r => r.id !== deleteItem.id));
    setDeleteItem(null);
  }

  const tabs = ["overview", "requests", "analytics"];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Inter', sans-serif", transition: "background 0.3s" }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-18px); } to { opacity:1; transform:translateX(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>🔧 Maintenance</div>
          <div style={{ fontSize: 13, color: t.subtext }}>Track and manage hostel maintenance requests</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {/* Period selector */}
          <div style={{ display: "flex", background: t.toggleBg, borderRadius: 10, padding: 3, gap: 2 }}>
            {["Week", "Month", "Year"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: period === p ? t.accent : "transparent",
                color: period === p ? "#fff" : t.subtext,
                transition: "all 0.2s",
              }}>{p}</button>
            ))}
          </div>
          {/* Dark/Light toggle */}
          <button onClick={() => setDark(d => !d)} style={{
            padding: "8px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.toggleBg,
            color: t.text, cursor: "pointer", fontWeight: 600, fontSize: 14,
          }}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
          <button onClick={() => setShowAdd(true)} style={{
            padding: "9px 20px", borderRadius: 10, border: "none", background: t.accent,
            color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14,
          }}>+ Add Request</button>
        </div>
      </div>


      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <StatCard label="Total Requests" value={stats.total} color={t.accent} sparkKey="accent" t={t} />
          <StatCard label="Open" value={stats.open} color={t.danger} sparkKey="danger" t={t} />
          <StatCard label="In Progress" value={stats.inProgress} color={t.warning} sparkKey="warning" t={t} />
          <StatCard label="Completed" value={stats.completed} color={t.success} sparkKey="success" t={t} />
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: t.toggleBg, borderRadius: 12, padding: 4, width: "fit-content" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "9px 22px", borderRadius: 9, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 14, textTransform: "capitalize",
              background: activeTab === tab ? t.accent : "transparent",
              color: activeTab === tab ? "#fff" : t.subtext,
              transition: "all 0.2s",
            }}>{tab}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ animation: "slideUp 0.3s ease" }}>
          {activeTab === "overview" && <OverviewTab requests={requests} t={t} />}
          {activeTab === "requests" && <RequestsTab requests={requests} onEdit={r => setEditItem(r)} onDelete={r => setDeleteItem(r)} t={t} />}
          {activeTab === "analytics" && <AnalyticsTab requests={requests} t={t} />}
        </div>
      </div>

      {/* Modals */}
      {(showAdd || editItem) && (
        <AddEditModal
          item={editItem}
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setEditItem(null); }}
          t={t}
        />
      )}
      {deleteItem && (
        <DeleteModal item={deleteItem} onConfirm={handleDelete} onClose={() => setDeleteItem(null)} t={t} />
      )}
    </div>
  );
}
