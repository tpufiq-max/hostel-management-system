import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

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

  // No specific roles required
  if (allowedRoles.length === 0) return children;

  // Role check (treat warden as admin)
  const userRole = user?.role;
  const effectiveRole = userRole === 'warden' ? 'admin' : userRole;

  if (!allowedRoles.includes(userRole) && !allowedRoles.includes(effectiveRole)) {
    // Redirect to their own dashboard if they're authenticated but wrong role
    const redirectPath = userRole === 'student' ? '/student/dashboard' : '/admin/dashboard';

    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            You don't have permission to access this page.
          </p>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            Your role: <span className="font-medium capitalize">{userRole}</span>
          </p>
          <Navigate to={redirectPath} replace />
        </div>
      </div>
    );
  }

  return children;
}
