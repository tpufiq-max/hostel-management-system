package com.hostel.constants;

/**
 * Central registry of HTTP paths used by the application.
 *
 * <p>Controllers continue to use the {@code @RequestMapping} string literals
 * for compatibility with annotation processors that read them as compile-time
 * constants. This class is the source of truth so other layers (security
 * config, tests, future client code generators) reference the same values
 * without fishing through controller files.
 */
public final class ApiPaths {

    private ApiPaths() {
        // utility class
    }

    /** All REST endpoints live under this prefix. */
    public static final String API_PREFIX = "/api";

    public static final String AUTH = API_PREFIX + "/auth";
    public static final String STUDENTS = API_PREFIX + "/students";
    public static final String ROOMS = API_PREFIX + "/rooms";
    public static final String FEES = API_PREFIX + "/fees";
    public static final String COMPLAINTS = API_PREFIX + "/complaints";
    public static final String ATTENDANCE = API_PREFIX + "/attendance";
    public static final String ALLOCATIONS = API_PREFIX + "/allocations";
    public static final String DASHBOARD = API_PREFIX + "/dashboard";
    public static final String PUBLIC = API_PREFIX + "/public";

    // Public auth subpaths (used in security config)
    public static final String AUTH_LOGIN = AUTH + "/login";
    public static final String AUTH_REGISTER = AUTH + "/register";
    public static final String AUTH_REFRESH = AUTH + "/refresh";
    public static final String AUTH_FORGOT_PASSWORD = AUTH + "/forgot-password";
    public static final String AUTH_RESET_PASSWORD = AUTH + "/reset-password";

    // Patterns used by Spring Security's permitAll matchers
    public static final String AUTH_PATTERN = AUTH + "/**";
    public static final String PUBLIC_PATTERN = PUBLIC + "/**";

    // Documentation / dev tools
    public static final String SWAGGER_UI = "/swagger-ui.html";
    public static final String[] SWAGGER_PATTERNS = {
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/swagger-resources/**",
            "/webjars/**"
    };
    public static final String[] H2_CONSOLE_PATTERNS = { "/h2-console/**" };
}
