package com.hostel.constants;

/**
 * Authentication / authorization constants.
 */
public final class SecurityConstants {

    private SecurityConstants() {
        // utility class
    }

    public static final String AUTH_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    public static final String ROLE_PREFIX = "ROLE_";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_WARDEN = "WARDEN";
    public static final String ROLE_STUDENT = "STUDENT";

    /** Pre-authorize expression for admin OR warden access. */
    public static final String ADMIN_OR_WARDEN = "hasRole('ADMIN') or hasRole('WARDEN')";
    public static final String ADMIN_ONLY = "hasRole('ADMIN')";
    public static final String AUTHENTICATED = "isAuthenticated()";

    /** Name used when registering the JWT bearer scheme in OpenAPI. */
    public static final String JWT_SECURITY_SCHEME = "bearerAuth";
}
