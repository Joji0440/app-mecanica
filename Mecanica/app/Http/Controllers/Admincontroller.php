<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function index()
    {
        $users = User::whereDoesntHave('roles', function ($query) {
            $query->where('name', 'admin');
        })->get();

        return view('admin.users', compact('users'));
    }

    public function listUsers(Request $request)
    {
        if (!auth()->user()->hasRole('admin')) {
            abort(403, 'No tienes permiso para acceder a esta página.');
        }

        $users = User::paginate(10);
        return view('admin.users', compact('users'));
    }

    public function edit(User $user)
    {
        // Bloquear edición de administradores y moderadores
        if ($user->hasAnyRole(['admin', 'moderator'])) {
            abort(403, 'No puedes editar administradores o moderadores.');
        }

        return view('admin.edit-user', compact('user'));
    }

    public function update(Request $request, User $user)
    {
        // Bloquear edición de administradores y moderadores
        if ($user->hasAnyRole(['admin', 'moderator'])) {
            abort(403, 'No puedes editar administradores o moderadores.');
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'nullable|string|min:8',
        ]);

        $user->update([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => $validatedData['password'] ? bcrypt($validatedData['password']) : $user->password,
        ]);

        return redirect()->route('admin.users')->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user)
    {
        // Bloquear eliminación de administradores y moderadores
        if ($user->hasAnyRole(['admin', 'moderator'])) {
            abort(403, 'No puedes eliminar administradores o moderadores.');
        }

        $user->delete();

        return redirect()->route('admin.users')->with('success', 'Usuario eliminado correctamente.');
    }
}