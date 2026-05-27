package com.hostel.config;

import com.hostel.entity.User;
import com.hostel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Objects;

/**
 * DataInitializer — bootstraps demo accounts on first startup.
 *
 *   • Admin   : admin@hostel.com / admin123     (role = ADMIN)
 *   • Student : student@hostel.com / student123 (role = STUDENT)
 *
 * No other sample data is seeded — rooms, fees, complaints, visitors,
 * notices, events, mess menus, maintenance requests, attendance records
 * all start empty. Add data through the UI.
 *
 * Bootstrap is idempotent — skipped if the username already exists.
 * Disable once your real accounts are configured:
 *   APP_BOOTSTRAP_ADMIN_ENABLED=false
 *   APP_BOOTSTRAP_STUDENT_ENABLED=false
 */
@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    @Order(1)
    CommandLineRunner initData(
            // ── admin ──────────────────────────────────────────────────────
            @Value("${app.bootstrap.admin.enabled:true}")             boolean adminEnabled,
            @Value("${app.bootstrap.admin.name:Administrator}")       String adminName,
            @Value("${app.bootstrap.admin.username:admin}")           String adminUsername,
            @Value("${app.bootstrap.admin.email:admin@hostel.com}")   String adminEmail,
            @Value("${app.bootstrap.admin.password:admin123}")        String adminPassword,
            @Value("${app.bootstrap.admin.phone:9876543210}")         String adminPhone,
            // ── demo student ───────────────────────────────────────────────
            @Value("${app.bootstrap.student.enabled:true}")           boolean studentEnabled,
            @Value("${app.bootstrap.student.name:Demo Student}")      String studentName,
            @Value("${app.bootstrap.student.username:student}")       String studentUsername,
            @Value("${app.bootstrap.student.email:student@hostel.com}") String studentEmail,
            @Value("${app.bootstrap.student.password:student123}")    String studentPassword,
            @Value("${app.bootstrap.student.phone:9876500000}")       String studentPhone,
            UserRepository  userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            try {
                // ── admin ─────────────────────────────────────────────────
                if (!adminEnabled) {
                    log.info("DataInitializer: admin bootstrap disabled — skipping");
                } else if (userRepository.existsByUsername(adminUsername)) {
                    log.info("DataInitializer: admin '{}' already exists — skipping", adminUsername);
                } else {
                    userRepository.save(Objects.requireNonNull(User.builder()
                            .name(adminName)
                            .username(adminUsername)
                            .email(adminEmail)
                            .password(passwordEncoder.encode(adminPassword))
                            .role(User.Role.ADMIN)
                            .phone(adminPhone)
                            .isActive(true)
                            .build()));
                    log.info("DataInitializer: ✓ admin '{}' created", adminUsername);
                }

                // ── demo student ──────────────────────────────────────────
                if (!studentEnabled) {
                    log.info("DataInitializer: student bootstrap disabled — skipping");
                } else if (userRepository.existsByUsername(studentUsername)) {
                    log.info("DataInitializer: student '{}' already exists — skipping", studentUsername);
                } else {
                    userRepository.save(Objects.requireNonNull(User.builder()
                            .name(studentName)
                            .username(studentUsername)
                            .email(studentEmail)
                            .password(passwordEncoder.encode(studentPassword))
                            .role(User.Role.STUDENT)
                            .phone(studentPhone)
                            .isActive(true)
                            .build()));
                    log.info("DataInitializer: ✓ student '{}' created", studentUsername);
                }

                log.info("==========================================");
                log.info("🏠 HMS Backend Ready — http://localhost:8080");
                log.info("   Admin   : {} / {}", adminEmail,   adminPassword);
                log.info("   Student : {} / {}", studentEmail, studentPassword);
                log.info("   Note    : DB is empty — add data via the UI");
                log.info("==========================================");

            } catch (Exception e) {
                log.warn("DataInitializer: non-fatal error: {}", e.getMessage(), e);
            }
        };
    }
}
