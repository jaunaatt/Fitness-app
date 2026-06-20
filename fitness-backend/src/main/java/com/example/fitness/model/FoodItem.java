package com.example.fitness.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
@Table(name = "food_items")
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Food name is required")
    @Column(nullable = false)
    private String name;

    @PositiveOrZero(message = "Calories must be zero or positive")
    @Column(nullable = false)
    private double calories;

    @PositiveOrZero(message = "Protein must be zero or positive")
    @Column(name = "protein_gram", nullable = false)
    private double proteinGram;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nutrition_tracker_id")
    @JsonBackReference
    private NutritionTracker nutritionTracker;

    // Constructors
    public FoodItem() {}

    public FoodItem(String name, double calories, double proteinGram) {
        this.name = name;
        this.calories = calories;
        this.proteinGram = proteinGram;
    }

    // Methods from class diagram
    public double getProtein() {
        return this.proteinGram;
    }

    public double getCalories() {
        return this.calories;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getProteinGram() { return proteinGram; }
    public void setProteinGram(double proteinGram) { this.proteinGram = proteinGram; }

    public void setCalories(double calories) { this.calories = calories; }

    public NutritionTracker getNutritionTracker() { return nutritionTracker; }
    public void setNutritionTracker(NutritionTracker nutritionTracker) {
        this.nutritionTracker = nutritionTracker;
    }
}
