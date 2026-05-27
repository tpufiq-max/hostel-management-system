package com.hostel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visitors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visitor_name", nullable = false)
    private String visitorName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Relation relation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    private String purpose;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "id_proof")
    private String idProof;

    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    // 'status' is a reserved keyword in H2 — renamed to visitor_status
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "visitor_status", nullable = false)
    private Status status = Status.CHECKED_IN;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (checkInTime == null) {
            checkInTime = LocalDateTime.now();
        }
    }

    public enum Relation {
        PARENT, SIBLING, FRIEND, RELATIVE, GUARDIAN, OTHER
    }

    public enum Status {
        CHECKED_IN, CHECKED_OUT, REJECTED
    }
}
