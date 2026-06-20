package com.example.fitness.service;

import com.example.fitness.model.FoodItem;
import com.example.fitness.model.User;
import com.example.fitness.model.WorkoutSession;
import com.example.fitness.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
@Transactional
public class FitnessService {

    private final UserRepository userRepository;

    @Autowired
    public FitnessService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Log a food item consumed by the user, updating calories, proteins, streak, and points.
     *
     * @param user       the authenticated user (derived from SecurityContextHolder)
     * @param food       the food item to log
     * @param clientDate the user's local date for streak calculation (see User.updateStreak)
     */
    public User logFood(User user, FoodItem food, LocalDate clientDate) {
        if (user.getNutritionTracker() == null) {
            // logFood on the User entity initialises the tracker if needed
        }
        // Temporarily override the date by calling the user's logFood which internally
        // calls updateStreak — but we need clientDate awareness, so we replicate the logic:
        if (user.getNutritionTracker() == null) {
            com.example.fitness.model.NutritionTracker tracker =
                    new com.example.fitness.model.NutritionTracker(150.0, 2000.0);
            tracker.setUser(user);
            user.setNutritionTracker(tracker);
        }
        user.getNutritionTracker().addFoodItem(food);
        user.updateStreak(clientDate);
        user.addPoints(5);
        return userRepository.save(user);
    }

    /**
     * Check in a workout session for the user, updating weekly workouts, streak, and points.
     *
     * @param user       the authenticated user
     * @param session    the workout session to record
     * @param clientDate the user's local date for streak calculation
     */
    public User checkInWorkout(User user, WorkoutSession session, LocalDate clientDate) {
        if (!session.isValidSession()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid session: non-rest sessions require a positive duration and muscle group");
        }
        if (user.getWorkoutTracker() == null) {
            com.example.fitness.model.WorkoutTracker tracker =
                    new com.example.fitness.model.WorkoutTracker(4);
            tracker.setUser(user);
            user.setWorkoutTracker(tracker);
        }
        user.getWorkoutTracker().logSession(session);
        if (!session.isRestDay()) {
            user.updateStreak(clientDate);
            user.addPoints(20);
        } else {
            user.addPoints(5);
        }
        return userRepository.save(user);
    }

    /**
     * Reset the user's daily nutrition consumption history.
     */
    public User resetDailyNutritionLog(User user) {
        if (user.getNutritionTracker() != null) {
            user.getNutritionTracker().resetDailyLog();
            return userRepository.save(user);
        }
        return user;
    }
}
