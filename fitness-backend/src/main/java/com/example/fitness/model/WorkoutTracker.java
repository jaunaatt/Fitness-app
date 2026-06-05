package com.example.fitness.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_trackers")
public class WorkoutTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "weekly_target_days", nullable = false)
    private int weeklyTargetDays;

    @Column(name = "current_weekly_workouts", nullable = false)
    private int currentWeeklyWorkouts;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @OneToMany(mappedBy = "workoutTracker", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<WorkoutSession> history = new ArrayList<>();

    // Constructors
    public WorkoutTracker() {}

    public WorkoutTracker(int weeklyTargetDays) {
        this.weeklyTargetDays = weeklyTargetDays;
        this.currentWeeklyWorkouts = 0;
    }

    // Methods from class diagram
    public void logSession(WorkoutSession session) {
        if (history == null) {
            history = new ArrayList<>();
        }
        history.add(session);
        session.setWorkoutTracker(this);
        
        if (!session.isRestDay() && session.isValidSession()) {
            currentWeeklyWorkouts++;
        }
    }

    public boolean isWeeklyTargetReached() {
        return currentWeeklyWorkouts >= weeklyTargetDays;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getWeeklyTargetDays() {
        return weeklyTargetDays;
    }

    public void setWeeklyTargetDays(int weeklyTargetDays) {
        this.weeklyTargetDays = weeklyTargetDays;
    }

    public int getCurrentWeeklyWorkouts() {
        return currentWeeklyWorkouts;
    }

    public void setCurrentWeeklyWorkouts(int currentWeeklyWorkouts) {
        this.currentWeeklyWorkouts = currentWeeklyWorkouts;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<WorkoutSession> getHistory() {
        return history;
    }

    public void setHistory(List<WorkoutSession> history) {
        this.history = history;
    }
}
