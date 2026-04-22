package com.placementtrack.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "test_cases")
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private CodingQuestion question;

    @Column(name = "input_data", columnDefinition = "TEXT", nullable = false)
    private String inputData;

    @Column(name = "expected_output", columnDefinition = "TEXT", nullable = false)
    private String expectedOutput;

    @Column(name = "is_hidden")
    private Boolean isHidden = false;

    public Long getId() { return id; }
    public CodingQuestion getQuestion() { return question; }
    public String getInputData() { return inputData; }
    public String getExpectedOutput() { return expectedOutput; }
    public Boolean getIsHidden() { return isHidden; }

    public void setId(Long id) { this.id = id; }
    public void setQuestion(CodingQuestion question) { this.question = question; }
    public void setInputData(String inputData) { this.inputData = inputData; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
    public void setIsHidden(Boolean isHidden) { this.isHidden = isHidden; }
}