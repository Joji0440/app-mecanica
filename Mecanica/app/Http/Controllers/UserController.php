<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Muestra la vista para gestionar usuarios.
     *
     * @return \Illuminate\View\View
     */
    public function manage()
    {
        if (!auth()->user()->hasRole('moderator')) {
            abort(403, 'No tienes permiso para acceder a esta página.');
        }

        $users = User::all();
        $roles = \Spatie\Permission\Models\Role::all();

        return view('manage-users', compact('users', 'roles'));
    }

    /**
     * Asigna un rol a un usuario.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\RedirectResponse
     */
    public function assignRole(Request $request, User $user)
    {
        $validatedData = $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $user->syncRoles([$validatedData['role']]);

        return redirect()->route('manage.users')->with('success', 'Rol asignado correctamente.');
    }
}