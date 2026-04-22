package com.placementtrack.service;

import com.placementtrack.dto.ProfileDto;
import com.placementtrack.dto.ProgressDto;
import com.placementtrack.model.Student;
import com.placementtrack.model.StudentProfile;
import com.placementtrack.model.StudentProgress;
import com.placementtrack.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private StudentProgressRepository progressRepository;

    @Autowired
    private SubtopicRepository subtopicRepository;

    @Transactional
    public StudentProfile saveProfile(Long studentId, ProfileDto dto) {
        System.out.println("=== saveProfile called ===");
        System.out.println("studentId received: " + studentId);

        if (studentId == null) {
            throw new RuntimeException("Student ID is null! JWT token issue.");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        System.out.println("Student found: " + student.getName() + " id: " + student.getId());

        StudentProfile profile = profileRepository.findByStudentId(studentId)
                .orElse(new StudentProfile());

        profile.setStudent(student);
        profile.setPreferredLanguage(dto.getPreferredLanguage());
        profile.setDreamCompany(dto.getDreamCompany());
        profile.setDreamRole(dto.getDreamRole());
        profile.setSkillLevel(dto.getSkillLevel());

        profile = profileRepository.save(profile);

        student.setProfileCompleted(true);
        studentRepository.save(student);

        System.out.println("Profile saved successfully!");
        return profile;
    }

    public StudentProfile getProfile(Long studentId) {
        return profileRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    public Student getStudent(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public ProgressDto getProgress(Long studentId) {
        List<StudentProgress> allProgress = progressRepository.findByStudentId(studentId);

        double aptitude = calculateModuleProgress(allProgress, "APTITUDE");
        double programming = calculateModuleProgress(allProgress, "PROGRAMMING");
        double interview = calculateModuleProgress(allProgress, "INTERVIEW");
        double overall = (aptitude + programming + interview) / 3.0;

        String suggestion = generateSuggestion(overall);
        boolean ready = overall >= 100.0;

        return new ProgressDto(
                Math.min(aptitude, 100),
                Math.min(programming, 100),
                Math.min(interview, 100),
                Math.min(overall, 100),
                suggestion,
                ready
        );
    }

    private double calculateModuleProgress(
            List<StudentProgress> progressList, String module) {

        long totalSubtopics = subtopicRepository.findAll().stream()
                .filter(s -> s.getTopic().getModuleType().name().equals(module))
                .count();

        if (totalSubtopics == 0) return 0.0;

        List<StudentProgress> filtered = progressList.stream()
                .filter(p -> p.getSubtopic().getTopic()
                        .getModuleType().name().equals(module))
                .toList();

        if (filtered.isEmpty()) return 0.0;

        double totalAccuracy = filtered.stream()
                .mapToDouble(p -> p.getAccuracyPercentage().doubleValue())
                .sum();

        return (totalAccuracy / (totalSubtopics * 100.0)) * 100.0;
    }

    private String generateSuggestion(double overall) {
        if (overall >= 100) return "You are ready! 🎉";
        if (overall >= 80) return "Excellent! Almost ready. Keep pushing!";
        if (overall >= 60) return "Great work! Focus on weak areas.";
        if (overall >= 40) return "Good start! Practice more daily.";
        return "Keep going! Practice at least 10 questions daily.";
    }

    public Map<Long, String> getSubtopicSuggestions(Long studentId) {
        List<StudentProgress> progressList =
                progressRepository.findByStudentId(studentId);
        Map<Long, String> suggestions = new HashMap<>();

        for (StudentProgress p : progressList) {
            double acc = p.getAccuracyPercentage().doubleValue();
            String msg;
            if (acc >= 75) {
                msg = "Excellent! Move to next topic. 🚀";
            } else if (acc >= 50) {
                msg = "Good! A bit more practice needed.";
            } else {
                msg = "Practice more questions in this topic.";
            }
            suggestions.put(p.getSubtopic().getId(), msg);
        }
        return suggestions;
    }
}