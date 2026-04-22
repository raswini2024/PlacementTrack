package com.placementtrack.repository;

import com.placementtrack.model.PaperQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaperQuestionRepository extends JpaRepository<PaperQuestion, Long> {
    List<PaperQuestion> findByPaperId(Long paperId);
}