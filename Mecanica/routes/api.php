<?php
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Ruta pública para iniciar sesión
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas por Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});