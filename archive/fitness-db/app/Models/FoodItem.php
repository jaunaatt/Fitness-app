<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FoodItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'nutrition_tracker_id',
        'name',
        'calories',
        'protein_gram',
    ];

    protected $casts = [
        'calories' => 'double',
        'protein_gram' => 'double',
    ];

    /**
     * Get the nutrition tracker that recorded this food item.
     */
    public function nutritionTracker(): BelongsTo
    {
        return $this->belongsTo(NutritionTracker::class);
    }
}
