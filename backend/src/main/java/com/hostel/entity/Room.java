package com.hostel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_number", nullable = false, unique = true)
    private String roomNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Builder.Default
    @Column(nullable = false)
    private Integer occupied = 0;

    private String block;

    private Integer floor;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType type = RoomType.DOUBLE;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @Column(name = "monthly_rent")
    private Double monthlyRent;

    private String amenities;

    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY)
    private List<Student> students;

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

    public enum RoomType {
        SINGLE, DOUBLE, TRIPLE, DORMITORY
    }

    public enum RoomStatus {
        AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED
    }
}
