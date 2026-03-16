package com.placementtrack.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_language", nullable = false)
    private ProgrammingLanguage preferredLanguage;

    @Column(name = "dream_company", nullable = false, length = 100)
    private String dreamCompany;

    @Column(name = "dream_role", nullable = false, length = 100)
    private String dreamRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", nullable = false)
    private SkillLevel skillLevel;

    public enum ProgrammingLanguage {
        Java, Python, Cpp
    }

    public enum SkillLevel {
        Beginner, Intermediate, Advanced
    }
}
