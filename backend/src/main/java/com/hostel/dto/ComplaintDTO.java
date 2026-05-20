package com.hostel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ComplaintDTO {
    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentName;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String category;
    private String complaintStatus;
    private String priority;
    private String resolutionNotes;
    private String assignedTo;
    private String resolvedAt;
    private String createdAt;
    private String updatedAt;
}
