package com.example.fitness.service;

import com.example.fitness.model.FoodItem;
import com.example.fitness.model.NutritionTracker;
import com.example.fitness.model.User;
import com.example.fitness.model.WorkoutSession;
import com.example.fitness.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FitnessServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FitnessService fitnessService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testUser");
        user.setTotalPoints(10);
    }

    @Test
    void testLogFood_createsTrackerIfAbsent() {
        assertNull(user.getNutritionTracker());

        FoodItem food = new FoodItem("Apple", 52.0, 0.3);
        when(userRepository.save(any(User.class))).thenReturn(user);

        User updatedUser = fitnessService.logFood(user, food, LocalDate.now());

        assertNotNull(updatedUser.getNutritionTracker());
        assertEquals(1, updatedUser.getNutritionTracker().getDailyConsumed().size());
        verify(userRepository).save(user);
    }

    @Test
    void testLogFood_incrementsPointsBy5() {
        int initialPoints = user.getTotalPoints();

        FoodItem food = new FoodItem("Banana", 89.0, 1.1);
        when(userRepository.save(any(User.class))).thenReturn(user);

        User updatedUser = fitnessService.logFood(user, food, LocalDate.now());

        assertEquals(initialPoints + 5, updatedUser.getTotalPoints());
    }

    @Test
    void testCheckInWorkout_validSession_incrementsPoints() {
        int initialPoints = user.getTotalPoints();

        WorkoutSession session = new WorkoutSession();
        session.setDurationMinutes(30);
        session.setMuscleGroupFocus("Chest");

        when(userRepository.save(any(User.class))).thenReturn(user);

        User updatedUser = fitnessService.checkInWorkout(user, session, LocalDate.now());

        assertNotNull(updatedUser.getWorkoutTracker());
        assertEquals(initialPoints + 20, updatedUser.getTotalPoints());
        assertEquals(1, updatedUser.getWorkoutTracker().getHistory().size());
    }

    @Test
    void testCheckInWorkout_invalidSession_throwsBadRequest() {
        WorkoutSession session = new WorkoutSession();
        session.setDurationMinutes(0); // Invalid duration

        assertThrows(ResponseStatusException.class, () -> {
            fitnessService.checkInWorkout(user, session, LocalDate.now());
        });

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testResetDailyNutritionLog_clearsDailyConsumed() {
        NutritionTracker tracker = new NutritionTracker();
        tracker.getDailyConsumed().add(new FoodItem("Apple", 52.0, 0.3));
        user.setNutritionTracker(tracker);

        when(userRepository.save(any(User.class))).thenReturn(user);

        User updatedUser = fitnessService.resetDailyNutritionLog(user);

        assertTrue(updatedUser.getNutritionTracker().getDailyConsumed().isEmpty());
    }
}
