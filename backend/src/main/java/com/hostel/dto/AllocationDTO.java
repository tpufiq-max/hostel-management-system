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
public class AllocationDTO {
    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentName;

    @NotNull(message = "Room ID is required")
    private Long roomId;

    private String roomNumber;

    private String course;

    private String assignedOn;

    private String notes;

    private String createdAt;
}
