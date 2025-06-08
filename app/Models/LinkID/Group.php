<?php

namespace App\Models\LinkID;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Group extends Model
{
    protected $table = 'groups';
    protected $primaryKey = 'group_id';
    protected $fillable = ['group_id', 'group_name'];

    protected $connection = 'linkid';

    public function users()
    {
        return $this->belongsToMany(User::class, 'groups_members', 'group_id', 'user_id')
                    ->where('groups_members.approved', "1")
                    ->select(
                        'users.user_id',
                        'user_firstname',
                        'user_lastname',
                        'user_name',
                        DB::raw("CONCAT(user_firstname, ' ', user_lastname) AS user_fullname")
                    );
    }
}
