<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles;

    protected $guard_name = 'web';

    /**
     * Los atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'name', 
        'email', 
        'password',
    ];

    /**
     * Método para depurar los roles del usuario.
     */
    public function debugRoles()
    {
        return $this->roles->pluck('name'); // Devuelve los nombres de los roles asignados al usuario.
    }
}
