import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

const menuItems = [
  { name: "Dashboard",   path: "/",                 icon: "🏠", section: "main"     },
  { name: "Students",    path: "/students",         icon: "👥", section: "main"     },
  { name: "Rooms",       path: "/rooms",            icon: "🚪", section: "main"     },
  { name: "Allocation",  path: "/allocation",       icon: "▪",  section: "main"     },
  { name: "Mess",        path: "/mess",             icon: "🍽️", section: "main"     },
  { name: "Fees",        path: "/fees",             icon: "₹",  section: "finance"  },
  { name: "Attendance",  path: "/attendance",       icon: "📅", section: "academic" },
  { name: "Complaint",   path: "/complaint",        icon: "🔔", section: "academic" },
  { name: "Maintenance", path: "/maintenance",      icon: "🔧", section: "academic" },
  { name: "Visitors",    path: "/visitor",          icon: "👤", section: "academic" },
  { name: "Notice",      path: "/notice",           icon: "📢", section: "reports"  },
  { name: "Reports",     path: "/reports",          icon: "▪",  section: "reports"  },
  { name: "Analytics",   path: "/analytics",        icon: "📈", section: "reports"  },
  { name: "Profiles",    path: "/student-profiles", icon: "🪪", section: "reports"  },
  { name: "Events",      path: "/events",           icon: "🎉", section: "reports"  },
];

const sections = [
  { key: "main",     label: "Main"     },
  { key: "finance",  label: "Finance"  },
  { key: "academic", label: "Academic" },
  { key: "reports",  label: "Reports"  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, t: tProp, isDark: isDarkProp }) {
  const themeCtx = useContext(ThemeContext);
  const authCtx  = useContext(AuthContext);

  const t      = tProp     ?? themeCtx?.t     ?? { bg: "#020617", surface: "#0b1220", card: "#0f172a", border: "#1e293b", text: "#f8fafc", muted: "#94a3b8", accent: "#3b82f6" };
  const isDark = isDarkProp ?? themeCtx?.isDark ?? true;

  const user      = authCtx?.user;
  const userName  = user?.name ?? "Guest";
  const userRole  = user?.role ?? "guest";
  const initials  = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [tooltip, setTooltip] = useState(null);

  return (
    <>
      <style>{`
        .hms-nav-link { text-decoration: none !important; }
        .hms-nav-link:focus { outline: none; }

        .hms-sb-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          position: relative;
        }

        .hms-sb-item.active {
          background: ${t.accent};
          color: #ffffff;
          box-shadow: 0 4px 14px ${t.accent}55;
        }

        .hms-sb-item:not(.active):hover {
          background: ${isDark ? "#1e293b" : "#f1f5f9"};
          color: ${t.accent};
        }

        .hms-sb-item:not(.active) {
          color: ${t.muted};
        }

        /* Thin active indicator bar */
        .hms-sb-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 6px; bottom: 6px;
          width: 3px;
          background: #fff;
          border-radius: 0 3px 3px 0;
          opacity: 0.6;
        }

        /* Scrollbar */
        .hms-sb-nav::-webkit-scrollbar       { width: 4px; }
        .hms-sb-nav::-webkit-scrollbar-track { background: transparent; }
        .hms-sb-nav::-webkit-scrollbar-thumb {
          background: ${isDark ? "#1e293b" : "#cbd5e1"};
          border-radius: 4px;
        }

        @keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

        /* Tooltip */
        .hms-tooltip {
          position: fixed;
          left: 84px;
          background: ${t.card};
          border: 1px solid ${t.border};
          color: ${t.text};
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          z-index: 9999;
          pointer-events: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          animation: fadeIn 0.15s ease;
        }
      `}</style>

      {/* Tooltip (only when collapsed) */}
      {!sidebarOpen && tooltip && (
        <div className="hms-tooltip" style={{ top: tooltip.y }}>
          {tooltip.label}
        </div>
      )}

      <aside style={{
        width:          "100%",
        height:         "100vh",
        background:     t.surface,
        borderRight:    `1px solid ${t.border}`,
        display:        "flex",
        flexDirection:  "column",
        overflow:       "hidden",
        transition:     "background 0.3s, border-color 0.3s",
        fontFamily:     "'Inter', system-ui, sans-serif",
      }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          padding:        sidebarOpen ? "18px 16px" : "18px 0",
          borderBottom:   `1px solid ${t.border}`,
          flexShrink:     0,
          minHeight:      64,
          transition:     "padding 0.3s",
        }}>
          {/* Logo */}
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${t.accent}, #a855f7)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, boxShadow: `0 4px 12px ${t.accent}44`,
              }}>🏠</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.text, letterSpacing: -0.3 }}>HMS</div>
                <div style={{ fontSize: 10, color: t.muted }}>Hostel System</div>
              </div>
            </div>
          )}

          {/* Collapsed logo (just icon) */}
          {!sidebarOpen && (
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${t.accent}, #a855f7)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: `0 4px 12px ${t.accent}44`,
            }}>🏠</div>
          )}

          {/* Toggle button */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                border: `1px solid ${t.border}`,
                background: t.card, color: t.muted,
                cursor: "pointer", fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = t.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = t.card; e.currentTarget.style.color = t.muted; e.currentTarget.style.borderColor = t.border; }}
            >
              ←
            </button>
          )}

          {/* Expand button when collapsed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                position: "absolute", top: 70, right: -12,
                width: 24, height: 24, borderRadius: "50%",
                border: `1px solid ${t.border}`,
                background: t.surface, color: t.muted,
                cursor: "pointer", fontSize: 11,
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10, boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.color = t.muted; }}
            >
              →
            </button>
          )}
        </div>

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav
          className="hms-sb-nav"
          style={{
            flex:      1,
            overflowY: "auto",
            overflowX: "hidden",
            padding:   sidebarOpen ? "12px 10px" : "12px 8px",
            display:   "flex",
            flexDirection: "column",
            gap:       2,
          }}
        >
          {sections.map(sec => {
            const items = menuItems.filter(m => m.section === sec.key);
            return (
              <div key={sec.key} style={{ marginBottom: 8 }}>
                {/* Section label */}
                {sidebarOpen && (
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: t.muted,
                    textTransform: "uppercase", letterSpacing: 1,
                    padding: "6px 12px 4px",
                    opacity: 0.7,
                  }}>
                    {sec.label}
                  </div>
                )}
                {!sidebarOpen && (
                  <div style={{
                    height: 1, background: t.border,
                    margin: "6px 8px 6px",
                    opacity: 0.5,
                  }} />
                )}

                {/* Nav items */}
                {items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `hms-nav-link hms-sb-item${isActive ? " active" : ""}`
                    }
                    onMouseEnter={e => {
                      if (!sidebarOpen) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ label: item.name, y: rect.top + rect.height / 2 - 14 });
                      }
                    }}
                    onMouseLeave={() => { setTooltip(null); }}
                  >
                    {/* Icon */}
                    <span style={{
                      fontSize:   18,
                      flexShrink: 0,
                      width:      22,
                      textAlign:  "center",
                      display:    "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}>
                      {item.icon}
                    </span>

                    {/* Label (hidden when collapsed) */}
                    {sidebarOpen && (
                      <span style={{
                        flex:     1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 13,
                        fontWeight: 500,
                      }}>
                        {item.name}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* ── Footer (real user, not hardcoded "Admin User") ─────────────── */}
        <div style={{
          borderTop:  `1px solid ${t.border}`,
          padding:    sidebarOpen ? "14px 16px" : "14px 8px",
          flexShrink: 0,
          display:    "flex",
          alignItems: "center",
          gap:        10,
          transition: "padding 0.3s",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${t.accent}, #a855f7)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700,
          }}>
            {initials}
          </div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userName}
              </div>
              <div style={{ fontSize: 11, color: t.muted, textTransform: "capitalize" }}>
                {userRole === "admin" ? "👑 Administrator" : userRole === "warden" ? "🛡️ Warden" : "🎓 Student"}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
