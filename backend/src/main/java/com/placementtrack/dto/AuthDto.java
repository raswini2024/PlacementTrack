package com.placementtrack.dto;

public class AuthDto {

    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;

        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPassword() { return password; }
        public void setName(String name) { this.name = name; }
        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public String getPassword() { return password; }
        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private Long studentId;
        private String name;
        private String email;
        private Boolean profileCompleted;
        private String role;

        public AuthResponse(String token, Long studentId, String name,
                            String email, Boolean profileCompleted, String role) {
            this.token = token;
            this.studentId = studentId;
            this.name = name;
            this.email = email;
            this.profileCompleted = profileCompleted;
            this.role = role;
        }

        public String getToken() { return token; }
        public Long getStudentId() { return studentId; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public Boolean getProfileCompleted() { return profileCompleted; }
        public String getRole() { return role; }
    }
}
