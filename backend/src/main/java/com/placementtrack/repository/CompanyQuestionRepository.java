package com.placementtrack.repository;

import com.placementtrack.model.CompanyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompanyQuestionRepository extends JpaRepository<CompanyQuestion, Long> {
    List<CompanyQuestion> findByCompanyIgnoreCase(String company);
    List<CompanyQuestion> findByCompanyIgnoreCaseAndQuestionType(String company, String questionType);
}