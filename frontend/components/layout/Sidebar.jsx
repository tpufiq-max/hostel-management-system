import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  User,
  KeyRound,
  GraduationCap,
  Shield,
} from "lucide-react";

const adminMenu = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", path: "/admin/students", icon: Users },
  { name: "Rooms", path: "/admin/rooms", icon: BedDouble },
  { name: "Allocation", path: "/admin/allocation", icon: ClipboardList },
  { name: "Fees", path: "/admin/fees", icon: IndianRupee },
  { name: "Attendance", path: "/admin/attendance", icon: CalendarDays },
  { name: "Complaints", path: "/admin/complaints", icon: Bell },
  { name: "Visitors", path: "/admin/visitors", icon: Users },
  { name: "Notices", path: "/admin/notices", icon: FileText },
  { name: "Mess", path: "/admin/mess", icon: Sparkles },
  { name: "Maintenance", path: "/admin/maintenance", icon: Settings },
  { name: "Events", path: "/admin/events", icon: CalendarDays },
  { name: "Reports", path: "/admin/reports", icon: ClipboardList },
  { name: "Analytics", path: "/admin/analytics", icon: Sparkles },
  { name: "Financial", path: "/admin/financial", icon: IndianRupee },
];

const studentMenu = [
  { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { name: "My Profile", path: "/student/profile", icon: User },
  { name: "My Fees", path: "/student/fees", icon: IndianRupee },
  { name: "My Attendance", path: "/student/attendance", icon: CalendarDays },
  { name: "My Complaints", path: "/student/complaints", icon: Bell },
  { name: "Notices", path: "/student/notices", icon: FileText },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, isMobile }) {
  const { logout, user, isAdmin, isStudent } = useContext(AuthContext);
  const navigate = useNavigate();

  const menuItems = isStudent ? studentMenu : adminMenu;
  const portalName = isStudent ? "Student Portal" : "Admin Panel";
  const portalIcon = isStudent ? GraduationCap : Shield;
  const PortalIcon = portalIcon;
  const portalGradient = isStudent
    ? "from-emerald-500 to-teal-600"
    : "from-purple-600 to-indigo-600";

  const changePasswordPath = isStudent ? "/student/change-password" : "/admin/change-password";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNavClick = () => {
    if (isMobile) setSidebarOpen(false);
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
          {(sidebarOpen || isMobile) ? (
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${portalGradient} flex items-center justify-center shadow-lg`}>
                <PortalIcon size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">HMS</h2>
                <p className="text-[10px] text-slate-400 leading-tight">{portalName}</p>
              </div>
            </div>
          ) : (
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${portalGradient} flex items-center justify-center shadow-lg mx-auto`}>
              <PortalIcon size={18} className="text-white" />
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            aria-label="Toggle sidebar"
          >
            {isMobile ? <X size={18} /> : sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* User info — only when expanded */}
        {(sidebarOpen || isMobile) && user && (
          <div className="px-4 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${portalGradient} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

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
                    ? `bg-gradient-to-r ${portalGradient} text-white shadow-lg`
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

        {/* Footer actions */}
        <div className="p-3 border-t border-[var(--border-color)] space-y-1">
          <NavLink
            to={changePasswordPath}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200
              ${isActive
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }
              ${!sidebarOpen && !isMobile ? "justify-center" : ""}
              `
            }
            title={!sidebarOpen && !isMobile ? "Change Password" : undefined}
          >
            <KeyRound size={20} className="flex-shrink-0" />
            {(sidebarOpen || isMobile) && (
              <span className="font-medium text-sm">Change Password</span>
            )}
          </NavLink>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 w-full
              text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200
              ${!sidebarOpen && !isMobile ? "justify-center" : ""}
            `}
            title={!sidebarOpen && !isMobile ? "Logout" : undefined}
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
