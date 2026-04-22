package com.placementtrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "exam_papers")
public class ExamPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String company;

    @Column(nullable = false, length = 200)
    private String title;

    @Column
    private Integer year;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_mins")
    private Integer durationMins = 60;

    @Column(name = "total_questions")
    private Integer totalQuestions = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "paper", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PaperQuestion> questions;

    public Long getId() { return id; }
    public String getCompany() { return company; }
    public String getTitle() { return title; }
    public Integer getYear() { return year; }
    public String getDescription() { return description; }
    public Integer getDurationMins() { return durationMins; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<PaperQuestion> getQuestions() { return questions; }

    public void setId(Long id) { this.id = id; }
    public void setCompany(String company) { this.company = company; }
    public void setTitle(String title) { this.title = title; }
    public void setYear(Integer year) { this.year = year; }
    public void setDescription(String description) { this.description = description; }
    public void setDurationMins(Integer durationMins) { this.durationMins = durationMins; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setQuestions(List<PaperQuestion> questions) { this.questions = questions; }
}