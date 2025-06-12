<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/register', [AuthController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [AuthController::class, 'register']);

Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/', function () {
    return view('welcome');
});

Route::get('/admin/users', function () {
    $user = Auth::user();

    if (! $user || ! $user->hasRole('admin')) {
        abort(403, 'Unauthorized action.');
    }

    return app(App\Http\Controllers\AdminController::class)->index();
})->name('admin.users');

Route::middleware(['auth'])->group(function () {
    Route::get('/test-role', function () {
        $user = Auth::user();
        if ($user && $user->hasRole('admin')) {
            return 'El usuario tiene el rol de administrador.';
        }
        return 'El usuario no tiene el rol de administrador.';
    });
});