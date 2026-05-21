import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

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

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // No specific roles required — allow all authenticated users
  if (allowedRoles.length === 0) return children;

  // Role check (treat warden as admin)
  const userRole = user?.role;
  const effectiveRole = userRole === 'warden' ? 'admin' : userRole;

  if (!allowedRoles.includes(userRole) && !allowedRoles.includes(effectiveRole)) {
    // Redirect to their own dashboard
    const redirectPath = userRole === 'student' ? '/student/dashboard' : '/admin/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
