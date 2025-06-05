<?php

namespace App\Models\LinkID;

use Illuminate\Database\Eloquent\Model;

class QuSetoran extends Model
{
    protected $connection = 'linkid';
    protected $table = 'qu_setoran';
    public $timestamps = false;

    protected $fillable = [
        'tgl',
        'penyetor',
        'penerima',
        'setoran',
        'tampilan',
        'nomor',
        'info',
        'hasil',
        'ket',
        'kesalahan',
        'perhalaman',
        'paraf',
        'paraftgl',
        'parafoleh'
    ];

    protected $casts = [
        'kesalahan' => 'array',
        'perhalaman' => 'array',
    ];
}
