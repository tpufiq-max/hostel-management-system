import { get } from "../../api/api";

/**
 * Report service — aggregates data from existing endpoints.
 * No new backend needed. Combines /api/dashboard/stats + /api/visitors.
 */
export const reportService = {
  async summary() {
    const [statsRes, visitorsRes] = await Promise.allSettled([
      get("/dashboard/stats"),
      get("/visitors?status=CHECKED_IN&page=0&size=1"),
    ]);

    const s = statsRes.status    === "fulfilled" ? statsRes.value    : null;
    const v = visitorsRes.status === "fulfilled" ? visitorsRes.value : null;

    return {
      occupancyRate:     s ? Math.round(s.occupancyRate ?? ((s.occupiedRooms / (s.totalRooms || 1)) * 100)) : null,
      occupancyDetail:   s ? `${s.occupiedRooms ?? "?"} of ${s.totalRooms ?? "?"} rooms occupied` : null,
      totalRevenue:      s ? s.totalRevenue   : null,
      revenueDetail:     s ? `₹ ${Number(s.pendingPayments || 0).toLocaleString()} outstanding` : null,
      openComplaints:    s ? s.openComplaints : null,
      complaintsDetail:  s ? `${s.totalComplaints ?? 0} total · ${s.resolvedComplaints ?? 0} resolved` : null,
      checkedInVisitors: v ? (v.totalElements ?? v.content?.length ?? 0) : null,
      visitorsDetail:    "Currently inside the hostel",
    };
  },
};

export default reportService;
