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
public class NoticeDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String category;
    private String priority;
    private String publishedBy;
    private String publishedAt;
    private String expiresAt;
    private Boolean isActive;
    private String targetAudience;
    private String createdAt;
    private String updatedAt;
}
