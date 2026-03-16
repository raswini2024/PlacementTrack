package com.placementtrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "subtopics")
public class Subtopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty = Difficulty.Easy;

    @JsonIgnore
    @OneToMany(mappedBy = "subtopic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Question> questions;

    public enum Difficulty { Easy, Medium, Hard }

    public Long getId() { return id; }
    public Topic getTopic() { return topic; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Difficulty getDifficulty() { return difficulty; }
    public List<Question> getQuestions() { return questions; }

    public void setId(Long id) { this.id = id; }
    public void setTopic(Topic topic) { this.topic = topic; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
}