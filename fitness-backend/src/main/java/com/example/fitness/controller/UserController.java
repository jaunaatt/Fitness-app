package com.example.fitness.controller;

import com.example.fitness.model.FoodItem;
import com.example.fitness.model.User;
import com.example.fitness.model.WorkoutSession;
import com.example.fitness.repository.UserRepository;
import com.example.fitness.service.FitnessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final FitnessService fitnessService;

    @Autowired
    public UserController(UserRepository userRepository, FitnessService fitnessService) {
        this.userRepository = userRepository;
        this.fitnessService = fitnessService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        // Automatically initialize trackers if not present
        if (user.getNutritionTracker() != null) {
            user.getNutritionTracker().setUser(user);
        }
        if (user.getWorkoutTracker() != null) {
            user.getWorkoutTracker().setUser(user);
        }
        return userRepository.save(user);
    }

    @PostMapping("/{id}/log-food")
    public ResponseEntity<User> logFood(@PathVariable Long id, @RequestBody FoodItem food) {
        try {
            User updatedUser = fitnessService.logFood(id, food);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/check-in-workout")
    public ResponseEntity<User> checkInWorkout(@PathVariable Long id, @RequestBody WorkoutSession session) {
        if (!session.isValidSession()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            User updatedUser = fitnessService.checkInWorkout(id, session);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reset-nutrition")
    public ResponseEntity<User> resetNutrition(@PathVariable Long id) {
        try {
            User updatedUser = fitnessService.resetDailyNutritionLog(id);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
