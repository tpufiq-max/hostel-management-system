package com.hostel.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceDTO {
    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentName;
    private String rollNumber;

    @NotNull(message = "Date is required")
    private String date;

    @NotNull(message = "Status is required")
    private String status;

    private String checkInTime;
    private String checkOutTime;
    private String remarks;
    private String markedBy;
    private String createdAt;
}
