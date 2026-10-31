<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = [
        'name',
        'category',
        'description',
        'price',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];
}   