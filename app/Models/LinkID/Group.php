<?php

namespace App\Models\LinkID;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $table = 'groups';
    protected $primaryKey = 'group_id';
    protected $fillable = ['group_id', 'group_name'];

    protected $connection = 'linkid';
}
