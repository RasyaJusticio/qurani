<?php

namespace App\Models\LinkID;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $connection = 'linkid';
    protected $table = 'system_cities';
    protected $primaryKey = 'city_id';
}
