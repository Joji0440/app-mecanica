<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Muestra el dashboard principal.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        // Aquí puedes agregar lógica para mostrar datos en el dashboard.
        return view('dashboard'); // Asegúrate de que esta vista exista en resources/views.
    }
}