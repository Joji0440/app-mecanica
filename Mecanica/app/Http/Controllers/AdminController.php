<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class AdminController extends Controller
{
    /**
     * Listar todos los usuarios (solo admin)
     */
    public function listUsers(Request $request)
    {
        try {
            // Obtener parámetros de paginación y filtros
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $role = $request->get('role');

            $query = User::with('roles');

            // Aplicar filtro de búsqueda
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Aplicar filtro de rol
            if ($role) {
                $query->role($role);
            }

            // Ordenar por fecha de creación (más recientes primero)
            $query->orderBy('created_at', 'desc');

            // Paginar resultados
            $users = $query->paginate($perPage);

            return response()->json([
                'message' => 'Usuarios obtenidos exitosamente',
                'data' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'total_pages' => $users->lastPage(),
                    'total_items' => $users->total(),
                    'per_page' => $users->perPage(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener usuarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un usuario específico
     */
    public function show(User $user)
    {
        return response()->json([
            'message' => 'Usuario obtenido exitosamente',
            'data' => $user->load('roles')
        ]);
    }

    /**
     * Actualizar un usuario
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|nullable|string|min:8|confirmed',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Actualizar datos básicos
        $data = $request->only(['name', 'email']);
        
        if ($request->has('password') && $request->password) {
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);

        // Actualizar roles si se proporcionan
        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return response()->json([
            'message' => 'Usuario actualizado exitosamente',
            'data' => $user->fresh()->load('roles')
        ]);
    }

    /**
     * Eliminar un usuario
     */
    public function destroy(User $user)
    {
        // Prevenir que el admin se elimine a sí mismo
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'No puedes eliminar tu propia cuenta'
            ], 403);
        }

        // Prevenir eliminar el último admin
        if ($user->hasRole('admin')) {
            $adminCount = User::role('admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'No se puede eliminar el último administrador'
                ], 403);
            }
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado exitosamente'
        ]);
    }

    /**
     * Asignar rol a un usuario
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

        $user->assignRole($request->role);

        return response()->json([
            'message' => 'Rol asignado exitosamente',
            'data' => $user->fresh()->load('roles')
        ]);
    }

    /**
     * Remover rol de un usuario
     */
    public function removeRole(Request $request, User $user)
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

        // Prevenir remover rol admin del último admin
        if ($request->role === 'admin' && $user->hasRole('admin')) {
            $adminCount = User::role('admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'No se puede remover el rol del último administrador'
                ], 403);
            }
        }

        $user->removeRole($request->role);

        return response()->json([
            'message' => 'Rol removido exitosamente',
            'data' => $user->fresh()->load('roles')
        ]);
    }

    /**
     * Obtener estadísticas del sistema
     */
    public function getStats()
    {
        $stats = [
            'total_users' => User::count(),
            'admin_users' => User::role('admin')->count(),
            'moderator_users' => User::role('moderator')->count(),
            'regular_users' => User::role('user')->count(),
            'users_this_month' => User::whereMonth('created_at', now()->month)
                                    ->whereYear('created_at', now()->year)
                                    ->count(),
            'recent_users' => User::latest()->take(5)->get(['id', 'name', 'email', 'created_at'])
        ];

        return response()->json([
            'message' => 'Estadísticas obtenidas exitosamente',
            'data' => $stats
        ]);
    }

    /**
     * Crear un nuevo usuario
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Crear el usuario
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
            ]);

            // Asignar roles si se proporcionan, sino asignar rol 'user' por defecto
            if ($request->has('roles') && !empty($request->roles)) {
                $user->assignRole($request->roles);
            } else {
                $user->assignRole('user');
            }

            return response()->json([
                'message' => 'Usuario creado exitosamente',
                'data' => $user->fresh()->load('roles')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar información básica del usuario (solo admin)
     */
    public function updateUserInfo(Request $request, User $user)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->update([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            return response()->json([
                'message' => 'Información del usuario actualizada exitosamente',
                'data' => $user->fresh()->load('roles')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
