package com.placementtrack.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "preferred_language", length = 50)
    private String preferredLanguage;

    @Column(name = "dream_company", length = 100)
    private String dreamCompany;

    @Column(name = "dream_role", length = 100)
    private String dreamRole;

    @Column(name = "skill_level", length = 50)
    private String skillLevel;

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public String getDreamCompany() { return dreamCompany; }
    public String getDreamRole() { return dreamRole; }
    public String getSkillLevel() { return skillLevel; }

    public void setId(Long id) { this.id = id; }
    public void setStudent(Student student) { this.student = student; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public void setDreamCompany(String dreamCompany) { this.dreamCompany = dreamCompany; }
    public void setDreamRole(String dreamRole) { this.dreamRole = dreamRole; }
    public void setSkillLevel(String skillLevel) { this.skillLevel = skillLevel; }
}