import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  IndianRupee,
  CalendarDays,
  ClipboardList,
  Bell,
  FileText,
  Sparkles,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Students", path: "/students", icon: Users },
  { name: "Rooms", path: "/rooms", icon: BedDouble },
  { name: "Allocation", path: "/allocation", icon: ClipboardList },
  { name: "Mess", path: "/mess", icon: Sparkles },
  { name: "Fees", path: "/fees", icon: IndianRupee },
  { name: "Attendance", path: "/attendance", icon: CalendarDays },
  { name: "Complaints", path: "/complaint", icon: Bell },
  { name: "Visitors", path: "/visitor", icon: Users },
  { name: "Notice", path: "/notice", icon: FileText },
  { name: "Reports", path: "/reports", icon: ClipboardList },
  { name: "Analytics", path: "/analytics", icon: Sparkles },
  { name: "Profiles", path: "/student-profiles", icon: Users },
  { name: "Maintenance", path: "/maintenance", icon: Settings },
  { name: "Events", path: "/events", icon: CalendarDays },
  { name: "Financial", path: "/financial", icon: IndianRupee },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, isMobile }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-color)]
          shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out
          ${isMobile
            ? `w-[280px] ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            : `${sidebarOpen ? "w-[260px]" : "w-[80px]"}`
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)] min-h-[65px]">
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">HMS</h2>
                <p className="text-[10px] text-slate-400 leading-tight">Hostel System</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            aria-label="Toggle sidebar"
          >
            {isMobile ? (
              <X size={18} />
            ) : sidebarOpen ? (
              <ChevronLeft size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group
                  ${isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                  ${!sidebarOpen && !isMobile ? "justify-center" : ""}
                  `
                }
                title={!sidebarOpen && !isMobile ? item.name : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {(sidebarOpen || isMobile) && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-[var(--border-color)]">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 w-full
              text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200
              ${!sidebarOpen && !isMobile ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {(sidebarOpen || isMobile) && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
