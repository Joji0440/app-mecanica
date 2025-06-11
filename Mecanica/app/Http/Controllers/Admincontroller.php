<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index()
    {
        $users = User::whereDoesntHave('roles', function ($query) {
            $query->where('name', 'admin');
        })->get();

        return view('admin.users', compact('users'));
    }

    public function update(Request $request, User $user)
    {
        if ($user->hasRole('admin')) {
            return redirect()->back()->withErrors(['message' => 'No puedes modificar a otro administrador.']);
        }

        $user->update($request->only(['name', 'email']));

        return redirect()->route('admin.users')->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user)
    {
        if ($user->hasRole('admin')) {
            return redirect()->back()->withErrors(['message' => 'No puedes eliminar a otro administrador.']);
        }

        $user->delete();

        return redirect()->route('admin.users')->with('success', 'Usuario eliminado correctamente.');
    }
}