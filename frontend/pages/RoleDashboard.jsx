import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AdminDashboard from "./Dashboard";
import StudentDashboard from "./student/StudentDashboard";

/**
 * Routes / to the right dashboard based on the caller's role.
 * Admins and wardens see the staff dashboard (existing Dashboard component);
 * students see their personal dashboard.
 */
export default function RoleDashboard() {
  const { user } = useContext(AuthContext);
  const role = (user?.role ?? "").toLowerCase();
  if (role === "student") return <StudentDashboard />;
  return <AdminDashboard />;
}
