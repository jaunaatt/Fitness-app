package com.example.fitness.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for updating the user's weekly workout target.
 */
public class UpdateWorkoutTargetRequest {

    @NotNull(message = "Weekly target days is required")
    @Min(value = 1, message = "Weekly target must be at least 1 day")
    @Max(value = 7, message = "Weekly target cannot exceed 7 days")
    private Integer weeklyTargetDays;

    // ── Getters and Setters ───────────────────────────────────────────────────

    public Integer getWeeklyTargetDays() { return weeklyTargetDays; }
    public void setWeeklyTargetDays(Integer weeklyTargetDays) {
        this.weeklyTargetDays = weeklyTargetDays;
    }
}
