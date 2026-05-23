package com.hostel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;

    // Field initialiser is ignored by @Builder — set the default in builder method instead
    @Builder.Default
    private String tokenType = "Bearer";

    private UserDTO user;
}
