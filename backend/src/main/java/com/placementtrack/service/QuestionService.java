package com.placementtrack.service;

import com.placementtrack.dto.AnswerDto;
import com.placementtrack.model.*;
import com.placementtrack.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class QuestionService {

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private SubtopicRepository subtopicRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private StudentProgressRepository progressRepository;

    @Autowired
    private StudentRepository studentRepository;

    public List<Topic> getTopicsByModule(String moduleType) {
        return topicRepository.findByModuleType(Topic.ModuleType.valueOf(moduleType));
    }

    public List<Subtopic> getSubtopicsByTopic(Long topicId) {
        return subtopicRepository.findByTopicId(topicId);
    }

    public List<Question> getQuestionsBySubtopic(Long subtopicId) {
        return questionRepository.findBySubtopicId(subtopicId);
    }

    @Transactional
    public AnswerDto submitAnswer(Long studentId, Long questionId, String selectedAnswer) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        boolean isCorrect = question.getCorrectAnswer().equalsIgnoreCase(selectedAnswer);

        // Update progress
        Long subtopicId = question.getSubtopic().getId();
        StudentProgress progress = progressRepository
                .findByStudentIdAndSubtopicId(studentId, subtopicId)
                .orElseGet(() -> {
                    StudentProgress newP = new StudentProgress();
                    newP.setStudent(studentRepository.findById(studentId).orElseThrow());
                    newP.setSubtopic(question.getSubtopic());
                    return newP;
                });

        progress.setTotalAttempts(progress.getTotalAttempts() + 1);
        if (isCorrect) {
            progress.setCorrectAnswers(progress.getCorrectAnswers() + 1);
        }

        double accuracy = (double) progress.getCorrectAnswers() / progress.getTotalAttempts() * 100;
        progress.setAccuracyPercentage(BigDecimal.valueOf(accuracy).setScale(2, RoundingMode.HALF_UP));
        progress.setLastAttempted(LocalDateTime.now());
        progressRepository.save(progress);

        // Generate suggestion
        String suggestion;
        if (accuracy >= 75) {
            suggestion = "You are doing great in this topic. Move to the next level.";
        } else {
            suggestion = "You should practice more questions in this topic.";
        }

        return new AnswerDto(questionId, subtopicId, selectedAnswer, isCorrect,
                             question.getCorrectAnswer(), question.getExplanation(), suggestion);
    }

    public Map<String, Object> getSubtopicProgress(Long studentId, Long subtopicId) {
        Map<String, Object> result = new HashMap<>();
        progressRepository.findByStudentIdAndSubtopicId(studentId, subtopicId)
            .ifPresent(p -> {
                result.put("totalAttempts", p.getTotalAttempts());
                result.put("correctAnswers", p.getCorrectAnswers());
                result.put("accuracy", p.getAccuracyPercentage());
                double acc = p.getAccuracyPercentage().doubleValue();
                if (acc >= 75) {
                    result.put("suggestion", "You are doing great in this topic. Move to the next level.");
                } else {
                    result.put("suggestion", "You should practice more questions in this topic.");
                }
            });
        return result;
    }
}
