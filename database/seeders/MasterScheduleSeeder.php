<?php

namespace Database\Seeders;

use App\Models\MasterDay;
use App\Models\MasterTimeAllocation;
use App\Models\MasterUniform;
use Illuminate\Database\Seeder;

class MasterScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Uniforms
        $uniforms = [
            ['id' => 'UNI-PUTIH-ABU', 'uniform_name' => 'Putih Abu-Abu', 'description' => 'Seragam wajib hari Senin dan Kamis', 'is_any_day' => false],
            ['id' => 'UNI-BATIK', 'uniform_name' => 'Batik', 'description' => 'Seragam wajib hari Selasa dan Rabu', 'is_any_day' => false],
            ['id' => 'UNI-PRAMUKA', 'uniform_name' => 'Pramuka', 'description' => 'Seragam wajib hari Jumat', 'is_any_day' => false],
            ['id' => 'UNI-PRAKTIK', 'uniform_name' => 'Baju Praktik', 'description' => 'Dipakai saat jam produktif/praktik (tanpa hari spesifik)', 'is_any_day' => true],
        ];

        foreach ($uniforms as $uniform) {
            MasterUniform::updateOrCreate(['id' => $uniform['id']], $uniform);
        }

        // 2. Create Days
        $days = [
            ['id' => 'DAY-SENIN', 'day_name' => 'Senin', 'notes' => ''],
            ['id' => 'DAY-SELASA', 'day_name' => 'Selasa', 'notes' => null],
            ['id' => 'DAY-RABU', 'day_name' => 'Rabu', 'notes' => null],
            ['id' => 'DAY-KAMIS', 'day_name' => 'Kamis', 'notes' => null],
            ['id' => 'DAY-JUMAT', 'day_name' => 'Jumat', 'notes' => null],
        ];

        foreach ($days as $day) {
            MasterDay::updateOrCreate(['id' => $day['id']], $day);
        }

        // Attach uniforms to days
        $uniformSeninKamis = MasterUniform::find('UNI-PUTIH-ABU');
        $uniformSeninKamis->masterDays()->sync(['DAY-SENIN', 'DAY-KAMIS']);

        $uniformSelasaRabu = MasterUniform::find('UNI-BATIK');
        $uniformSelasaRabu->masterDays()->sync(['DAY-SELASA', 'DAY-RABU']);

        $uniformJumat = MasterUniform::find('UNI-PRAMUKA');
        $uniformJumat->masterDays()->sync(['DAY-JUMAT']);

        // 3. Create Time Allocations (Generic Schedules)
        $allocations = [];
        $idCounter = 1;

        // --- JADWAL KHUSUS SENIN ---
        $seninAllocations = [
            ['name' => 'Upacara Bendera', 'type' => 'ceremony', 'period_number' => null, 'start_time' => '07:15:00', 'end_time' => '08:00:00', 'description' => 'Upacara Bendera Senin'],
            ['name' => 'Senin JP 1', 'type' => 'period', 'period_number' => 1, 'start_time' => '08:00:00', 'end_time' => '08:40:00', 'description' => null],
            ['name' => 'Senin JP 2', 'type' => 'period', 'period_number' => 2, 'start_time' => '08:40:00', 'end_time' => '09:20:00', 'description' => null],
            ['name' => 'Senin JP 3', 'type' => 'period', 'period_number' => 3, 'start_time' => '09:20:00', 'end_time' => '10:00:00', 'description' => null],
            ['name' => 'Senin Istirahat 1', 'type' => 'break', 'period_number' => null, 'start_time' => '10:00:00', 'end_time' => '10:20:00', 'description' => 'Istirahat I'],
            ['name' => 'Senin JP 4', 'type' => 'period', 'period_number' => 4, 'start_time' => '10:20:00', 'end_time' => '11:00:00', 'description' => null],
            ['name' => 'Senin JP 5', 'type' => 'period', 'period_number' => 5, 'start_time' => '11:00:00', 'end_time' => '11:40:00', 'description' => null],
            ['name' => 'Senin JP 6', 'type' => 'period', 'period_number' => 6, 'start_time' => '11:40:00', 'end_time' => '12:20:00', 'description' => null],
            ['name' => 'Senin Istirahat 2', 'type' => 'break', 'period_number' => null, 'start_time' => '12:20:00', 'end_time' => '13:00:00', 'description' => 'Istirahat II'],
            ['name' => 'Senin JP 7', 'type' => 'period', 'period_number' => 7, 'start_time' => '13:00:00', 'end_time' => '13:40:00', 'description' => null],
            ['name' => 'Senin JP 8', 'type' => 'period', 'period_number' => 8, 'start_time' => '13:40:00', 'end_time' => '14:20:00', 'description' => null],
            ['name' => 'Senin JP 9', 'type' => 'period', 'period_number' => 9, 'start_time' => '14:20:00', 'end_time' => '15:00:00', 'description' => null],
            ['name' => 'Senin JP 10', 'type' => 'period', 'period_number' => 10, 'start_time' => '15:00:00', 'end_time' => '15:40:00', 'description' => null],
        ];

        $seninIds = [];
        foreach ($seninAllocations as $alloc) {
            $alloc['id'] = 'TIME-SENIN-'.str_pad($idCounter++, 4, '0', STR_PAD_LEFT);
            $seninIds[] = $alloc['id'];
            $allocations[] = $alloc;
        }

        // --- JADWAL REGULER (SELASA, RABU, KAMIS) ---
        $midWeekAllocations = [
            ['name' => 'Reguler JP 1', 'type' => 'period', 'period_number' => 1, 'start_time' => '07:30:00', 'end_time' => '08:10:00', 'description' => null],
            ['name' => 'Reguler JP 2', 'type' => 'period', 'period_number' => 2, 'start_time' => '08:10:00', 'end_time' => '08:50:00', 'description' => null],
            ['name' => 'Reguler JP 3', 'type' => 'period', 'period_number' => 3, 'start_time' => '08:50:00', 'end_time' => '09:30:00', 'description' => null],
            ['name' => 'Reguler JP 4', 'type' => 'period', 'period_number' => 4, 'start_time' => '09:30:00', 'end_time' => '10:10:00', 'description' => null],
            ['name' => 'Reguler Istirahat 1', 'type' => 'break', 'period_number' => null, 'start_time' => '10:10:00', 'end_time' => '10:30:00', 'description' => 'Istirahat I'],
            ['name' => 'Reguler JP 5', 'type' => 'period', 'period_number' => 5, 'start_time' => '10:30:00', 'end_time' => '11:10:00', 'description' => null],
            ['name' => 'Reguler JP 6', 'type' => 'period', 'period_number' => 6, 'start_time' => '11:10:00', 'end_time' => '11:50:00', 'description' => null],
            ['name' => 'Reguler JP 7', 'type' => 'period', 'period_number' => 7, 'start_time' => '11:50:00', 'end_time' => '12:30:00', 'description' => null],
            ['name' => 'Reguler Istirahat 2', 'type' => 'break', 'period_number' => null, 'start_time' => '12:30:00', 'end_time' => '13:10:00', 'description' => 'Istirahat II'],
            ['name' => 'Reguler JP 8', 'type' => 'period', 'period_number' => 8, 'start_time' => '13:10:00', 'end_time' => '13:50:00', 'description' => null],
            ['name' => 'Reguler JP 9', 'type' => 'period', 'period_number' => 9, 'start_time' => '13:50:00', 'end_time' => '14:30:00', 'description' => null],
            ['name' => 'Reguler JP 10', 'type' => 'period', 'period_number' => 10, 'start_time' => '14:30:00', 'end_time' => '15:10:00', 'description' => null],
        ];

        $midWeekIds = [];
        $idCounter = 1;
        foreach ($midWeekAllocations as $alloc) {
            $alloc['id'] = 'TIME-REG-'.str_pad($idCounter++, 4, '0', STR_PAD_LEFT);
            $midWeekIds[] = $alloc['id'];
            $allocations[] = $alloc;
        }

        // --- JADWAL KHUSUS JUMAT ---
        $jumatAllocations = [
            ['name' => 'Jumat JP 1', 'type' => 'period', 'period_number' => 1, 'start_time' => '07:30:00', 'end_time' => '08:10:00', 'description' => null],
            ['name' => 'Jumat JP 2', 'type' => 'period', 'period_number' => 2, 'start_time' => '08:10:00', 'end_time' => '08:50:00', 'description' => null],
            ['name' => 'Jumat JP 3', 'type' => 'period', 'period_number' => 3, 'start_time' => '08:50:00', 'end_time' => '09:30:00', 'description' => null],
            ['name' => 'Jumat Istirahat 1', 'type' => 'break', 'period_number' => null, 'start_time' => '09:30:00', 'end_time' => '09:45:00', 'description' => 'Istirahat I'],
            ['name' => 'Jumat JP 4', 'type' => 'period', 'period_number' => 4, 'start_time' => '09:45:00', 'end_time' => '10:25:00', 'description' => null],
            ['name' => 'Jumat JP 5', 'type' => 'period', 'period_number' => 5, 'start_time' => '10:25:00', 'end_time' => '11:05:00', 'description' => null],
            ['name' => 'Jumat JP 6', 'type' => 'period', 'period_number' => 6, 'start_time' => '11:05:00', 'end_time' => '11:45:00', 'description' => null],
        ];

        $jumatIds = [];
        $idCounter = 1;
        foreach ($jumatAllocations as $alloc) {
            $alloc['id'] = 'TIME-JUMAT-'.str_pad($idCounter++, 4, '0', STR_PAD_LEFT);
            $jumatIds[] = $alloc['id'];
            $allocations[] = $alloc;
        }

        // Insert Time Allocations
        foreach (array_chunk($allocations, 100) as $chunk) {
            MasterTimeAllocation::upsert($chunk, ['id'], ['name', 'type', 'period_number', 'start_time', 'end_time', 'description']);
        }

        // 4. Attach Allocations to Days via Pivot
        $daySenin = MasterDay::find('DAY-SENIN');
        $daySenin->timeAllocations()->sync($seninIds);

        foreach (['DAY-SELASA', 'DAY-RABU', 'DAY-KAMIS'] as $dayId) {
            $day = MasterDay::find($dayId);
            $day->timeAllocations()->sync($midWeekIds);
        }

        $dayJumat = MasterDay::find('DAY-JUMAT');
        $dayJumat->timeAllocations()->sync($jumatIds);
    }
}
