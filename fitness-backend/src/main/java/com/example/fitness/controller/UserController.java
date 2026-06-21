package com.example.fitness.controller;

import com.example.fitness.model.FoodItem;
import com.example.fitness.model.NutritionTracker;
import com.example.fitness.model.User;
import com.example.fitness.model.WorkoutSession;
import com.example.fitness.model.WorkoutTracker;
import com.example.fitness.model.dto.ChangePasswordRequest;
import com.example.fitness.model.dto.UpdateNutritionTargetRequest;
import com.example.fitness.model.dto.UpdateProfileRequest;
import com.example.fitness.model.dto.UpdateWorkoutTargetRequest;
import com.example.fitness.repository.NutritionTrackerRepository;
import com.example.fitness.repository.UserRepository;
import com.example.fitness.repository.WorkoutTrackerRepository;
import com.example.fitness.service.FitnessService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;
    private final NutritionTrackerRepository nutritionTrackerRepository;
    private final WorkoutTrackerRepository workoutTrackerRepository;

    @Autowired
    public UserController(UserRepository userRepository,
                          FitnessService fitnessService,
                          PasswordEncoder passwordEncoder,
                          NutritionTrackerRepository nutritionTrackerRepository,
                          WorkoutTrackerRepository workoutTrackerRepository) {
        this.userRepository              = userRepository;
        this.fitnessService              = fitnessService;
        this.passwordEncoder             = passwordEncoder;
        this.nutritionTrackerRepository  = nutritionTrackerRepository;
        this.workoutTrackerRepository    = workoutTrackerRepository;
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
        session.setSessionDate(date);
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

    /**
     * Update the authenticated user's physical profile (height, weight, age, gender, activityLevel).
     * Only the provided non-null fields are applied.
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<User> updateProfile(
            @PathVariable Long id,
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User principal) {

        assertOwnership(id, principal);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getHeight()  != null) user.setHeight(request.getHeight());
        if (request.getWeight()  != null) user.setWeight(request.getWeight());
        if (request.getAge()     != null) user.setAge(request.getAge());
        if (request.getGender()  != null) user.setGender(request.getGender());

        // Accept either "activity" or "activityLevel" from the request
        String activity = request.resolvedActivityLevel();
        if (activity != null) user.setActivityLevel(activity);

        if (request.getLeaderboardVisible() != null) user.setLeaderboardVisible(request.getLeaderboardVisible());

        return ResponseEntity.ok(userRepository.save(user));
    }

    /**
     * Override the authenticated user's daily nutrition targets manually.
     * Creates a NutritionTracker if the user doesn't have one yet.
     */
    @PutMapping("/{id}/nutrition-target")
    public ResponseEntity<User> updateNutritionTarget(
            @PathVariable Long id,
            @Valid @RequestBody UpdateNutritionTargetRequest request,
            @AuthenticationPrincipal User principal) {

        assertOwnership(id, principal);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Create tracker if it doesn't exist yet
        if (user.getNutritionTracker() == null) {
            NutritionTracker tracker = new NutritionTracker(
                    request.getDailyProteinTarget() != null ? request.getDailyProteinTarget() : 150.0,
                    request.getDailyCalorieTarget() != null ? request.getDailyCalorieTarget() : 2000.0
            );
            tracker.setUser(user);
            user.setNutritionTracker(tracker);
        } else {
            if (request.getDailyCalorieTarget() != null)
                user.getNutritionTracker().setDailyCalorieTarget(request.getDailyCalorieTarget());
            if (request.getDailyProteinTarget() != null)
                user.getNutritionTracker().setDailyProteinTarget(request.getDailyProteinTarget());
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    /**
     * Set or update the authenticated user's weekly workout target.
     * Creates a WorkoutTracker if the user doesn't have one yet.
     */
    @PutMapping("/{id}/workout-target")
    public ResponseEntity<User> updateWorkoutTarget(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWorkoutTargetRequest request,
            @AuthenticationPrincipal User principal) {

        assertOwnership(id, principal);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getWorkoutTracker() == null) {
            WorkoutTracker tracker = new WorkoutTracker(request.getWeeklyTargetDays());
            tracker.setUser(user);
            user.setWorkoutTracker(tracker);
        } else {
            user.getWorkoutTracker().setWeeklyTargetDays(request.getWeeklyTargetDays());
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    /**
     * Change the authenticated user's password.
     * Validates the current password with PasswordEncoder.matches() before applying the new one.
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User principal) {

        assertOwnership(id, principal);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Permanently delete the authenticated user's account and all related data.
     * CascadeType.ALL on User relations handles cascade deletion automatically.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal User principal) {

        assertOwnership(id, principal);

        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
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

