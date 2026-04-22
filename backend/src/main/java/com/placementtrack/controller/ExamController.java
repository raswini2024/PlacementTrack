package com.placementtrack.controller;

import com.placementtrack.model.ExamPaper;
import com.placementtrack.model.PaperQuestion;
import com.placementtrack.repository.ExamPaperRepository;
import com.placementtrack.repository.PaperQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/exam")
@CrossOrigin(origins = "http://localhost:3000")
public class ExamController {

    @Autowired
    private ExamPaperRepository examPaperRepository;

    @Autowired
    private PaperQuestionRepository paperQuestionRepository;

    // Get papers by company
    @GetMapping("/papers/{company}")
    public ResponseEntity<?> getPapersByCompany(@PathVariable String company) {
        List<ExamPaper> papers = examPaperRepository.findByCompanyIgnoreCase(company);
        List<Map<String, Object>> result = papers.stream().map(p -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", p.getId());
            map.put("company", p.getCompany());
            map.put("title", p.getTitle());
            map.put("year", p.getYear());
            map.put("description", p.getDescription());
            map.put("durationMins", p.getDurationMins());
            map.put("totalQuestions", p.getTotalQuestions());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // Get questions for a paper
    @GetMapping("/papers/{paperId}/questions")
    public ResponseEntity<?> getPaperQuestions(@PathVariable Long paperId) {
        List<PaperQuestion> questions = paperQuestionRepository.findByPaperId(paperId);
        List<Map<String, Object>> result = questions.stream().map(q -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", q.getId());
            map.put("questionText", q.getQuestionText());
            map.put("optionA", q.getOptionA());
            map.put("optionB", q.getOptionB());
            map.put("optionC", q.getOptionC());
            map.put("optionD", q.getOptionD());
            map.put("difficulty", q.getDifficulty());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // Submit paper answers
    @PostMapping("/papers/{paperId}/submit")
    public ResponseEntity<?> submitPaper(
            @PathVariable Long paperId,
            @RequestBody Map<String, String> answers) {

        List<PaperQuestion> questions = paperQuestionRepository.findByPaperId(paperId);
        int correct = 0;
        List<Map<String, Object>> results = new ArrayList<>();

        for (PaperQuestion q : questions) {
            String userAnswer = answers.getOrDefault(q.getId().toString(), "");
            boolean isCorrect = q.getCorrectAnswer().equalsIgnoreCase(userAnswer);
            if (isCorrect) correct++;

            Map<String, Object> r = new LinkedHashMap<>();
            r.put("questionId", q.getId());
            r.put("questionText", q.getQuestionText());
            r.put("userAnswer", userAnswer);
            r.put("correctAnswer", q.getCorrectAnswer());
            r.put("isCorrect", isCorrect);
            r.put("explanation", q.getExplanation());
            results.add(r);
        }

        int total = questions.size();
        double pct = total > 0 ? (double) correct / total * 100 : 0;

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("correct", correct);
        response.put("total", total);
        response.put("percentage", Math.round(pct));
        response.put("results", results);
        response.put("message", pct >= 70 ? "🎉 Excellent! Well done!" :
                pct >= 40 ? "💪 Good effort! Keep practicing!" :
                        "📚 Keep studying! You can do it!");

        return ResponseEntity.ok(response);
    }
}