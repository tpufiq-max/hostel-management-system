package com.hostel.controller;

import com.hostel.dto.*;
import com.hostel.dto.PasswordRequests.*;
import com.hostel.service.AuthService;
import com.hostel.service.PasswordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.hostel.security.CustomUserDetails;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "Authentication", description = "Login, registration, password management, and current-user endpoints")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordService passwordService;

    public AuthController(AuthService authService, PasswordService passwordService) {
        this.authService = authService;
        this.passwordService = passwordService;
    }

    @Operation(summary = "Login with email and password",
               description = "Returns access + refresh tokens and the authenticated user.")
    @SecurityRequirements // No auth required
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @Operation(summary = "Register a new user",
               description = "Public self-service registration. Use ADMIN/WARDEN role only when invoked by an existing admin.")
    @SecurityRequirements
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @Operation(summary = "Exchange a refresh token for a new access + refresh token pair")
    @SecurityRequirements
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Request a password reset link",
               description = "Always returns 200 to avoid leaking whether the email exists. " +
                             "In dev, the reset token is included in the response for testing.")
    @SecurityRequirements
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        String token = passwordService.forgotPassword(request.getEmail());

        // Always return success (don't leak whether email exists)
        Map<String, Object> data = new HashMap<>();
        data.put("emailSent", true);
        // In dev mode, include the token for testing
        if (token != null) {
            data.put("devToken", token);
        }

        return ResponseEntity.ok(ApiResponse.success(
                "If an account with that email exists, a password reset link has been sent.",
                data
        ));
    }

    @Operation(summary = "Reset a password using a token from the forgot-password flow")
    @SecurityRequirements
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    @Operation(summary = "Change the current user's password",
               description = "Requires the current password for confirmation.")
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        passwordService.changePassword(
                userDetails.getUsername(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @Operation(summary = "Get the currently authenticated user")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        UserDTO dto = UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole().name().toLowerCase())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .build();
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
