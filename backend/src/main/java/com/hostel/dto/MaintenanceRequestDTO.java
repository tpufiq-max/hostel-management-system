package com.hostel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MaintenanceRequestDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String roomNumber;

    @NotBlank(message = "Category is required")
    private String category;

    private String priority;
    private String status;
    private String reportedBy;
    private String assignedTo;
    private String reportedDate;
    private String completedDate;
    private String estimatedCost;
    private String notes;
    private String createdAt;
    private String updatedAt;
}
