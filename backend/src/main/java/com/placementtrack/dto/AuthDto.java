package com.placementtrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank
        @Email
        private String email;

        @NotBlank
        @Size(min = 6, max = 100)
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank
        @Email
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private Long studentId;
        private String name;
        private String email;
        private Boolean profileCompleted;

        public AuthResponse(String token, Long studentId, String name, String email, Boolean profileCompleted) {
            this.token = token;
            this.studentId = studentId;
            this.name = name;
            this.email = email;
            this.profileCompleted = profileCompleted;
        }
    }
}
