<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $role): Response
    {
        if (!Auth::check() || !$request->user()->hasRole($role)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Proteger administradores
        if ($role === 'admin' && $request->route('user')?->hasRole('admin')) {
            return response()->json(['message' => 'No puedes modificar o eliminar a otro administrador.'], 403);
        }

        return $next($request);
    }
}

