package com.example.fitness.model.dto;

import jakarta.validation.constraints.Positive;

/**
 * Request payload for manually overriding daily nutrition targets.
 * User can choose to use manual values instead of the Mifflin-St Jeor calculation.
 */
public class UpdateNutritionTargetRequest {

    @Positive(message = "Calorie target must be positive")
    private Double dailyCalorieTarget;

    @Positive(message = "Protein target must be positive")
    private Double dailyProteinTarget;

    // ── Getters and Setters ───────────────────────────────────────────────────

    public Double getDailyCalorieTarget() { return dailyCalorieTarget; }
    public void setDailyCalorieTarget(Double dailyCalorieTarget) {
        this.dailyCalorieTarget = dailyCalorieTarget;
    }

    public Double getDailyProteinTarget() { return dailyProteinTarget; }
    public void setDailyProteinTarget(Double dailyProteinTarget) {
        this.dailyProteinTarget = dailyProteinTarget;
    }
}
