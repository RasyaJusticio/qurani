<?php

namespace App\Models\LinkId;

use Illuminate\Database\Eloquent\Model;

class SettingGlobal extends Model
{
    protected $connection = "linkid";
    protected $table = "qu_setting_global";
    protected $primaryKey = "id";
}
