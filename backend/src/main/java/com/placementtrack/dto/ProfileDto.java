package com.placementtrack.dto;

import com.placementtrack.model.StudentProfile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProfileDto {
    @NotNull
    private StudentProfile.ProgrammingLanguage preferredLanguage;

    @NotBlank
    private String dreamCompany;

    @NotBlank
    private String dreamRole;

    @NotNull
    private StudentProfile.SkillLevel skillLevel;
}
