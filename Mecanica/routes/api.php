<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

// Endpoint de salud (público)
Route::get('/health', [HealthController::class, 'check']);

// Rutas públicas (sin autenticación)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/notifications', [DashboardController::class, 'getNotifications']);
    Route::put('/notifications/{id}/read', [DashboardController::class, 'markNotificationAsRead']);
    
    // Perfil de usuario
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/activity', [UserController::class, 'getActivity']);
    
    // Rutas para administradores únicamente
    Route::prefix('admin')->middleware(['role:admin'])->group(function () {
        Route::get('/users', [AdminController::class, 'listUsers']);
        Route::post('/users', [AdminController::class, 'store']);
        Route::get('/users/{user}', [AdminController::class, 'show']);
        Route::put('/users/{user}', [AdminController::class, 'update']);
        Route::delete('/users/{user}', [AdminController::class, 'destroy']);
        Route::post('/users/{user}/assign-role', [AdminController::class, 'assignRole']);
        Route::post('/users/{user}/remove-role', [AdminController::class, 'removeRole']);
        Route::get('/stats', [AdminController::class, 'getStats']);
    });
    
    // Rutas para managers y admins (gestión limitada)
    Route::prefix('manage')->middleware(['role:manager|admin'])->group(function () {
        Route::get('/users', [UserController::class, 'manage']);
        Route::post('/users/{user}/assign-role', [UserController::class, 'assignRole']);
        Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    });
});