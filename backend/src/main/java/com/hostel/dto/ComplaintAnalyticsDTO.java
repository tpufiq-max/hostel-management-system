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
public class ComplaintAnalyticsDTO {
    private long open;
    private long inProgress;
    private long resolved;
    private long closed;
    private List<CategoryCount> categoryBreakdown;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryCount {
        private String category;
        private long count;
    }
}
