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
 * DataInitializer — bootstraps ONE admin user on first startup only.
 *
 * ✗ NO sample rooms
 * ✗ NO sample students
 * ✗ NO fake fees, visitors, notices, events, mess menus,
 *     maintenance requests, complaints or attendance records
 *
 * The system starts completely empty. All data is added through the UI.
 *
 * Admin bootstrap is idempotent — skipped if username already exists.
 * Disable once your real admin is configured:
 *   APP_BOOTSTRAP_ADMIN_ENABLED=false
 */
@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    @Order(1)
    CommandLineRunner initData(
            @Value("${app.bootstrap.admin.enabled:true}")           boolean bootstrapEnabled,
            @Value("${app.bootstrap.admin.name:Administrator}")     String adminName,
            @Value("${app.bootstrap.admin.username:admin}")         String adminUsername,
            @Value("${app.bootstrap.admin.email:admin@hostel.com}") String adminEmail,
            @Value("${app.bootstrap.admin.password:admin123}")      String adminPassword,
            @Value("${app.bootstrap.admin.phone:9876543210}")       String adminPhone,
            UserRepository  userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            try {
                if (!bootstrapEnabled) {
                    log.info("DataInitializer: bootstrap disabled — skipping");
                    return;
                }

                if (userRepository.existsByUsername(adminUsername)) {
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

                log.info("==========================================");
                log.info("🏠 HMS Backend Ready — http://localhost:8080");
                log.info("   Login : {} / {}", adminUsername, adminPassword);
                log.info("   Note  : DB is empty — add data via the UI");
                log.info("==========================================");

            } catch (Exception e) {
                log.warn("DataInitializer: non-fatal error: {}", e.getMessage(), e);
            }
        };
    }
}
