package com.hostel.controller;

import com.hostel.dto.ApiResponse;
import com.hostel.dto.DashboardStatsDTO;
import com.hostel.service.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard", description = "Aggregated metrics for the admin dashboard")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardStats()));
    }
}
