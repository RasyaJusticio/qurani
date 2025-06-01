<?php

namespace App\Models\Qurani;

use Illuminate\Database\Eloquent\Model;

class Verses extends Model
{
    protected $connection = 'qurani';

    protected $casts = [
        'translations' => 'array'
    ];

    public $timestamps = false;
}
