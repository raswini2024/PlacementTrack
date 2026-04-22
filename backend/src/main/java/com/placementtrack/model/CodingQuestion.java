package com.placementtrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "coding_questions")
public class CodingQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty = Difficulty.Easy;

    @Column(length = 100)
    private String company;

    @Column(length = 100)
    private String topic;

    @Column(name = "input_format", columnDefinition = "TEXT")
    private String inputFormat;

    @Column(name = "output_format", columnDefinition = "TEXT")
    private String outputFormat;

    @Column(name = "constraints_text", columnDefinition = "TEXT")
    private String constraintsText;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestCase> testCases;

    public enum Difficulty { Easy, Medium, Hard }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Difficulty getDifficulty() { return difficulty; }
    public String getCompany() { return company; }
    public String getTopic() { return topic; }
    public String getInputFormat() { return inputFormat; }
    public String getOutputFormat() { return outputFormat; }
    public String getConstraintsText() { return constraintsText; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<TestCase> getTestCases() { return testCases; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public void setCompany(String company) { this.company = company; }
    public void setTopic(String topic) { this.topic = topic; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }
    public void setConstraintsText(String constraintsText) { this.constraintsText = constraintsText; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }
}