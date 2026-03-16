package com.placementtrack.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "company_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String company;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type")
    private QuestionType questionType;

    @Column(name = "year_asked")
    private Integer yearAsked;

    @Column(name = "answer_hint", columnDefinition = "TEXT")
    private String answerHint;

    public enum QuestionType {
        Technical, HR, Aptitude, Programming
    }
}
