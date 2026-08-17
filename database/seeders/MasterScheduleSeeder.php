<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MasterScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $days = [
            [
                'id' => 'DAY-SENIN',
                'day_name' => 'Senin',
                'uniform_description' => 'Putih Abu-Abu',
                'notes' => ''
            ],
            [
                'id' => 'DAY-SELASA',
                'day_name' => 'Selasa',
                'uniform_description' => 'Batik',
                'notes' => null
            ],
            [
                'id' => 'DAY-RABU',
                'day_name' => 'Rabu',
                'uniform_description' => 'Batik',
                'notes' => null
            ],
            [
                'id' => 'DAY-KAMIS',
                'day_name' => 'Kamis',
                'uniform_description' => 'Putih Abu-Abu',
                'notes' => null
            ],
            [
                'id' => 'DAY-JUMAT',
                'day_name' => 'Jumat',
                'uniform_description' => 'Pramuka',
                'notes' => null
            ],
        ];

        foreach ($days as $day) {
            \App\Models\MasterDay::create($day);
        }

        $allocations = [];
        $idCounter = 1;

        // SENIN
        $seninAllocations = [
            ['type' => 'ceremony', 'period_number' => null, 'start_time' => '07:15:00', 'end_time' => '08:00:00', 'description' => 'Upacara Bendera'],
            ['type' => 'period', 'period_number' => 1, 'start_time' => '08:00:00', 'end_time' => '08:40:00', 'description' => null],
            ['type' => 'period', 'period_number' => 2, 'start_time' => '08:40:00', 'end_time' => '09:20:00', 'description' => null],
            ['type' => 'period', 'period_number' => 3, 'start_time' => '09:20:00', 'end_time' => '10:00:00', 'description' => null],
            ['type' => 'break', 'period_number' => null, 'start_time' => '10:00:00', 'end_time' => '10:20:00', 'description' => 'Istirahat I'],
            ['type' => 'period', 'period_number' => 4, 'start_time' => '10:20:00', 'end_time' => '11:00:00', 'description' => null],
            ['type' => 'period', 'period_number' => 5, 'start_time' => '11:00:00', 'end_time' => '11:40:00', 'description' => null],
            ['type' => 'period', 'period_number' => 6, 'start_time' => '11:40:00', 'end_time' => '12:20:00', 'description' => null],
            ['type' => 'break', 'period_number' => null, 'start_time' => '12:20:00', 'end_time' => '13:00:00', 'description' => 'Istirahat II'],
            ['type' => 'period', 'period_number' => 7, 'start_time' => '13:00:00', 'end_time' => '13:40:00', 'description' => null],
            ['type' => 'period', 'period_number' => 8, 'start_time' => '13:40:00', 'end_time' => '14:20:00', 'description' => null],
            ['type' => 'period', 'period_number' => 9, 'start_time' => '14:20:00', 'end_time' => '15:00:00', 'description' => null],
            ['type' => 'period', 'period_number' => 10, 'start_time' => '15:00:00', 'end_time' => '15:40:00', 'description' => null],
        ];

        foreach ($seninAllocations as $alloc) {
            $alloc['id'] = 'TIME-' . str_pad($idCounter++, 4, '0', STR_PAD_LEFT);
            $alloc['master_day_id'] = 'DAY-SENIN';
            $allocations[] = $alloc;
        }

        // SELASA, RABU, KAMIS
        $midWeekAllocations = [
            ['type' => 'period', 'period_number' => 1, 'start_time' => '07:30:00', 'end_time' => '08:10:00', 'description' => null],
            ['type' => 'period', 'period_number' => 2, 'start_time' => '08:10:00', 'end_time' => '08:50:00', 'description' => null],
            ['type' => 'period', 'period_number' => 3, 'start_time' => '08:50:00', 'end_time' => '09:30:00', 'description' => null],
            ['type' => 'period', 'period_number' => 4, 'start_time' => '09:30:00', 'end_time' => '10:10:00', 'description' => null],
            ['type' => 'break', 'period_number' => null, 'start_time' => '10:10:00', 'end_time' => '10:30:00', 'description' => 'Istirahat I'],
            ['type' => 'period', 'period_number' => 5, 'start_time' => '10:30:00', 'end_time' => '11:10:00', 'description' => null],
            ['type' => 'period', 'period_number' => 6, 'start_time' => '11:10:00', 'end_time' => '11:50:00', 'description' => null],
            ['type' => 'period', 'period_number' => 7, 'start_time' => '11:50:00', 'end_time' => '12:30:00', 'description' => null],
            ['type' => 'break', 'period_number' => null, 'start_time' => '12:30:00', 'end_time' => '13:10:00', 'description' => 'Istirahat II'],
            ['type' => 'period', 'period_number' => 8, 'start_time' => '13:10:00', 'end_time' => '13:50:00', 'description' => null],
            ['type' => 'period', 'period_number' => 9, 'start_time' => '13:50:00', 'end_time' => '14:30:00', 'description' => null],
            ['type' => 'period', 'period_number' => 10, 'start_time' => '14:30:00', 'end_time' => '15:10:00', 'description' => null],
        ];

        foreach (['DAY-SELASA', 'DAY-RABU', 'DAY-KAMIS'] as $dayId) {
            foreach ($midWeekAllocations as $alloc) {
                $alloc['id'] = 'TIME-' . str_pad($idCounter++, 4, '0', STR_PAD_LEFT);
                $alloc['master_day_id'] = $dayId;
                $allocations[] = $alloc;
            }
        }

        // JUMAT
        $jumatAllocations = [
            ['type' => 'period', 'period_number' => 1, 'start_time' => '07:30:00', 'end_time' => '08:10:00', 'description' => null],
            ['type' => 'period', 'period_number' => 2, 'start_time' => '08:10:00', 'end_time' => '08:50:00', 'description' => null],
            ['type' => 'period', 'period_number' => 3, 'start_time' => '08:50:00', 'end_time' => '09:30:00', 'description' => null],
            ['type' => 'break', 'period_number' => null, 'start_time' => '09:30:00', 'end_time' => '09:45:00', 'description' => 'Istirahat I'],
            ['type' => 'period', 'period_number' => 4, 'start_time' => '09:45:00', 'end_time' => '10:25:00', 'description' => null],
            ['type' => 'period', 'period_number' => 5, 'start_time' => '10:25:00', 'end_time' => '11:05:00', 'description' => null],
            ['type' => 'period', 'period_number' => 6, 'start_time' => '11:05:00', 'end_time' => '11:45:00', 'description' => null],
        ];

        foreach ($jumatAllocations as $alloc) {
            $alloc['id'] = 'TIME-' . str_pad($idCounter++, 4, '0', STR_PAD_LEFT);
            $alloc['master_day_id'] = 'DAY-JUMAT';
            $allocations[] = $alloc;
        }

        foreach (array_chunk($allocations, 100) as $chunk) {
            \App\Models\MasterTimeAllocation::insert($chunk);
        }
    }
}
