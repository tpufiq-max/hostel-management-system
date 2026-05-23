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

const initialStudents = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+91 98765 43210", room: "101", course: "Computer Science", year: "3rd Year", status: "Active", joinDate: "2023-08-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+91 98765 11122", room: "102", course: "Mechanical Engineering", year: "2nd Year", status: "Active", joinDate: "2023-08-20" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+91 99887 76655", room: "103", course: "Electrical Engineering", year: "4th Year", status: "Inactive", joinDate: "2022-08-10" },
  { id: 4, name: "Sarah Wilson", email: "sarah@example.com", phone: "+91 90210 33445", room: "104", course: "Civil Engineering", year: "1st Year", status: "Active", joinDate: "2024-08-25" },
  { id: 5, name: "David Brown", email: "david@example.com", phone: "+91 87651 23409", room: "105", course: "Business Administration", year: "2nd Year", status: "Active", joinDate: "2023-08-18" },
  { id: 6, name: "Sara Khan", email: "sara@example.com", phone: "+91 90909 80808", room: "203", course: "Computer Science", year: "1st Year", status: "Active", joinDate: "2025-01-10" },
];
const courseList = ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Business Administration"];
const yearList = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const roomList = ["101", "102", "103", "104", "105", "201", "202", "203", "301"];

const courseColors = {
  "Computer Science": "#6366f1",
  "Mechanical Engineering": "#f59e0b",
  "Electrical Engineering": "#22c55e",
  "Civil Engineering": "#3b82f6",
  "Business Administration": "#ec4899",
};

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

function StatCard({ label, value, color, sparkData, theme }) {
  const animated = useCountUp(value);
  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.border}`,
      borderRadius: 16, padding: "20px 24px", flex: 1, minWidth: 160,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)", animation: "slideUp 0.4s ease",
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 13, color: theme.subText, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color, marginBottom: 8 }}>{animated}</div>
      <MiniSparkline data={sparkData} color={color} />
    </div>
  );
}

function AvatarInitials({ name, course, size = 36 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const bg = courseColors[course] || "#6366f1";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
    }}>{initials}</div>
  );
}

function StatusBadge({ status, theme }) {
  const c = status === "Active" ? theme.success : theme.danger;
  return (
    <span style={{
      background: c + "22", color: c, border: `1px solid ${c}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
    }}>{status}</span>
  );
}

function CourseBadge({ course }) {
  const c = courseColors[course] || "#6366f1";
  return (
    <span style={{
      background: c + "22", color: c, border: `1px solid ${c}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
    }}>{course}</span>
  );
}

function RoomBadge({ room, theme }) {
  return (
    <span style={{
      background: theme.accent + "22", color: theme.accent,
      border: `1px solid ${theme.accent}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
    }}>Room {room}</span>
  );
}


function DonutChart({ data, colors, theme }) {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  let offset = 0;
  const r = 54, cx = 70, cy = 70, stroke = 18;
  const circumference = 2 * Math.PI * r;
  const slices = data.map((val, i) => {
    const pct = val / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const slice = (
      <circle key={i} cx={cx} cy={cy} r={r}
        fill="none" stroke={colors[i]} strokeWidth={stroke}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset * circumference}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    );
    offset += pct;
    return slice;
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
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, padding: "0 4px" }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, color: theme.subText }}>{v}</div>
          <div style={{
            width: "100%", background: color + "33", borderRadius: "4px 4px 0 0",
            height: `${(v / max) * 90}px`, position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: color, borderRadius: "4px 4px 0 0",
              height: "100%", animation: "slideUp 0.6s ease",
            }} />
          </div>
          <div style={{ fontSize: 10, color: theme.subText, textAlign: "center" }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}


const emptyForm = { name: "", email: "", phone: "", room: "101", course: "Computer Science", year: "1st Year", status: "Active", joinDate: "" };

export default function Students() {
  const [dark, setDark] = useState(true);
  const t = dark ? darkTheme : lightTheme;
  const [period, setPeriod] = useState("Monthly");
  const [tab, setTab] = useState("overview");
  const [students, setStudents] = useState(initialStudents);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saveAnim, setSaveAnim] = useState(false);

  const total = students.length;
  const active = students.filter(s => s.status === "Active").length;
  const inactive = students.filter(s => s.status === "Inactive").length;
  const rooms = [...new Set(students.map(s => s.room))].length;

  const sparkBase = [2, 3, 2, 4, 3, 5, 4];

  function openAdd() {
    setEditStudent(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }
  function openEdit(s) {
    setEditStudent(s);
    setForm({ ...s });
    setFormErrors({});
    setShowModal(true);
  }
  function validateForm() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.phone.trim()) errs.phone = "Phone required";
    if (!form.joinDate) errs.joinDate = "Join date required";
    return errs;
  }
  function handleSave() {
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaveAnim(true);
    setTimeout(() => {
      if (editStudent) {
        setStudents(prev => prev.map(s => s.id === editStudent.id ? { ...form, id: s.id } : s));
      } else {
        setStudents(prev => [...prev, { ...form, id: Date.now() }]);
      }
      setShowModal(false);
      setSaveAnim(false);
    }, 400);
  }
  function handleDelete() {
    setStudents(prev => prev.filter(s => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const filtered = students
    .filter(s => {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.room.includes(q);
    })
    .filter(s => courseFilter === "All" || s.course === courseFilter)
    .filter(s => statusFilter === "All" || s.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "room") return a.room.localeCompare(b.room);
      if (sortBy === "joinDate") return new Date(b.joinDate) - new Date(a.joinDate);
      return 0;
    });

  const courseCounts = courseList.map(c => students.filter(s => s.course === c).length);
  const courseColorsArr = courseList.map(c => courseColors[c]);

  const monthLabels = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  const monthCounts = monthLabels.map(m => {
    const mMap = { "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12", "Jan": "01" };
    return students.filter(s => s.joinDate.includes(`-${mMap[m]}-`)).length;
  });

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
      `}</style>


      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: t.text }}>Students</h1>
          <div style={{ fontSize: 14, color: t.subText, marginTop: 4 }}>Hostel student management &amp; analytics</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {["Monthly","Quarterly","Yearly"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "7px 16px", borderRadius: 20, border: `1px solid ${period===p ? t.accent : t.border}`,
              background: period===p ? t.accent : "transparent", color: period===p ? "#fff" : t.subText,
              cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
            }}>{p}</button>
          ))}
          <button onClick={() => setDark(d => !d)} style={{
            padding: "8px 16px", borderRadius: 20, border: `1px solid ${t.border}`,
            background: t.cardBg, color: t.text, cursor: "pointer", fontSize: 18,
          }}>{dark ? "☀️" : "🌙"}</button>
          <button onClick={openAdd} style={{
            padding: "9px 20px", borderRadius: 10, border: "none",
            background: t.accent, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
            boxShadow: `0 4px 14px ${t.accent}55`,
          }}>+ Add Student</button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Total Students" value={total} color={t.accent} sparkData={[...sparkBase.slice(1), total]} theme={t} />
        <StatCard label="Active" value={active} color={t.success} sparkData={[2,3,3,4,4,4,active]} theme={t} />
        <StatCard label="Inactive" value={inactive} color={t.danger} sparkData={[1,1,2,1,1,2,inactive]} theme={t} />
        <StatCard label="Rooms Occupied" value={rooms} color={t.warning} sparkData={[3,3,4,4,5,5,rooms]} theme={t} />
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${t.border}`, paddingBottom: 0 }}>
        {["overview","students","analytics"].map(tb => (
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
          {/* Left: Recent Students */}
          <div style={{ flex: 2, minWidth: 320, background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24, animation: "slideIn 0.4s ease" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: t.text }}>Recent Students</div>
            {students.slice().sort((a,b) => new Date(b.joinDate)-new Date(a.joinDate)).slice(0,6).map(s => (
              <div key={s.id}>
                <div className="row-hover" onClick={() => setExpandedId(expandedId===s.id ? null : s.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 8px",
                  borderRadius: 10, cursor: "pointer", transition: "background 0.15s",
                  background: expandedId===s.id ? t.tableHover : "transparent",
                }}>
                  <AvatarInitials name={s.name} course={s.course} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: t.text }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: t.subText }}>{s.course}</div>
                  </div>
                  <RoomBadge room={s.room} theme={t} />
                  <StatusBadge status={s.status} theme={t} />
                  <div style={{ fontSize: 12, color: t.subText, whiteSpace: "nowrap" }}>{s.joinDate}</div>
                  <span style={{ color: t.subText, fontSize: 12 }}>{expandedId===s.id ? "▲" : "▼"}</span>
                </div>
                {expandedId === s.id && (
                  <div style={{
                    padding: "10px 20px 14px 60px", background: t.tableHover,
                    borderRadius: "0 0 10px 10px", animation: "slideUp 0.25s ease",
                    borderTop: `1px solid ${t.border}`,
                  }}>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>📧 Email: </span><span style={{ fontSize: 13, color: t.text }}>{s.email}</span></div>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>📞 Phone: </span><span style={{ fontSize: 13, color: t.text }}>{s.phone}</span></div>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>📚 Year: </span><span style={{ fontSize: 13, color: t.text }}>{s.year}</span></div>
                    </div>
                  </div>
                )}
                <div style={{ borderBottom: `1px solid ${t.border}22`, margin: "0 8px" }} />
              </div>
            ))}
          </div>

          {/* Right: Charts */}
          <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Donut chart */}
            <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24, animation: "slideIn 0.5s ease" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: t.text }}>Course Distribution</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative" }}>
                  <DonutChart data={courseCounts} colors={courseColorsArr} theme={t} />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{total}</div>
                    <div style={{ fontSize: 10, color: t.subText }}>Total</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {courseList.map((c, i) => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: courseColors[c], flexShrink: 0 }} />
                      <div style={{ fontSize: 11, color: t.subText, flex: 1 }}>{c.split(" ")[0]}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{courseCounts[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Active/Inactive */}
            <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24, animation: "slideIn 0.6s ease" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: t.text }}>Status Breakdown</div>
              {[{label:"Active", val:active, color:t.success},{label:"Inactive", val:inactive, color:t.danger}].map(item => (
                <div key={item.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: t.text }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.val} ({total ? Math.round(item.val/total*100) : 0}%)</span>
                  </div>
                  <div style={{ height: 8, background: t.border, borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${total ? (item.val/total*100) : 0}%`, background: item.color, borderRadius: 8, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ===== STUDENTS TAB ===== */}
      {tab === "students" && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          {/* Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18, alignItems: "center" }}>
            <input
              placeholder="Search by name, email, room…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, maxWidth: 260, flex: "1 1 200px" }}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["All", ...courseList].map(c => (
                <button key={c} className="chip" onClick={() => setCourseFilter(c)} style={{
                  padding: "5px 12px", borderRadius: 20, border: `1px solid ${courseFilter===c ? t.accent : t.border}`,
                  background: courseFilter===c ? t.accent : t.chipBg, color: courseFilter===c ? "#fff" : t.subText,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{c === "All" ? "All Courses" : c.split(" ")[0]}</button>
              ))}
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, maxWidth: 140 }}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, maxWidth: 150 }}>
              <option value="name">Sort: Name</option>
              <option value="joinDate">Sort: Join Date</option>
              <option value="room">Sort: Room</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 2fr 1fr 1fr 100px", padding: "10px 16px", background: t.border + "55", fontSize: 12, fontWeight: 700, color: t.subText, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <span>Student</span><span>Course</span><span>Room</span><span>Email</span><span>Year</span><span>Status</span><span>Actions</span>
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: t.subText }}>No students found.</div>
            )}
            {filtered.map((s, idx) => (
              <div key={s.id}>
                <div className="row-hover" onClick={() => setExpandedId(expandedId===s.id ? null : s.id)}
                  style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 2fr 1fr 1fr 100px", padding: "12px 16px", borderTop: `1px solid ${t.border}22`, alignItems: "center", cursor: "pointer", transition: "background 0.15s", animation: `slideIn ${0.1+idx*0.04}s ease` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <AvatarInitials name={s.name} course={s.course} size={32} />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                  </div>
                  <CourseBadge course={s.course} />
                  <RoomBadge room={s.room} theme={t} />
                  <span style={{ fontSize: 13, color: t.subText }}>{s.email}</span>
                  <span style={{ fontSize: 13, color: t.subText }}>{s.year}</span>
                  <StatusBadge status={s.status} theme={t} />
                  <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                    <button className="action-btn" onClick={() => openEdit(s)} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${t.accent}`, background: "transparent", color: t.accent, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Edit</button>
                    <button className="action-btn" onClick={() => setDeleteTarget(s)} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${t.danger}`, background: "transparent", color: t.danger, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Del</button>
                  </div>
                </div>
                {expandedId === s.id && (
                  <div style={{ padding: "10px 20px 14px 60px", background: t.tableHover, borderTop: `1px solid ${t.border}22`, animation: "slideUp 0.25s ease" }}>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>📞 Phone: </span><span style={{ fontSize: 13 }}>{s.phone}</span></div>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>📅 Join Date: </span><span style={{ fontSize: 13 }}>{s.joinDate}</span></div>
                      <div><span style={{ color: t.subText, fontSize: 12 }}>📚 Year: </span><span style={{ fontSize: 13 }}>{s.year}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: t.subText }}>Showing {filtered.length} of {students.length} students</div>
        </div>
      )}


      {/* ===== ANALYTICS TAB ===== */}
      {tab === "analytics" && (
        <div style={{ animation: "slideIn 0.4s ease" }}>
          <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 28, marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: t.text }}>Students Enrolled Per Month</div>
            <BarChart labels={monthLabels} values={monthCounts} color={t.accent} theme={t} />
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Avg Students/Course", value: (total/courseList.length).toFixed(1), color: t.accent, icon: "📊" },
              { label: "Active Rate", value: `${total ? Math.round(active/total*100) : 0}%`, color: t.success, icon: "✅" },
              { label: "Rooms Used", value: rooms, color: t.warning, icon: "🏠" },
              { label: "Newest Batch", value: "2025", color: t.danger, icon: "🎓" },
            ].map((kpi, i) => (
              <div key={i} style={{
                flex: 1, minWidth: 160, background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`,
                padding: "20px 24px", textAlign: "center", animation: `slideUp ${0.2+i*0.1}s ease`,
                borderTop: `3px solid ${kpi.color}`,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{kpi.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                <div style={{ fontSize: 13, color: t.subText, marginTop: 4 }}>{kpi.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220, background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: t.text }}>By Course</div>
              {courseList.map((c, i) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: courseColors[c] }} />
                  <div style={{ flex: 1, fontSize: 13, color: t.text }}>{c}</div>
                  <div style={{ width: 80, height: 6, background: t.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${total ? (courseCounts[i]/total)*100 : 0}%`, background: courseColors[c], transition: "width 0.8s" }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text, width: 20, textAlign: "right" }}>{courseCounts[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 220, background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: t.text }}>By Year</div>
              {yearList.map(y => {
                const cnt = students.filter(s => s.year === y).length;
                return (
                  <div key={y} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1, fontSize: 13, color: t.text }}>{y}</div>
                    <div style={{ width: 80, height: 6, background: t.border, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${total ? (cnt/total)*100 : 0}%`, background: t.accent, transition: "width 0.8s" }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text, width: 20, textAlign: "right" }}>{cnt}</div>
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
            background: t.modalBg, borderRadius: 20, padding: 32, width: "100%", maxWidth: 520,
            border: `1px solid ${t.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            animation: "slideUp 0.3s ease", maxHeight: "90vh", overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.text }}>{editStudent ? "Edit Student" : "Add New Student"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: t.subText }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Full Name *</label>
                <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} style={{ ...inputStyle, borderColor: formErrors.name ? t.danger : t.border }} placeholder="e.g. John Doe" />
                {formErrors.name && <div style={errorStyle}>{formErrors.name}</div>}
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} style={{ ...inputStyle, borderColor: formErrors.email ? t.danger : t.border }} placeholder="email@example.com" />
                {formErrors.email && <div style={errorStyle}>{formErrors.email}</div>}
              </div>
              <div>
                <label style={labelStyle}>Phone *</label>
                <input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} style={{ ...inputStyle, borderColor: formErrors.phone ? t.danger : t.border }} placeholder="+91 98765 43210" />
                {formErrors.phone && <div style={errorStyle}>{formErrors.phone}</div>}
              </div>
              <div>
                <label style={labelStyle}>Room</label>
                <select value={form.room} onChange={e => setForm(f=>({...f,room:e.target.value}))} style={inputStyle}>
                  {roomList.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Course</label>
                <select value={form.course} onChange={e => setForm(f=>({...f,course:e.target.value}))} style={inputStyle}>
                  {courseList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <select value={form.year} onChange={e => setForm(f=>({...f,year:e.target.value}))} style={inputStyle}>
                  {yearList.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))} style={inputStyle}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Join Date *</label>
                <input type="date" value={form.joinDate} onChange={e => setForm(f=>({...f,joinDate:e.target.value}))} style={{ ...inputStyle, borderColor: formErrors.joinDate ? t.danger : t.border }} />
                {formErrors.joinDate && <div style={errorStyle}>{formErrors.joinDate}</div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 22px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.subText, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={handleSave} style={{
                padding: "10px 28px", borderRadius: 10, border: "none",
                background: saveAnim ? t.success : t.accent, color: "#fff",
                cursor: "pointer", fontSize: 14, fontWeight: 700,
                boxShadow: `0 4px 14px ${t.accent}55`, transition: "background 0.3s",
              }}>{saveAnim ? "Saving…" : editStudent ? "Update" : "Add Student"}</button>
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
            border: `1px solid ${t.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", animation: "slideUp 0.3s ease", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: t.text }}>Remove Student?</h2>
            <p style={{ color: t.subText, fontSize: 14, marginBottom: 24 }}>Are you sure you want to remove <strong style={{ color: t.text }}>{deleteTarget.name}</strong>? This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "10px 24px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.subText, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: t.danger, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 14px ${t.danger}55` }}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
