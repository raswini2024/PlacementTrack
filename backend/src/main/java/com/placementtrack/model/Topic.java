package com.placementtrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "topics")
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "module_type", nullable = false)
    private ModuleType moduleType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String icon;

    @JsonIgnore
    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Subtopic> subtopics;

    public enum ModuleType { APTITUDE, PROGRAMMING, INTERVIEW }

    public Long getId() { return id; }
    public String getName() { return name; }
    public ModuleType getModuleType() { return moduleType; }
    public String getDescription() { return description; }
    public String getIcon() { return icon; }
    public List<Subtopic> getSubtopics() { return subtopics; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setModuleType(ModuleType moduleType) { this.moduleType = moduleType; }
    public void setDescription(String description) { this.description = description; }
    public void setIcon(String icon) { this.icon = icon; }
    public void setSubtopics(List<Subtopic> subtopics) { this.subtopics = subtopics; }
}