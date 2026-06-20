package com.example.fitness.controller;

import com.example.fitness.model.FoodItem;
import com.example.fitness.model.User;
import com.example.fitness.model.WorkoutSession;
import com.example.fitness.repository.UserRepository;
import com.example.fitness.service.FitnessService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

/**
 * User-related endpoints.
 *
 * Ownership rule: mutating actions (log-food, check-in-workout, reset-nutrition)
 * always target the AUTHENTICATED user — the {id} in the URL is verified to match.
 * This prevents a logged-in user from modifying another user's data by guessing an ID.
 *
 * Read-only lookups (GET /users, GET /users/{id}) remain available to authenticated
 * users so the leaderboard and profile views can resolve user info.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final FitnessService fitnessService;

    @Autowired
    public UserController(UserRepository userRepository, FitnessService fitnessService) {
        this.userRepository = userRepository;
        this.fitnessService = fitnessService;
    }

    // ── Read endpoints (authenticated, not owner-restricted) ──────────────────

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

    // ── Mutating endpoints (authenticated + owner-only) ───────────────────────

    /**
     * Log a food item for the authenticated user.
     *
     * @param id         must match the authenticated user's ID
     * @param food       the food item (validated by @Valid)
     * @param clientDate optional client local date for streak (defaults to server date if absent)
     * @param principal  the authenticated user injected by Spring Security
     */
    @PostMapping("/{id}/log-food")
    public ResponseEntity<User> logFood(
            @PathVariable Long id,
            @Valid @RequestBody FoodItem food,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate clientDate,
            @AuthenticationPrincipal User principal) {

        assertOwnership(id, principal);
        LocalDate date = clientDate != null ? clientDate : LocalDate.now();
        User updated = fitnessService.logFood(principal, food, date);
        return ResponseEntity.ok(updated);
    }

    /**
     * Check in a workout session for the authenticated user.
     */
    @PostMapping("/{id}/check-in-workout")
    public ResponseEntity<User> checkInWorkout(
            @PathVariable Long id,
            @Valid @RequestBody WorkoutSession session,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate clientDate,
            @AuthenticationPrincipal User principal) {

        assertOwnership(id, principal);
        LocalDate date = clientDate != null ? clientDate : LocalDate.now();
        User updated = fitnessService.checkInWorkout(principal, session, date);
        return ResponseEntity.ok(updated);
    }

    /**
     * Reset the authenticated user's daily nutrition log.
     */
    @PostMapping("/{id}/reset-nutrition")
    public ResponseEntity<User> resetNutrition(
            @PathVariable Long id,
            @AuthenticationPrincipal User principal) {

        assertOwnership(id, principal);
        User updated = fitnessService.resetDailyNutritionLog(principal);
        return ResponseEntity.ok(updated);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Verifies the requested user ID matches the authenticated principal.
     * Throws 403 Forbidden if they don't match, preventing horizontal privilege escalation.
     */
    private void assertOwnership(Long requestedId, User principal) {
        if (!principal.getId().equals(requestedId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only modify your own data");
        }
    }
}
