package com.placementtrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id", nullable = false)
    private Student interviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewee_id")
    private Student interviewee;

    @Column(name = "room_id", nullable = false, length = 100)
    private String roomId;

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    private Status status = Status.WAITING;

    @Column(name = "interviewer_score")
    private Integer interviewerScore;

    @Column(name = "interviewee_score")
    private Integer intervieweeScore;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status { WAITING, ACTIVE, COMPLETED }

    public Long getId() { return id; }
    public Student getInterviewer() { return interviewer; }
    public Student getInterviewee() { return interviewee; }
    public String getRoomId() { return roomId; }
    public String getQuestionText() { return questionText; }
    public Status getStatus() { return status; }
    public Integer getInterviewerScore() { return interviewerScore; }
    public Integer getIntervieweeScore() { return intervieweeScore; }
    public String getFeedback() { return feedback; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setInterviewer(Student interviewer) { this.interviewer = interviewer; }
    public void setInterviewee(Student interviewee) { this.interviewee = interviewee; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public void setStatus(Status status) { this.status = status; }
    public void setInterviewerScore(Integer interviewerScore) { this.interviewerScore = interviewerScore; }
    public void setIntervieweeScore(Integer intervieweeScore) { this.intervieweeScore = intervieweeScore; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}