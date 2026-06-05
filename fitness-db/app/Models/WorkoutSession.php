<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'workout_tracker_id',
        'muscle_group_focus',
        'is_rest_day',
        'duration_minutes',
    ];

    protected $casts = [
        'is_rest_day' => 'boolean',
        'duration_minutes' => 'integer',
    ];

    /**
     * Get the workout tracker that recorded this workout session.
     */
    public function workoutTracker(): BelongsTo
    {
        return $this->belongsTo(WorkoutTracker::class);
    }
}
