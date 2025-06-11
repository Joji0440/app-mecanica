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
        $moderator = Role::create(['name' => 'moderator']);
        $user = Role::create(['name' => 'user']);

        // Crear permisos
        Permission::create(['name' => 'manage users']);
        Permission::create(['name' => 'view dashboard']);
        Permission::create(['name' => 'assign admins']);
        Permission::create(['name' => 'delete users']);

        // Asignar permisos al rol de admin
        $admin->givePermissionTo(['manage users', 'view dashboard', 'delete users']);

        // Asignar permisos al rol de moderator
        $moderator->givePermissionTo(['assign admins']);
    }
}
