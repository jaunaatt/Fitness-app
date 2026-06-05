package com.example.fitness.controller;

import com.example.fitness.model.WorkoutSession;
import com.example.fitness.repository.WorkoutSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout-sessions")
@CrossOrigin(origins = "*")
public class WorkoutSessionController {

    private final WorkoutSessionRepository workoutSessionRepository;

    @Autowired
    public WorkoutSessionController(WorkoutSessionRepository workoutSessionRepository) {
        this.workoutSessionRepository = workoutSessionRepository;
    }

    @GetMapping
    public List<WorkoutSession> getAllWorkoutSessions() {
        return workoutSessionRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutSession> getWorkoutSessionById(@PathVariable Long id) {
        return workoutSessionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkoutSession(@PathVariable Long id) {
        if (!workoutSessionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        workoutSessionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
