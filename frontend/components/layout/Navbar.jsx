import React, { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { get } from "../../api/api";

const READ_KEY = "hms_notif_read";
const POLL_MS  = 60_000; // refresh every 60 s

/* localStorage helpers — read state lives in the browser */
const loadReadIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]")); }
  catch { return new Set(); }
};
const saveReadIds = (set) => {
  try { localStorage.setItem(READ_KEY, JSON.stringify([...set])); }
  catch { /* ignore */ }
};

export default function Navbar({ sidebarOpen, setSidebarOpen, isMobile, t: tProp, isDark: isDarkProp }) {
  const themeCtx = useContext(ThemeContext);
  const authCtx  = useContext(AuthContext);
  const navigate = useNavigate();

  const t      = tProp      ?? themeCtx?.t;
  const isDark = isDarkProp ?? themeCtx?.isDark ?? true;
  const toggleTheme = themeCtx?.toggleTheme ?? (() => {});

  const user   = authCtx?.user;
  const logout = authCtx?.logout ?? (() => {});

  const [time, setTime]                 = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs]     = useState(false);

  const [items, setItems]     = useState([]);
  const [readIds, setReadIds] = useState(loadReadIds);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  /* ---------- live clock ---------- */
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* ---------- close dropdowns on outside click ---------- */
  useEffect(() => {
    const handler = () => { setShowUserMenu(false); setShowNotifs(false); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  /* ---------- fetch notifications ---------- */
  const fetchNotifs = useCallback(async () => {
    if (!authCtx?.isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await get("/notifications");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Couldn't load notifications.");
    } finally {
      setLoading(false);
    }
  }, [authCtx?.isAuthenticated]);

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, POLL_MS);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  /* ---------- derived state ---------- */
  const unreadCount = useMemo(
    () => items.filter(i => !readIds.has(i.id)).length,
    [items, readIds]
  );

  const colourFor = (severity) => {
    switch (severity) {
      case "danger":  return t.danger;
      case "warning": return t.warning;
      case "success": return t.success;
      case "accent":
      default:        return t.accent;
    }
  };

  const markRead = (id) => {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    saveReadIds(next);
  };

  const markAllRead = () => {
    const next = new Set(readIds);
    items.forEach(i => next.add(i.id));
    setReadIds(next);
    saveReadIds(next);
  };

  const handleItemClick = (item) => {
    markRead(item.id);
    setShowNotifs(false);
    if (item.link) navigate(item.link);
  };

  const formatTime = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (d) =>
    d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

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

          {/* Live clock */}
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
              onClick={() => {
                setShowNotifs(s => !s);
                setShowUserMenu(false);
                if (!showNotifs) fetchNotifs(); // refresh when opening
              }}
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.card, color: t.text,
                cursor: "pointer", fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  background: t.danger, color: "#fff",
                  borderRadius: "50%",
                  minWidth: 17, height: 17, padding: "0 5px",
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${t.surface}`,
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notif dropdown */}
            {showNotifs && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: 340, maxHeight: 480,
                background: t.surface,
                border: `1px solid ${t.border}`, borderRadius: 14,
                boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.12)",
                zIndex: 100, overflow: "hidden",
                animation: "slideDown 0.2s ease",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{
                  padding: "14px 16px 10px",
                  borderBottom: `1px solid ${t.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>
                    Notifications
                  </span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {unreadCount > 0 && (
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        background: `${t.danger}22`, color: t.danger,
                        borderRadius: 6, padding: "2px 8px",
                      }}>
                        {unreadCount} new
                      </span>
                    )}
                    {items.length > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{
                          fontSize: 11, fontWeight: 600, color: t.accent,
                          background: "transparent", border: "none",
                          cursor: "pointer", padding: "2px 4px",
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                  {error ? (
                    <div style={{ padding: "20px 16px", fontSize: 13, color: t.danger }}>
                      {error}
                    </div>
                  ) : loading && items.length === 0 ? (
                    <div style={{ padding: "20px 16px", fontSize: 13, color: t.muted, textAlign: "center" }}>
                      Loading…
                    </div>
                  ) : items.length === 0 ? (
                    <div style={{
                      padding: "32px 16px", fontSize: 13,
                      color: t.muted, textAlign: "center",
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>✨</div>
                      You're all caught up.
                    </div>
                  ) : items.map(n => {
                    const c = colourFor(n.severity);
                    const isUnread = !readIds.has(n.id);
                    return (
                      <div
                        key={n.id}
                        className="hms-dd-item"
                        onClick={() => handleItemClick(n)}
                        style={{
                          padding: "12px 16px",
                          display: "flex", gap: 12, alignItems: "flex-start",
                          cursor: "pointer",
                          borderBottom: `1px solid ${t.border}`,
                          transition: "background 0.15s",
                          background: isUnread ? `${c}0d` : "transparent",
                          position: "relative",
                        }}
                      >
                        {isUnread && (
                          <span style={{
                            position: "absolute", top: 14, right: 14,
                            width: 7, height: 7, borderRadius: "50%",
                            background: c, flexShrink: 0,
                          }} />
                        )}
                        <div style={{
                          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                          background: `${c}22`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16,
                        }}>
                          {n.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                          <div style={{
                            fontSize: 13, color: t.text,
                            fontWeight: isUnread ? 600 : 500,
                            lineHeight: 1.4,
                          }}>
                            {n.title}
                          </div>
                          {n.message && (
                            <div style={{
                              fontSize: 12, color: t.muted, marginTop: 2,
                              overflow: "hidden", textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                            }}>
                              {n.message}
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: t.muted, marginTop: 3 }}>
                            {n.relativeTime || ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {items.length > 0 && (
                  <div style={{
                    padding: "10px 16px", textAlign: "center",
                    borderTop: `1px solid ${t.border}`, flexShrink: 0,
                  }}>
                    <button
                      onClick={fetchNotifs}
                      style={{
                        fontSize: 12, color: t.accent, fontWeight: 600,
                        background: "transparent", border: "none", cursor: "pointer",
                      }}
                    >
                      ↻ Refresh
                    </button>
                  </div>
                )}
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

            {showUserMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: 220, background: t.surface,
                border: `1px solid ${t.border}`, borderRadius: 14,
                boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.12)",
                zIndex: 100, overflow: "hidden",
                animation: "slideDown 0.2s ease",
              }}>
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

                {[
                  { icon: "👤", label: "My Profile",    action: () => navigate(user?.role === "student" ? "/me/profile" : "/profile") },
                  { icon: "⚙️", label: "Settings",      action: () => navigate("/settings") },
                  { icon: "🔔", label: "Notifications", action: () => { setShowUserMenu(false); setShowNotifs(true); } },
                  { icon: "❓", label: "Help & Support", action: () => navigate("/help") },
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
