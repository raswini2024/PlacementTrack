package com.placementtrack.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnswerDto {
    private Long questionId;
    private Long subtopicId;
    private String selectedAnswer;
    private boolean correct;
    private String correctAnswer;
    private String explanation;
    private String suggestion;
}
