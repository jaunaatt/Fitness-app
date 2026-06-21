package com.example.fitness.model.dto;

/**
 * Request payload for updating a user's physical profile.
 * All fields are optional — only non-null values are applied.
 * Frontend sends: { height, weight, age, gender, activity (mapped to activityLevel) }
 */
public class UpdateProfileRequest {

    /** Height in centimetres. */
    private Double height;

    /** Weight in kilograms. */
    private Double weight;

    /** Age in years. */
    private Integer age;

    /** "male" or "female". */
    private String gender;

    /**
     * Activity level: "sedentary", "light", "active", "very_active".
     * Frontend sends this as "activity" so we accept both field names.
     */
    private String activityLevel;

    /** Alias accepted from frontend (maps to activityLevel). */
    private String activity;

    private Boolean leaderboardVisible;

    // ── Getters and Setters ───────────────────────────────────────────────────

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }

    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }

    public Boolean getLeaderboardVisible() { return leaderboardVisible; }
    public void setLeaderboardVisible(Boolean leaderboardVisible) { this.leaderboardVisible = leaderboardVisible; }

    /**
     * Returns the effective activity level, accepting either "activity" or "activityLevel".
     * Frontend sends "activity", backend stores "activityLevel".
     */
    public String resolvedActivityLevel() {
        if (activityLevel != null && !activityLevel.isBlank()) return activityLevel;
        if (activity != null && !activity.isBlank()) return activity;
        return null;
    }
}
