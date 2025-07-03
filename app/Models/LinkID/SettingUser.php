<?php

namespace App\Models\LinkId;

use Illuminate\Database\Eloquent\Model;

class SettingUser extends Model
{
    protected $connection = "linkid";
    protected $table = "qu_setting_user";
    protected $primaryKey = "id";
}
