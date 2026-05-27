package com.hostel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Per-student, per-day, per-meal attendance row used by the Smart Mess
 * Management module.
 *
 * The unique constraint (student_id, meal_date, meal_type) makes
 * {@code markAttendance} idempotent at the DB level — repeated marks for
 * the same (student, date, meal) update the existing row instead of
 * creating duplicates.
 *
 * H2 reserved-keyword notes:
 *   • {@code date} → column {@code meal_date}
 *   • {@code status} → column {@code attendance_status}
 *   • {@code meal_type} is safe and matches the existing MessMenu naming.
 */
@Entity
@Table(
    name = "meal_attendance",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_meal_attendance_student_date_meal",
        columnNames = {"student_id", "meal_date", "meal_type"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "meal_date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 24)
    private MealType mealType;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_status", nullable = false, length = 12)
    private AttendanceStatus status = AttendanceStatus.ABSENT;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * The four meal slots tracked by the Smart Mess module.
     * Note this is intentionally a different enum from {@code MessMenu.MealType}
     * because SPECIAL_DINNER is a billable event, not a menu category.
     */
    public enum MealType {
        BREAKFAST, LUNCH, DINNER, SPECIAL_DINNER
    }

    public enum AttendanceStatus {
        PRESENT, ABSENT
    }
}
