<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Muestra la vista para gestionar usuarios.
     *
     * @return \Illuminate\View\View
     */
    public function manage()
    {
        // Aquí puedes agregar lógica para obtener usuarios o permisos.
        return view('manage-users'); // Asegúrate de que esta vista exista en resources/views.
    }
}