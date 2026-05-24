package com.hostel.service;

import com.hostel.dto.AuthRequest;
import com.hostel.dto.AuthResponse;
import com.hostel.dto.RegisterRequest;
import com.hostel.entity.User;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.UserMapper;
import com.hostel.repository.UserRepository;
import com.hostel.security.CustomUserDetails;
import com.hostel.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Authentication, registration, and refresh-token issuance.
 *
 * <p>User-to-DTO conversion is delegated to {@link UserMapper}; the role is
 * lower-cased there to match what the existing frontend expects.
 */
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        return buildAuthResponse(
                user,
                tokenProvider.generateAccessToken(authentication),
                tokenProvider.generateRefreshToken(user.getEmail()));
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(parseRole(request.getRole()))
                .phone(request.getPhone())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        return buildAuthResponse(
                user,
                tokenProvider.generateAccessToken(user.getEmail(), user.getRole().name()),
                tokenProvider.generateRefreshToken(user.getEmail()));
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildAuthResponse(
                user,
                tokenProvider.generateAccessToken(email, user.getRole().name()),
                tokenProvider.generateRefreshToken(email));
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userMapper.toDto(user))
                .build();
    }

    private User.Role parseRole(String role) {
        if (role == null || role.isBlank()) {
            throw new BadRequestException("Role is required");
        }
        try {
            return User.Role.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role '" + role + "'. Allowed: ADMIN, WARDEN, STUDENT");
        }
    }
}
