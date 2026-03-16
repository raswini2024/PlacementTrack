package com.placementtrack.repository;

import com.placementtrack.model.HrQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HrQuestionRepository extends JpaRepository<HrQuestion, Long> {
    List<HrQuestion> findByCategory(String category);
}
