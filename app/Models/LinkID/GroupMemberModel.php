<?php

namespace App\Models\LinkId;

use Illuminate\Database\Eloquent\Model;

class GroupMemberModel extends Model
{
    protected $connection = 'linkid';
    protected $table = 'groups_members';
    protected $primaryKey = 'id';

}
