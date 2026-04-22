package com.placementtrack.controller;

import com.placementtrack.model.*;
import com.placementtrack.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired private StudentRepository studentRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private TopicRepository topicRepository;
    @Autowired private SubtopicRepository subtopicRepository;
    @Autowired private MockTestRepository mockTestRepository;
    @Autowired private CodingQuestionRepository codingQuestionRepository;
    @Autowired private TestCaseRepository testCaseRepository;
    @Autowired private CompanyQuestionRepository companyQuestionRepository;
    @Autowired private ExamPaperRepository examPaperRepository;
    @Autowired private PaperQuestionRepository paperQuestionRepository;

    // ===== STATS =====
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentRepository.count());
        stats.put("totalQuestions", questionRepository.count());
        stats.put("totalTopics", topicRepository.count());
        stats.put("totalMockTests", mockTestRepository.count());
        return ResponseEntity.ok(stats);
    }

    // ===== MCQ QUESTIONS =====
    @GetMapping("/questions")
    public ResponseEntity<?> getAllQuestions() {
        List<Question> questions = questionRepository.findAll();
        List<Map<String, Object>> result = questions.stream().map(q -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", q.getId());
            map.put("questionText", q.getQuestionText());
            map.put("optionA", q.getOptionA());
            map.put("optionB", q.getOptionB());
            map.put("optionC", q.getOptionC());
            map.put("optionD", q.getOptionD());
            map.put("correctAnswer", q.getCorrectAnswer());
            map.put("explanation", q.getExplanation());
            map.put("difficulty", q.getDifficulty());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/questions")
    public ResponseEntity<?> addQuestion(@RequestBody Map<String, Object> body) {
        try {
            Long subtopicId = Long.valueOf(body.get("subtopicId").toString());
            Subtopic subtopic = subtopicRepository.findById(subtopicId)
                    .orElseThrow(() -> new RuntimeException("Subtopic not found"));
            Question q = new Question();
            q.setSubtopic(subtopic);
            q.setQuestionText(body.get("questionText").toString());
            q.setOptionA(body.get("optionA").toString());
            q.setOptionB(body.get("optionB").toString());
            q.setOptionC(body.get("optionC").toString());
            q.setOptionD(body.get("optionD").toString());
            q.setCorrectAnswer(body.get("correctAnswer").toString());
            q.setExplanation(body.getOrDefault("explanation", "").toString());
            q.setDifficulty(Question.Difficulty.valueOf(body.get("difficulty").toString()));
            q.setQuestionType(Question.QuestionType.MCQ);
            questionRepository.save(q);
            return ResponseEntity.ok(Map.of("message", "Question added!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        try {
            questionRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Deleted!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== TOPICS =====
    @GetMapping("/topics")
    public ResponseEntity<?> getAllTopics() {
        List<Topic> topics = topicRepository.findAll();
        List<Map<String, Object>> result = topics.stream().map(t -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", t.getId());
            map.put("name", t.getName());
            map.put("moduleType", t.getModuleType());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // ===== STUDENTS =====
    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        List<Map<String, Object>> result = students.stream()
                .filter(s -> s.getRole() == Student.Role.STUDENT)
                .map(s -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", s.getId());
                    map.put("name", s.getName());
                    map.put("email", s.getEmail());
                    map.put("profileCompleted", s.getProfileCompleted());
                    map.put("createdAt", s.getCreatedAt());
                    if (s.getProfile() != null) {
                        map.put("dreamCompany", s.getProfile().getDreamCompany());
                        map.put("dreamRole", s.getProfile().getDreamRole());
                    }
                    return map;
                }).toList();
        return ResponseEntity.ok(result);
    }

    // ===== CODING QUESTIONS =====
    @GetMapping("/coding-questions")
    public ResponseEntity<?> getCodingQuestions() {
        List<CodingQuestion> questions = codingQuestionRepository.findAll();
        List<Map<String, Object>> result = questions.stream().map(q -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", q.getId());
            map.put("title", q.getTitle());
            map.put("difficulty", q.getDifficulty());
            map.put("company", q.getCompany());
            map.put("topic", q.getTopic());
            map.put("testCaseCount", testCaseRepository.findByQuestionId(q.getId()).size());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/coding-questions")
    public ResponseEntity<?> addCodingQuestion(@RequestBody Map<String, Object> body) {
        try {
            CodingQuestion q = new CodingQuestion();
            q.setTitle(body.get("title").toString());
            q.setDescription(body.get("description").toString());
            q.setDifficulty(CodingQuestion.Difficulty.valueOf(
                    body.getOrDefault("difficulty", "Easy").toString()));
            q.setCompany(body.getOrDefault("company", "").toString());
            q.setTopic(body.getOrDefault("topic", "").toString());
            q.setInputFormat(body.getOrDefault("inputFormat", "").toString());
            q.setOutputFormat(body.getOrDefault("outputFormat", "").toString());
            q.setConstraintsText(body.getOrDefault("constraintsText", "").toString());
            CodingQuestion saved = codingQuestionRepository.save(q);

            if (body.containsKey("testCases")) {
                List<Map<String, Object>> tcs = (List<Map<String, Object>>) body.get("testCases");
                for (Map<String, Object> tc : tcs) {
                    TestCase testCase = new TestCase();
                    testCase.setQuestion(saved);
                    testCase.setInputData(tc.get("input").toString());
                    testCase.setExpectedOutput(tc.get("expectedOutput").toString());
                    testCase.setIsHidden(Boolean.parseBoolean(
                            tc.getOrDefault("isHidden", "false").toString()));
                    testCaseRepository.save(testCase);
                }
            }
            return ResponseEntity.ok(Map.of("message", "Added!", "id", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/coding-questions/{id}")
    public ResponseEntity<?> deleteCodingQuestion(@PathVariable Long id) {
        try {
            codingQuestionRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Deleted!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== COMPANY QUESTIONS =====
    @GetMapping("/company-questions")
    public ResponseEntity<?> getCompanyQuestions() {
        List<CompanyQuestion> questions = companyQuestionRepository.findAll();
        List<Map<String, Object>> result = questions.stream().map(q -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", q.getId());
            map.put("company", q.getCompany());
            map.put("questionText", q.getQuestionText());
            map.put("questionType", q.getQuestionType());
            map.put("yearAsked", q.getYearAsked());
            map.put("difficulty", q.getDifficulty());
            map.put("answerHint", q.getAnswerHint());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/company-questions")
    public ResponseEntity<?> addCompanyQuestion(@RequestBody Map<String, Object> body) {
        try {
            CompanyQuestion q = new CompanyQuestion();
            q.setCompany(body.get("company").toString());
            q.setQuestionText(body.get("questionText").toString());
            q.setQuestionType(body.get("questionType").toString());
            q.setYearAsked(Integer.parseInt(body.get("yearAsked").toString()));
            q.setDifficulty(body.getOrDefault("difficulty", "Easy").toString());
            q.setAnswerHint(body.getOrDefault("answerHint", "").toString());
            companyQuestionRepository.save(q);
            return ResponseEntity.ok(Map.of("message", "Added!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/company-questions/{id}")
    public ResponseEntity<?> deleteCompanyQuestion(@PathVariable Long id) {
        try {
            companyQuestionRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Deleted!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== EXAM PAPERS =====
    @GetMapping("/exam-papers")
    public ResponseEntity<?> getExamPapers() {
        List<ExamPaper> papers = examPaperRepository.findAll();
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

    @PostMapping("/exam-papers")
    public ResponseEntity<?> addExamPaper(@RequestBody Map<String, Object> body) {
        try {
            ExamPaper p = new ExamPaper();
            p.setCompany(body.get("company").toString());
            p.setTitle(body.get("title").toString());
            p.setYear(Integer.parseInt(body.get("year").toString()));
            p.setDescription(body.getOrDefault("description", "").toString());
            p.setDurationMins(Integer.parseInt(body.getOrDefault("durationMins", "60").toString()));
            p.setTotalQuestions(Integer.parseInt(body.getOrDefault("totalQuestions", "0").toString()));
            examPaperRepository.save(p);
            return ResponseEntity.ok(Map.of("message", "Paper added!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/exam-papers/{paperId}/questions")
    public ResponseEntity<?> addPaperQuestion(
            @PathVariable Long paperId,
            @RequestBody Map<String, Object> body) {
        try {
            ExamPaper paper = examPaperRepository.findById(paperId)
                    .orElseThrow(() -> new RuntimeException("Paper not found"));
            PaperQuestion q = new PaperQuestion();
            q.setPaper(paper);
            q.setQuestionText(body.get("questionText").toString());
            q.setOptionA(body.get("optionA").toString());
            q.setOptionB(body.get("optionB").toString());
            q.setOptionC(body.get("optionC").toString());
            q.setOptionD(body.get("optionD").toString());
            q.setCorrectAnswer(body.get("correctAnswer").toString());
            q.setExplanation(body.getOrDefault("explanation", "").toString());
            q.setDifficulty(PaperQuestion.Difficulty.valueOf(
                    body.getOrDefault("difficulty", "Easy").toString()));
            paperQuestionRepository.save(q);
            return ResponseEntity.ok(Map.of("message", "Question added!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/exam-papers/{id}")
    public ResponseEntity<?> deleteExamPaper(@PathVariable Long id) {
        try {
            examPaperRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Deleted!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}