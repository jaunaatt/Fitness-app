package com.example.fitness.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "muscle_group_focus", nullable = false)
    private String muscleGroupFocus;

    @Column(name = "is_rest_day", nullable = false)
    private boolean isRestDay;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_tracker_id")
    @JsonBackReference
    private WorkoutTracker workoutTracker;

    // Constructors
    public WorkoutSession() {}

    public WorkoutSession(String muscleGroupFocus, boolean isRestDay, int durationMinutes) {
        this.muscleGroupFocus = muscleGroupFocus;
        this.isRestDay = isRestDay;
        this.durationMinutes = durationMinutes;
    }

    // Methods from class diagram
    public boolean isValidSession() {
        if (isRestDay) {
            return true; // Rest days are valid sessions even with 0 duration
        }
        return durationMinutes > 0 && muscleGroupFocus != null && !muscleGroupFocus.trim().isEmpty();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMuscleGroupFocus() {
        return muscleGroupFocus;
    }

    public void setMuscleGroupFocus(String muscleGroupFocus) {
        this.muscleGroupFocus = muscleGroupFocus;
    }

    public boolean isRestDay() {
        return isRestDay;
    }

    public void setRestDay(boolean restDay) {
        isRestDay = restDay;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public WorkoutTracker getWorkoutTracker() {
        return workoutTracker;
    }

    public void setWorkoutTracker(WorkoutTracker workoutTracker) {
        this.workoutTracker = workoutTracker;
    }
}
