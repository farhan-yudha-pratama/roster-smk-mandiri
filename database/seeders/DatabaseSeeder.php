<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Urutan seeding WAJIB dijaga karena ada ketergantungan FK antar tabel:
     *   1. UserRoleSeeder       → roles, users, model_has_roles
     *   2. MasterDataSeeder     → master_classrooms, master_subjects, master_homeroom_teachers, master_classes
     *   3. MasterScheduleSeeder → master_uniforms, master_days, master_time_allocations, pivot tables
     *   4. RosterScheduleSeeder → roster_schedules (baca dari roster.json)
     */
    public function run(): void
    {
        $this->call([
            UserRoleSeeder::class,
            MasterDataSeeder::class,
            MasterScheduleSeeder::class,
            RosterScheduleSeeder::class,
        ]);
    }
}
