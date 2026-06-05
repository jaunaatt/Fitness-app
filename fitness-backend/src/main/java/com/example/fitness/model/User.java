package com.example.fitness.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "total_points", nullable = false)
    private int totalPoints;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak;

    @Column(name = "last_log_date")
    private LocalDate lastLogDate;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private NutritionTracker nutritionTracker;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private WorkoutTracker workoutTracker;

    // Constructors
    public User() {}

    public User(String username) {
        this.username = username;
        this.totalPoints = 0;
        this.currentStreak = 0;
    }

    // Methods from class diagram
    public void logFood(FoodItem food) {
        if (this.nutritionTracker == null) {
            this.nutritionTracker = new NutritionTracker(150.0, 2000.0);
            this.nutritionTracker.setUser(this);
        }
        this.nutritionTracker.addFoodItem(food);
        updateStreak();
        addPoints(5); // Gain 5 points for logging food items
    }

    public void checkInWorkout(WorkoutSession session) {
        if (this.workoutTracker == null) {
            this.workoutTracker = new WorkoutTracker(4);
            this.workoutTracker.setUser(this);
        }
        if (session.isValidSession()) {
            this.workoutTracker.logSession(session);
            if (!session.isRestDay()) {
                updateStreak();
                addPoints(20); // Gain 20 points for checking in a workout session
            } else {
                addPoints(5); // Gain 5 points for recording a rest day
            }
        }
    }

    public void updateStreak() {
        LocalDate today = LocalDate.now();
        if (lastLogDate == null) {
            currentStreak = 1;
        } else {
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(lastLogDate, today);
            if (daysBetween == 1) {
                currentStreak++;
            } else if (daysBetween > 1) {
                currentStreak = 1;
            }
            // If daysBetween == 0, we don't change the streak (already logged today)
        }
        lastLogDate = today;
    }

    public void addPoints(int points) {
        this.totalPoints += points;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public LocalDate getLastLogDate() {
        return lastLogDate;
    }

    public void setLastLogDate(LocalDate lastLogDate) {
        this.lastLogDate = lastLogDate;
    }

    public NutritionTracker getNutritionTracker() {
        return nutritionTracker;
    }

    public void setNutritionTracker(NutritionTracker nutritionTracker) {
        this.nutritionTracker = nutritionTracker;
        if (nutritionTracker != null && nutritionTracker.getUser() != this) {
            nutritionTracker.setUser(this);
        }
    }

    public WorkoutTracker getWorkoutTracker() {
        return workoutTracker;
    }

    public void setWorkoutTracker(WorkoutTracker workoutTracker) {
        this.workoutTracker = workoutTracker;
        if (workoutTracker != null && workoutTracker.getUser() != this) {
            workoutTracker.setUser(this);
        }
    }
}
