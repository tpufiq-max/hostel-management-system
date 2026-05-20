import api from "../api/api";

const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),

  register: (data) => api.post("/auth/register", data),

  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),

  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),

  resetPassword: (token, newPassword) =>
    api.post("/auth/reset-password", { token, newPassword }),

  changePassword: (currentPassword, newPassword) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),

  getCurrentUser: () => api.get("/auth/me"),
};

export default authService;
