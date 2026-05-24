import React, { useState, useContext, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { ThemeContext } from "../context/ThemeContext";

export default function Layout({ children }) {
  const { t, isDark } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setMobileOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const SIDEBAR_EXPANDED  = 260;
  const SIDEBAR_COLLAPSED = 72;

  const marginLeft = isMobile
    ? 0
    : sidebarOpen
      ? SIDEBAR_EXPANDED
      : SIDEBAR_COLLAPSED;

  return (
    <div style={{
      minHeight:  "100vh",
      background: t.bg,
      color:      t.text,
      display:    "flex",
      overflow:   "hidden",
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: "background 0.3s, color 0.3s",
      position:   "relative",
    }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        * { box-sizing: border-box; }

        .hms-main::-webkit-scrollbar       { width: 5px; }
        .hms-main::-webkit-scrollbar-track { background: transparent; }
        .hms-main::-webkit-scrollbar-thumb {
          background: ${isDark ? "#1e293b" : "#cbd5e1"};
          border-radius: 4px;
        }
        .hms-main::-webkit-scrollbar-thumb:hover {
          background: ${t.accent};
        }

        .hms-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(3px);
          z-index: 40;
          animation: fadeIn 0.2s ease;
        }

        @media (max-width: 767px) {
          .hms-sidebar-wrap {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .hms-sidebar-wrap.open {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="hms-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`hms-sidebar-wrap${isMobile && mobileOpen ? " open" : ""}`}
        style={{
          position:   "fixed",
          top:        0,
          left:       0,
          height:     "100vh",
          zIndex:     50,
          width:      isMobile
            ? SIDEBAR_EXPANDED
            : sidebarOpen
              ? SIDEBAR_EXPANDED
              : SIDEBAR_COLLAPSED,
          transition: "width 0.3s ease, transform 0.3s ease",
          flexShrink: 0,
        }}
      >
        <Sidebar
          sidebarOpen={isMobile ? true : sidebarOpen}
          setSidebarOpen={isMobile ? setMobileOpen : setSidebarOpen}
          t={t}
          isDark={isDark}
        />
      </div>

      {/* Main area */}
      <div style={{
        display:       "flex",
        flexDirection: "column",
        flex:          1,
        marginLeft:    marginLeft,
        transition:    "margin-left 0.3s ease",
        minHeight:     "100vh",
        minWidth:      0,
      }}>

        {/* Navbar */}
        <div style={{
          position:       "sticky",
          top:            0,
          zIndex:         30,
          background:     t.surface,
          borderBottom:   `1px solid ${t.border}`,
          backdropFilter: "blur(8px)",
          flexShrink:     0,
        }}>
          <Navbar
            sidebarOpen={isMobile ? mobileOpen : sidebarOpen}
            setSidebarOpen={isMobile ? setMobileOpen : setSidebarOpen}
            isMobile={isMobile}
            t={t}
            isDark={isDark}
          />
        </div>

        {/* Page content */}
        <main
          className="hms-main"
          style={{
            flex:       1,
            overflowY:  "auto",
            overflowX:  "hidden",
            padding:    "24px",
            background: t.bg,
            animation:  "slideUp 0.4s ease both",
            transition: "background 0.3s",
          }}
        >
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            {children}
          </div>
        </main>

        {/* Footer */}
        <div style={{
          borderTop:      `1px solid ${t.border}`,
          padding:        "10px 24px",
          background:     t.surface,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          fontSize:       12,
          color:          t.muted,
          flexShrink:     0,
          transition:     "background 0.3s, border-color 0.3s",
        }}>
          <span>🏠 Hostel Management System</span>
          <span>© {new Date().getFullYear()} · All rights reserved</span>
        </div>
      </div>

      {/* Mobile floating hamburger */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position:       "fixed",
            bottom:         24,
            left:           16,
            zIndex:         60,
            width:          48,
            height:         48,
            borderRadius:   "50%",
            border:         "none",
            background:     t.accent,
            color:          "#fff",
            fontSize:       20,
            cursor:         "pointer",
            boxShadow:      `0 4px 20px ${t.accent}77`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            transition:     "transform 0.2s",
            animation:      "fadeIn 0.3s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          ☰
        </button>
      )}
    </div>
  );
}
