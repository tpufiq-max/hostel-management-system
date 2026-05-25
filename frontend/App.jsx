import React from "react";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// ThemeProvider wraps AuthProvider so the login screen and any auth-related
// loading states already have access to the theme context.
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
