<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Obtener perfil del usuario autenticado
     */
    public function profile(Request $request)
    {
        return response()->json([
            'message' => 'Perfil obtenido exitosamente',
            'data' => $request->user()->load('roles')
        ]);
    }

    /**
     * Actualizar perfil del usuario autenticado
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'current_password' => 'required_with:password',
            'password' => 'sometimes|nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar contraseña actual si se está cambiando la contraseña
        if ($request->has('password') && $request->password) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'La contraseña actual es incorrecta'
                ], 422);
            }
        }

        // Actualizar datos
        $data = $request->only(['name', 'email']);
        
        if ($request->has('password') && $request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'data' => $user->fresh()->load('roles')
        ]);
    }

    /**
     * Gestionar usuarios (para moderadores)
     */
    public function manage(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        $query = User::with('roles');

        // Los moderadores solo pueden ver usuarios regulares
        if ($request->user()->hasRole('moderator') && !$request->user()->hasRole('admin')) {
            $query->role('user');
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($perPage);

        return response()->json([
            'message' => 'Lista de usuarios obtenida exitosamente',
            'data' => $users
        ]);
    }

    /**
     * Asignar rol a usuario (solo moderadores y admins)
     */
    public function assignRole(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string|exists:roles,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $currentUser = $request->user();

        // Los moderadores solo pueden asignar rol 'user'
        if ($currentUser->hasRole('moderator') && !$currentUser->hasRole('admin')) {
            if ($request->role !== 'user') {
                return response()->json([
                    'message' => 'No tienes permisos para asignar este rol'
                ], 403);
            }
        }

        // Prevenir que los moderadores modifiquen admins
        if ($user->hasRole('admin') && $currentUser->hasRole('moderator') && !$currentUser->hasRole('admin')) {
            return response()->json([
                'message' => 'No tienes permisos para modificar administradores'
            ], 403);
        }

        $user->assignRole($request->role);

        return response()->json([
            'message' => 'Rol asignado exitosamente',
            'data' => $user->fresh()->load('roles')
        ]);
    }

    /**
     * Suspender/Activar usuario
     */
    public function toggleStatus(Request $request, User $user)
    {
        $currentUser = $request->user();

        // Prevenir auto-suspensión
        if ($user->id === $currentUser->id) {
            return response()->json([
                'message' => 'No puedes suspender tu propia cuenta'
            ], 403);
        }

        // Los moderadores no pueden suspender admins
        if ($user->hasRole('admin') && $currentUser->hasRole('moderator') && !$currentUser->hasRole('admin')) {
            return response()->json([
                'message' => 'No tienes permisos para suspender administradores'
            ], 403);
        }

        // Toggle del estado (usando un campo 'suspended_at' en la tabla users)
        if ($user->suspended_at) {
            $user->update(['suspended_at' => null]);
            $message = 'Usuario activado exitosamente';
        } else {
            $user->update(['suspended_at' => now()]);
            $message = 'Usuario suspendido exitosamente';
            
            // Revocar todos los tokens del usuario suspendido
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $message,
            'data' => $user->fresh()->load('roles')
        ]);
    }

    /**
     * Obtener actividad reciente del usuario
     */
    public function getActivity(Request $request)
    {
        $user = $request->user();
        
        // Obtener tokens activos (sesiones)
        $activeSessions = $user->tokens()->where('expires_at', '>', now())
                                        ->orWhereNull('expires_at')
                                        ->count();

        $activity = [
            'last_login' => $user->last_login_at ?? $user->created_at,
            'active_sessions' => $activeSessions,
            'member_since' => $user->created_at,
            'profile_updated' => $user->updated_at,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name')
        ];

        return response()->json([
            'message' => 'Actividad obtenida exitosamente',
            'data' => $activity
        ]);
    }
}
