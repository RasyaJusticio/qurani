<?php

namespace App\Models\LinkID;

use App\Models\SystemProvince;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use PHPUnit\Event\Telemetry\System;

class QuSetoranRekap extends Model
{
    protected $connection = 'linkid';

    protected $table = 'qu_setoran_rekap';

    public $timestamps = false;

    protected $fillable = [
        'periode',
        'negara',
        'provinsi',
        'kota',
        'lat',
        'long',
        't1',
        't2',
        't3',
        't4',
        't5',
        't6',
        't7',
        't8',
        't9',
        't10',
        't11',
        't12',
        't13',
        't14',
        't15',
        't16',
        't17',
        't18',
        't19',
        't20',
        't21',
        't22',
        't23',
        't24',
        't25',
        't26',
        't27',
        't28',
        't29',
        't30',
        't31'
    ];

    /**
     * Get the province that owns the QuSetoranRekap
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function provinsi(): BelongsTo
    {
        return $this->belongsTo(SystemProvince::class, 'provinsi', 'province_id');
    }
}
