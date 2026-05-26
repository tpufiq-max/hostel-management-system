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

    @NotBlank(message = "Day is required (MON..SUN)")
    private String day;

    @NotBlank(message = "Meal type is required (BREAKFAST/LUNCH/DINNER/SNACKS)")
    private String mealType;

    @NotBlank(message = "Items list is required")
    private String items;

    private String specialNote;
    private Boolean isActive;
    private String effectiveFrom;
    private String createdAt;
    private String updatedAt;
}
