package com.placementtrack.repository;

import com.placementtrack.model.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    Optional<InterviewSession> findFirstByStatus(InterviewSession.Status status);
    List<InterviewSession> findByInterviewerIdOrIntervieweeId(Long interviewerId, Long intervieweeId);
}