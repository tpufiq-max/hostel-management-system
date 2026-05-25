package com.hostel.controller;

import com.hostel.dto.*;
import com.hostel.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Analytics", description = "Aggregated analytics data")
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDTO>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getSummary()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueAnalyticsDTO>> getRevenue() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRevenue()));
    }

    @GetMapping("/occupancy")
    public ResponseEntity<ApiResponse<OccupancyAnalyticsDTO>> getOccupancy() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOccupancy()));
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<ComplaintAnalyticsDTO>> getComplaints() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getComplaints()));
    }

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<AttendanceAnalyticsDTO>> getAttendance() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAttendance()));
    }
}
