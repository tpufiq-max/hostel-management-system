package com.hostel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintCategory category;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_status", nullable = false)
    private ComplaintStatus complaintStatus = ComplaintStatus.OPEN;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ComplaintStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }

    public enum ComplaintCategory {
        MAINTENANCE, ELECTRICAL, PLUMBING, CLEANLINESS, FOOD, SECURITY, NOISE, OTHER
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, URGENT
    }
}
