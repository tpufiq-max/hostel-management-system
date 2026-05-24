package com.hostel.config;

import com.hostel.entity.User;
import com.hostel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Bootstraps the initial administrator account on first startup so the
 * application is usable out of the box. No demo students, rooms, fees, or
 * student users are seeded — all real data is entered through the application.
 *
 * <p>The bootstrap admin is only created when:
 * <ol>
 *   <li>{@code app.bootstrap.admin.enabled=true} (default true), AND</li>
 *   <li>No user with the configured bootstrap email exists.</li>
 * </ol>
 *
 * <p>Override defaults via environment variables (recommended for production):
 * <pre>
 *   APP_BOOTSTRAP_ADMIN_ENABLED
 *   APP_BOOTSTRAP_ADMIN_EMAIL
 *   APP_BOOTSTRAP_ADMIN_PASSWORD
 *   APP_BOOTSTRAP_ADMIN_NAME
 *   APP_BOOTSTRAP_ADMIN_USERNAME
 *   APP_BOOTSTRAP_ADMIN_PHONE
 * </pre>
 *
 * <p>After the first login, change the admin password and set
 * {@code APP_BOOTSTRAP_ADMIN_ENABLED=false} in production.
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
    CommandLineRunner initData(UserRepository userRepository,
                               PasswordEncoder passwordEncoder,
                               Environment env) {
        return args -> {
            try {
                bootstrapAdminIfNeeded(userRepository, passwordEncoder);
                printStartupBanner(env);
            } catch (Exception e) {
                // Non-fatal: schema may not be ready on the very first run.
                log.error("DataInitializer failed (non-fatal): {}", e.getMessage(), e);
            }
        };
    }

    private void bootstrapAdminIfNeeded(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        if (!bootstrapEnabled) {
            log.info("Bootstrap admin disabled (app.bootstrap.admin.enabled=false). Skipping.");
            return;
        }
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Bootstrap admin '{}' already exists. Skipping.", adminEmail);
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
        log.warn(" CHANGE THE PASSWORD IMMEDIATELY after first login.");
        log.warn(" In production, set APP_BOOTSTRAP_ADMIN_ENABLED=false once");
        log.warn(" your real admin user is configured.");
        log.warn("===========================================================");
    }

    /**
     * Prints a profile-aware startup banner. We avoid printing credentials.
     */
    private void printStartupBanner(Environment env) {
        String[] profiles = env.getActiveProfiles();
        String activeProfile = profiles.length == 0 ? "default" : String.join(",", profiles);
        String dbType = inferDatabaseType(env);
        String port = env.getProperty("server.port", "8080");
        String contextPath = env.getProperty("server.servlet.context-path", "");

        log.info("==========================================");
        log.info(" Hostel Management System backend ready");
        log.info("   Profile : {}", activeProfile);
        log.info("   Database: {}", dbType);
        log.info("   URL     : http://localhost:{}{}", port, contextPath);
        log.info("==========================================");
    }

    private String inferDatabaseType(Environment env) {
        String url = env.getProperty("spring.datasource.url", "");
        if (url.startsWith("jdbc:mysql")) return "MySQL (" + sanitizeUrl(url) + ")";
        if (url.startsWith("jdbc:postgresql")) return "PostgreSQL (" + sanitizeUrl(url) + ")";
        if (url.startsWith("jdbc:h2:mem")) return "H2 in-memory";
        if (url.startsWith("jdbc:h2:file")) return "H2 file-based";
        if (url.startsWith("jdbc:h2")) return "H2";
        return url.isEmpty() ? "unknown" : sanitizeUrl(url);
    }

    /**
     * Strips query parameters from a JDBC URL so we don't log credentials or
     * connection-string secrets that some drivers accept inline.
     */
    private String sanitizeUrl(String url) {
        int q = url.indexOf('?');
        return q < 0 ? url : url.substring(0, q);
    }
}
