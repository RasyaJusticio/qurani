<?php

namespace App\Models\Qurani;

use Illuminate\Database\Eloquent\Model;

class ChapterInfo extends Model
{
    protected $table = "chapter_infos";
    public $timestamps = false;
    protected $connection = 'qurani';
    protected $casts = [
        'en_us' => 'array',
        'id_id' => 'array'
    ];
}
