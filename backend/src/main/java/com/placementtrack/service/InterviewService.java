package com.placementtrack.service;

import com.placementtrack.model.*;
import com.placementtrack.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class InterviewService {

    @Autowired
    private CompanyQuestionRepository companyQuestionRepository;

    @Autowired
    private HrQuestionRepository hrQuestionRepository;

    @Autowired
    private MockTestRepository mockTestRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private StudentRepository studentRepository;

    public List<CompanyQuestion> getCompanyQuestions(String company) {
        return companyQuestionRepository.findByCompanyIgnoreCase(company);
    }

    public List<HrQuestion> getAllHrQuestions() {
        return hrQuestionRepository.findAll();
    }

    public Map<String, Object> startMockTest(Long studentId, String testType) {
        Map<String, Object> result = new HashMap<>();
        List<Question> questions = new ArrayList<>();

        // Fetch 10 questions of given type
        if ("APTITUDE".equals(testType)) {
            // Get subtopics from aptitude topics
            questions = questionRepository.findAll().stream()
                .filter(q -> q.getSubtopic().getTopic().getModuleType() == Topic.ModuleType.APTITUDE)
                .limit(10)
                .toList();
        } else if ("PROGRAMMING".equals(testType)) {
            questions = questionRepository.findAll().stream()
                .filter(q -> q.getSubtopic().getTopic().getModuleType() == Topic.ModuleType.PROGRAMMING)
                .limit(10)
                .toList();
        } else {
            // Mixed
            questions = questionRepository.findAll().stream().limit(15).toList();
        }

        result.put("questions", questions);
        result.put("totalQuestions", questions.size());
        result.put("testType", testType);
        return result;
    }

    public MockTest submitMockTest(Long studentId, String testType, int totalQuestions, int correctAnswers) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        MockTest test = new MockTest();
        test.setStudent(student);
        test.setTestType(MockTest.TestType.valueOf(testType));
        test.setTotalQuestions(totalQuestions);
        test.setCorrectAnswers(correctAnswers);

        double score = totalQuestions > 0 ? (double) correctAnswers / totalQuestions * 100 : 0;
        test.setScorePercentage(BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP));

        return mockTestRepository.save(test);
    }

    public List<MockTest> getMockTestHistory(Long studentId) {
        return mockTestRepository.findByStudentIdOrderByTakenAtDesc(studentId);
    }

    public Map<String, Object> getCompanyRoadmap(String company) {
        Map<String, Object> roadmap = new HashMap<>();
        roadmap.put("company", company);

        List<CompanyQuestion> questions = companyQuestionRepository.findByCompanyIgnoreCase(company);

        Map<String, List<CompanyQuestion>> grouped = new LinkedHashMap<>();
        for (CompanyQuestion q : questions) {
            grouped.computeIfAbsent(q.getQuestionType().name(), k -> new ArrayList<>()).add(q);
        }

        roadmap.put("questionsByType", grouped);
        roadmap.put("totalQuestions", questions.size());

        // Add roadmap stages
        List<Map<String, String>> stages = new ArrayList<>();
        stages.add(Map.of("stage", "1", "title", "Aptitude Round", "description", "Quantitative & Logical questions"));
        stages.add(Map.of("stage", "2", "title", "Technical Round 1", "description", "Data Structures & Algorithms"));
        stages.add(Map.of("stage", "3", "title", "Technical Round 2", "description", "Advanced Programming & Design"));
        stages.add(Map.of("stage", "4", "title", "HR Round", "description", "Behavioral & HR questions"));

        roadmap.put("stages", stages);
        return roadmap;
    }
}
