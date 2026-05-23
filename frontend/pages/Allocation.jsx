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

const initialAllocations = [
  { id: 1, student: "John Doe", room: "101", course: "Computer Science", assignedOn: "2025-01-10", phone: "+91 98765 43210", duration: 134 },
  { id: 2, student: "Jane Smith", room: "102", course: "Mechanical Engineering", assignedOn: "2025-02-03", phone: "+91 98765 11122", duration: 110 },
  { id: 3, student: "Mike Johnson", room: "201", course: "Electrical Engineering", assignedOn: "2025-03-15", phone: "+91 99887 76655", duration: 70 },
  { id: 4, student: "Alice Brown", room: "202", course: "Civil Engineering", assignedOn: "2025-04-08", phone: "+91 90210 33445", duration: 45 },
  { id: 5, student: "David Green", room: "301", course: "Business Administration", assignedOn: "2025-05-12", phone: "+91 87651 23409", duration: 11 },
  { id: 6, student: "Sara Khan", room: "203", course: "Computer Science", assignedOn: "2025-05-18", phone: "+91 90909 80808", duration: 5 },
];

const studentList = ["John Doe", "Jane Smith", "Mike Johnson", "Alice Brown", "David Green", "Sara Khan", "Rohit Verma", "Priya Patel"];
const roomList = ["101", "102", "201", "202", "203", "301", "302", "401"];
const courseList = ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Business Administration"];

const monthlyData = {
  counts: [3, 5, 4, 6, 8, 7, 9, 6, 5, 4, 7, 8],
  months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
};

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

function BarChart({ data, t }) {
  const maxVal = Math.max(...data.counts);
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140, paddingBottom: 24, minWidth: 480, position: "relative" }}>
        {data.months.map((m, i) => (
          <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end", height: 110, position: "relative" }}>
              {hovered === i && (
                <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 11, color: t.text, whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.3)", marginBottom: 4 }}>
                  <div style={{ color: t.accent }}>{data.counts[i]} allocations</div>
                </div>
              )}
              <div style={{ width: "70%", background: hovered === i ? t.accent : `${t.accent}99`, borderRadius: "6px 6px 0 0", height: `${(data.counts[i] / maxVal) * 110}px`, transition: "all 0.3s" }} />
            </div>
            <span style={{ fontSize: 10, color: t.muted }}>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseDonut({ allocations, t }) {
  const counts = courseList.map(c => allocations.filter(a => a.course === c).length);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const colors = [t.accent, t.success, t.warning, t.purple, t.gold];
  const r = 48, cx = 60, cy = 60, stroke = 14;
  const circ = 2 * Math.PI * r;
  let offset = circ * 0.25;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width={120} height={120}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.border} strokeWidth={stroke} />
        {counts.map((c, i) => {
          const arc = (c / total) * circ;
          const seg = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={colors[i]} strokeWidth={stroke}
              strokeDasharray={`${arc} ${circ}`} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s ease" }} />
          );
          offset += arc;
          return seg;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={t.text} fontSize={18} fontWeight={700}>{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={t.muted} fontSize={10}>total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, flex: 1, minWidth: 140 }}>
        {courseList.map((c, i) => (
          <div key={c} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: t.muted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i], display: "inline-block" }} />
              <span style={{ color: t.text, fontSize: 11 }}>{c.split(" ")[0]}</span>
            </span>
            <strong style={{ color: colors[i] }}>{counts[i]}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Allocation() {
  const [dark, setDark] = useState(true);
  const [period, setPeriod] = useState("Year");
  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [allocations, setAllocations] = useState(initialAllocations);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    student: "", room: "", course: "", assignedOn: new Date().toISOString().split("T")[0],
  });
  const t = dark ? darkTheme : lightTheme;

  useEffect(() => { setTimeout(() => setStarted(true), 100); }, []);

  const totalAllocs = allocations.length;
  const activeRooms = new Set(allocations.map(a => a.room)).size;
  const availableRooms = roomList.length - activeRooms;
  const thisMonth = allocations.filter(a => new Date(a.assignedOn).getMonth() === new Date().getMonth()).length;

  const cTotal = useCountUp(totalAllocs, 1400, started);
  const cActive = useCountUp(activeRooms, 1400, started);
  const cAvailable = useCountUp(availableRooms, 1400, started);
  const cMonth = useCountUp(thisMonth, 1400, started);

  const filtered = allocations
    .filter(a => filterCourse === "all" ? true : a.course === filterCourse)
    .filter(a => {
      const q = searchTerm.toLowerCase();
      return a.student.toLowerCase().includes(q) || a.room.includes(q) || a.course.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.assignedOn) - new Date(a.assignedOn);
      if (sortBy === "student") return a.student.localeCompare(b.student);
      if (sortBy === "room") return a.room.localeCompare(b.room);
      return 0;
    });

  const handleAdd = () => {
    setEditing(null);
    setFormData({ student: "", room: "", course: "", assignedOn: new Date().toISOString().split("T")[0] });
    setShowForm(true);
  };
  const handleEdit = (a) => { setEditing(a); setFormData(a); setShowForm(true); };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      setAllocations(allocations.map(a => a.id === editing.id ? { ...a, ...formData } : a));
    } else {
      setAllocations([...allocations, { ...formData, id: Date.now(), phone: "+91 99999 00000", duration: 0 }]);
    }
    setShowForm(false);
  };
  const handleDelete = (id) => { setAllocations(allocations.filter(a => a.id !== id)); setConfirmDelete(null); };

  const courseColor = (course) => {
    const idx = courseList.indexOf(course);
    return [t.accent, t.success, t.warning, t.purple, t.gold][idx] || t.accent;
  };

  const initials = (name) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const statCards = [
    { label: "Total Allocations", val: cTotal, icon: "🏠", color: t.accent, bg: `${t.accent}18`, change: "+12% from last month", trend: "up", spark: [3,5,4,6,8,7,9,6,5,4,7,8] },
    { label: "Active Rooms", val: cActive, icon: "🚪", color: t.success, bg: `${t.success}18`, change: `${activeRooms}/${roomList.length} occupied`, trend: "up", spark: [4,5,5,6,7,7,8,8,8,8,9,9] },
    { label: "Available Rooms", val: cAvailable, icon: "✨", color: t.warning, bg: `${t.warning}18`, change: "Ready to assign", trend: "warn", spark: [5,4,4,3,3,2,2,1,1,1,0,0] },
    { label: "This Month", val: cMonth, icon: "📅", color: t.purple, bg: `${t.purple}18`, change: "New allocations", trend: "up", spark: [1,2,1,3,4,3,5,4,3,2,3,4] },
  ];

  return (
    <div style={{ background: t.bg, minHeight: "100vh", color: t.text, fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.3s" }}>
      {/* Header */}
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(8px)" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>Room Allocation</div>
          <div style={{ fontSize: 12, color: t.muted }}>Manage student room assignments and allocation history</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {["Week","Month","Year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: period === p ? t.accent : t.card, color: period === p ? "#fff" : t.muted, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>{p}</button>
          ))}
          <button onClick={() => setDark(!dark)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button onClick={handleAdd} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: t.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 4px 14px ${t.accent}55` }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Allocate Room
          </button>
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          {statCards.map((card, i) => (
            <div key={card.label} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, position: "relative", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", animation: `slideUp 0.5s ease ${i * 0.1}s both` }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${card.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: card.bg, borderRadius: "0 16px 0 80px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 14, paddingTop: 14, fontSize: 24 }}>{card.icon}</div>
              <div style={{ fontSize: 12, color: t.muted, marginBottom: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{card.label}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: card.color, letterSpacing: -1, marginBottom: 6 }}>{card.val.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: card.trend === "up" ? t.success : card.trend === "down" ? t.danger : t.warning }}>{card.trend === "up" ? "↑" : card.trend === "down" ? "↓" : "⚠"} {card.change}</div>
              <div style={{ marginTop: 12 }}><MiniSparkline data={card.spark} color={card.color} /></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, background: t.surface, borderRadius: 12, padding: 4, width: "fit-content", border: `1px solid ${t.border}` }}>
          {["overview","allocations","analytics"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: activeTab === tab ? t.accent : "transparent", color: activeTab === tab ? "#fff" : t.muted, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize" }}>{tab}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            {/* Recent Allocations */}
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Allocations</h3>
                <button onClick={() => setActiveTab("allocations")} style={{ fontSize: 12, color: t.accent, background: "none", border: "none", cursor: "pointer", padding: 0 }}>View all →</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {allocations.slice().sort((a,b) => new Date(b.assignedOn) - new Date(a.assignedOn)).slice(0, 5).map((a, i) => (
                  <div key={a.id} onClick={() => setExpandedRow(expandedRow === a.id ? null : a.id)}
                    style={{ background: t.card, border: `1px solid ${expandedRow === a.id ? t.accent : t.border}`, borderRadius: 12, padding: "12px 16px", cursor: "pointer", transition: "all 0.2s", animation: `slideIn 0.3s ease ${i * 0.05}s both` }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                    onMouseLeave={e => { if (expandedRow !== a.id) e.currentTarget.style.borderColor = t.border; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${courseColor(a.course)}, ${courseColor(a.course)}cc)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>{initials(a.student)}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{a.student}</div>
                          <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{a.course}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: `${t.accent}22`, color: t.accent, fontWeight: 600 }}>Room {a.room}</span>
                        <span style={{ fontSize: 12, color: t.muted, minWidth: 80, textAlign: "right" }}>{a.assignedOn}</span>
                      </div>
                    </div>
                    {expandedRow === a.id && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}`, fontSize: 12, color: t.muted, display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span>Phone: <strong style={{ color: t.text }}>{a.phone}</strong></span>
                        <span>Duration: <strong style={{ color: t.success }}>{a.duration} days</strong></span>
                        <span>Course: <strong style={{ color: courseColor(a.course) }}>{a.course}</strong></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Course Donut + Quick Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 14px" }}>Course Distribution</h3>
                <CourseDonut allocations={allocations} t={t} />
              </div>
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Available Rooms</h3>
                  <span style={{ fontSize: 12, background: `${t.warning}22`, color: t.warning, padding: "2px 8px", borderRadius: 6 }}>{availableRooms} free</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))", gap: 8 }}>
                  {roomList.map(r => {
                    const occupied = allocations.some(a => a.room === r);
                    return (
                      <div key={r} style={{ background: occupied ? `${t.danger}15` : `${t.success}15`, border: `1px solid ${occupied ? t.danger : t.success}55`, borderRadius: 8, padding: "10px 6px", textAlign: "center", fontSize: 13, fontWeight: 600, color: occupied ? t.danger : t.success }}>
                        {r}
                        <div style={{ fontSize: 9, marginTop: 2, opacity: 0.7 }}>{occupied ? "TAKEN" : "FREE"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "allocations" && (
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
            {/* Search + Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by student, room, or course..." style={{ flex: 1, minWidth: 220, padding: "8px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, outline: "none" }} />
              <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14 }}>
                <option value="all">All Courses</option>
                {courseList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14 }}>
                <option value="date">Sort by Date</option>
                <option value="student">Sort by Student</option>
                <option value="room">Sort by Room</option>
              </select>
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {["all", ...courseList].map(c => (
                <button key={c} onClick={() => setFilterCourse(c)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${filterCourse === c ? t.accent : t.border}`, background: filterCourse === c ? `${t.accent}22` : "transparent", color: filterCourse === c ? t.accent : t.muted, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>{c === "all" ? "All" : c.split(" ")[0]}</button>
              ))}
            </div>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((a, i) => (
                <div key={a.id} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: `slideIn 0.25s ease ${i * 0.03}s both`, transition: "border-color 0.2s", flexWrap: "wrap", gap: 12 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 200 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${courseColor(a.course)}, ${courseColor(a.course)}cc)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>{initials(a.student)}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{a.student}</div>
                      <div style={{ fontSize: 12, color: t.muted }}>{a.course}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: `${t.accent}22`, color: t.accent, fontWeight: 600 }}>Room {a.room}</span>
                    <span style={{ fontSize: 12, color: t.muted, minWidth: 90 }}>{a.assignedOn}</span>
                    <button onClick={() => handleEdit(a)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: `${t.accent}22`, color: t.accent, border: "none", cursor: "pointer", fontWeight: 500 }}>Edit</button>
                    <button onClick={() => setConfirmDelete(a)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: `${t.danger}22`, color: t.danger, border: "none", cursor: "pointer", fontWeight: 500 }}>Remove</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: t.muted, fontSize: 14 }}>No allocations match your filter.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Monthly Allocations</h3>
                <span style={{ fontSize: 12, color: t.muted }}>FY 2025</span>
              </div>
              <BarChart data={monthlyData} t={t} />
            </div>
            {[
              { label: "Avg per Month", val: "6.0", icon: "📊", color: t.accent },
              { label: "Peak Month", val: "Jul — 9", icon: "🏆", color: t.gold },
              { label: "Occupancy Rate", val: `${Math.round((activeRooms/roomList.length)*100)}%`, icon: "📈", color: t.success },
              { label: "Most Popular Course", val: "CS", icon: "🎓", color: t.purple },
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

      {/* Add / Edit Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)", padding: 20 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: 28, width: 420, maxWidth: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{editing ? "Edit Allocation" : "Allocate Room"}</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: t.muted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: t.muted, marginBottom: 20 }}>{editing ? "Update assignment details" : "Assign a room to a student"}</div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 6, fontWeight: 500 }}>Student</label>
                <select required value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, outline: "none" }}>
                  <option value="">Select student</option>
                  {studentList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 6, fontWeight: 500 }}>Room</label>
                <select required value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, outline: "none" }}>
                  <option value="">Select room</option>
                  {roomList.map(r => <option key={r} value={r}>Room {r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 6, fontWeight: 500 }}>Course</label>
                <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, outline: "none" }}>
                  <option value="">Select course</option>
                  {courseList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 6, fontWeight: 500 }}>Assignment Date</label>
                <input required type="date" value={formData.assignedOn} onChange={e => setFormData({...formData, assignedOn: e.target.value})}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.text, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: t.accent, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>{editing ? "Update" : "Allocate"} ✓</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)", padding: 20 }}
          onClick={() => setConfirmDelete(null)}>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: 28, width: 360, maxWidth: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Remove Allocation?</div>
            <div style={{ fontSize: 13, color: t.muted, marginBottom: 20 }}>{confirmDelete.student} · Room {confirmDelete.room}</div>
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
