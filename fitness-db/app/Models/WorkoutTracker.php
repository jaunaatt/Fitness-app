<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutTracker extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'weekly_target_days',
        'current_weekly_workouts',
    ];

    protected $casts = [
        'weekly_target_days' => 'integer',
        'current_weekly_workouts' => 'integer',
    ];

    /**
     * Get the user that owns the workout tracker.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the workout sessions history for this tracker.
     */
    public function workoutSessions(): HasMany
    {
        return $this->hasMany(WorkoutSession::class);
    }
}
