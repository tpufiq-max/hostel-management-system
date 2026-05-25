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
public class MessMenuDTO {
    private Long id;

    @NotBlank(message = "Day is required")
    private String day;

    @NotBlank(message = "Meal type is required")
    private String mealType;

    @NotBlank(message = "Items are required")
    private String items;

    private String specialNote;
    private boolean isActive;
    private String effectiveFrom;
    private String effectiveTo;
    private String createdAt;
    private String updatedAt;
}
