import { get } from "../../api/api";

/**
 * Dashboard API client.
 *
 * Backend endpoint (see backend/src/main/java/com/hostel/controller/DashboardController.java):
 *   GET /api/dashboard/stats -> DashboardStatsDTO
 *
 * Returns:
 *   {
 *     totalStudents, activeStudents,
 *     totalRooms, occupiedRooms, occupancyRate,
 *     totalRevenue, pendingPayments,
 *     totalComplaints, resolvedComplaints, openComplaints
 *   }
 */
export const dashboardService = {
  stats() {
    return get(`/dashboard/stats`);
  },
};

export default dashboardService;
