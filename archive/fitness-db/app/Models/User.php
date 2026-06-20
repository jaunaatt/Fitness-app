<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'total_points',
        'current_streak',
        'last_log_date',
    ];

    protected $casts = [
        'last_log_date' => 'date',
        'total_points' => 'integer',
        'current_streak' => 'integer',
    ];

    /**
     * Get the nutrition tracker associated with the user.
     */
    public function nutritionTracker(): HasOne
    {
        return $this->hasOne(NutritionTracker::class);
    }

    /**
     * Get the workout tracker associated with the user.
     */
    public function workoutTracker(): HasOne
    {
        return $this->hasOne(WorkoutTracker::class);
    }
}
