<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The authentication guards for the user.
     *
     * @var array
     */
    protected $guards = [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        // Otros guards...
    ];

    protected $guard_name = 'web'; // Asegúrate de que esto esté presente
}
