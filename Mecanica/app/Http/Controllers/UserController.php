<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\DTO\UserDTO;
use App\Services\UserService;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    /**
     * Obtener lista de usuarios para gestionar (moderadores)
     */
    public function manage(): JsonResponse
    {
        try {
            $users = $this->userService->getAllUsers();
            $roles = \Spatie\Permission\Models\Role::all();

            return response()->json([
                'message' => 'Datos obtenidos exitosamente',
                'data' => [
                    'users' => $users,
                    'roles' => $roles
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
     * Asignar rol a un usuario
     */
    public function assignRole(Request $request, User $user): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'role' => 'required|string|exists:roles,name',
            ]);

            $updatedUser = $this->userService->assignRole($user, $validatedData['role']);

            return response()->json([
                'message' => 'Rol asignado correctamente',
                'data' => new UserResource($updatedUser->load('roles'))
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al asignar rol',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Obtener usuario por ID
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'message' => 'Usuario obtenido exitosamente',
            'data' => new UserResource($user->load('roles'))
        ]);
    }

    /**
     * Actualizar usuario
     */
    public function update(Request $request, User $user): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $user->id,
                'password' => 'nullable|string|min:8',
            ]);

            $userDTO = UserDTO::fromRequest($validatedData);
            $updatedUser = $this->userService->updateUser($user, $userDTO);

            return response()->json([
                'message' => 'Usuario actualizado correctamente',
                'data' => new UserResource($updatedUser->load('roles'))
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar usuario',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Eliminar usuario
     */
    public function destroy(User $user): JsonResponse
    {
        try {
            $this->userService->deleteUser($user);

            return response()->json([
                'message' => 'Usuario eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar usuario',
                'error' => $e->getMessage()
            ], 422);
        }
    }
}
