package com.hostel.config;

import com.hostel.entity.User;
import com.hostel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Bootstraps the initial admin account on first startup so the application
 * is usable out-of-the-box. No demo students, rooms, or fees are seeded —
 * all real data is entered through the application UI/API.
 *
 * The admin is only created when:
 *   1. app.bootstrap.admin.enabled=true (default true), AND
 *   2. No user with the bootstrap email already exists in the database.
 *
 * Override the defaults via environment variables or application properties:
 *   APP_BOOTSTRAP_ADMIN_EMAIL
 *   APP_BOOTSTRAP_ADMIN_PASSWORD
 *   APP_BOOTSTRAP_ADMIN_NAME
 *   APP_BOOTSTRAP_ADMIN_USERNAME
 *   APP_BOOTSTRAP_ADMIN_PHONE
 */
@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Value("${app.bootstrap.admin.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${app.bootstrap.admin.email:admin@hostel.local}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password:ChangeMe@123}")
    private String adminPassword;

    @Value("${app.bootstrap.admin.name:Administrator}")
    private String adminName;

    @Value("${app.bootstrap.admin.username:admin}")
    private String adminUsername;

    @Value("${app.bootstrap.admin.phone:0000000000}")
    private String adminPhone;

    @Bean
    CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!bootstrapEnabled) {
                log.info("Admin bootstrap disabled (app.bootstrap.admin.enabled=false). Skipping.");
                return;
            }

            if (userRepository.existsByEmail(adminEmail)) {
                log.info("Admin account '{}' already exists. Skipping bootstrap.", adminEmail);
                return;
            }

            User admin = User.builder()
                    .name(adminName)
                    .username(adminUsername)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .phone(adminPhone)
                    .isActive(true)
                    .build();

            userRepository.save(admin);

            log.warn("===========================================================");
            log.warn(" Initial admin account created: {}", adminEmail);
            log.warn(" Please log in and CHANGE THE DEFAULT PASSWORD immediately.");
            log.warn(" Disable bootstrap in production by setting:");
            log.warn("   app.bootstrap.admin.enabled=false");
            log.warn("===========================================================");
        };
    }
}
