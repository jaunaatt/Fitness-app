package com.example.fitness.controller;

import com.example.fitness.model.User;
import com.example.fitness.model.WorkoutSession;
import com.example.fitness.repository.WorkoutSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {

    private final WorkoutSessionRepository workoutSessionRepository;

    @Autowired
    public WorkoutSessionController(WorkoutSessionRepository workoutSessionRepository) {
        this.workoutSessionRepository = workoutSessionRepository;
    }

    /**
     * Returns only the authenticated user's workout sessions.
     * This is scoped to the current user — not all sessions in the database.
     */
    @GetMapping
    public List<WorkoutSession> getMyWorkoutSessions(@AuthenticationPrincipal User principal) {
        return workoutSessionRepository.findByWorkoutTracker_User(principal);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutSession> getWorkoutSessionById(@PathVariable Long id) {
        return workoutSessionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutSession(
            @PathVariable Long id,
            @AuthenticationPrincipal User principal) {

        WorkoutSession session = workoutSessionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Workout session not found"));

        // Ownership check
        if (session.getWorkoutTracker() == null ||
                session.getWorkoutTracker().getUser() == null ||
                !session.getWorkoutTracker().getUser().getId().equals(principal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only delete your own workout sessions");
        }

        workoutSessionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
