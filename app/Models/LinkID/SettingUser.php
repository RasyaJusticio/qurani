<?php

namespace App\Models\LinkID;

use Illuminate\Database\Eloquent\Model;

class SettingUser extends Model
{
    protected $connection = "linkid";
    protected $table = "qu_setting_user";
    protected $primaryKey = "id";
    protected $guarded = [];
    public $timestamps = false;
}
