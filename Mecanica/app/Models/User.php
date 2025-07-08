<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, HasRoles, HasApiTokens;

    protected $guard_name = 'web';

    /**
     * Los atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'name', 
        'email', 
        'password',
        'last_login_at',
        'suspended_at',
    ];

    /**
     * Los atributos que deben ser ocultados para serialización.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Los atributos que deben ser convertidos.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'suspended_at' => 'datetime',
        'password' => 'hashed',
    ];
}
