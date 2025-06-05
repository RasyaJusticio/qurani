<?php

namespace App\Models\LinkID;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;


class User extends Model
{
    protected $connection = "linkid";
}
