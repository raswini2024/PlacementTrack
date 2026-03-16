package com.placementtrack.repository;

import com.placementtrack.model.Topic;
import com.placementtrack.model.Topic.ModuleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    @Query("SELECT DISTINCT t FROM Topic t WHERE t.moduleType = :moduleType")
    List<Topic> findByModuleType(ModuleType moduleType);
}