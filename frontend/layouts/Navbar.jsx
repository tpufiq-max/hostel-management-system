import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({ sidebarOpen, setSidebarOpen, isMobile, t: tProp, isDark: isDarkProp }) {
  const themeCtx = useContext(ThemeContext);
  const authCtx  = useContext(AuthContext);

  // Support both prop-passed t (from Layout) and direct context
  const t      = tProp      ?? themeCtx?.t;
  const isDark = isDarkProp ?? themeCtx?.isDark ?? true;
  const toggleTheme = themeCtx?.toggleTheme ?? (() => {});

  const user   = authCtx?.user;
  const logout = authCtx?.logout ?? (() => {});

  const [time, setTime]             = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs]     = useState(false);
  const [notifCount]                    = useState(3);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = () => { setShowUserMenu(false); setShowNotifs(false); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (d) =>
    d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const notifications = [
    { id: 1, icon: "💰", msg: "Fee payment overdue — Room 310",  time: "2m ago",  color: t.warning },
    { id: 2, icon: "🔧", msg: "Maintenance request: AC — Rm 205", time: "15m ago", color: t.accent  },
    { id: 3, icon: "▪", msg: "New complaint submitted",           time: "1h ago",  color: t.danger  },
  ];

  return (
    <>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn    { from { opacity:0; }                            to { opacity:1; }                          }
        .hms-nb-btn:hover    { opacity: 0.85; transform: scale(1.05); }
        .hms-nb-btn          { transition: all 0.2s; }
        .hms-dd-item:hover   { background: ${isDark ? "#1e293b" : "#f1f5f9"} !important; }
      `}</style>

      <header style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "0 24px",
        height:         64,
        background:     t.surface,
        borderBottom:   `1px solid ${t.border}`,
        backdropFilter: "blur(8px)",
        gap:            16,
        flexWrap:       "wrap",
        transition:     "background 0.3s, border-color 0.3s",
        fontFamily:     "'Inter', system-ui, sans-serif",
      }}>

        {/* ── Left: hamburger + title ──────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>

          {/* Hamburger — always visible, collapses/expands sidebar */}
          <button
            className="hms-nb-btn"
            onClick={e => { e.stopPropagation(); setSidebarOpen?.(o => !o); }}
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.card, color: t.text,
              cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>

          {/* Title block */}
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 18, fontWeight: 700,
              color: t.text, letterSpacing: -0.3,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              🏠 Hostel Management System
            </div>
            <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>
              Smart hostel administration dashboard
            </div>
          </div>
        </div>

        {/* ── Right: clock · notifications · theme · user ──────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

          {/* Live clock (hidden on very small screens via min-width) */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end",
            padding: "6px 14px", borderRadius: 10,
            border: `1px solid ${t.border}`, background: t.card,
            lineHeight: 1.3,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.accent, fontVariantNumeric: "tabular-nums" }}>
              {formatTime(time)}
            </span>
            <span style={{ fontSize: 10, color: t.muted }}>
              {formatDate(time)}
            </span>
          </div>

          {/* Notification bell */}
          <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
            <button
              className="hms-nb-btn"
              onClick={() => { setShowNotifs(s => !s); setShowUserMenu(false); }}
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.card, color: t.text,
                cursor: "pointer", fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}
            >
              🔔
              {notifCount > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  background: t.danger, color: "#fff",
                  borderRadius: "50%", width: 17, height: 17,
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${t.surface}`,
                }}>
                  {notifCount}
                </span>
              )}
            </button>

            {/* Notif dropdown */}
            {showNotifs && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: 300, background: t.surface,
                border: `1px solid ${t.border}`, borderRadius: 14,
                boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.12)",
                zIndex: 100, overflow: "hidden",
                animation: "slideDown 0.2s ease",
              }}>
                <div style={{
                  padding: "14px 16px 10px",
                  borderBottom: `1px solid ${t.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Notifications</span>
                  <span style={{ fontSize: 11, background: `${t.danger}22`, color: t.danger, borderRadius: 6, padding: "2px 8px", fontWeight: 600 }}>
                    {notifCount} new
                  </span>
                </div>
                {notifications.map(n => (
                  <div key={n.id} className="hms-dd-item" style={{
                    padding: "12px 16px", display: "flex", gap: 12,
                    alignItems: "flex-start", cursor: "pointer",
                    borderBottom: `1px solid ${t.border}`,
                    transition: "background 0.15s",
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: `${n.color}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>
                      {n.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: t.text, fontWeight: 500, lineHeight: 1.4 }}>{n.msg}</div>
                      <div style={{ fontSize: 11, color: t.muted, marginTop: 3 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "10px 16px", textAlign: "center" }}>
                  <span style={{ fontSize: 12, color: t.accent, cursor: "pointer", fontWeight: 600 }}>
                    View all notifications →
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            className="hms-nb-btn"
            onClick={toggleTheme}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 10,
              border: `1px solid ${t.border}`,
              background: t.card, color: t.text,
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 16 }}>{isDark ? "☀️" : "🌙"}</span>
            <span style={{ display: isMobile ? "none" : "inline" }}>
              {isDark ? "Light" : "Dark"}
            </span>
          </button>

          {/* User avatar + dropdown */}
          <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
            <button
              className="hms-nb-btn"
              onClick={() => { setShowUserMenu(s => !s); setShowNotifs(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "6px 12px 6px 6px", borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.card, color: t.text,
                cursor: "pointer",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 13, fontWeight: 700,
              }}>
                {initials}
              </div>
              <div style={{ textAlign: "left", display: isMobile ? "none" : "block" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, lineHeight: 1.2 }}>
                  {user?.name ?? "Guest"}
                </div>
                <div style={{ fontSize: 11, color: t.muted }}>
                  {user?.role === "admin" ? "👑 Admin" : "🎓 Student"}
                </div>
              </div>
              <span style={{ color: t.muted, fontSize: 10, display: isMobile ? "none" : "block" }}>▼</span>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: 220, background: t.surface,
                border: `1px solid ${t.border}`, borderRadius: 14,
                boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.12)",
                zIndex: 100, overflow: "hidden",
                animation: "slideDown 0.2s ease",
              }}>
                {/* Profile header */}
                <div style={{
                  padding: "16px",
                  borderBottom: `1px solid ${t.border}`,
                  background: `${t.accent}11`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 15, fontWeight: 700,
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{user?.name ?? "Guest"}</div>
                      <div style={{ fontSize: 11, color: t.muted }}>{user?.email}</div>
                    </div>
                  </div>
                  <div style={{
                    marginTop: 10, fontSize: 11, fontWeight: 600,
                    padding: "3px 10px", borderRadius: 6, display: "inline-block",
                    background: user?.role === "admin" ? `${t.accent}22` : `${t.success}22`,
                    color: user?.role === "admin" ? t.accent : t.success,
                  }}>
                    {user?.role === "admin" ? "👑 Administrator" : "🎓 Student"}
                  </div>
                </div>

                {/* Menu items */}
                {[
                  { icon: "👤", label: "My Profile",    action: () => {} },
                  { icon: "⚙️", label: "Settings",      action: () => {} },
                  { icon: "🔔", label: "Notifications", action: () => { setShowUserMenu(false); setShowNotifs(true); } },
                  { icon: "❓", label: "Help & Support", action: () => {} },
                ].map(item => (
                  <div key={item.label} className="hms-dd-item" style={{
                    padding: "11px 16px", display: "flex", alignItems: "center",
                    gap: 10, cursor: "pointer",
                    borderBottom: `1px solid ${t.border}`,
                    fontSize: 13, color: t.text,
                    transition: "background 0.15s",
                  }} onClick={() => { item.action(); setShowUserMenu(false); }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}

                {/* Logout */}
                <div className="hms-dd-item" style={{
                  padding: "11px 16px", display: "flex", alignItems: "center",
                  gap: 10, cursor: "pointer",
                  fontSize: 13, color: t.danger, fontWeight: 600,
                  transition: "background 0.15s",
                }} onClick={() => { logout(); setShowUserMenu(false); }}>
                  <span style={{ fontSize: 16 }}>🚪</span>
                  Sign Out
                </div>
              </div>
            )}
          </div>

        </div>
      </header>
    </>
  );
}
