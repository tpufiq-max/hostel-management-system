package com.hostel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {
    private long totalStudents;
    private long activeStudents;
    private long totalRooms;
    private long occupiedRooms;
    private double totalRevenue;
    private double pendingPayments;
    private long totalComplaints;
    private long resolvedComplaints;
    private long openComplaints;
    private double occupancyRate;
}
