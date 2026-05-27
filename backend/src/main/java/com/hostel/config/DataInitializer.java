package com.hostel.config;

import com.hostel.entity.*;
import com.hostel.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Objects;

/**
 * DataInitializer — runs on every startup (Order 1).
 *
 * Responsibilities:
 *  1. Bootstrap a single admin user from config/env vars (idempotent — skipped if username exists).
 *  2. Seed sample rooms if the rooms table is empty.
 *  3. Seed sample students if the students table is empty.
 *
 * All admin credentials are driven by application properties so they can be
 * overridden via environment variables without touching source code:
 *
 *   APP_BOOTSTRAP_ADMIN_ENABLED=true/false
 *   APP_BOOTSTRAP_ADMIN_NAME=...
 *   APP_BOOTSTRAP_ADMIN_USERNAME=...
 *   APP_BOOTSTRAP_ADMIN_EMAIL=...
 *   APP_BOOTSTRAP_ADMIN_PASSWORD=...
 *   APP_BOOTSTRAP_ADMIN_PHONE=...
 */
@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    @Order(1)
    CommandLineRunner initData(
            @Value("${app.bootstrap.admin.enabled:true}")   boolean bootstrapEnabled,
            @Value("${app.bootstrap.admin.name:Administrator}")    String adminName,
            @Value("${app.bootstrap.admin.username:admin}")        String adminUsername,
            @Value("${app.bootstrap.admin.email:admin@hostel.com}") String adminEmail,
            @Value("${app.bootstrap.admin.password:admin123}")     String adminPassword,
            @Value("${app.bootstrap.admin.phone:9876543210}")      String adminPhone,
            UserRepository    userRepository,
            StudentRepository studentRepository,
            RoomRepository    roomRepository,
            PasswordEncoder   passwordEncoder) {

        return args -> {
            try {

                // ── 1. Bootstrap Admin ──────────────────────────────────
                if (bootstrapEnabled) {
                    if (!userRepository.existsByUsername(adminUsername)) {
                        userRepository.save(Objects.requireNonNull(User.builder()
                                .name(adminName)
                                .username(adminUsername)
                                .email(adminEmail)
                                .password(passwordEncoder.encode(adminPassword))
                                .role(User.Role.ADMIN)
                                .phone(adminPhone)
                                .isActive(true)
                                .build()));
                        log.info("DataInitializer: ✓ Admin user '{}' created ({})", adminUsername, adminEmail);
                    } else {
                        log.info("DataInitializer: Admin user '{}' already exists — skipping bootstrap", adminUsername);
                    }
                } else {
                    log.info("DataInitializer: app.bootstrap.admin.enabled=false — skipping admin bootstrap");
                }

                // ── 2. Sample Rooms ─────────────────────────────────────
                if (roomRepository.count() == 0) {
                    for (int floor = 1; floor <= 3; floor++) {
                        for (int room = 1; room <= 5; room++) {
                            String roomNumber = floor + String.format("%02d", room);
                            roomRepository.save(Objects.requireNonNull(Room.builder()
                                    .roomNumber(roomNumber)
                                    .capacity(room <= 3 ? 2 : 3)
                                    .occupied(0)
                                    .block("A")
                                    .floor(floor)
                                    .type(room <= 3 ? Room.RoomType.DOUBLE : Room.RoomType.TRIPLE)
                                    .status(Room.RoomStatus.AVAILABLE)
                                    .monthlyRent(room <= 3 ? 5000.0 : 4000.0)
                                    .amenities("WiFi, AC, Attached Bathroom")
                                    .build()));
                        }
                    }
                    log.info("DataInitializer: ✓ 15 sample rooms created (3 floors × 5 rooms)");
                }

                // ── 3. Sample Students ──────────────────────────────────
                if (studentRepository.count() == 0) {
                    String[][] data = {
                        {"John Doe",      "B.Tech CSE",    "Engineering", "Male",   "2024001", "101"},
                        {"Jane Smith",    "B.Tech ECE",    "Engineering", "Female", "2024002", "102"},
                        {"Mike Johnson",  "B.Tech ME",     "Engineering", "Male",   "2024003", "103"},
                        {"Emily Davis",   "BBA",           "Management",  "Female", "2024004", "104"},
                        {"Chris Wilson",  "B.Sc Physics",  "Science",     "Male",   "2024005", "105"},
                        {"Priya Sharma",  "B.Tech CSE",    "Engineering", "Female", "2024006", "201"},
                        {"Rahul Verma",   "B.Com",         "Commerce",    "Male",   "2024007", "202"},
                        {"Anjali Nair",   "M.Sc Chemistry","Science",     "Female", "2024008", "203"},
                        {"Arjun Reddy",   "B.Tech IT",     "Engineering", "Male",   "2024009", "204"},
                        {"Sneha Patel",   "MBA",           "Management",  "Female", "2024010", "205"},
                    };
                    for (int i = 0; i < data.length; i++) {
                        String[] d = data[i];
                        studentRepository.save(Objects.requireNonNull(Student.builder()
                                .name(d[0])
                                .email(d[0].toLowerCase().replace(" ", ".") + "@student.hostel.com")
                                .phone("98765432" + String.format("%02d", i + 10))
                                .rollNumber(d[4])
                                .course(d[1])
                                .department(d[2])
                                .year(i < 5 ? 2 : 1)
                                .roomNumber(d[5])
                                .gender(d[3])
                                .feesStatus(i < 6 ? Student.FeesStatus.PAID : Student.FeesStatus.PENDING)
                                .isActive(true)
                                .admissionDate(LocalDate.of(2024, 7, 1))
                                .build()));
                    }
                    log.info("DataInitializer: ✓ 10 sample students created");
                }

                log.info("==========================================");
                log.info("🏠 HMS Backend Ready!");
                log.info("   URL    : http://localhost:8080");
                log.info("   Admin  : {} / {}", adminUsername, adminPassword);
                log.info("==========================================");

            } catch (Exception e) {
                log.warn("DataInitializer: error during initialization (non-fatal): {}", e.getMessage(), e);
            }
        };
    }
}
