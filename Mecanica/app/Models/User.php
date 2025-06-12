<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;

    protected $guard_name = 'web'; // Esto asegura que el guard sea 'web'

    /**
     * Método para depurar los roles del usuario.
     */
    public function debugRoles()
    {
        return $this->roles->pluck('name'); // Devuelve los nombres de los roles asignados al usuario.
    }
}
