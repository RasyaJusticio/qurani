<?php

namespace App\Models\LinkID;

use Illuminate\Database\Eloquent\Model;

class SettingGroup extends Model
{
    protected $connection = "linkid";
    protected $table = "qu_setting_group";
    protected $primaryKey = "id";
}
