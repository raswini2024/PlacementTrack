package com.placementtrack.controller;

import com.placementtrack.model.*;
import com.placementtrack.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(origins = "http://localhost:3000")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    private Long getUserId(Authentication auth) {
        return (Long) auth.getCredentials();
    }

    @GetMapping("/company/{company}")
    public ResponseEntity<List<CompanyQuestion>> getCompanyQuestions(@PathVariable String company) {
        return ResponseEntity.ok(interviewService.getCompanyQuestions(company));
    }

    @GetMapping("/company/{company}/roadmap")
    public ResponseEntity<Map<String, Object>> getCompanyRoadmap(@PathVariable String company) {
        return ResponseEntity.ok(interviewService.getCompanyRoadmap(company));
    }

    @GetMapping("/hr-questions")
    public ResponseEntity<List<HrQuestion>> getHrQuestions() {
        return ResponseEntity.ok(interviewService.getAllHrQuestions());
    }

    @GetMapping("/mock-test/start/{testType}")
    public ResponseEntity<Map<String, Object>> startMockTest(@PathVariable String testType,
                                                              Authentication auth) {
        Long studentId = getUserId(auth);
        return ResponseEntity.ok(interviewService.startMockTest(studentId, testType));
    }

    @PostMapping("/mock-test/submit")
    public ResponseEntity<?> submitMockTest(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            Long studentId = getUserId(auth);
            String testType = body.get("testType").toString();
            int total = Integer.parseInt(body.get("totalQuestions").toString());
            int correct = Integer.parseInt(body.get("correctAnswers").toString());
            MockTest test = interviewService.submitMockTest(studentId, testType, total, correct);
            return ResponseEntity.ok(test);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mock-test/history")
    public ResponseEntity<List<MockTest>> getMockTestHistory(Authentication auth) {
        Long studentId = getUserId(auth);
        return ResponseEntity.ok(interviewService.getMockTestHistory(studentId));
    }
}
