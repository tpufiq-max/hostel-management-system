package com.hostel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Single response object returned by GET /api/analytics.
 * All sections are optional/nullable so callers can tolerate partial data.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsDTO {

    // ── Student metrics ──────────────────────────────────────
    private Long   totalStudents;
    private Long   activeStudents;

    // ── Room / occupancy ──────────────────────────────────────
    private Long   totalRooms;
    private Long   occupiedRooms;
    private Long   availableRooms;
    private Double occupancyRate;

    // ── Revenue ───────────────────────────────────────────────
    private Double totalRevenue;
    private Double pendingRevenue;
    private List<MonthlyRevenue> monthlyRevenue;

    // ── Complaints ─────────────────────────────────────────────
    private Long   totalComplaints;
    private Long   openComplaints;
    private Long   resolvedComplaints;
    private Long   inProgressComplaints;
    private List<ComplaintByCategory> complaintsByCategory;

    // ── Attendance (last 7 days) ──────────────────────────────
    private List<DailyAttendance> dailyAttendance;

    // ── Visitors ──────────────────────────────────────────────
    private Long   checkedInVisitors;
    private Long   checkedOutVisitors;

    // ── Maintenance ───────────────────────────────────────────
    private Long   openMaintenanceRequests;
    private Long   completedMaintenanceRequests;

    // ── Notice / Events ───────────────────────────────────────
    private Long   activeNotices;
    private Long   upcomingEvents;

    /* ── Inner record types ─────────────────────────────────── */

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class MonthlyRevenue {
        private String month;   // "Jan", "Feb", ...
        private Double amount;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ComplaintByCategory {
        private String category;
        private Long   count;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class DailyAttendance {
        private String date;
        private Long   present;
        private Long   absent;
        private Long   late;
        private Long   leave;
        private Long   total;
        private Double presentPct;
    }
}
