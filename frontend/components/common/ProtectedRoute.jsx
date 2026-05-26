import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/**
 * Guards routes that require authentication and (optionally) a role.
 *
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   <ProtectedRoute allowedRoles={["admin"]}><Students /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          color: "var(--muted)",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid var(--border)",
            borderTop: "3px solid var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <div style={{ fontSize: 13 }}>Checking session…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <ForbiddenScreen role={user?.role} />;
  }

  return children;
}

function ForbiddenScreen({ role }) {
  return (
    <div
      role="alert"
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 28,
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(248,113,113,0.15)",
            color: "var(--danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 700,
            margin: "0 auto 16px",
          }}
        >
          ⓘ
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          Access denied
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          Your role
          {role ? (
            <>
              {" ("}
              <strong style={{ color: "var(--text)" }}>{role}</strong>
              {") "}
            </>
          ) : (
            " "
          )}
          doesn't have permission to view this page.
        </p>

        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            marginTop: 20,
            padding: "10px 18px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}
