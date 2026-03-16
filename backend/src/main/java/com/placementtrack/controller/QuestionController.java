package com.placementtrack.controller;

import com.placementtrack.dto.AnswerDto;
import com.placementtrack.model.*;
import com.placementtrack.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    private Long getUserId(Authentication auth) {
        return (Long) auth.getCredentials();
    }

    @GetMapping("/topics/{moduleType}")
    public ResponseEntity<List<Map<String, Object>>> getTopics(@PathVariable String moduleType) {
        List<Topic> topics = questionService.getTopicsByModule(moduleType);
        List<Map<String, Object>> result = topics.stream().map(t -> {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", t.getId());
            map.put("name", t.getName());
            map.put("moduleType", t.getModuleType());
            map.put("description", t.getDescription());
            map.put("icon", t.getIcon());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/subtopics/{topicId}")
    public ResponseEntity<List<Map<String, Object>>> getSubtopics(@PathVariable Long topicId) {
        List<Subtopic> subtopics = questionService.getSubtopicsByTopic(topicId);
        List<Map<String, Object>> result = subtopics.stream().map(s -> {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getName());
            map.put("description", s.getDescription());
            map.put("difficulty", s.getDifficulty());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/practice/{subtopicId}")
    public ResponseEntity<List<Map<String, Object>>> getQuestions(@PathVariable Long subtopicId) {
        List<Question> questions = questionService.getQuestionsBySubtopic(subtopicId);
        List<Map<String, Object>> result = questions.stream().map(q -> {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", q.getId());
            map.put("questionText", q.getQuestionText());
            map.put("optionA", q.getOptionA());
            map.put("optionB", q.getOptionB());
            map.put("optionC", q.getOptionC());
            map.put("optionD", q.getOptionD());
            map.put("difficulty", q.getDifficulty());
            map.put("questionType", q.getQuestionType());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitAnswer(@RequestBody Map<String, Object> body,
                                          Authentication auth) {
        try {
            Long studentId = getUserId(auth);
            Long questionId = Long.valueOf(body.get("questionId").toString());
            String selectedAnswer = body.get("selectedAnswer").toString();
            AnswerDto result = questionService.submitAnswer(studentId, questionId, selectedAnswer);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/progress/{subtopicId}")
    public ResponseEntity<?> getProgress(@PathVariable Long subtopicId, Authentication auth) {
        Long studentId = getUserId(auth);
        return ResponseEntity.ok(questionService.getSubtopicProgress(studentId, subtopicId));
    }
}