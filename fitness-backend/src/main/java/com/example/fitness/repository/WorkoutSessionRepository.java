package com.example.fitness.repository;

import com.example.fitness.model.User;
import com.example.fitness.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    /** Find all workout sessions belonging to a specific user (via workoutTracker → user). */
    List<WorkoutSession> findByWorkoutTracker_User(User user);
}
