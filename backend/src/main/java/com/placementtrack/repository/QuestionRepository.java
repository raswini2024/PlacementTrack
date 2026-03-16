package com.placementtrack.repository;

import com.placementtrack.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findBySubtopicId(Long subtopicId);
    List<Question> findBySubtopicIdIn(List<Long> subtopicIds);
    long countBySubtopicId(Long subtopicId);
}
