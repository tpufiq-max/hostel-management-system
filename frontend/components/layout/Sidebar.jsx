import React, { useState, useContext, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

/**
 * Sidebar — role-aware navigation.
 *
 * Each item declares which roles can see it. ADMINs and WARDENs see the full
 * menu; STUDENTs see only their own dashboard, profile, fees, attendance,
 * room, complaints, maintenance, notices and events.
 */

const ALL = ["admin", "warden", "student"];
const STAFF = ["admin", "warden"];
const ADMIN = ["admin"];

const menuItems = [
  // ── shared ────────────────────────────────────────────────────────
  { name: "Dashboard",       path: "/",             icon: "🏠", section: "main",     roles: ALL   },

  // ── admin / warden ────────────────────────────────────────────────
  { name: "Students",        path: "/students",     icon: "👥", section: "main",     roles: STAFF },
  { name: "Rooms",           path: "/rooms",        icon: "🚪", section: "main",     roles: STAFF },
  { name: "Allocation",      path: "/allocation",   icon: "▪",  section: "main",     roles: STAFF },
  { name: "Mess",            path: "/mess",         icon: "🍽️", section: "main",     roles: STAFF },

  { name: "Fees",            path: "/fees",         icon: "₹",  section: "finance",  roles: STAFF },
  { name: "Financial",       path: "/financial",    icon: "💰", section: "finance",  roles: ADMIN },

  { name: "Attendance",      path: "/attendance",   icon: "📅", section: "academic", roles: STAFF },
  { name: "Mess Attendance", path: "/mess/attendance", icon: "🍽️", section: "academic", roles: STAFF },
  { name: "Complaints",      path: "/complaint",    icon: "🔔", section: "academic", roles: STAFF },
  { name: "Maintenance",     path: "/maintenance",  icon: "🔧", section: "academic", roles: STAFF },
  { name: "Visitors",        path: "/visitor",      icon: "👤", section: "academic", roles: STAFF },

  { name: "Notice",          path: "/notice",       icon: "📢", section: "reports",  roles: STAFF },
  { name: "Reports",         path: "/reports",      icon: "▪",  section: "reports",  roles: STAFF },
  { name: "Analytics",       path: "/analytics",    icon: "📈", section: "reports",  roles: ADMIN },
  { name: "Profiles",        path: "/student-profiles", icon: "🪪", section: "reports", roles: STAFF },
  { name: "Events",          path: "/events",       icon: "🎉", section: "reports",  roles: STAFF },

  // ── student-only ──────────────────────────────────────────────────
  { name: "My Profile",      path: "/me/profile",     icon: "🧑", section: "me",        roles: ["student"] },
  { name: "My Room",         path: "/me/room",        icon: "🚪", section: "me",        roles: ["student"] },
  { name: "My Fees",         path: "/me/fees",        icon: "₹",  section: "me",        roles: ["student"] },
  { name: "My Attendance",   path: "/me/attendance",  icon: "📅", section: "me",        roles: ["student"] },
  { name: "My Mess",         path: "/me/mess",        icon: "🍽️", section: "me",        roles: ["student"] },
  { name: "My Complaints",   path: "/me/complaints",  icon: "🔔", section: "me",        roles: ["student"] },
  { name: "My Maintenance",  path: "/me/maintenance", icon: "🔧", section: "me",        roles: ["student"] },
  { name: "Notices",         path: "/me/notices",     icon: "📢", section: "me",        roles: ["student"] },
];

const sectionMeta = [
  { key: "main",     label: "Main"     },
  { key: "me",       label: "My space" },
  { key: "finance",  label: "Finance"  },
  { key: "academic", label: "Academic" },
  { key: "reports",  label: "Reports"  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, t: tProp, isDark: isDarkProp }) {
  const themeCtx = useContext(ThemeContext);
  const auth     = useContext(AuthContext);

  const t      = tProp      ?? themeCtx?.t      ?? { bg: "#020617", surface: "#0b1220", card: "#0f172a", border: "#1e293b", text: "#f8fafc", muted: "#94a3b8", accent: "#3b82f6" };
  const isDark = isDarkProp ?? themeCtx?.isDark ?? true;
  const role   = (auth?.user?.role ?? "guest").toLowerCase();

  const [tooltip, setTooltip] = useState(null);

  // Filter items by role and group by section.
  const sections = useMemo(() => {
    const visible = menuItems.filter(m => m.roles.includes(role));
    return sectionMeta
      .map(s => ({ ...s, items: visible.filter(m => m.section === s.key) }))
      .filter(s => s.items.length > 0);
  }, [role]);

  const userInitials = (auth?.user?.name ?? "U")
    .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = role === "admin"   ? "👑 Administrator"
                  : role === "warden"  ? "🛡 Warden"
                  : role === "student" ? "🎓 Student"
                  : "Guest";

  return (
    <>
      <style>{`
        .hms-nav-link { text-decoration: none !important; }
        .hms-nav-link:focus { outline: none; }

        .hms-sb-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 12px;
          cursor: pointer; transition: all 0.2s ease;
          font-size: 14px; font-weight: 500;
          white-space: nowrap; overflow: hidden;
          position: relative;
        }
        .hms-sb-item.active {
          background: ${t.accent}; color: #fff;
          box-shadow: 0 4px 14px ${t.accent}55;
        }
        .hms-sb-item:not(.active):hover {
          background: ${isDark ? "#1e293b" : "#f1f5f9"};
          color: ${t.accent};
        }
        .hms-sb-item:not(.active) { color: ${t.muted}; }
        .hms-sb-item.active::before {
          content: ''; position: absolute; left: 0; top: 6px; bottom: 6px;
          width: 3px; background: #fff; border-radius: 0 3px 3px 0; opacity: 0.6;
        }

        .hms-sb-nav::-webkit-scrollbar { width: 4px; }
        .hms-sb-nav::-webkit-scrollbar-track { background: transparent; }
        .hms-sb-nav::-webkit-scrollbar-thumb {
          background: ${isDark ? "#1e293b" : "#cbd5e1"};
          border-radius: 4px;
        }

        @keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        .hms-tooltip {
          position: fixed; left: 84px;
          background: ${t.card}; border: 1px solid ${t.border}; color: ${t.text};
          padding: 6px 12px; border-radius: 8px;
          font-size: 12px; font-weight: 600; white-space: nowrap;
          z-index: 9999; pointer-events: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          animation: fadeIn 0.15s ease;
        }
      `}</style>

      {!sidebarOpen && tooltip && (
        <div className="hms-tooltip" style={{ top: tooltip.y }}>
          {tooltip.label}
        </div>
      )}

      <aside style={{
        width: "100%", height: "100vh",
        background: t.surface, borderRight: `1px solid ${t.border}`,
        display: "flex", flexDirection: "column", overflow: "hidden",
        transition: "background 0.3s, border-color 0.3s",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* ── Header ────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          padding: sidebarOpen ? "18px 16px" : "18px 0",
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0, minHeight: 64, transition: "padding 0.3s",
        }}>
          {sidebarOpen ? (
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
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${t.accent}, #a855f7)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: `0 4px 12px ${t.accent}44`,
            }}>🏠</div>
          )}

          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                border: `1px solid ${t.border}`, background: t.card,
                color: t.muted, cursor: "pointer", fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = t.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = t.card; e.currentTarget.style.color = t.muted; e.currentTarget.style.borderColor = t.border; }}
            >←</button>
          )}

          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                position: "absolute", top: 70, right: -12,
                width: 24, height: 24, borderRadius: "50%",
                border: `1px solid ${t.border}`, background: t.surface,
                color: t.muted, cursor: "pointer", fontSize: 11,
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10, boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.color = t.muted; }}
            >→</button>
          )}
        </div>

        {/* ── Nav ───────────────────────────────────────────────── */}
        <nav className="hms-sb-nav" style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: sidebarOpen ? "12px 10px" : "12px 8px",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {sections.map(sec => (
            <div key={sec.key} style={{ marginBottom: 8 }}>
              {sidebarOpen ? (
                <div style={{
                  fontSize: 10, fontWeight: 700, color: t.muted,
                  textTransform: "uppercase", letterSpacing: 1,
                  padding: "6px 12px 4px", opacity: 0.7,
                }}>{sec.label}</div>
              ) : (
                <div style={{
                  height: 1, background: t.border,
                  margin: "6px 8px 6px", opacity: 0.5,
                }} />
              )}

              {sec.items.map(item => (
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
                  onMouseLeave={() => setTooltip(null)}
                >
                  <span style={{
                    fontSize: 18, flexShrink: 0, width: 22,
                    textAlign: "center", display: "inline-flex",
                    alignItems: "center", justifyContent: "center", lineHeight: 1,
                  }}>{item.icon}</span>
                  {sidebarOpen && (
                    <span style={{
                      flex: 1, overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", fontSize: 13, fontWeight: 500,
                    }}>{item.name}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div style={{
          borderTop: `1px solid ${t.border}`,
          padding: sidebarOpen ? "14px 16px" : "14px 8px",
          flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
          transition: "padding 0.3s",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${t.accent}, #a855f7)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700,
          }}>{userInitials}</div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {auth?.user?.name ?? "Guest"}
              </div>
              <div style={{ fontSize: 11, color: t.muted }}>{roleLabel}</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
