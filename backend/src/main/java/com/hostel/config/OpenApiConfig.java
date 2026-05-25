package com.hostel.config;

import com.hostel.constants.SecurityConstants;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Springdoc / OpenAPI configuration.
 *
 * <p>Exposes:
 * <ul>
 *   <li>Interactive UI at <code>/swagger-ui.html</code></li>
 *   <li>Raw spec at <code>/v3/api-docs</code></li>
 * </ul>
 *
 * <p>Registers a global JWT bearer security scheme so authenticated endpoints
 * get a "lock" icon in the UI and a single "Authorize" button at the top
 * accepts an access token for all subsequent requests.
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${spring.application.name:hostel-management-system}")
    private String appName;

    @Bean
    public OpenAPI hostelOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hostel Management System API")
                        .version("v1")
                        .description("""
                                REST API for the Hostel Management System.

                                **Authentication.** Most endpoints require a JWT access token.
                                Call `POST /api/auth/login` with your credentials, copy the
                                `accessToken` from the response, click the "Authorize" button
                                above and paste it as `Bearer <token>`.

                                **Roles.** Endpoints are protected by role:
                                - `ADMIN` — full access
                                - `WARDEN` — student / room / attendance / complaint management
                                - `STUDENT` — read-only access to own records
                                """)
                        .contact(new Contact()
                                .name("Hostel Management Team")
                                .email("support@hostel.local"))
                        .license(new License()
                                .name("MIT")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:" + serverPort).description("Local")))
                .components(new Components()
                        .addSecuritySchemes(SecurityConstants.JWT_SECURITY_SCHEME, jwtSecurityScheme()))
                .addSecurityItem(new SecurityRequirement()
                        .addList(SecurityConstants.JWT_SECURITY_SCHEME));
    }

    private SecurityScheme jwtSecurityScheme() {
        return new SecurityScheme()
                .name(SecurityConstants.JWT_SECURITY_SCHEME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Paste the JWT access token returned by /api/auth/login");
    }
}
