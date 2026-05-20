package com.hostel.service;

import com.hostel.entity.PasswordResetToken;
import com.hostel.entity.User;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.PasswordResetTokenRepository;
import com.hostel.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class PasswordService {

    private static final long RESET_TOKEN_VALIDITY_HOURS = 1;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordService(UserRepository userRepository,
                           PasswordResetTokenRepository tokenRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Generate a password reset token. Returns the token regardless of whether
     * the email exists (security best practice — don't leak account existence).
     * In production, the token would be emailed to the user.
     */
    public String forgotPassword(String email) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    // Clean up any existing tokens for this user
                    tokenRepository.deleteByUserEmail(email);

                    String tokenString = UUID.randomUUID().toString();
                    PasswordResetToken token = PasswordResetToken.builder()
                            .token(tokenString)
                            .userEmail(email)
                            .expiresAt(LocalDateTime.now().plusHours(RESET_TOKEN_VALIDITY_HOURS))
                            .used(false)
                            .build();
                    tokenRepository.save(token);

                    // TODO: In production, send token via email. For now, log it.
                    System.out.println("=== PASSWORD RESET TOKEN for " + email + " ===");
                    System.out.println("Token: " + tokenString);
                    System.out.println("Reset URL: http://localhost:5173/reset-password?token=" + tokenString);
                    System.out.println("================================================");

                    return tokenString;
                })
                .orElse(null); // Don't leak whether email exists
    }

    public void resetPassword(String tokenString, String newPassword) {
        PasswordResetToken token = tokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (!token.isValid()) {
            throw new BadRequestException("Reset token has expired or already been used");
        }

        User user = userRepository.findByEmail(token.getUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);
    }

    public void changePassword(String userEmail, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
