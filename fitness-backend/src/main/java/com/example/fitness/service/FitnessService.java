package com.example.fitness.service;

import com.example.fitness.model.FoodItem;
import com.example.fitness.model.User;
import com.example.fitness.model.WorkoutSession;
import com.example.fitness.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     */
    public User logFood(Long userId, FoodItem food) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        user.logFood(food);
        return userRepository.save(user);
    }

    /**
     * Check in a workout session for the user, updating weekly workouts, streak, and points.
     */
    public User checkInWorkout(Long userId, WorkoutSession session) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        user.checkInWorkout(session);
        return userRepository.save(user);
    }

    /**
     * Reset the user's daily nutrition consumption history.
     */
    public User resetDailyNutritionLog(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        if (user.getNutritionTracker() != null) {
            user.getNutritionTracker().resetDailyLog();
            return userRepository.save(user);
        }
        return user;
    }
}
