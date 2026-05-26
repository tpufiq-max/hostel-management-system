package com.hostel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a student ↔ room assignment.
 * Derived entirely from the Student and Room entities — no extra table needed.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllocationDTO {

    private Long   studentId;
    private String studentName;
    private String studentEmail;
    private String rollNumber;
    private String course;

    private Long   roomId;
    private String roomNumber;
    private String roomType;
    private String roomBlock;
    private Integer roomFloor;
    private Integer roomCapacity;
    private Integer roomOccupied;

    /** ISO-8601 date the student was admitted (used as "assigned on" proxy). */
    private String admissionDate;
}
