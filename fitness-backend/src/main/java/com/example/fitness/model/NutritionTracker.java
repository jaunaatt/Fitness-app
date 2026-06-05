package com.example.fitness.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nutrition_trackers")
public class NutritionTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "daily_protein_target", nullable = false)
    private double dailyProteinTarget;

    @Column(name = "daily_calorie_target", nullable = false)
    private double dailyCalorieTarget;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @OneToMany(mappedBy = "nutritionTracker", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<FoodItem> dailyConsumed = new ArrayList<>();

    // Constructors
    public NutritionTracker() {}

    public NutritionTracker(double dailyProteinTarget, double dailyCalorieTarget) {
        this.dailyProteinTarget = dailyProteinTarget;
        this.dailyCalorieTarget = dailyCalorieTarget;
    }

    // Methods from class diagram
    public double calculateTotalProtein() {
        if (dailyConsumed == null) return 0.0;
        return dailyConsumed.stream()
                .mapToDouble(FoodItem::getProtein)
                .sum();
    }

    public double calculateTotalCalories() {
        if (dailyConsumed == null) return 0.0;
        return dailyConsumed.stream()
                .mapToDouble(FoodItem::getCalories)
                .sum();
    }

    public boolean isProteinTargetReached() {
        return calculateTotalProtein() >= dailyProteinTarget;
    }

    public void resetDailyLog() {
        if (dailyConsumed != null) {
            dailyConsumed.clear();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getDailyProteinTarget() {
        return dailyProteinTarget;
    }

    public void setDailyProteinTarget(double dailyProteinTarget) {
        this.dailyProteinTarget = dailyProteinTarget;
    }

    public double getDailyCalorieTarget() {
        return dailyCalorieTarget;
    }

    public void setDailyCalorieTarget(double dailyCalorieTarget) {
        this.dailyCalorieTarget = dailyCalorieTarget;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<FoodItem> getDailyConsumed() {
        return dailyConsumed;
    }

    public void setDailyConsumed(List<FoodItem> dailyConsumed) {
        this.dailyConsumed = dailyConsumed;
    }

    // Helper to add food item
    public void addFoodItem(FoodItem food) {
        dailyConsumed.add(food);
        food.setNutritionTracker(this);
    }
}
