package com.placementtrack.controller;

import com.placementtrack.model.CodingQuestion;
import com.placementtrack.model.TestCase;
import com.placementtrack.repository.CodingQuestionRepository;
import com.placementtrack.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/coding")
@CrossOrigin(origins = "http://localhost:3000")
public class CodingController {

    @Autowired
    private CodingQuestionRepository codingQuestionRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    // Get all coding questions
    @GetMapping("/questions")
    public ResponseEntity<?> getAllQuestions() {
        List<CodingQuestion> questions = codingQuestionRepository.findAll();
        List<Map<String, Object>> result = questions.stream().map(q -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", q.getId());
            map.put("title", q.getTitle());
            map.put("description", q.getDescription());
            map.put("difficulty", q.getDifficulty());
            map.put("company", q.getCompany());
            map.put("topic", q.getTopic());
            map.put("inputFormat", q.getInputFormat());
            map.put("outputFormat", q.getOutputFormat());
            map.put("constraintsText", q.getConstraintsText());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // Get question by id with visible test cases
    @GetMapping("/questions/{id}")
    public ResponseEntity<?> getQuestion(@PathVariable Long id) {
        CodingQuestion q = codingQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Only visible test cases
        List<TestCase> visibleCases = testCaseRepository
                .findByQuestionIdAndIsHidden(id, false);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", q.getId());
        result.put("title", q.getTitle());
        result.put("description", q.getDescription());
        result.put("difficulty", q.getDifficulty());
        result.put("company", q.getCompany());
        result.put("topic", q.getTopic());
        result.put("inputFormat", q.getInputFormat());
        result.put("outputFormat", q.getOutputFormat());
        result.put("constraintsText", q.getConstraintsText());

        List<Map<String, Object>> testCases = visibleCases.stream().map(tc -> {
            Map<String, Object> tcMap = new LinkedHashMap<>();
            tcMap.put("id", tc.getId());
            tcMap.put("input", tc.getInputData());
            tcMap.put("expectedOutput", tc.getExpectedOutput());
            tcMap.put("isHidden", false);
            return tcMap;
        }).toList();

        result.put("testCases", testCases);
        return ResponseEntity.ok(result);
    }

    // Submit code — check against all test cases
    @PostMapping("/submit/{questionId}")
    public ResponseEntity<?> submitCode(
            @PathVariable Long questionId,
            @RequestBody Map<String, String> body) {

        String userOutput = body.getOrDefault("output", "").trim();

        List<TestCase> allCases = testCaseRepository
                .findByQuestionId(questionId);

        int total = allCases.size();
        int passed = 0;
        List<Map<String, Object>> results = new ArrayList<>();

        for (int i = 0; i < allCases.size(); i++) {
            TestCase tc = allCases.get(i);
            boolean isHidden = tc.getIsHidden();
            String expected = tc.getExpectedOutput().trim();

            // Simple output comparison
            boolean pass = userOutput.equals(expected);
            if (pass) passed++;

            Map<String, Object> r = new LinkedHashMap<>();
            r.put("testCase", i + 1);
            r.put("passed", pass);
            if (!isHidden) {
                r.put("input", tc.getInputData());
                r.put("expected", expected);
                r.put("got", userOutput);
            } else {
                r.put("input", "Hidden");
                r.put("expected", "Hidden");
                r.put("got", pass ? "Correct" : "Wrong");
            }
            results.add(r);
        }

        String verdict = passed == total ? "ALL_PASSED" :
                passed > 0 ? "PARTIAL" : "FAILED";

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("passed", passed);
        response.put("total", total);
        response.put("verdict", verdict);
        response.put("results", results);
        response.put("message", passed == total ?
                "🎉 All test cases passed! Great job!" :
                passed > 0 ?
                        "⚠️ " + passed + "/" + total + " test cases passed. Keep trying!" :
                        "❌ No test cases passed. Check your logic!");

        return ResponseEntity.ok(response);
    }
}