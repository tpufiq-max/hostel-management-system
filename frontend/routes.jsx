import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './layouts/Layout';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Students from './pages/Students';
import Rooms from './pages/Rooms';
import Allocation from './pages/Allocation';
import Mess from './pages/Mess';
import Fees from './pages/Fees';
import Complaint from './pages/Complaint';
import Attendance from './pages/Attendance';
import Visitor from './pages/Visitor';
import Notice from './pages/Notice';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound.jsx';
import Analytics from './pages/Analytics';
import StudentProfiles from './pages/StudentProfiles';
import Maintenance from './pages/Maintenance';
import EventCalendar from './pages/EventCalendar';

function AppRoutes() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute allowedRoles={['admin']}><Students /></ProtectedRoute>} />
            <Route path="/rooms" element={<ProtectedRoute allowedRoles={['admin']}><Rooms /></ProtectedRoute>} />
            <Route path="/allocation" element={<ProtectedRoute allowedRoles={['admin']}><Allocation /></ProtectedRoute>} />
            <Route path="/mess" element={<ProtectedRoute allowedRoles={['admin']}><Mess /></ProtectedRoute>} />
            <Route path="/fees" element={<ProtectedRoute allowedRoles={['admin']}><Fees /></ProtectedRoute>} />
            <Route path="/complaint" element={<ProtectedRoute allowedRoles={['admin', 'student']}><Complaint /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin']}><Attendance /></ProtectedRoute>} />
            <Route path="/visitor" element={<ProtectedRoute allowedRoles={['admin']}><Visitor /></ProtectedRoute>} />
            <Route path="/notice" element={<ProtectedRoute allowedRoles={['admin']}><Notice /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'student']}><Reports /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
            <Route path="/student-profiles" element={<ProtectedRoute allowedRoles={['admin']}><StudentProfiles /></ProtectedRoute>} />
            <Route path="/maintenance" element={<ProtectedRoute allowedRoles={['admin', 'student']}><Maintenance /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute allowedRoles={['admin', 'student']}><EventCalendar /></ProtectedRoute>} />
            {/* /financial route removed: FinancialDashboard.jsx deleted in F2 (was 100% fake data) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default AppRoutes;
