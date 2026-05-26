package com.hostel.controller;

import com.hostel.dto.AnalyticsDTO;
import com.hostel.dto.ApiResponse;
import com.hostel.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * GET /api/analytics
     * Returns a single AnalyticsDTO aggregating data from all modules.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsDTO>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAnalytics()));
    }
}
