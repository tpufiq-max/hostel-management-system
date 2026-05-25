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
public class AttendanceAnalyticsDTO {
    private List<DailyAttendance> dailyAttendance;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyAttendance {
        private String date;
        private long presentCount;
        private long absentCount;
        private double percentage;
    }
}
