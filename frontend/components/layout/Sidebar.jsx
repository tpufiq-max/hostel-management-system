import React from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: <LayoutDashboard size={22} /> },
  { name: "Students", path: "/students", icon: <Users size={22} /> },
  { name: "Rooms", path: "/rooms", icon: <BedDouble size={22} /> },
  { name: "Allocation", path: "/allocation", icon: <ClipboardList size={22} /> },
  { name: "Mess", path: "/mess", icon: <Sparkles size={22} /> },
  { name: "Fees", path: "/fees", icon: <IndianRupee size={22} /> },
  { name: "Attendance", path: "/attendance", icon: <CalendarDays size={22} /> },
  { name: "Complaint", path: "/complaint", icon: <Bell size={22} /> },
  { name: "Visitors", path: "/visitor", icon: <Users size={22} /> },
  { name: "Notice", path: "/notice", icon: <FileText size={22} /> },
  { name: "Reports", path: "/reports", icon: <ClipboardList size={22} /> },
  { name: "Analytics", path: "/analytics", icon: <Sparkles size={22} /> },
  { name: "Profiles", path: "/student-profiles", icon: <Users size={22} /> },
  { name: "Maintenance", path: "/maintenance", icon: <Settings size={22} /> },
  { name: "Events", path: "/events", icon: <CalendarDays size={22} /> },
  { name: "Financial", path: "/financial", icon: <IndianRupee size={22} /> },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] shadow-2xl z-50 transition-all duration-300 ${
        sidebarOpen ? "w-[260px]" : "w-[90px]"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border-color)]">
        {sidebarOpen && (
          <div>
            <h2 className="text-xl font-bold text-white">HMS</h2>
            <p className="text-xs text-slate-400">Hostel System</p>
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex flex-col gap-2 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-200 hover:bg-blue-600 hover:text-white"
              }`
            }
          >
            {item.icon}
            {sidebarOpen && <span className="font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
