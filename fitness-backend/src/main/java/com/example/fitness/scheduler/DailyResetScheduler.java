package com.example.fitness.scheduler;

import com.example.fitness.model.NutritionTracker;
import com.example.fitness.repository.NutritionTrackerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DailyResetScheduler {

    private final NutritionTrackerRepository nutritionTrackerRepository;

    @Autowired
    public DailyResetScheduler(NutritionTrackerRepository nutritionTrackerRepository) {
        this.nutritionTrackerRepository = nutritionTrackerRepository;
    }

    /**
     * Resets the daily nutrition log for all users every day at midnight (00:00).
     * This ensures the dailyConsumed list starts fresh for the new day.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void resetDailyNutritionLogs() {
        List<NutritionTracker> trackers = nutritionTrackerRepository.findAll();
        for (NutritionTracker tracker : trackers) {
            tracker.resetDailyLog();
        }
        nutritionTrackerRepository.saveAll(trackers);
    }
}
