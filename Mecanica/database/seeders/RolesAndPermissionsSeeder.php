<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear roles
        $admin = Role::create(['name' => 'admin']);
        $user = Role::create(['name' => 'user']);

        // Crear permisos
        Permission::create(['name' => 'manage users']);
        Permission::create(['name' => 'view dashboard']);

        // Asignar permisos al rol de admin
        $admin->givePermissionTo(['manage users', 'view dashboard']);
    }
}
