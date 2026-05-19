import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme } =
    useContext(ThemeContext);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-4 shadow-sm">

      <div>
        <h1 className="text-3xl font-bold">
          Hostel Management System
        </h1>

        <p className="text-secondary text-sm">
          Smart hostel administration dashboard
        </p>
      </div>

      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-5 py-3 hover:scale-105 transition-all"
      >
        {theme === "dark" ? (
          <Sun size={20} />
        ) : (
          <Moon size={20} />
        )}

        <span className="font-semibold">
          {theme === "dark"
            ? "Light Mode"
            : "Dark Mode"}
        </span>
      </button>
    </header>
  );
}