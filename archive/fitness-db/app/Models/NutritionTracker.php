<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NutritionTracker extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'daily_protein_target',
        'daily_calorie_target',
    ];

    protected $casts = [
        'daily_protein_target' => 'double',
        'daily_calorie_target' => 'double',
    ];

    /**
     * Get the user that owns the nutrition tracker.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the food items consumed for this nutrition tracker.
     */
    public function foodItems(): HasMany
    {
        return $this->hasMany(FoodItem::class);
    }
}
