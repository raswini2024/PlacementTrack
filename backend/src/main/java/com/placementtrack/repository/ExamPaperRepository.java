package com.placementtrack.repository;

import com.placementtrack.model.ExamPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamPaperRepository extends JpaRepository<ExamPaper, Long> {
    List<ExamPaper> findByCompanyIgnoreCase(String company);
}