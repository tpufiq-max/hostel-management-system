import { get } from "../../api/api";

/**
 * Analytics API client.
 *
 * Backend endpoint (see backend/src/main/java/com/hostel/controller/AnalyticsController.java):
 *   GET /api/analytics → AnalyticsDTO
 *
 * Returns a single flat object with all analytics data:
 *   totalStudents, activeStudents,
 *   totalRooms, occupiedRooms, availableRooms, occupancyRate,
 *   totalRevenue, pendingRevenue, monthlyRevenue[],
 *   totalComplaints, openComplaints, resolvedComplaints, inProgressComplaints,
 *   complaintsByCategory[],
 *   dailyAttendance[],
 *   checkedInVisitors, checkedOutVisitors,
 *   openMaintenanceRequests, completedMaintenanceRequests,
 *   activeNotices, upcomingEvents
 */
export const analyticsService = {
  get() {
    return get("/analytics");
  },
};

export default analyticsService;
