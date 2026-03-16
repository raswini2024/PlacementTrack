package com.placementtrack.repository;

import com.placementtrack.model.StudentProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProgressRepository extends JpaRepository<StudentProgress, Long> {
    List<StudentProgress> findByStudentId(Long studentId);
    Optional<StudentProgress> findByStudentIdAndSubtopicId(Long studentId, Long subtopicId);

    @Query("SELECT AVG(sp.accuracyPercentage) FROM StudentProgress sp WHERE sp.student.id = :studentId")
    Double getAverageAccuracyByStudentId(Long studentId);

    @Query("SELECT AVG(sp.accuracyPercentage) FROM StudentProgress sp " +
           "WHERE sp.student.id = :studentId AND sp.subtopic.topic.moduleType = :moduleType")
    Double getAccuracyByStudentAndModule(Long studentId, String moduleType);
}
