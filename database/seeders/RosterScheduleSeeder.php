<?php

namespace Database\Seeders;

use App\Models\RosterSchedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RosterScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schedules = [
            [
                'id' => (string) Str::uuid(),
                'class_id' => 'X-PPL-GIM-1',
                'day' => 'Senin',
                'week_cycle' => 'GANJIL',
                'period_number' => 1,
                'start_time' => '08:00:00',
                'end_time' => '09:20:00',
                'subject_id' => 'MTK',
                'teacher_id' => 'HR-001',
                'classroom_id' => 'TEORI-11',
                'period_duration_hours' => 2,
            ],
            [
                'id' => (string) Str::uuid(),
                'class_id' => 'X-PPL-GIM-2',
                'day' => 'Senin',
                'week_cycle' => 'GANJIL',
                'period_number' => 3,
                'start_time' => '09:20:00',
                'end_time' => '11:00:00',
                'subject_id' => 'PIPAS',
                'teacher_id' => 'HR-002',
                'classroom_id' => 'LAB-1',
                'period_duration_hours' => 2,
            ],
            [
                'id' => (string) Str::uuid(),
                'class_id' => 'XI-TKJ-1',
                'day' => 'Selasa',
                'week_cycle' => 'GENAP',
                'period_number' => 1,
                'start_time' => '07:30:00',
                'end_time' => '09:30:00',
                'subject_id' => 'BING',
                'teacher_id' => 'HR-007',
                'classroom_id' => 'LAB-2',
                'period_duration_hours' => 3,
            ],
            [
                'id' => (string) Str::uuid(),
                'class_id' => 'XII-RPL-1',
                'day' => 'Kamis',
                'week_cycle' => 'GANJIL',
                'period_number' => 4,
                'start_time' => '09:30:00',
                'end_time' => '11:50:00',
                'subject_id' => 'KEJURUAN',
                'teacher_id' => 'HR-017',
                'classroom_id' => 'LAB-5',
                'period_duration_hours' => 3,
            ]
        ];

        foreach ($schedules as $schedule) {
            RosterSchedule::create($schedule);
        }
    }
}
