package com.hostel.config;

import com.hostel.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security configuration with strict role-based access.
 *
 * Roles
 *   ADMIN   — full access
 *   WARDEN  — admin-equivalent for student / room / fee operations
 *   STUDENT — only the per-user /api/me/** endpoints + read-only notices/events
 *
 * The matchers below are ordered most-specific first.
 * Anything not explicitly listed falls through to .anyRequest().authenticated()
 * which still requires a valid JWT.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ── public ────────────────────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/error").permitAll()

                // ── per-user (any authenticated role) ─────────────────────
                .requestMatchers("/api/me/**").authenticated()

                // ── Smart Mess Management (admin/warden) ──────────────────
                // These are deeper paths than /api/mess/** (the menu CRUD)
                // and MUST be listed before the menu rules so they win the
                // most-specific match. If a student hits these they get 403,
                // which the test relies on.
                .requestMatchers("/api/mess/attendance", "/api/mess/attendance/**").hasAnyRole("ADMIN", "WARDEN")
                .requestMatchers("/api/mess/bills", "/api/mess/bills/**").hasAnyRole("ADMIN", "WARDEN")
                .requestMatchers("/api/mess/revenue", "/api/mess/revenue/**").hasAnyRole("ADMIN", "WARDEN")

                // ── notices: anyone can read, only admin/warden can mutate
                .requestMatchers(HttpMethod.GET, "/api/notices/**").authenticated()
                .requestMatchers("/api/notices/**").hasAnyRole("ADMIN", "WARDEN")

                // ── events: anyone can read, only admin/warden can mutate
                .requestMatchers(HttpMethod.GET, "/api/events/**").authenticated()
                .requestMatchers("/api/events/**").hasAnyRole("ADMIN", "WARDEN")

                // ── mess menu: anyone can read, only admin/warden can mutate
                // (keep these LAST among the /api/mess rules — the more specific
                //  Smart Mess paths above must match first)
                .requestMatchers(HttpMethod.GET, "/api/mess/**").authenticated()
                .requestMatchers("/api/mess/**").hasAnyRole("ADMIN", "WARDEN")

                // ── admin-only domains ────────────────────────────────────
                .requestMatchers("/api/students/**").hasAnyRole("ADMIN", "WARDEN")
                .requestMatchers("/api/rooms/**").hasAnyRole("ADMIN", "WARDEN")
                .requestMatchers("/api/allocations/**").hasAnyRole("ADMIN", "WARDEN")
                .requestMatchers("/api/fees/**").hasAnyRole("ADMIN", "WARDEN")
                .requestMatchers("/api/attendance/**").hasAnyRole("ADMIN", "WARDEN")
                .requestMatchers("/api/visitors/**").hasAnyRole("ADMIN", "WARDEN")
                .requestMatchers("/api/analytics/**").hasRole("ADMIN")
                .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "WARDEN")
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "WARDEN")

                // ── shared (admin sees all, students use /api/me) ─────────
                // GET listings on these are admin-only; submission goes through /api/me
                .requestMatchers("/api/complaints/**").hasAnyRole("ADMIN", "WARDEN")
                .requestMatchers("/api/maintenance/**").hasAnyRole("ADMIN", "WARDEN")

                // ── default: must be authenticated ────────────────────────
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // Allow H2 console iframe (dev only)
        http.headers(h -> h.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
