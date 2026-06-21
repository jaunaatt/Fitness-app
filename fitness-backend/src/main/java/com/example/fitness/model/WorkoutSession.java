package com.example.fitness.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Muscle group focus is required")
    @Column(name = "muscle_group_focus", nullable = false)
    private String muscleGroupFocus;

    /**
     * Human-readable exercise name as entered by the user (e.g. "Bench Press — Wide Grip").
     * Stored separately from muscleGroupFocus so the history tab can display the full
     * exercise variation name rather than a generic muscle-group label.
     */
    @Column(name = "variation_name")
    private String variationName;

    /** Number of sets performed. Nullable — not all sessions track sets/reps. */
    @PositiveOrZero(message = "Sets must be zero or positive")
    @Column(name = "sets")
    private Integer sets;

    /** Number of reps per set. Nullable — not all sessions track sets/reps. */
    @PositiveOrZero(message = "Reps must be zero or positive")
    @Column(name = "reps")
    private Integer reps;

    @Column(name = "is_rest_day", nullable = false)
    private boolean isRestDay;

    @PositiveOrZero(message = "Duration must be zero or positive")
    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "session_date")
    private java.time.LocalDate sessionDate;

    @PrePersist
    protected void onCreate() {
        if (sessionDate == null) {
            sessionDate = java.time.LocalDate.now();
        }
    }

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
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMuscleGroupFocus() { return muscleGroupFocus; }
    public void setMuscleGroupFocus(String muscleGroupFocus) { this.muscleGroupFocus = muscleGroupFocus; }

    public String getVariationName() { return variationName; }
    public void setVariationName(String variationName) { this.variationName = variationName; }

    public Integer getSets() { return sets; }
    public void setSets(Integer sets) { this.sets = sets; }

    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }

    public boolean isRestDay() { return isRestDay; }
    public void setRestDay(boolean restDay) { isRestDay = restDay; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public java.time.LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(java.time.LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public WorkoutTracker getWorkoutTracker() { return workoutTracker; }
    public void setWorkoutTracker(WorkoutTracker workoutTracker) { this.workoutTracker = workoutTracker; }
}
