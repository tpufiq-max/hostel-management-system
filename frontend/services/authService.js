import api from "../api/api";

const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),

  register: (data) => api.post("/auth/register", data),

  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
};

export default authService;
