package com.example.fitness.repository;

import com.example.fitness.model.NutritionTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NutritionTrackerRepository extends JpaRepository<NutritionTracker, Long> {
}
