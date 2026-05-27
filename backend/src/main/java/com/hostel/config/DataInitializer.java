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
 * DataInitializer — bootstraps a single admin user on first startup.
 *
 * NO demo students, rooms, fees, visitors, notices, events, mess menus,
 * maintenance requests, complaints or attendance records are ever seeded.
 * The system stays clean until you create your own data through the UI.
 *
 * The admin is created ONLY when:
 *   1. app.bootstrap.admin.enabled=true (default)
 *   2. No user with the configured username exists yet
 *
 * Override via environment variables in production:
 *   APP_BOOTSTRAP_ADMIN_ENABLED=true|false
 *   APP_BOOTSTRAP_ADMIN_NAME=...
 *   APP_BOOTSTRAP_ADMIN_USERNAME=...
 *   APP_BOOTSTRAP_ADMIN_EMAIL=...
 *   APP_BOOTSTRAP_ADMIN_PASSWORD=...
 *   APP_BOOTSTRAP_ADMIN_PHONE=...
 *
 * Once your real admin is configured, disable bootstrap entirely:
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
            UserRepository    userRepository,
            PasswordEncoder   passwordEncoder) {

        return args -> {
            try {
                if (!bootstrapEnabled) {
                    log.info("DataInitializer: app.bootstrap.admin.enabled=false — skipping admin bootstrap");
                    logBanner(adminUsername, "<bootstrap disabled>");
                    return;
                }

                if (userRepository.existsByUsername(adminUsername)) {
                    log.info("DataInitializer: admin '{}' already exists — skipping bootstrap", adminUsername);
                    logBanner(adminUsername, "<existing user — password unchanged>");
                    return;
                }

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
                logBanner(adminUsername, adminPassword);

            } catch (Exception e) {
                log.warn("DataInitializer: error during admin bootstrap (non-fatal): {}", e.getMessage(), e);
            }
        };
    }

    private static void logBanner(String username, String password) {
        log.info("==========================================");
        log.info("🏠 HMS Backend Ready!");
        log.info("   URL    : http://localhost:8080");
        log.info("   Admin  : {} / {}", username, password);
        log.info("   Note   : System is empty by design — add data via UI");
        log.info("==========================================");
    }
}
