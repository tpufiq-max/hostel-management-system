package com.hostel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mess_menus",
        uniqueConstraints = @UniqueConstraint(
            name = "uk_mess_day_meal",
            columnNames = {"week_day", "meal_type"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 'day' is a reserved keyword in H2 — renamed to week_day
    @Enumerated(EnumType.STRING)
    @Column(name = "week_day", nullable = false)
    private Day day;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String items;

    private String specialNote;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (effectiveFrom == null) {
            effectiveFrom = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Day {
        MON, TUE, WED, THU, FRI, SAT, SUN
    }

    public enum MealType {
        BREAKFAST, LUNCH, DINNER, SNACKS
    }
}
