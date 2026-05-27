import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
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
import FinancialDashboard from './pages/FinancialDashboard';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';
import Help from './pages/Help';

function AppRoutes() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          background: "var(--bg)",
          color: "var(--muted)",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid var(--border)",
            borderTop: "3px solid var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <div style={{ fontSize: 13 }}>Loading…</div>
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
            <Route path='/' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='/students' element={<ProtectedRoute allowedRoles={['admin']}><Students /></ProtectedRoute>} />
            <Route path='/rooms' element={<ProtectedRoute allowedRoles={['admin']}><Rooms /></ProtectedRoute>} />
            <Route path='/allocation' element={<ProtectedRoute allowedRoles={['admin']}><Allocation /></ProtectedRoute>} />
            <Route path='/mess' element={<ProtectedRoute allowedRoles={['admin']}><Mess /></ProtectedRoute>} />
            <Route path='/fees' element={<ProtectedRoute allowedRoles={['admin']}><Fees /></ProtectedRoute>} />
            <Route path='/complaint' element={<ProtectedRoute allowedRoles={['admin', 'student']}><Complaint /></ProtectedRoute>} />
            <Route path='/attendance' element={<ProtectedRoute allowedRoles={['admin']}><Attendance /></ProtectedRoute>} />
            <Route path='/visitor' element={<ProtectedRoute allowedRoles={['admin']}><Visitor /></ProtectedRoute>} />
            <Route path='/notice' element={<ProtectedRoute allowedRoles={['admin']}><Notice /></ProtectedRoute>} />
            <Route path='/reports' element={<ProtectedRoute allowedRoles={['admin', 'student']}><Reports /></ProtectedRoute>} />
            <Route path='/analytics' element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
            <Route path='/student-profiles' element={<ProtectedRoute allowedRoles={['admin']}><StudentProfiles /></ProtectedRoute>} />
            <Route path='/maintenance' element={<ProtectedRoute allowedRoles={['admin', 'student']}><Maintenance /></ProtectedRoute>} />
            <Route path='/events' element={<ProtectedRoute allowedRoles={['admin', 'student']}><EventCalendar /></ProtectedRoute>} />
            <Route path='/financial' element={<ProtectedRoute allowedRoles={['admin']}><FinancialDashboard /></ProtectedRoute>} />
            <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path='/settings' element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path='/help' element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default AppRoutes;
