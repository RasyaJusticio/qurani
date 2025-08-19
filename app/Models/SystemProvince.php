<?php

namespace App\Models;

use App\Models\LinkID\Kota;
use Illuminate\Database\Eloquent\Model;

class SystemProvince extends Model
{
    protected $connection = 'linkid';
    protected $table = 'system_provinces';
    /**
     * Get all of the comments for the SystemProvince
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */

    public function cities()
    {
        return $this->hasMany(Kota::class, 'city_id', 'province_id');
    }
}
