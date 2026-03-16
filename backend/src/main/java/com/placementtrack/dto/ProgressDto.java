package com.placementtrack.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgressDto {
    private double aptitudeProgress;
    private double programmingProgress;
    private double interviewProgress;
    private double overallProgress;
    private String suggestion;
    private boolean isReadyForInterview;
}
