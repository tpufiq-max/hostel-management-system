import { useState, useEffect } from "react";

const darkTheme = {
  bg: "#0f172a", cardBg: "#1e293b", border: "#334155",
  text: "#f1f5f9", subText: "#94a3b8", inputBg: "#0f172a",
  accent: "#6366f1", success: "#22c55e", danger: "#ef4444",
  warning: "#f59e0b", hover: "#334155", modalBg: "#1e293b",
  tableBg: "#1e293b", tableHover: "#273449", chipBg: "#334155",
};
const lightTheme = {
  bg: "#f1f5f9", cardBg: "#ffffff", border: "#e2e8f0",
  text: "#1e293b", subText: "#64748b", inputBg: "#ffffff",
  accent: "#6366f1", success: "#16a34a", danger: "#dc2626",
  warning: "#d97706", hover: "#f8fafc", modalBg: "#ffffff",
  tableBg: "#ffffff", tableHover: "#f8fafc", chipBg: "#e2e8f0",
};

const initialFees = [
  { id: 1, student: "John Doe",    amount: 8000, dueDate: "2025-06-01", status: "Paid",    type: "Monthly",     room: "101" },
  { id: 2, student: "Jane Smith",  amount: 8000, dueDate: "2025-06-05", status: "Pending", type: "Monthly",     room: "102" },
  { id: 3, student: "Mike Johnson",amount: 5000, dueDate: "2025-05-15", status: "Overdue", type: "Hostel",      room: "103" },
  { id: 4, student: "Alice Brown", amount: 2000, dueDate: "2025-06-10", status: "Paid",    type: "Mess",        room: "202" },
  { id: 5, student: "David Green", amount: 8000, dueDate: "2025-06-12", status: "Pending", type: "Monthly",     room: "301" },
  { id: 6, student: "Sara Khan",   amount: 1500, dueDate: "2025-06-20", status: "Paid",    type: "Maintenance", room: "203" },
];
const studentList = ["John Doe","Jane Smith","Mike Johnson","Alice Brown","David Green","Sara Khan"];
const feeTypes = ["Monthly","Hostel","Mess","Maintenance","Other"];
const feeStatuses = ["Paid","Pending","Overdue"];

function useCountUp(target, duration = 1000) {
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
  const w = 80, h = 30;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ label, value, color, sparkData, prefix, theme }) {
  const animated = useCountUp(value);
  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.border}`,
      borderRadius: 16, padding: "20px 24px", flex: 1, minWidth: 160,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)", animation: "slideUp 0.4s ease",
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 13, color: theme.subText, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 8 }}>{prefix || ""}{animated.toLocaleString()}</div>
      <MiniSparkline data={sparkData} color={color} />
    </div>
  );
}

function statusColor(status, t) {
  if (status === "Paid") return t.success;
  if (status === "Pending") return t.warning;
  if (status === "Overdue") return t.danger;
  return t.subText;
}

function StatusBadge({ status, theme }) {
  const c = statusColor(status, theme);
  return (
    <span style={{
      background: c + "22", color: c, border: `1px solid ${c}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
    }}>{status}</span>
  );
}

function TypeBadge({ type, theme }) {
  const typeColors = { Monthly: "#6366f1", Hostel: "#3b82f6", Mess: "#22c55e", Maintenance: "#f59e0b", Other: "#94a3b8" };
  const c = typeColors[type] || theme.accent;
  return (
    <span style={{
      background: c + "22", color: c, border: `1px solid ${c}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
    }}>{type}</span>
  );
}

function AvatarInitials({ name, size = 36 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#ec4899"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
    }}>{initials}</div>
  );
}


function DonutChart({ segments, theme }) {
  // segments: [{label, value, color}]
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 54, cx = 70, cy = 70, stroke = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map((seg, i) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r}
        fill="none" stroke={seg.color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset * circumference}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    );
    offset += pct;
    return el;
  });
  return (
    <svg width={140} height={140} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.border} strokeWidth={stroke} />
      {slices}
    </svg>
  );
}

function BarChart({ labels, values, color, theme }) {
  const max = Math.max(...values) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 130, padding: "0 4px" }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, color: theme.subText }}>₹{v > 999 ? (v/1000).toFixed(1)+"k" : v}</div>
          <div style={{ width: "100%", background: color+"33", borderRadius: "4px 4px 0 0", height: `${(v/max)*100}px`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: color, borderRadius: "4px 4px 0 0", height: "100%", animation: "slideUp 0.6s ease" }} />
          </div>
          <div style={{ fontSize: 10, color: theme.subText }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

const emptyForm = { student: studentList[0], amount: "", dueDate: "", type: "Monthly", status: "Pending" };


export default function Fees() {
  const [dark, setDark] = useState(true);
  const t = dark ? darkTheme : lightTheme;
  const [period, setPeriod] = useState("Monthly");
  const [tab, setTab] = useState("overview");
  const [fees, setFees] = useState(initialFees);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");
  const [showModal, setShowModal] = useState(false);
  const [editFee, setEditFee] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saveAnim, setSaveAnim] = useState(false);

  const totalCollected = fees.filter(f => f.status === "Paid").reduce((a, f) => a + f.amount, 0);
  const totalPending = fees.filter(f => f.status === "Pending").reduce((a, f) => a + f.amount, 0);
  const totalOverdue = fees.filter(f => f.status === "Overdue").reduce((a, f) => a + f.amount, 0);
  const totalRecords = fees.length;

  function openAdd() { setEditFee(null); setForm(emptyForm); setFormErrors({}); setShowModal(true); }
  function openEdit(f) { setEditFee(f); setForm({ ...f }); setFormErrors({}); setShowModal(true); }
  function validateForm() {
    const errs = {};
    if (!form.student) errs.student = "Student required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = "Valid amount required";
    if (!form.dueDate) errs.dueDate = "Due date required";
    return errs;
  }
  function handleSave() {
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaveAnim(true);
    setTimeout(() => {
      if (editFee) {
        setFees(prev => prev.map(f => f.id === editFee.id ? { ...form, id: f.id, amount: Number(form.amount), room: f.room || "—" } : f));
      } else {
        setFees(prev => [...prev, { ...form, id: Date.now(), amount: Number(form.amount), room: "—" }]);
      }
      setShowModal(false);
      setSaveAnim(false);
    }, 400);
  }
  function handleDelete() { setFees(prev => prev.filter(f => f.id !== deleteTarget.id)); setDeleteTarget(null); }
  function markPaid(id) { setFees(prev => prev.map(f => f.id === id ? { ...f, status: "Paid" } : f)); }

  const filtered = fees
    .filter(f => {
      const q = search.toLowerCase();
      return f.student.toLowerCase().includes(q) || f.type.toLowerCase().includes(q) || f.room.toLowerCase().includes(q);
    })
    .filter(f => statusFilter === "All" || f.status === statusFilter)
    .filter(f => typeFilter === "All" || f.type === typeFilter)
    .sort((a, b) => {
      if (sortBy === "dueDate") return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === "amount") return b.amount - a.amount;
      return 0;
    });

  const donutSegments = [
    { label: "Paid", value: totalCollected, color: t.success },
    { label: "Pending", value: totalPending, color: t.warning },
    { label: "Overdue", value: totalOverdue, color: t.danger },
  ];

  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun"];
  const monthAmounts = monthLabels.map(m => {
    const mMap = { Jan:"01", Feb:"02", Mar:"03", Apr:"04", May:"05", Jun:"06" };
    return fees.filter(f => f.status === "Paid" && f.dueDate.includes(`-${mMap[m]}-`)).reduce((a, f) => a + f.amount, 0);
  });

  const collectionRate = totalRecords ? Math.round((fees.filter(f=>f.status==="Paid").length / totalRecords) * 100) : 0;
  const avgFee = totalRecords ? Math.round(fees.reduce((a,f)=>a+f.amount,0) / totalRecords) : 0;
  const typeCounts = feeTypes.map(tp => ({ type: tp, count: fees.filter(f=>f.type===tp).length }));
  const mostCommonType = typeCounts.sort((a,b)=>b.count-a.count)[0]?.type || "—";
  const outstandingCount = fees.filter(f => f.status !== "Paid").length;

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
    border: `1px solid ${t.border}`, background: t.inputBg, color: t.text,
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 13, color: t.subText, marginBottom: 4, display: "block" };
  const errorStyle = { color: t.danger, fontSize: 11, marginTop: 2 };


  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Inter',sans-serif", padding: "24px", transition: "background 0.3s,color 0.3s" }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .row-hover:hover { background: ${t.tableHover} !important; }
        .tab-btn:hover { opacity:0.85; }
        .action-btn:hover { opacity:0.75; }
        .chip:hover { opacity:0.8; cursor:pointer; }
        .mark-paid-btn:hover { opacity:0.8; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: t.text }}>Fees</h1>
          <div style={{ fontSize: 14, color: t.subText, marginTop: 4 }}>Fee collection management &amp; analytics</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {["Monthly","Quarterly","Yearly"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "7px 16px", borderRadius: 20, border: `1px solid ${period===p ? t.accent : t.border}`,
              background: period===p ? t.accent : "transparent", color: period===p ? "#fff" : t.subText,
              cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
            }}>{p}</button>
          ))}
          <button onClick={() => setDark(d => !d)} style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid ${t.border}`, background: t.cardBg, color: t.text, cursor: "pointer", fontSize: 18 }}>{dark ? "☀️" : "🌙"}</button>
          <button onClick={openAdd} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: t.accent, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 14px ${t.accent}55` }}>+ Add Fee</button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Total Collected" value={totalCollected} color={t.success} sparkData={[1500,2000,1800,2500,2000,3000,totalCollected/1000|0]} prefix="₹" theme={t} />
        <StatCard label="Pending" value={totalPending} color={t.warning} sparkData={[2,3,2,4,3,3,totalPending/1000|0]} prefix="₹" theme={t} />
        <StatCard label="Overdue" value={totalOverdue} color={t.danger} sparkData={[1,1,2,1,2,2,totalOverdue/1000|0]} prefix="₹" theme={t} />
        <StatCard label="Total Records" value={totalRecords} color={t.accent} sparkData={[3,4,4,5,5,6,totalRecords]} theme={t} />
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${t.border}` }}>
        {["overview","fees","analytics"].map(tb => (
          <button key={tb} className="tab-btn" onClick={() => setTab(tb)} style={{
            padding: "10px 22px", border: "none", background: "transparent",
            color: tab===tb ? t.accent : t.subText, fontWeight: tab===tb ? 700 : 500,
            fontSize: 14, cursor: "pointer", borderBottom: tab===tb ? `2px solid ${t.accent}` : "2px solid transparent",
            transition: "all 0.2s", textTransform: "capitalize",
          }}>{tb.charAt(0).toUpperCase()+tb.slice(1)}</button>
        ))}
      </div>


      {/* ===== OVERVIEW TAB ===== */}
      {tab === "overview" && (
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* Left: Recent Fee Records */}
          <div style={{ flex: 2, minWidth: 320, background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24, animation: "slideIn 0.4s ease" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: t.text }}>Recent Fee Records</div>
            {fees.slice().sort((a,b) => new Date(b.dueDate)-new Date(a.dueDate)).slice(0,6).map(f => (
              <div key={f.id}>
                <div className="row-hover" onClick={() => setExpandedId(expandedId===f.id ? null : f.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 8px",
                  borderRadius: 10, cursor: "pointer", transition: "background 0.15s",
                  background: expandedId===f.id ? t.tableHover : "transparent",
                }}>
                  <AvatarInitials name={f.student} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: t.text }}>{f.student}</div>
                    <div style={{ fontSize: 12, color: t.subText }}>{f.dueDate}</div>
                  </div>
                  <TypeBadge type={f.type} theme={t} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: statusColor(f.status, t) }}>₹{f.amount.toLocaleString()}</div>
                  <StatusBadge status={f.status} theme={t} />
                  <span style={{ color: t.subText, fontSize: 12 }}>{expandedId===f.id ? "▲" : "▼"}</span>
                </div>
                {expandedId === f.id && (
                  <div style={{ padding: "10px 20px 14px 60px", background: t.tableHover, borderRadius: "0 0 10px 10px", animation: "slideUp 0.25s ease", borderTop: `1px solid ${t.border}` }}>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>🏠 Room: </span><span style={{ fontSize: 13, color: t.text }}>{f.room}</span></div>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>💳 Type: </span><span style={{ fontSize: 13, color: t.text }}>{f.type}</span></div>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>📅 Due: </span><span style={{ fontSize: 13, color: t.text }}>{f.dueDate}</span></div>
                    </div>
                  </div>
                )}
                <div style={{ borderBottom: `1px solid ${t.border}22`, margin: "0 8px" }} />
              </div>
            ))}
          </div>

          {/* Right */}
          <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Donut */}
            <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24, animation: "slideIn 0.5s ease" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: t.text }}>Collection Summary</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative" }}>
                  <DonutChart segments={donutSegments} theme={t} />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: t.text }}>₹{(totalCollected/1000).toFixed(1)}k</div>
                    <div style={{ fontSize: 10, color: t.subText }}>Paid</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {donutSegments.map(seg => (
                    <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
                      <div style={{ fontSize: 12, color: t.subText, flex: 1 }}>{seg.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>₹{seg.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending list with Mark Paid */}
            <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24, animation: "slideIn 0.6s ease" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: t.text }}>Pending Collections</div>
              {fees.filter(f => f.status === "Pending" || f.status === "Overdue").length === 0 && (
                <div style={{ color: t.subText, fontSize: 13, textAlign: "center", padding: "12px 0" }}>All fees collected! 🎉</div>
              )}
              {fees.filter(f => f.status !== "Paid").map(f => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${t.border}22` }}>
                  <AvatarInitials name={f.student} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{f.student}</div>
                    <div style={{ fontSize: 11, color: statusColor(f.status, t) }}>{f.status} · ₹{f.amount.toLocaleString()}</div>
                  </div>
                  <button className="mark-paid-btn" onClick={() => markPaid(f.id)} style={{
                    padding: "4px 12px", borderRadius: 8, border: `1px solid ${t.success}`,
                    background: t.success + "22", color: t.success, cursor: "pointer", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                    transition: "opacity 0.2s",
                  }}>Mark Paid</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ===== FEES TAB ===== */}
      {tab === "fees" && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          {/* Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18, alignItems: "center" }}>
            <input
              placeholder="Search by student, type, room…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, maxWidth: 260, flex: "1 1 200px" }}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["All", ...feeStatuses].map(s => (
                <button key={s} className="chip" onClick={() => setStatusFilter(s)} style={{
                  padding: "5px 14px", borderRadius: 20,
                  border: `1px solid ${statusFilter===s ? (s==="Paid" ? t.success : s==="Pending" ? t.warning : s==="Overdue" ? t.danger : t.accent) : t.border}`,
                  background: statusFilter===s ? (s==="Paid" ? t.success : s==="Pending" ? t.warning : s==="Overdue" ? t.danger : t.accent) : t.chipBg,
                  color: statusFilter===s ? "#fff" : t.subText,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{s === "All" ? "All Status" : s}</button>
              ))}
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, maxWidth: 140 }}>
              <option value="All">All Types</option>
              {feeTypes.map(tp => <option key={tp} value={tp}>{tp}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, maxWidth: 150 }}>
              <option value="dueDate">Sort: Due Date</option>
              <option value="amount">Sort: Amount</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px", padding: "10px 16px", background: t.border+"55", fontSize: 12, fontWeight: 700, color: t.subText, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <span>Student</span><span>Type</span><span>Amount</span><span>Due Date</span><span>Status</span><span>Actions</span>
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: t.subText }}>No fee records found.</div>
            )}
            {filtered.map((f, idx) => (
              <div key={f.id}>
                <div className="row-hover" onClick={() => setExpandedId(expandedId===f.id ? null : f.id)}
                  style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px", padding: "12px 16px", borderTop: `1px solid ${t.border}22`, alignItems: "center", cursor: "pointer", transition: "background 0.15s", animation: `slideIn ${0.1+idx*0.04}s ease` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <AvatarInitials name={f.student} size={32} />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{f.student}</span>
                  </div>
                  <TypeBadge type={f.type} theme={t} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: statusColor(f.status, t) }}>₹{f.amount.toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: t.subText }}>{f.dueDate}</span>
                  <StatusBadge status={f.status} theme={t} />
                  <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                    <button className="action-btn" onClick={() => openEdit(f)} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${t.accent}`, background: "transparent", color: t.accent, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Edit</button>
                    <button className="action-btn" onClick={() => setDeleteTarget(f)} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${t.danger}`, background: "transparent", color: t.danger, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Del</button>
                  </div>
                </div>
                {expandedId === f.id && (
                  <div style={{ padding: "10px 20px 14px 60px", background: t.tableHover, borderTop: `1px solid ${t.border}22`, animation: "slideUp 0.25s ease" }}>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>🏠 Room: </span><span style={{ fontSize: 13 }}>{f.room}</span></div>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>💳 Fee Type: </span><span style={{ fontSize: 13 }}>{f.type}</span></div>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>💰 Amount: </span><span style={{ fontSize: 13, fontWeight: 700, color: statusColor(f.status, t) }}>₹{f.amount.toLocaleString()}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: t.subText }}>Showing {filtered.length} of {fees.length} records</div>
        </div>
      )}


      {/* ===== ANALYTICS TAB ===== */}
      {tab === "analytics" && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 28, marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: t.text }}>Monthly Collections (Paid)</div>
            <BarChart labels={monthLabels} values={monthAmounts} color={t.success} theme={t} />
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { label: "Collection Rate", value: `${collectionRate}%`, color: t.success, icon: "📈" },
              { label: "Avg Fee Amount", value: `₹${avgFee.toLocaleString()}`, color: t.accent, icon: "💰" },
              { label: "Most Common Type", value: mostCommonType, color: t.warning, icon: "📋" },
              { label: "Outstanding Count", value: outstandingCount, color: t.danger, icon: "⚠️" },
            ].map((kpi, i) => (
              <div key={i} style={{
                flex: 1, minWidth: 160, background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`,
                padding: "20px 24px", textAlign: "center", animation: `slideUp ${0.2+i*0.1}s ease`,
                borderTop: `3px solid ${kpi.color}`,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{kpi.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                <div style={{ fontSize: 13, color: t.subText, marginTop: 4 }}>{kpi.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220, background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: t.text }}>By Fee Type</div>
              {feeTypes.map((tp, i) => {
                const cnt = fees.filter(f=>f.type===tp).length;
                const typeColors = { Monthly:"#6366f1", Hostel:"#3b82f6", Mess:"#22c55e", Maintenance:"#f59e0b", Other:"#94a3b8" };
                const c = typeColors[tp] || t.accent;
                return (
                  <div key={tp} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
                    <div style={{ flex: 1, fontSize: 13, color: t.text }}>{tp}</div>
                    <div style={{ width: 80, height: 6, background: t.border, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${fees.length ? (cnt/fees.length)*100 : 0}%`, background: c, transition: "width 0.8s" }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text, width: 20, textAlign: "right" }}>{cnt}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ flex: 1, minWidth: 220, background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: t.text }}>By Status</div>
              {feeStatuses.map(s => {
                const cnt = fees.filter(f=>f.status===s).length;
                const c = statusColor(s, t);
                const amt = fees.filter(f=>f.status===s).reduce((a,f)=>a+f.amount,0);
                return (
                  <div key={s} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>{s}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: c }}>₹{amt.toLocaleString()} ({cnt} records)</span>
                    </div>
                    <div style={{ height: 8, background: t.border, borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${fees.length ? (cnt/fees.length)*100 : 0}%`, background: c, borderRadius: 8, transition: "width 0.8s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* ===== ADD/EDIT MODAL ===== */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}
          onClick={e => { if(e.target===e.currentTarget) setShowModal(false); }}>
          <div style={{
            background: t.modalBg, borderRadius: 20, padding: 32, width: "100%", maxWidth: 460,
            border: `1px solid ${t.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            animation: "slideUp 0.3s ease", maxHeight: "90vh", overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.text }}>{editFee ? "Edit Fee Record" : "Add New Fee"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: t.subText }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Student *</label>
                <select value={form.student} onChange={e => setForm(f=>({...f,student:e.target.value}))} style={{ ...inputStyle, borderColor: formErrors.student ? t.danger : t.border }}>
                  {studentList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {formErrors.student && <div style={errorStyle}>{formErrors.student}</div>}
              </div>
              <div>
                <label style={labelStyle}>Amount (₹) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} style={{ ...inputStyle, borderColor: formErrors.amount ? t.danger : t.border }} placeholder="e.g. 8000" min="0" />
                {formErrors.amount && <div style={errorStyle}>{formErrors.amount}</div>}
              </div>
              <div>
                <label style={labelStyle}>Due Date *</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} style={{ ...inputStyle, borderColor: formErrors.dueDate ? t.danger : t.border }} />
                {formErrors.dueDate && <div style={errorStyle}>{formErrors.dueDate}</div>}
              </div>
              <div>
                <label style={labelStyle}>Fee Type</label>
                <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} style={inputStyle}>
                  {feeTypes.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))} style={inputStyle}>
                  {feeStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 22px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.subText, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={handleSave} style={{
                padding: "10px 28px", borderRadius: 10, border: "none",
                background: saveAnim ? t.success : t.accent, color: "#fff",
                cursor: "pointer", fontSize: 14, fontWeight: 700,
                boxShadow: `0 4px 14px ${t.accent}55`, transition: "background 0.3s",
              }}>{saveAnim ? "Saving…" : editFee ? "Update" : "Add Fee"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRM DELETE MODAL ===== */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}
          onClick={e => { if(e.target===e.currentTarget) setDeleteTarget(null); }}>
          <div style={{
            background: t.modalBg, borderRadius: 20, padding: 36, width: "100%", maxWidth: 400,
            border: `1px solid ${t.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            animation: "slideUp 0.3s ease", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: t.text }}>Delete Fee Record?</h2>
            <p style={{ color: t.subText, fontSize: 14, marginBottom: 24 }}>
              Are you sure you want to delete the <strong style={{ color: t.text }}>₹{deleteTarget.amount.toLocaleString()}</strong> fee record for <strong style={{ color: t.text }}>{deleteTarget.student}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "10px 24px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.subText, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: t.danger, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 14px ${t.danger}55` }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
