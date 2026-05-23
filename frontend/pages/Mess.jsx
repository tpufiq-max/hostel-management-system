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
const initialMeals = [
  { id: 1, day: "Monday", type: "Breakfast", menu: "Idli, Sambar, Chutney", calories: 350, rating: 4 },
  { id: 2, day: "Monday", type: "Lunch", menu: "Rice, Dal, Sabzi, Chapati", calories: 650, rating: 5 },
  { id: 3, day: "Monday", type: "Dinner", menu: "Roti, Paneer, Salad", calories: 500, rating: 4 },
  { id: 4, day: "Tuesday", type: "Breakfast", menu: "Poha, Tea, Banana", calories: 300, rating: 3 },
  { id: 5, day: "Tuesday", type: "Lunch", menu: "Biryani, Raita, Papad", calories: 700, rating: 5 },
  { id: 6, day: "Wednesday", type: "Lunch", menu: "Chole, Puri, Pickle", calories: 600, rating: 4 },
  { id: 7, day: "Thursday", type: "Dinner", menu: "Khichdi, Ghee, Curd", calories: 450, rating: 4 },
  { id: 8, day: "Friday", type: "Lunch", menu: "Pasta, Garlic Bread, Juice", calories: 580, rating: 5 },
];
const dayList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const sparkData = {
  accent: [4,6,5,8,7,9,8],
  gold:   [3,4,5,4,5,4,5],
  success:[2,4,3,5,4,6,5],
  warning:[300,450,350,500,400,600,450],
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
  const last = pts.split(" ").slice(-1)[0].split(",");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}


// ── helpers ───────────────────────────────────────────────────────────────────
function mealIcon(type) {
  if (type === "Breakfast") return "🌅";
  if (type === "Lunch") return "☀️";
  if (type === "Dinner") return "🌙";
  return "🍎";
}
function mealChipColor(type, t) {
  if (type === "Breakfast") return t.accent;
  if (type === "Lunch") return t.success;
  if (type === "Dinner") return t.purple;
  return t.warning;
}
function StarRating({ rating, max = 5 }) {
  return (
    <span>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ fontSize: 13, color: i < rating ? "#f59e0b" : "#475569" }}>★</span>
      ))}
    </span>
  );
}
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


// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, sparkKey, suffix, t }) {
  const numVal = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const animated = useCountUp(Math.round(numVal));
  const display = suffix ? `${animated}${suffix}` : String(animated);
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`, borderRadius: 16,
      padding: "20px 24px", flex: "1 1 160px", minWidth: 150,
      boxShadow: t.shadow, display: "flex", flexDirection: "column", gap: 8,
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 13, color: t.subtext, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{display}</div>
      <MiniSparkline data={sparkData[sparkKey] || sparkData.accent} color={color} />
    </div>
  );
}

// ── Backdrop / Modal shell ────────────────────────────────────────────────────
function Backdrop({ children, onClose, t }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(4px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: t.card, border: `1px solid ${t.border}`, borderRadius: 18,
        padding: 32, width: "100%", maxWidth: 500, maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        animation: "slideUp 0.25s ease",
      }}>
        {children}
      </div>
    </div>
  );
}

// ── AddEditModal ──────────────────────────────────────────────────────────────
function AddEditModal({ item, onSave, onClose, t }) {
  const empty = { day: "Monday", type: "Breakfast", menu: "", calories: 400, rating: 3 };
  const [form, setForm] = useState(item ? { ...item } : empty);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Backdrop onClose={onClose} t={t}>
      <div style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 20 }}>
        {item ? "Edit Meal" : "Add New Meal"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle(t)}>Day</label>
            <select style={inputStyle(t)} value={form.day} onChange={e => set("day", e.target.value)}>
              {dayList.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle(t)}>Meal Type</label>
            <select style={inputStyle(t)} value={form.type} onChange={e => set("type", e.target.value)}>
              {mealTypes.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle(t)}>Menu Items</label>
          <textarea style={{ ...inputStyle(t), minHeight: 80, resize: "vertical" }} value={form.menu} onChange={e => set("menu", e.target.value)} placeholder="e.g. Rice, Dal, Sabzi, Chapati" />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle(t)}>Calories</label>
            <input type="number" style={inputStyle(t)} value={form.calories} onChange={e => set("calories", Number(e.target.value))} min={0} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle(t)}>Rating (1–5)</label>
            <select style={inputStyle(t)} value={form.rating} onChange={e => set("rating", Number(e.target.value))}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {"⭐".repeat(n)}</option>)}
            </select>
          </div>
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
        <div style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 8 }}>Remove Meal?</div>
        <div style={{ color: t.subtext, marginBottom: 24, fontSize: 14 }}>
          Remove <strong style={{ color: t.text }}>{item.day} {item.type}</strong> from the menu? This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "10px 26px", borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "10px 26px", borderRadius: 10, border: "none", background: t.danger, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Remove</button>
        </div>
      </div>
    </Backdrop>
  );
}

// ── OverviewTab ───────────────────────────────────────────────────────────────
function OverviewTab({ meals, t }) {
  const [expanded, setExpanded] = useState(null);
  const toggle = id => setExpanded(e => e === id ? null : id);

  // Weekly grid
  const weekGrid = dayList.map(day => ({
    day,
    meals: mealTypes.map(type => meals.find(m => m.day === day && m.type === type)).filter(Boolean),
  }));

  // Top rated
  const topRated = [...meals].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {/* Left: expandable meal list */}
      <div style={{ flex: "2 1 380px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 14 }}>Meal List</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {meals.map(m => (
            <div key={m.id} style={{
              background: t.card, border: `1px solid ${t.border}`, borderRadius: 14,
              overflow: "hidden", boxShadow: t.shadow, animation: "slideIn 0.3s ease",
            }}>
              <div onClick={() => toggle(m.id)} style={{
                padding: "14px 18px", cursor: "pointer", display: "flex",
                alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <span style={{ fontSize: 18 }}>{mealIcon(m.type)}</span>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 600, color: t.text, fontSize: 14 }}>{m.day} · {m.type}</div>
                  <div style={{ fontSize: 12, color: t.subtext, marginTop: 2 }}>{m.menu}</div>
                </div>
                <StarRating rating={m.rating} />
                <span style={{
                  background: mealChipColor(m.type, t) + "22",
                  color: mealChipColor(m.type, t),
                  borderRadius: 8, padding: "2px 10px", fontSize: 11, fontWeight: 700,
                  border: `1px solid ${mealChipColor(m.type, t)}44`,
                }}>{m.type}</span>
                <span style={{ color: t.subtext, fontSize: 16 }}>{expanded === m.id ? "▲" : "▼"}</span>
              </div>
              {expanded === m.id && (
                <div style={{ padding: "0 18px 14px", borderTop: `1px solid ${t.border}`, paddingTop: 10, display: "flex", gap: 20 }}>
                  <div><span style={{ color: t.subtext, fontSize: 12 }}>Calories: </span><span style={{ color: t.warning, fontWeight: 700, fontSize: 14 }}>{m.calories} kcal</span></div>
                  <div><span style={{ color: t.subtext, fontSize: 12 }}>Rating: </span><StarRating rating={m.rating} /></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: weekly schedule + top rated */}
      <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "18px 20px", boxShadow: t.shadow }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 14 }}>Weekly Schedule</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weekGrid.map(row => (
              <div key={row.day} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: t.subtext, width: 72, flexShrink: 0 }}>{row.day.slice(0, 3)}</span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {row.meals.length > 0 ? row.meals.map(m => (
                    <span key={m.id} style={{
                      background: mealChipColor(m.type, t) + "28",
                      color: mealChipColor(m.type, t),
                      borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700,
                      border: `1px solid ${mealChipColor(m.type, t)}44`,
                    }}>{mealIcon(m.type)} {m.type}</span>
                  )) : <span style={{ color: t.subtext, fontSize: 11 }}>—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "18px 20px", boxShadow: t.shadow }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 12 }}>⭐ Top Rated Meals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topRated.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>{mealIcon(m.type)} {m.type}</div>
                  <div style={{ fontSize: 11, color: t.subtext }}>{m.day}</div>
                </div>
                <StarRating rating={m.rating} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// ── MenuTab ───────────────────────────────────────────────────────────────────
function MenuTab({ meals, onEdit, onDelete, t }) {
  const [dayFilter, setDayFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("none");

  let filtered = meals.filter(m => {
    const matchDay = dayFilter === "All" || m.day === dayFilter;
    const matchType = typeFilter === "All" || m.type === typeFilter;
    return matchDay && matchType;
  });
  if (sortBy === "calories-asc") filtered = [...filtered].sort((a, b) => a.calories - b.calories);
  if (sortBy === "calories-desc") filtered = [...filtered].sort((a, b) => b.calories - a.calories);
  if (sortBy === "rating-desc") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  if (sortBy === "rating-asc") filtered = [...filtered].sort((a, b) => a.rating - b.rating);

  const chipStyle = (active, color) => ({
    padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: active ? "none" : `1px solid ${color}44`,
    background: active ? color : color + "18",
    color: active ? "#fff" : color, transition: "all 0.2s",
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle(t), maxWidth: 200 }}>
          <option value="none">Sort by…</option>
          <option value="calories-asc">Calories ↑</option>
          <option value="calories-desc">Calories ↓</option>
          <option value="rating-desc">Rating ↓</option>
          <option value="rating-asc">Rating ↑</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {["All", ...dayList].map(d => (
          <button key={d} onClick={() => setDayFilter(d)} style={chipStyle(dayFilter === d, t.accent)}>
            {d === "All" ? "All Days" : d.slice(0, 3)}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {["All", ...mealTypes].map(mt => (
          <button key={mt} onClick={() => setTypeFilter(mt)} style={chipStyle(typeFilter === mt, mealChipColor(mt === "All" ? "Breakfast" : mt, t))}>
            {mt === "All" ? "All Types" : `${mealIcon(mt)} ${mt}`}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: t.subtext }}>No meals match your filters.</div>
        )}
        {filtered.map(m => (
          <div key={m.id} style={{
            background: t.card, border: `1px solid ${t.border}`, borderRadius: 12,
            padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
            flexWrap: "wrap", boxShadow: t.shadow, animation: "slideIn 0.25s ease",
          }}>
            <span style={{ fontSize: 20 }}>{mealIcon(m.type)}</span>
            <div style={{ flex: "2 1 160px" }}>
              <div style={{ fontWeight: 600, color: t.text, fontSize: 14 }}>{m.day} · {m.type}</div>
              <div style={{ color: t.subtext, fontSize: 12, marginTop: 2 }}>{m.menu}</div>
            </div>
            <span style={{ background: t.warning + "22", color: t.warning, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>🔥 {m.calories} kcal</span>
            <StarRating rating={m.rating} />
            <span style={{
              background: mealChipColor(m.type, t) + "22", color: mealChipColor(m.type, t),
              borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700,
            }}>{m.type}</span>
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button onClick={() => onEdit(m)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.accent}44`, background: t.accent + "18", color: t.accent, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Edit</button>
              <button onClick={() => onDelete(m)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.danger}44`, background: t.danger + "18", color: t.danger, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── AnalyticsTab ──────────────────────────────────────────────────────────────
function AnalyticsTab({ meals, t }) {
  const dayData = dayList.map(d => ({ day: d, count: meals.filter(m => m.day === d).length }));
  const maxCount = Math.max(...dayData.map(d => d.count), 1);

  const avgRating = meals.length ? (meals.reduce((s, m) => s + m.rating, 0) / meals.length).toFixed(1) : "0.0";
  const avgCals = meals.length ? Math.round(meals.reduce((s, m) => s + m.calories, 0) / meals.length) : 0;
  const topMeal = meals.reduce((best, m) => (!best || m.rating > best.rating) ? m : best, null);
  const dayCountMap = dayList.map(d => meals.filter(m => m.day === d).length);
  const maxDayIdx = dayCountMap.indexOf(Math.max(...dayCountMap));
  const mostPopularDay = dayList[maxDayIdx] || "N/A";
  const weekTotal = meals.length;

  const kpiCards = [
    { label: "Highest Rated Meal", value: topMeal ? `${topMeal.day} ${topMeal.type}` : "N/A", color: t.gold, icon: "🏆" },
    { label: "Avg Daily Calories", value: `${avgCals} kcal`, color: t.warning, icon: "🔥" },
    { label: "Most Popular Day", value: mostPopularDay, color: t.success, icon: "📅" },
    { label: "Total Meals This Week", value: String(weekTotal), color: t.accent, icon: "🍽️" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Bar chart */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "24px 28px", boxShadow: t.shadow }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 20 }}>Meals Per Day of Week</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 130 }}>
          {dayData.map(d => (
            <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: "1 1 40px" }}>
              <div style={{ fontSize: 11, color: t.subtext }}>{d.count}</div>
              <div style={{
                width: "100%", maxWidth: 44,
                height: `${(d.count / maxCount) * 100}px`,
                background: `linear-gradient(to top, ${t.success}, ${t.success}88)`,
                borderRadius: "6px 6px 0 0",
                transition: "height 0.8s ease",
                minHeight: d.count ? 6 : 0,
              }} />
              <div style={{ fontSize: 10, color: t.subtext }}>{d.day.slice(0, 3)}</div>
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
            <div style={{ fontSize: k.value.length > 10 ? 15 : 20, fontWeight: 800, color: k.color, lineHeight: 1.2 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: t.subtext, marginTop: 6 }}>{k.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function Mess() {
  const [dark, setDark] = useState(true);
  const [period, setPeriod] = useState("Week");
  const [activeTab, setActiveTab] = useState("overview");
  const [meals, setMeals] = useState(initialMeals);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const t = dark ? darkTheme : lightTheme;

  const totalMeals = meals.length;
  const avgRatingNum = meals.length ? parseFloat((meals.reduce((s, m) => s + m.rating, 0) / meals.length).toFixed(1)) : 0;
  const weeklyItems = meals.filter(m => ["Monday","Tuesday","Wednesday","Thursday","Friday"].includes(m.day)).length;
  const avgCals = meals.length ? Math.round(meals.reduce((s, m) => s + m.calories, 0) / meals.length) : 0;

  function handleSave(form) {
    if (editItem) {
      setMeals(ms => ms.map(m => m.id === editItem.id ? { ...m, ...form } : m));
      setEditItem(null);
    } else {
      setMeals(ms => [...ms, { ...form, id: Date.now() }]);
      setShowAdd(false);
    }
  }
  function handleDelete() {
    setMeals(ms => ms.filter(m => m.id !== deleteItem.id));
    setDeleteItem(null);
  }

  const tabs = ["overview", "menu", "analytics"];

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
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>🍽️ Mess Management</div>
          <div style={{ fontSize: 13, color: t.subtext }}>Manage hostel mess menu and meal schedules</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: t.toggleBg, borderRadius: 10, padding: 3, gap: 2 }}>
            {["Week", "Month", "Year"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 13,
                background: period === p ? t.accent : "transparent",
                color: period === p ? "#fff" : t.subtext,
                transition: "all 0.2s",
              }}>{p}</button>
            ))}
          </div>
          <button onClick={() => setDark(d => !d)} style={{
            padding: "8px 16px", borderRadius: 10, border: `1px solid ${t.border}`,
            background: t.toggleBg, color: t.text, cursor: "pointer", fontWeight: 600, fontSize: 14,
          }}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
          <button onClick={() => setShowAdd(true)} style={{
            padding: "9px 20px", borderRadius: 10, border: "none", background: t.accent,
            color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14,
          }}>+ Add Meal</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <StatCard label="Total Meals" value={totalMeals} color={t.accent} sparkKey="accent" t={t} />
          <StatCard label="Avg Rating ⭐" value={Math.round(avgRatingNum * 10)} color={t.gold} sparkKey="gold" suffix="" t={t} />
          <StatCard label="Weekly Menu Items" value={weeklyItems} color={t.success} sparkKey="success" t={t} />
          <StatCard label="Avg Calories" value={avgCals} color={t.warning} sparkKey="warning" t={t} />
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
          {activeTab === "overview" && <OverviewTab meals={meals} t={t} />}
          {activeTab === "menu" && <MenuTab meals={meals} onEdit={m => setEditItem(m)} onDelete={m => setDeleteItem(m)} t={t} />}
          {activeTab === "analytics" && <AnalyticsTab meals={meals} t={t} />}
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
