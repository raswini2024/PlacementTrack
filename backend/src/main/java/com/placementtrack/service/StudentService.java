package com.placementtrack.service;

import com.placementtrack.dto.ProfileDto;
import com.placementtrack.dto.ProgressDto;
import com.placementtrack.model.Student;
import com.placementtrack.model.StudentProfile;
import com.placementtrack.model.StudentProgress;
import com.placementtrack.repository.StudentProfileRepository;
import com.placementtrack.repository.StudentProgressRepository;
import com.placementtrack.repository.StudentRepository;
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

    @Transactional
    public StudentProfile saveProfile(Long studentId, ProfileDto dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

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

    private double calculateModuleProgress(List<StudentProgress> progressList, String module) {
        List<StudentProgress> filtered = progressList.stream()
            .filter(p -> p.getSubtopic().getTopic().getModuleType().name().equals(module))
            .toList();

        if (filtered.isEmpty()) return 0.0;

        return filtered.stream()
            .mapToDouble(p -> p.getAccuracyPercentage().doubleValue())
            .average()
            .orElse(0.0);
    }

    private String generateSuggestion(double overall) {
        if (overall >= 100) return "You are ready to attend your dream company interview! 🎉";
        if (overall >= 80) return "Excellent progress! You're almost ready. Keep pushing!";
        if (overall >= 60) return "Great work! Focus on weak areas to boost your score.";
        if (overall >= 40) return "Good start! Practice more questions daily to improve.";
        return "Keep going! Consistency is key. Practice at least 10 questions daily.";
    }

    public Map<Long, String> getSubtopicSuggestions(Long studentId) {
        List<StudentProgress> progressList = progressRepository.findByStudentId(studentId);
        Map<Long, String> suggestions = new HashMap<>();

        for (StudentProgress p : progressList) {
            double acc = p.getAccuracyPercentage().doubleValue();
            String msg;
            if (acc >= 75) {
                msg = "You are doing great in this topic. Move to the next level.";
            } else if (acc >= 50) {
                msg = "Good progress! A bit more practice will make you proficient.";
            } else {
                msg = "You should practice more questions in this topic.";
            }
            suggestions.put(p.getSubtopic().getId(), msg);
        }

        return suggestions;
    }
}
