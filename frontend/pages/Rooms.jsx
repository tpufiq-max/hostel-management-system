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

const initialRooms = [
  { id: 1, number: "101", type: "Single", capacity: 1, status: "Available", floor: "1st", amenities: "AC, WiFi" },
  { id: 2, number: "102", type: "Double", capacity: 2, status: "Occupied", floor: "1st", amenities: "AC, WiFi, TV" },
  { id: 3, number: "201", type: "Triple", capacity: 3, status: "Available", floor: "2nd", amenities: "WiFi" },
  { id: 4, number: "202", type: "Dormitory", capacity: 8, status: "Maintenance", floor: "2nd", amenities: "WiFi" },
  { id: 5, number: "301", type: "Single", capacity: 1, status: "Occupied", floor: "3rd", amenities: "AC, WiFi" },
  { id: 6, number: "302", type: "Double", capacity: 2, status: "Available", floor: "3rd", amenities: "AC, WiFi, TV" },
];
const roomTypes = ["Single", "Double", "Triple", "Dormitory"];
const floorList = ["Ground", "1st", "2nd", "3rd"];
const roomStatuses = ["Available", "Occupied", "Maintenance"];


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


function DonutChart({ data, colors, t }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  let cumAngle = -90;
  const cx = 70, cy = 70, r = 52, inner = 32;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    const toRad = a => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(start + angle));
    const y2 = cy + r * Math.sin(toRad(start + angle));
    const xi1 = cx + inner * Math.cos(toRad(start));
    const yi1 = cy + inner * Math.sin(toRad(start));
    const xi2 = cx + inner * Math.cos(toRad(start + angle));
    const yi2 = cy + inner * Math.sin(toRad(start + angle));
    const large = angle > 180 ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`;
    return { path, color: colors[i], label: d.label, value: d.value };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={140} height={140}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.88} />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fill={t.text} fontSize={18} fontWeight="800">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={t.textMuted} fontSize={11}>Rooms</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ color: t.text, fontWeight: 600 }}>{s.label}</span>
            <span style={{ color: t.textMuted }}>({s.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function Rooms() {
  const [dark, setDark] = useState(true);
  const t = dark ? darkTheme : lightTheme;
  const [period, setPeriod] = useState("Month");
  const [tab, setTab] = useState("overview");
  const [rooms, setRooms] = useState(initialRooms);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("number");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ number: "", type: "Single", floor: "1st", status: "Available", capacity: 1, amenities: "" });
  const [hoveredId, setHoveredId] = useState(null);

  const statusColor = (s) => ({ Available: t.success, Occupied: t.accent, Maintenance: t.danger }[s] || t.muted);
  const statusBorderColor = (s) => ({ Available: t.success, Occupied: t.accent, Maintenance: t.danger }[s] || t.muted);

  const total = rooms.length;
  const availableCount = rooms.filter(r => r.status === "Available").length;
  const occupiedCount = rooms.filter(r => r.status === "Occupied").length;
  const maintenanceCount = rooms.filter(r => r.status === "Maintenance").length;
  const totalCapacity = rooms.reduce((a, r) => a + Number(r.capacity), 0);
  const occupancyRate = totalCapacity ? Math.round((occupiedCount / total) * 100) : 0;

  const filtered = rooms
    .filter(r => {
      const matchSearch = r.number.includes(search) || r.type.toLowerCase().includes(search.toLowerCase()) || r.amenities.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || r.type === typeFilter;
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "number") return a.number.localeCompare(b.number, undefined, { numeric: true });
      if (sortBy === "floor") return a.floor.localeCompare(b.floor);
      return 0;
    });

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? { ...item } : { number: "", type: "Single", floor: "1st", status: "Available", capacity: 1, amenities: "" });
    setShowModal(true);
  };

  const saveModal = () => {
    if (!form.number.trim()) return;
    if (editItem) {
      setRooms(rooms.map(r => r.id === editItem.id ? { ...form, id: editItem.id, capacity: Number(form.capacity) } : r));
    } else {
      setRooms([...rooms, { ...form, id: Date.now(), capacity: Number(form.capacity) }]);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    setRooms(rooms.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const btnStyle = (active, color) => ({
    padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
    background: active ? color : t.surfaceAlt, color: active ? "#fff" : t.textMuted, transition: "all 0.2s"
  });

  const floorBreakdown = ["Ground","1st","2nd","3rd"].map(fl => ({
    floor: fl,
    total: rooms.filter(r => r.floor === fl).length,
    available: rooms.filter(r => r.floor === fl && r.status === "Available").length,
    occupied: rooms.filter(r => r.floor === fl && r.status === "Occupied").length,
  }));

  const donutData = [
    { label: "Available", value: availableCount },
    { label: "Occupied", value: occupiedCount },
    { label: "Maintenance", value: maintenanceCount },
  ];
  const donutColors = [t.success, t.accent, t.danger];

  const floorBarData = ["Ground","1st","2nd","3rd"].map(fl => ({
    floor: fl,
    count: rooms.filter(r => r.floor === fl).length,
  }));
  const maxFloorCount = Math.max(...floorBarData.map(f => f.count), 1);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Inter',sans-serif", padding: "0 0 40px 0" }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        @keyframes slideIn { from { opacity:0; transform:scale(0.96) translateY(16px); } to { opacity:1; transform:none; } }
        .rooms-row:hover { background: ${t.surfaceAlt} !important; }
        .room-chip:hover { opacity:0.85; }
      `}</style>


      {/* Header */}
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", animation: "slideUp 0.4s ease" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.accent }}>🏠 Room Management</div>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>Manage hostel rooms and occupancy</div>
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
            + Add Room
          </button>
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>
        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 28 }}>
          <StatCard icon="🏠" label="Total Rooms" value={total} color={t.accent} sparkData={[4,5,5,6,6,6,total]} trend={5} t={t} />
          <StatCard icon="✅" label="Available" value={availableCount} color={t.success} sparkData={[2,3,2,3,3,3,availableCount]} trend={2} t={t} />
          <StatCard icon="🛏️" label="Occupied" value={occupiedCount} color={t.warning} sparkData={[1,2,2,2,2,2,occupiedCount]} trend={-4} t={t} />
          <StatCard icon="🔧" label="Maintenance" value={maintenanceCount} color={t.danger} sparkData={[0,1,1,1,1,1,maintenanceCount]} trend={0} t={t} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: t.surfaceAlt, borderRadius: 24, padding: 4, width: "fit-content" }}>
          {["overview","rooms","analytics"].map(tb => (
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
            {/* Left: Room Cards Grid */}
            <div style={{ flex: "2 1 380px", animation: "slideUp 0.5s ease" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: t.text }}>🏠 Room Overview</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {rooms.map(room => (
                  <div key={room.id}
                    onMouseEnter={() => setHoveredId(room.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      background: t.surface, borderRadius: 14, padding: "18px 18px 14px 22px",
                      border: `1px solid ${t.border}`, borderLeft: `4px solid ${statusBorderColor(room.status)}`,
                      boxShadow: hoveredId===room.id ? t.cardShadow : "none",
                      transition: "all 0.2s", cursor: "default",
                      transform: hoveredId===room.id ? "translateY(-2px)" : "none"
                    }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: t.text, lineHeight: 1 }}>{room.number}</div>
                      <span style={{ background: statusColor(room.status)+"22", color: statusColor(room.status), borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{room.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 4 }}><span style={{ fontWeight: 600, color: t.text }}>{room.type}</span> · {room.floor} Floor</div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>👥 Capacity: <span style={{ color: t.text, fontWeight: 600 }}>{room.capacity}</span></div>
                    <div style={{ fontSize: 11, color: t.textMuted, background: t.surfaceAlt, borderRadius: 8, padding: "4px 8px", display: "inline-block" }}>
                      📡 {room.amenities}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: Donut + Floor Breakdown */}
            <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: t.surface, borderRadius: 16, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.cardShadow, animation: "slideUp 0.55s ease" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: t.text }}>🍩 Occupancy Overview</div>
                <DonutChart data={donutData} colors={donutColors} t={t} />
              </div>
              <div style={{ background: t.surface, borderRadius: 16, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.cardShadow, animation: "slideUp 0.6s ease" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: t.text }}>🏢 Floor-wise Breakdown</div>
                {floorBreakdown.filter(f => f.total > 0).map((f, i) => (
                  <div key={f.floor} style={{ padding: "10px 0", borderBottom: i < floorBreakdown.length-1 ? `1px solid ${t.border}` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: t.text, fontSize: 13 }}>{f.floor} Floor</span>
                      <span style={{ color: t.textMuted, fontSize: 12 }}>{f.total} rooms</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                      <span style={{ color: t.success }}>✅ {f.available} Avail</span>
                      <span style={{ color: t.accent }}>🛏 {f.occupied} Occ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* ROOMS TAB */}
        {tab === "rooms" && (
          <div style={{ background: t.surface, borderRadius: 16, padding: 24, border: `1px solid ${t.border}`, boxShadow: t.cardShadow, animation: "slideUp 0.5s ease" }}>
            {/* Filters */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search by number, type, amenities..."
                style={{ flex: "1 1 200px", background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 14px", color: t.text, fontSize: 14, outline: "none" }}
              />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 14px", color: t.text, fontSize: 14, outline: "none", cursor: "pointer" }}>
                <option value="All">All Status</option>
                {roomStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 10, padding: "9px 14px", color: t.text, fontSize: 14, outline: "none", cursor: "pointer" }}>
                <option value="number">Sort by Number</option>
                <option value="floor">Sort by Floor</option>
              </select>
              <div style={{ display: "flex", gap: 6 }}>
                {["All",...roomTypes].map(tp => (
                  <button key={tp} className="room-chip" onClick={() => setTypeFilter(tp)}
                    style={{ padding: "7px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
                      background: typeFilter===tp ? t.accent : t.surfaceAlt, color: typeFilter===tp ? "#fff" : t.textMuted, transition: "all 0.2s" }}>
                    {tp}
                  </button>
                ))}
              </div>
            </div>
            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${t.border}` }}>
                    {["Room No.","Type","Floor","Capacity","Amenities","Status","Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: t.textMuted, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="rooms-row" style={{ borderBottom: `1px solid ${t.border}`, transition: "background 0.15s" }}>
                      <td style={{ padding: "11px 12px", color: t.text, fontWeight: 800, fontSize: 16 }}>{r.number}</td>
                      <td style={{ padding: "11px 12px", color: t.text, fontWeight: 600 }}>{r.type}</td>
                      <td style={{ padding: "11px 12px", color: t.textMuted }}>{r.floor}</td>
                      <td style={{ padding: "11px 12px", color: t.text }}>{r.capacity}</td>
                      <td style={{ padding: "11px 12px", color: t.textMuted, fontSize: 12 }}>{r.amenities}</td>
                      <td style={{ padding: "11px 12px" }}>
                        <span style={{ background: statusColor(r.status)+"22", color: statusColor(r.status), borderRadius: 8, padding: "3px 10px", fontWeight: 700, fontSize: 12 }}>{r.status}</span>
                      </td>
                      <td style={{ padding: "11px 12px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openModal(r)} style={{ background: t.accent+"22", border: "none", borderRadius: 8, padding: "5px 12px", color: t.accent, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Edit</button>
                          <button onClick={() => setDeleteId(r.id)} style={{ background: t.danger+"22", border: "none", borderRadius: 8, padding: "5px 12px", color: t.danger, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: t.textMuted }}>No rooms found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div style={{ animation: "slideUp 0.5s ease" }}>
            {/* Bar Chart: Rooms by Floor */}
            <div style={{ background: t.surface, borderRadius: 16, padding: 28, border: `1px solid ${t.border}`, boxShadow: t.cardShadow, marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: t.text }}>🏢 Rooms by Floor</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 24, height: 140, padding: "0 8px" }}>
                {floorBarData.map(f => {
                  const h = maxFloorCount ? (f.count / maxFloorCount) * 120 : 0;
                  return (
                    <div key={f.floor} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 14, color: t.textMuted, fontWeight: 700 }}>{f.count}</div>
                      <div style={{ width: "60%", height: h, background: `linear-gradient(180deg, ${t.accent}, ${t.accent}88)`, borderRadius: "8px 8px 0 0", transition: "height 0.8s ease", minHeight: f.count > 0 ? 6 : 0 }} />
                      <div style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>{f.floor || "GF"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* 4 KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18 }}>
              {[
                { label: "Occupancy Rate", value: `${occupancyRate}%`, icon: "📊", color: t.accent },
                { label: "Total Capacity", value: totalCapacity, icon: "👥", color: t.success },
                { label: "Available Rooms", value: availableCount, icon: "🟢", color: t.success },
                { label: "Under Maintenance", value: maintenanceCount, icon: "🔧", color: t.danger },
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
          <div style={{ background: t.surface, borderRadius: 20, padding: 32, minWidth: 400, maxWidth: 480, width: "90vw", boxShadow: t.cardShadow, border: `1px solid ${t.border}`, animation: "slideIn 0.35s ease" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text, marginBottom: 20 }}>{editItem ? "✏️ Edit Room" : "➕ Add Room"}</div>
            {[
              { label: "Room Number", key: "number", type: "text" },
              { label: "Type", key: "type", type: "select", options: roomTypes },
              { label: "Floor", key: "floor", type: "select", options: floorList },
              { label: "Status", key: "status", type: "select", options: roomStatuses },
              { label: "Capacity", key: "capacity", type: "number" },
              { label: "Amenities", key: "amenities", type: "text" },
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
            <div style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 8 }}>Delete Room?</div>
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
