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

    @NotBlank(message = "Event date is required (ISO-8601: yyyy-MM-dd)")
    private String eventDate;

    private String startTime; // ISO-8601 HH:mm or HH:mm:ss
    private String endTime;
    private String venue;
    private String organizer;
    private String category;
    private String status;
    private Integer maxParticipants;
    private Integer registeredCount;
    private String createdAt;
    private String updatedAt;
}
