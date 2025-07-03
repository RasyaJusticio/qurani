<?php

namespace App\Models\LinkId;

use Illuminate\Database\Eloquent\Model;

class SettingGroup extends Model
{
    protected $connection = "linkid";
    protected $table = "qu_setting_group";
    protected $primaryKey = "id";
}
