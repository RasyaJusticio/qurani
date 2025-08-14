<?php

namespace App\Models\Qurani;

use Illuminate\Database\Eloquent\Model;

class VersesIndopak extends Model
{
    protected $connection = 'qurani';

    protected $casts = [
        'translations' => 'array'
    ];
    protected $table = 'verses_indopak';
    public $timestamps = false;
}
