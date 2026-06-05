package com.example.fitness.repository;

import com.example.fitness.model.WorkoutTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkoutTrackerRepository extends JpaRepository<WorkoutTracker, Long> {
}
