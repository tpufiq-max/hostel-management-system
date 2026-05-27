package com.hostel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentDTO {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String rollNumber;
    private String course;
    private String department;
    private Integer year;
    private String roomNumber;
    private String bedNumber;
    private String guardianName;
    private String guardianPhone;
    private String address;
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String feesStatus;
    private String profileImage;
    private boolean isActive;
    private String admissionDate;
    private String createdAt;

    /**
     * One-shot temporary password set when admin creates a student.
     * Populated only in the response of POST /api/students; never stored.
     * The student should change this on first login via Settings.
     */
    private String tempPassword;
}
