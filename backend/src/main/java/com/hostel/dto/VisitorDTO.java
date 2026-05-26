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
public class VisitorDTO {
    private Long id;

    @NotBlank(message = "Visitor name is required")
    private String visitorName;

    @NotNull(message = "Relation is required")
    private String relation;

    private Long studentId;
    private String studentName;

    private String purpose;
    private String phoneNumber;
    private String idProof;
    private String checkInTime;
    private String checkOutTime;
    private String status;
    private String approvedBy;
    private String notes;
    private String createdAt;
}
