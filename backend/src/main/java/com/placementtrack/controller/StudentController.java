package com.placementtrack.controller;

import com.placementtrack.dto.ProfileDto;
import com.placementtrack.dto.ProgressDto;
import com.placementtrack.model.Student;
import com.placementtrack.model.StudentProfile;
import com.placementtrack.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    @Autowired
    private StudentService studentService;

    private Long getUserId(Authentication auth) {
        return (Long) auth.getCredentials();
    }

    @PostMapping("/profile")
    public ResponseEntity<?> saveProfile(@Valid @RequestBody ProfileDto dto, Authentication auth) {
        try {
            Long studentId = getUserId(auth);
            StudentProfile profile = studentService.saveProfile(studentId, dto);
            return ResponseEntity.ok(Map.of("message", "Profile saved successfully", "profile", profile));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        try {
            Long studentId = getUserId(auth);
            StudentProfile profile = studentService.getProfile(studentId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication auth) {
        try {
            Long studentId = getUserId(auth);
            Student student = studentService.getStudent(studentId);
            return ResponseEntity.ok(Map.of(
                "id", student.getId(),
                "name", student.getName(),
                "email", student.getEmail(),
                "profileCompleted", student.getProfileCompleted()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getProgress(Authentication auth) {
        try {
            Long studentId = getUserId(auth);
            ProgressDto progress = studentService.getProgress(studentId);
            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/suggestions")
    public ResponseEntity<?> getSuggestions(Authentication auth) {
        try {
            Long studentId = getUserId(auth);
            Map<Long, String> suggestions = studentService.getSubtopicSuggestions(studentId);
            return ResponseEntity.ok(suggestions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
