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
public class EventDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Event date is required")
    private String eventDate;

    private String startTime;
    private String endTime;

    @NotBlank(message = "Venue is required")
    private String venue;

    private String organizer;

    @NotBlank(message = "Category is required")
    private String category;

    private String status;
    private Integer maxParticipants;
    private Integer registeredCount;
    private String createdAt;
    private String updatedAt;
}
