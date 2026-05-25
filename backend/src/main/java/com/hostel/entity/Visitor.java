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

    @Column(nullable = false)
    private String purpose;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "id_proof")
    private String idProof;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.CHECKED_IN;

    @Column(name = "approved_by")
    private String approvedBy;

    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Relation {
        PARENT, SIBLING, FRIEND, RELATIVE, GUARDIAN, OTHER
    }

    public enum Status {
        CHECKED_IN, CHECKED_OUT, REJECTED
    }
}
