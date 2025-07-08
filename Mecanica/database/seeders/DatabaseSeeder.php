<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Llamar al seeder de roles y permisos
        $this->call(RolesAndPermissionsSeeder::class);

        // Crear usuario administrador
        $admin = User::firstOrCreate(
            ['email' => 'admin@mecanica.com'],
            [
                'name' => 'Administrador',
                'password' => \Hash::make('admin123'),
                'email_verified_at' => now()
            ]
        );
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        // Crear usuario de prueba
        $testUser = User::firstOrCreate(
            ['email' => 'user@mecanica.com'],
            [
                'name' => 'Usuario Prueba',
                'password' => \Hash::make('user123'),
                'email_verified_at' => now()
            ]
        );
        if (!$testUser->hasRole('user')) {
            $testUser->assignRole('user');
        }

        // Usuario de ejemplo del factory
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => \Hash::make('password'),
                'email_verified_at' => now()
            ]
        );
    }
}
