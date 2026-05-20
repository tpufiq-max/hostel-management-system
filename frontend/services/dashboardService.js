import api from "../api/api";

const dashboardService = {
  getStats: () => api.get("/dashboard/stats"),
};

export default dashboardService;
