<?php

namespace Database\Seeders;

use App\Enums\RoleType;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Roles
        $roleSuperadmin = Role::firstOrCreate([
            'name' => RoleType::SUPERADMIN->value,
            'guard_name' => 'web',
        ]);

        $roleGuru = Role::firstOrCreate([
            'name' => RoleType::GURU->value,
            'guard_name' => 'web',
        ]);

        $roleTeknisi = Role::firstOrCreate([
            'name' => RoleType::TEKNISI->value,
            'guard_name' => 'web',
        ]);

        // 2. Create Users (this will trigger User::created event which automatically assigns GURU, but we will sync the correct role afterward)

        // Superadmin
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Superadmin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        // Sync to remove the default GURU and set SUPERADMIN only
        $superadmin->roles()->syncWithPivotValues([$roleSuperadmin->id], ['model_type' => get_class($superadmin)]);

        // Guru
        $guru = User::firstOrCreate(
            ['email' => 'guru@gmail.com'],
            [
                'name' => 'Guru Biasa',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        // Sync just to be explicit, though it already has GURU by default
        $guru->roles()->syncWithPivotValues([$roleGuru->id], ['model_type' => get_class($guru)]);

        // Teknisi
        $teknisi = User::firstOrCreate(
            ['email' => 'teknisi@gmail.com'],
            [
                'name' => 'Teknisi Sekolah',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        // Sync to remove the default GURU and set TEKNISI only
        $teknisi->roles()->syncWithPivotValues([$roleTeknisi->id], ['model_type' => get_class($teknisi)]);
    }
}
