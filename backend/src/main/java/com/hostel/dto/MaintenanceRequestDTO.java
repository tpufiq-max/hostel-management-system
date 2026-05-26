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
    private String category;
    private String priority;
    private String status;
    private String roomNumber;

    private Long reportedById;
    private String reportedByName;

    private String assignedTo;
    private String reportedDate;
    private String completedDate;
    private String notes;
    private String createdAt;
    private String updatedAt;
}
