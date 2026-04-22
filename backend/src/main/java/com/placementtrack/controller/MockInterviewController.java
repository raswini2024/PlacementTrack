package com.placementtrack.controller;

import com.placementtrack.model.*;
import com.placementtrack.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/mock-interview")
@CrossOrigin(origins = "http://localhost:3000")
public class MockInterviewController {

    @Autowired
    private InterviewSessionRepository sessionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private HrQuestionRepository hrQuestionRepository;

    private Long getUserId(Authentication auth) {
        return (Long) auth.getCredentials();
    }

    // Random interview question எடுக்கும்
    private String getRandomQuestion() {
        List<HrQuestion> questions = hrQuestionRepository.findAll();
        if (questions.isEmpty()) return "Tell me about yourself.";
        return questions.get(new Random().nextInt(questions.size())).getQuestionText();
    }

    // Find or Create session
    @PostMapping("/find-partner")
    public ResponseEntity<?> findPartner(Authentication auth) {
        Long studentId = getUserId(auth);
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Already waiting session இருக்கான்னு check
        Optional<InterviewSession> waiting = sessionRepository
                .findFirstByStatus(InterviewSession.Status.WAITING);

        if (waiting.isPresent()) {
            InterviewSession session = waiting.get();

            // Same student ஆ இருந்தா skip
            if (session.getInterviewer().getId().equals(studentId)) {
                Map<String, Object> res = new LinkedHashMap<>();
                res.put("status", "WAITING");
                res.put("sessionId", session.getId());
                res.put("message", "Waiting for partner...");
                return ResponseEntity.ok(res);
            }

            // Match found!
            session.setInterviewee(student);
            session.setStatus(InterviewSession.Status.ACTIVE);
            session.setQuestionText(getRandomQuestion());
            sessionRepository.save(session);

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("status", "MATCHED");
            res.put("sessionId", session.getId());
            res.put("roomId", session.getRoomId());
            res.put("question", session.getQuestionText());
            res.put("role", "INTERVIEWEE");
            res.put("partnerName", session.getInterviewer().getName());
            return ResponseEntity.ok(res);

        } else {
            // New session create பண்ணு
            String roomId = "placementtrack-" + UUID.randomUUID().toString().substring(0, 8);
            InterviewSession session = new InterviewSession();
            session.setInterviewer(student);
            session.setRoomId(roomId);
            session.setStatus(InterviewSession.Status.WAITING);
            session.setQuestionText(getRandomQuestion());
            sessionRepository.save(session);

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("status", "WAITING");
            res.put("sessionId", session.getId());
            res.put("message", "Waiting for partner...");
            return ResponseEntity.ok(res);
        }
    }

    // Session status check (polling)
    @GetMapping("/session/{sessionId}/status")
    public ResponseEntity<?> checkStatus(
            @PathVariable Long sessionId, Authentication auth) {
        Long studentId = getUserId(auth);
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", session.getStatus());
        res.put("sessionId", session.getId());

        if (session.getStatus() == InterviewSession.Status.ACTIVE) {
            res.put("roomId", session.getRoomId());
            res.put("question", session.getQuestionText());

            boolean isInterviewer = session.getInterviewer().getId().equals(studentId);
            res.put("role", isInterviewer ? "INTERVIEWER" : "INTERVIEWEE");

            String partnerName = isInterviewer
                    ? (session.getInterviewee() != null ? session.getInterviewee().getName() : "Partner")
                    : session.getInterviewer().getName();
            res.put("partnerName", partnerName);
        }
        return ResponseEntity.ok(res);
    }

    // Submit feedback + score
    @PostMapping("/session/{sessionId}/feedback")
    public ResponseEntity<?> submitFeedback(
            @PathVariable Long sessionId,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        Long studentId = getUserId(auth);
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        int score = Integer.parseInt(body.get("score").toString());
        String feedback = body.getOrDefault("feedback", "").toString();

        boolean isInterviewer = session.getInterviewer().getId().equals(studentId);
        if (isInterviewer) {
            session.setIntervieweeScore(score);
        } else {
            session.setInterviewerScore(score);
        }
        session.setFeedback(feedback);
        session.setStatus(InterviewSession.Status.COMPLETED);
        sessionRepository.save(session);

        return ResponseEntity.ok(Map.of("message", "Feedback submitted! ✅"));
    }

    // History
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication auth) {
        Long studentId = getUserId(auth);
        List<InterviewSession> sessions = sessionRepository
                .findByInterviewerIdOrIntervieweeId(studentId, studentId);

        List<Map<String, Object>> result = sessions.stream()
                .filter(s -> s.getStatus() == InterviewSession.Status.COMPLETED)
                .map(s -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", s.getId());
                    map.put("status", s.getStatus());
                    map.put("question", s.getQuestionText());
                    boolean isInterviewer = s.getInterviewer().getId().equals(studentId);
                    map.put("role", isInterviewer ? "INTERVIEWER" : "INTERVIEWEE");
                    map.put("myScore", isInterviewer ? s.getInterviewerScore() : s.getIntervieweeScore());
                    map.put("partnerName", isInterviewer
                            ? (s.getInterviewee() != null ? s.getInterviewee().getName() : "Unknown")
                            : s.getInterviewer().getName());
                    map.put("date", s.getCreatedAt());
                    return map;
                }).toList();

        return ResponseEntity.ok(result);
    }

    // Cancel waiting
    @DeleteMapping("/session/{sessionId}/cancel")
    public ResponseEntity<?> cancelSession(
            @PathVariable Long sessionId, Authentication auth) {
        Long studentId = getUserId(auth);
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        if (session.getStatus() == InterviewSession.Status.WAITING) {
            sessionRepository.deleteById(sessionId);
        }
        return ResponseEntity.ok(Map.of("message", "Cancelled!"));
    }
}