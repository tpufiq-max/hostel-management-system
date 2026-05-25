package com.hostel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsSummaryDTO {
    private long totalStudents;
    private long totalRooms;
    private long occupiedRooms;
    private double totalRevenue;
    private double pendingFees;
    private long openComplaints;
    private long resolvedComplaints;
    private long activeVisitors;
    private long openMaintenanceRequests;
    private long activeNotices;
    private long upcomingEvents;
}
