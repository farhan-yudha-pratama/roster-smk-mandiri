<?php

namespace Database\Seeders;

use App\Models\RosterSchedule;
use Illuminate\Database\Seeder;

class DummyScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Path to the dummy schedules JSON file
        $jsonPath = database_path('seeders/dummy_schedules.json');

        if (file_exists($jsonPath)) {
            $json = file_get_contents($jsonPath);
            $schedules = json_decode($json, true);

            foreach ($schedules as $schedule) {
                RosterSchedule::updateOrCreate(
                    ['id' => $schedule['id']],
                    $schedule
                );
            }
        } else {
            $this->command->error('File dummy_schedules.json tidak ditemukan!');
        }
    }
}
