package com.placementtrack.repository;

import com.placementtrack.model.CodingQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CodingQuestionRepository extends JpaRepository<CodingQuestion, Long> {
    List<CodingQuestion> findByDifficulty(CodingQuestion.Difficulty difficulty);
    List<CodingQuestion> findByCompany(String company);
}