package com.hostel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RevenueAnalyticsDTO {
    private List<MonthlyRevenue> monthlyRevenue;
    private double totalRevenue;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private double amount;
    }
}
