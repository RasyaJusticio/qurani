<?php

namespace App\Models\LinkID;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $connection = "linkid";

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'user_password',
        'user_email_verification_code',
        'user_phone_verification_code',
        'user_reset_key',
        'user_two_factor_key',
        'user_two_factor_gsecret',
        'user_failed_login_ip',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_password' => 'hashed',
        ];
    }
}
