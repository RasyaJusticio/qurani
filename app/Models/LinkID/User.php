<?php

namespace App\Models\LinkID;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class User extends Model
{
    protected $connection = "linkid";
    protected $primaryKey = 'user_id';
    protected $table = 'users';

}
