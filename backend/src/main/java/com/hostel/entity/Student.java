package com.hostel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(name = "roll_number", unique = true)
    private String rollNumber;

    private String course;

    private String department;

    // 'year' is a reserved keyword in H2 — renamed to study_year
    @Column(name = "study_year")
    private Integer year;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "bed_number")
    private String bedNumber;

    @Column(name = "guardian_name")
    private String guardianName;

    @Column(name = "guardian_phone")
    private String guardianPhone;

    private String address;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "fees_status")
    private FeesStatus feesStatus = FeesStatus.PENDING;

    @Column(name = "profile_image")
    private String profileImage;

    @Builder.Default
    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum FeesStatus {
        PAID, PENDING, OVERDUE
    }
}
