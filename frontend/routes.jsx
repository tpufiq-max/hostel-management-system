import React, { useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Public pages — eagerly loaded for faster login
import LoginSelector from './pages/LoginSelector';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Lazy-loaded admin pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Allocation = lazy(() => import('./pages/Allocation'));
const Mess = lazy(() => import('./pages/Mess'));
const Fees = lazy(() => import('./pages/Fees'));
const Complaint = lazy(() => import('./pages/Complaint'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Visitor = lazy(() => import('./pages/Visitor'));
const Notice = lazy(() => import('./pages/Notice'));
const Reports = lazy(() => import('./pages/Reports'));
const Analytics = lazy(() => import('./pages/Analytics'));
const StudentProfiles = lazy(() => import('./pages/StudentProfiles'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const EventCalendar = lazy(() => import('./pages/EventCalendar'));
const FinancialDashboard = lazy(() => import('./pages/FinancialDashboard'));

// Lazy-loaded student pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const MyProfile = lazy(() => import('./pages/student/MyProfile'));
const MyFees = lazy(() => import('./pages/student/MyFees'));
const MyAttendance = lazy(() => import('./pages/student/MyAttendance'));
const MyComplaints = lazy(() => import('./pages/student/MyComplaints'));

// Shared
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback for lazy routes
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-3 text-sm text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}

// Smart redirect based on role
function RoleBasedRedirect() {
  const { user, isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ── Public Routes (no layout) ───────────────── */}
          {!isAuthenticated && (
            <>
              <Route path="/" element={<LoginSelector />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}

          {/* ── Authenticated Routes (with layout) ──────── */}
          {isAuthenticated && (
            <>
              {/* Smart redirect based on role */}
              <Route path="/" element={<RoleBasedRedirect />} />

              {/* Login pages redirect to dashboard if already logged in */}
              <Route path="/admin/login" element={<RoleBasedRedirect />} />
              <Route path="/student/login" element={<RoleBasedRedirect />} />

              {/* Forgot/reset password still accessible (in case admin needs to reset student) */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* ── ADMIN ROUTES ──────────────────────── */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin', 'warden']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="students" element={<Students />} />
                      <Route path="rooms" element={<Rooms />} />
                      <Route path="allocation" element={<Allocation />} />
                      <Route path="mess" element={<Mess />} />
                      <Route path="fees" element={<Fees />} />
                      <Route path="attendance" element={<Attendance />} />
                      <Route path="complaints" element={<Complaint />} />
                      <Route path="visitors" element={<Visitor />} />
                      <Route path="notices" element={<Notice />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="student-profiles" element={<StudentProfiles />} />
                      <Route path="maintenance" element={<Maintenance />} />
                      <Route path="events" element={<EventCalendar />} />
                      <Route path="financial" element={<FinancialDashboard />} />
                      <Route path="change-password" element={<ChangePassword />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* ── STUDENT ROUTES ────────────────────── */}
              <Route path="/student/*" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="profile" element={<MyProfile />} />
                      <Route path="fees" element={<MyFees />} />
                      <Route path="attendance" element={<MyAttendance />} />
                      <Route path="complaints" element={<MyComplaints />} />
                      <Route path="notices" element={<Notice />} />
                      <Route path="change-password" element={<ChangePassword />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Backwards-compat: /change-password without prefix */}
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <Layout>
                    <ChangePassword />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<RoleBasedRedirect />} />
            </>
          )}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default AppRoutes;
