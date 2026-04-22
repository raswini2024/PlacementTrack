package com.placementtrack.repository; // Correct package name

import com.placementtrack.model.Student; // Student model-ah import pannu
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    Boolean existsByEmail(String email);
}