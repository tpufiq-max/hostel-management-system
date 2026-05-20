import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, BedDouble, IndianRupee, CalendarDays,
  ClipboardList, Bell, FileText, Sparkles, Settings, Menu, X,
  LogOut, ChevronLeft, User, KeyRound, GraduationCap, Shield,
  Wrench, UserCheck, Utensils, BarChart3, FileBarChart,
} from 'lucide-react';

/**
 * Admin nav grouped into 4 logical sections (industry-standard SaaS pattern).
 * Reduces cognitive load vs. the previous flat 15-item list.
 */
const adminGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Analytics',  path: '/admin/analytics',  icon: BarChart3 },
    ],
  },
  {
    label: 'People & Rooms',
    items: [
      { name: 'Students',   path: '/admin/students',         icon: Users },
      { name: 'Profiles',   path: '/admin/student-profiles', icon: UserCheck },
      { name: 'Rooms',      path: '/admin/rooms',            icon: BedDouble },
      { name: 'Allocation', path: '/admin/allocation',       icon: ClipboardList },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Fees',        path: '/admin/fees',        icon: IndianRupee },
      { name: 'Attendance',  path: '/admin/attendance',  icon: CalendarDays },
      { name: 'Complaints',  path: '/admin/complaints',  icon: Bell },
      { name: 'Visitors',    path: '/admin/visitors',    icon: Users },
      { name: 'Mess',        path: '/admin/mess',        icon: Utensils },
      { name: 'Maintenance', path: '/admin/maintenance', icon: Wrench },
    ],
  },
  {
    label: 'Insights & Comms',
    items: [
      { name: 'Reports',   path: '/admin/reports',   icon: FileBarChart },
      { name: 'Notices',   path: '/admin/notices',   icon: FileText },
      { name: 'Events',    path: '/admin/events',    icon: CalendarDays },
      { name: 'Financial', path: '/admin/financial', icon: IndianRupee },
    ],
  },
];

const studentItems = [
  { name: 'Dashboard',     path: '/student/dashboard',   icon: LayoutDashboard },
  { name: 'My Profile',    path: '/student/profile',     icon: User },
  { name: 'My Fees',       path: '/student/fees',        icon: IndianRupee },
  { name: 'My Attendance', path: '/student/attendance',  icon: CalendarDays },
  { name: 'My Complaints', path: '/student/complaints',  icon: Bell },
  { name: 'Notices',       path: '/student/notices',     icon: FileText },
];

function NavItem({ item, expanded, onClick, gradient }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      title={!expanded ? item.name : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group
        ${isActive ? `bg-gradient-to-r ${gradient} text-white shadow-lg` : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
        ${!expanded ? 'justify-center' : ''}`
      }
    >
      <Icon size={18} className="flex-shrink-0" />
      {expanded && <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>}
    </NavLink>
  );
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, isMobile }) {
  const { logout, user, isStudent } = useContext(AuthContext);
  const navigate = useNavigate();

  const expanded = sidebarOpen || isMobile;
  const PortalIcon = isStudent ? GraduationCap : Shield;
  const portalName = isStudent ? 'Student Portal' : 'Admin Panel';
  const gradient = isStudent ? 'from-emerald-500 to-teal-600' : 'from-purple-600 to-indigo-600';
  const changePasswordPath = isStudent ? '/student/change-password' : '/admin/change-password';

  const handleLogout = () => { logout(); navigate('/'); };
  const handleNavClick = () => { if (isMobile) setSidebarOpen(false); };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`
          fixed left-0 top-0 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-color)]
          shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out
          ${isMobile
            ? `w-[280px] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `${sidebarOpen ? 'w-[260px]' : 'w-[80px]'}`
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)] min-h-[65px]">
          {expanded ? (
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <PortalIcon size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">HMS</h2>
                <p className="text-[10px] text-slate-400 leading-tight">{portalName}</p>
              </div>
            </div>
          ) : (
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mx-auto`}>
              <PortalIcon size={18} className="text-white" />
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isMobile ? <X size={18} /> : sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* User info — only when expanded */}
        {expanded && user && (
          <div className="px-4 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation — grouped for admin, flat for student */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
          {isStudent ? (
            <div className="space-y-1">
              {studentItems.map((item) => (
                <NavItem key={item.path} item={item} expanded={expanded} onClick={handleNavClick} gradient={gradient} />
              ))}
            </div>
          ) : (
            adminGroups.map((group, idx) => (
              <div key={group.label} className={idx > 0 ? 'mt-4' : ''}>
                {expanded ? (
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 px-3 mb-1.5">
                    {group.label}
                  </p>
                ) : (
                  idx > 0 && <div className="border-t border-slate-800 mx-2 mb-2" />
                )}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavItem key={item.path} item={item} expanded={expanded} onClick={handleNavClick} gradient={gradient} />
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-[var(--border-color)] space-y-1">
          <NavLink
            to={changePasswordPath}
            onClick={handleNavClick}
            title={!expanded ? 'Change Password' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200
              ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              ${!expanded ? 'justify-center' : ''}`
            }
          >
            <KeyRound size={18} className="flex-shrink-0" />
            {expanded && <span className="font-medium text-sm">Change Password</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            title={!expanded ? 'Logout' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 w-full
              text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200
              ${!expanded ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {expanded && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
