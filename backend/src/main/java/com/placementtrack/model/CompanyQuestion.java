package com.placementtrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "company_questions")
public class CompanyQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String company;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(name = "question_type", length = 50)
    private String questionType;

    @Column(name = "year_asked")
    private Integer yearAsked;

    @Column(name = "answer_hint", columnDefinition = "TEXT")
    private String answerHint;

    @Column(length = 20)
    private String difficulty = "Easy";

    public Long getId() { return id; }
    public String getCompany() { return company; }
    public String getQuestionText() { return questionText; }
    public String getQuestionType() { return questionType; }
    public Integer getYearAsked() { return yearAsked; }
    public String getAnswerHint() { return answerHint; }
    public String getDifficulty() { return difficulty; }

    public void setId(Long id) { this.id = id; }
    public void setCompany(String company) { this.company = company; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public void setYearAsked(Integer yearAsked) { this.yearAsked = yearAsked; }
    public void setAnswerHint(String answerHint) { this.answerHint = answerHint; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}