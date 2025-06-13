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
        $totalUsers = \App\Models\User::count();
        $admins = \App\Models\User::role('admin')->count();
        $moderators = \App\Models\User::role('moderator')->count();
        $users = \App\Models\User::role('user')->count();

        return view('dashboard', compact('totalUsers', 'admins', 'moderators', 'users'));
    }
}