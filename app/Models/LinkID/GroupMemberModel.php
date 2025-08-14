<?php

namespace App\Models\LinkID;

use Illuminate\Database\Eloquent\Model;

class GroupMemberModel extends Model
{
    protected $connection = 'linkid';
    protected $table = 'groups_members';
    protected $primaryKey = 'id';

}
