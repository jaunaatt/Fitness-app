<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\NutritionTracker;
use App\Models\WorkoutTracker;
use App\Models\FoodItem;
use App\Models\WorkoutSession;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User 1: Alice (Sleek Fitness Streak)
        $alice = User::create([
            'username' => 'AliceFit',
            'total_points' => 150,
            'current_streak' => 5,
            'last_log_date' => '2026-06-04',
        ]);

        $aliceNutrition = NutritionTracker::create([
            'user_id' => $alice->id,
            'daily_protein_target' => 120.0,
            'daily_calorie_target' => 2000.0,
        ]);

        FoodItem::create([
            'nutrition_tracker_id' => $aliceNutrition->id,
            'name' => 'Oatmeal & Berries',
            'calories' => 350.0,
            'protein_gram' => 12.0,
        ]);

        FoodItem::create([
            'nutrition_tracker_id' => $aliceNutrition->id,
            'name' => 'Grilled Chicken Salad',
            'calories' => 450.0,
            'protein_gram' => 40.0,
        ]);

        FoodItem::create([
            'nutrition_tracker_id' => $aliceNutrition->id,
            'name' => 'Whey Protein Shake',
            'calories' => 160.0,
            'protein_gram' => 25.0,
        ]);

        $aliceWorkout = WorkoutTracker::create([
            'user_id' => $alice->id,
            'weekly_target_days' => 4,
            'current_weekly_workouts' => 2,
        ]);

        WorkoutSession::create([
            'workout_tracker_id' => $aliceWorkout->id,
            'muscle_group_focus' => 'Chest & Triceps',
            'is_rest_day' => false,
            'duration_minutes' => 60,
        ]);

        WorkoutSession::create([
            'workout_tracker_id' => $aliceWorkout->id,
            'muscle_group_focus' => 'Legs (Quads Focus)',
            'is_rest_day' => false,
            'duration_minutes' => 50,
        ]);


        // User 2: Bob (Powerlifter)
        $bob = User::create([
            'username' => 'BobLift',
            'total_points' => 220,
            'current_streak' => 8,
            'last_log_date' => '2026-06-05',
        ]);

        $bobNutrition = NutritionTracker::create([
            'user_id' => $bob->id,
            'daily_protein_target' => 160.0,
            'daily_calorie_target' => 2800.0,
        ]);

        FoodItem::create([
            'nutrition_tracker_id' => $bobNutrition->id,
            'name' => 'Scrambled Eggs & Toast',
            'calories' => 400.0,
            'protein_gram' => 24.0,
        ]);

        FoodItem::create([
            'nutrition_tracker_id' => $bobNutrition->id,
            'name' => 'Double Beef Burger & Rice',
            'calories' => 950.0,
            'protein_gram' => 55.0,
        ]);

        $bobWorkout = WorkoutTracker::create([
            'user_id' => $bob->id,
            'weekly_target_days' => 5,
            'current_weekly_workouts' => 3,
        ]);

        WorkoutSession::create([
            'workout_tracker_id' => $bobWorkout->id,
            'muscle_group_focus' => 'Back & Biceps',
            'is_rest_day' => false,
            'duration_minutes' => 70,
        ]);

        WorkoutSession::create([
            'workout_tracker_id' => $bobWorkout->id,
            'muscle_group_focus' => 'Deadlift Day',
            'is_rest_day' => false,
            'duration_minutes' => 90,
        ]);

        WorkoutSession::create([
            'workout_tracker_id' => $bobWorkout->id,
            'muscle_group_focus' => 'Rest Day',
            'is_rest_day' => true,
            'duration_minutes' => 0,
        ]);


        // User 3: Charlie (Beginner)
        $charlie = User::create([
            'username' => 'CharlieActive',
            'total_points' => 30,
            'current_streak' => 1,
            'last_log_date' => '2026-06-05',
        ]);

        $charlieNutrition = NutritionTracker::create([
            'user_id' => $charlie->id,
            'daily_protein_target' => 100.0,
            'daily_calorie_target' => 1800.0,
        ]);

        FoodItem::create([
            'nutrition_tracker_id' => $charlieNutrition->id,
            'name' => 'Avocado Toast',
            'calories' => 300.0,
            'protein_gram' => 8.0,
        ]);

        $charlieWorkout = WorkoutTracker::create([
            'user_id' => $charlie->id,
            'weekly_target_days' => 3,
            'current_weekly_workouts' => 1,
        ]);

        WorkoutSession::create([
            'workout_tracker_id' => $charlieWorkout->id,
            'muscle_group_focus' => 'Full Body Cardio',
            'is_rest_day' => false,
            'duration_minutes' => 30,
        ]);
    }
}
