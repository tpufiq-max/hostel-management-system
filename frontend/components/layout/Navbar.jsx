import React, { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { Moon, Sun, Menu, Bell, User, LogOut, Settings, ChevronDown } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-[var(--bg-primary)] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight">
            Hostel Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] hidden md:block">
            Smart hostel administration dashboard
          </p>
        </div>
        <h1 className="sm:hidden text-lg font-bold">HMS</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 sm:p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:scale-105 transition-all"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          className="p-2 sm:p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:scale-105 transition-all relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:scale-105 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
              {user?.name || "User"}
            </span>
            <ChevronDown size={14} className="hidden md:block" />
          </button>

          {/* Dropdown menu */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-[var(--border-color)]">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                  {user?.role}
                </span>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] transition-colors">
                <User size={16} />
                <span>Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] transition-colors">
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <div className="border-t border-[var(--border-color)] mt-1 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
