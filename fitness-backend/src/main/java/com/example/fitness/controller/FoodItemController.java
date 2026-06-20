package com.example.fitness.controller;

import com.example.fitness.model.FoodItem;
import com.example.fitness.model.User;
import com.example.fitness.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/food-items")
public class FoodItemController {

    private final FoodItemRepository foodItemRepository;

    @Autowired
    public FoodItemController(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    @GetMapping
    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFoodItemById(@PathVariable Long id) {
        return foodItemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a food item belonging to the authenticated user.
     * Returns 403 if the item belongs to a different user,
     * and 404 if the item does not exist.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodItem(
            @PathVariable Long id,
            @AuthenticationPrincipal User principal) {

        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Food item not found"));

        // Ownership check: ensure this food item belongs to the authenticated user
        if (item.getNutritionTracker() == null ||
                item.getNutritionTracker().getUser() == null ||
                !item.getNutritionTracker().getUser().getId().equals(principal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only delete your own food entries");
        }

        foodItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
