<?php

namespace Database\Seeders;

use App\Models\MasterDay;
use App\Models\MasterTimeAllocation;
use App\Models\MasterUniform;
use Illuminate\Database\Seeder;

class MasterScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUniforms();
        $this->seedDays();
        $this->seedTimeAllocations();
    }

    // =========================================================================
    // 1. SERAGAM (master_uniforms)
    // =========================================================================
    private function seedUniforms(): void
    {
        $uniforms = [
            ['id' => 'UNI-PUTIH-ABU', 'uniform_name' => 'Putih Abu-Abu', 'description' => 'Seragam wajib hari Senin dan Kamis',              'is_any_day' => false],
            ['id' => 'UNI-BATIK',     'uniform_name' => 'Batik',         'description' => 'Seragam wajib hari Selasa dan Rabu',              'is_any_day' => false],
            ['id' => 'UNI-PRAMUKA',   'uniform_name' => 'Pramuka',       'description' => 'Seragam wajib hari Jumat',                        'is_any_day' => false],
            ['id' => 'UNI-PRAKTIK',   'uniform_name' => 'Baju Praktik',  'description' => 'Dipakai saat jam produktif/praktik (tanpa hari spesifik)', 'is_any_day' => true],
        ];

        foreach ($uniforms as $uniform) {
            MasterUniform::updateOrCreate(['id' => $uniform['id']], $uniform);
        }
    }

    // =========================================================================
    // 2. HARI (master_days) + relasi ke seragam (master_day_uniforms)
    // =========================================================================
    private function seedDays(): void
    {
        $days = [
            ['id' => 'DAY-SENIN',  'day_name' => 'Senin',  'master_uniform_id' => 'UNI-PUTIH-ABU', 'notes' => null],
            ['id' => 'DAY-SELASA', 'day_name' => 'Selasa', 'master_uniform_id' => 'UNI-BATIK',     'notes' => null],
            ['id' => 'DAY-RABU',   'day_name' => 'Rabu',   'master_uniform_id' => 'UNI-BATIK',     'notes' => null],
            ['id' => 'DAY-KAMIS',  'day_name' => 'Kamis',  'master_uniform_id' => 'UNI-PUTIH-ABU', 'notes' => null],
            ['id' => 'DAY-JUMAT',  'day_name' => 'Jumat',  'master_uniform_id' => 'UNI-PRAMUKA',   'notes' => null],
        ];

        foreach ($days as $day) {
            MasterDay::updateOrCreate(['id' => $day['id']], $day);
        }

        // Sinkronisasi relasi pivot master_day_uniforms
        MasterUniform::find('UNI-PUTIH-ABU')->masterDays()->sync(['DAY-SENIN', 'DAY-KAMIS']);
        MasterUniform::find('UNI-BATIK')->masterDays()->sync(['DAY-SELASA', 'DAY-RABU']);
        MasterUniform::find('UNI-PRAMUKA')->masterDays()->sync(['DAY-JUMAT']);
    }

    // =========================================================================
    // 3. ALOKASI WAKTU (master_time_allocations) + pivot ke hari (master_day_time_allocations)
    //
    //    Ada 3 jadwal berbeda:
    //      - SENIN  : Diawali upacara, 10 JP, 2x istirahat
    //      - JUMAT  : 6 JP, 1x istirahat (lebih pendek)
    //      - REGULER: Selasa/Rabu/Kamis, 10 JP, 2x istirahat
    //
    //    Waktu JP harus sinkron dengan getDaySchedule() di RosterScheduleSeeder.
    // =========================================================================
    private function seedTimeAllocations(): void
    {
        $allocations = [];
        $seninIds    = [];
        $midWeekIds  = [];
        $jumatIds    = [];

        // --- SENIN ---
        $seninSlots = [
            ['name' => 'Upacara Bendera', 'type' => 'ceremony', 'period_number' => null, 'start_time' => '07:15:00', 'end_time' => '08:00:00', 'description' => 'Upacara Bendera Senin'],
            ['name' => 'Senin JP 1',      'type' => 'period',   'period_number' => 1,    'start_time' => '08:00:00', 'end_time' => '08:40:00', 'description' => null],
            ['name' => 'Senin JP 2',      'type' => 'period',   'period_number' => 2,    'start_time' => '08:40:00', 'end_time' => '09:20:00', 'description' => null],
            ['name' => 'Senin JP 3',      'type' => 'period',   'period_number' => 3,    'start_time' => '09:20:00', 'end_time' => '10:00:00', 'description' => null],
            ['name' => 'Senin Istirahat 1','type' => 'break',   'period_number' => null, 'start_time' => '10:00:00', 'end_time' => '10:20:00', 'description' => 'Istirahat I'],
            ['name' => 'Senin JP 4',      'type' => 'period',   'period_number' => 4,    'start_time' => '10:20:00', 'end_time' => '11:00:00', 'description' => null],
            ['name' => 'Senin JP 5',      'type' => 'period',   'period_number' => 5,    'start_time' => '11:00:00', 'end_time' => '11:40:00', 'description' => null],
            ['name' => 'Senin JP 6',      'type' => 'period',   'period_number' => 6,    'start_time' => '11:40:00', 'end_time' => '12:20:00', 'description' => null],
            ['name' => 'Senin Istirahat 2','type' => 'break',   'period_number' => null, 'start_time' => '12:20:00', 'end_time' => '13:00:00', 'description' => 'Istirahat II'],
            ['name' => 'Senin JP 7',      'type' => 'period',   'period_number' => 7,    'start_time' => '13:00:00', 'end_time' => '13:40:00', 'description' => null],
            ['name' => 'Senin JP 8',      'type' => 'period',   'period_number' => 8,    'start_time' => '13:40:00', 'end_time' => '14:20:00', 'description' => null],
            ['name' => 'Senin JP 9',      'type' => 'period',   'period_number' => 9,    'start_time' => '14:20:00', 'end_time' => '15:00:00', 'description' => null],
            ['name' => 'Senin JP 10',     'type' => 'period',   'period_number' => 10,   'start_time' => '15:00:00', 'end_time' => '15:40:00', 'description' => null],
        ];

        foreach ($seninSlots as $i => $slot) {
            $slot['id'] = 'TIME-SENIN-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT);
            $seninIds[] = $slot['id'];
            $allocations[] = $slot;
        }

        // --- REGULER (Selasa, Rabu, Kamis) ---
        $regularSlots = [
            ['name' => 'Reguler JP 1',       'type' => 'period',  'period_number' => 1,    'start_time' => '07:30:00', 'end_time' => '08:10:00', 'description' => null],
            ['name' => 'Reguler JP 2',       'type' => 'period',  'period_number' => 2,    'start_time' => '08:10:00', 'end_time' => '08:50:00', 'description' => null],
            ['name' => 'Reguler JP 3',       'type' => 'period',  'period_number' => 3,    'start_time' => '08:50:00', 'end_time' => '09:30:00', 'description' => null],
            ['name' => 'Reguler JP 4',       'type' => 'period',  'period_number' => 4,    'start_time' => '09:30:00', 'end_time' => '10:10:00', 'description' => null],
            ['name' => 'Reguler Istirahat 1','type' => 'break',   'period_number' => null, 'start_time' => '10:10:00', 'end_time' => '10:30:00', 'description' => 'Istirahat I'],
            ['name' => 'Reguler JP 5',       'type' => 'period',  'period_number' => 5,    'start_time' => '10:30:00', 'end_time' => '11:10:00', 'description' => null],
            ['name' => 'Reguler JP 6',       'type' => 'period',  'period_number' => 6,    'start_time' => '11:10:00', 'end_time' => '11:50:00', 'description' => null],
            ['name' => 'Reguler JP 7',       'type' => 'period',  'period_number' => 7,    'start_time' => '11:50:00', 'end_time' => '12:30:00', 'description' => null],
            ['name' => 'Reguler Istirahat 2','type' => 'break',   'period_number' => null, 'start_time' => '12:30:00', 'end_time' => '13:10:00', 'description' => 'Istirahat II'],
            ['name' => 'Reguler JP 8',       'type' => 'period',  'period_number' => 8,    'start_time' => '13:10:00', 'end_time' => '13:50:00', 'description' => null],
            ['name' => 'Reguler JP 9',       'type' => 'period',  'period_number' => 9,    'start_time' => '13:50:00', 'end_time' => '14:30:00', 'description' => null],
            ['name' => 'Reguler JP 10',      'type' => 'period',  'period_number' => 10,   'start_time' => '14:30:00', 'end_time' => '15:10:00', 'description' => null],
        ];

        foreach ($regularSlots as $i => $slot) {
            $slot['id'] = 'TIME-REG-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT);
            $midWeekIds[] = $slot['id'];
            $allocations[] = $slot;
        }

        // --- JUMAT ---
        $jumatSlots = [
            ['name' => 'Jumat JP 1',      'type' => 'period', 'period_number' => 1,    'start_time' => '07:30:00', 'end_time' => '08:10:00', 'description' => null],
            ['name' => 'Jumat JP 2',      'type' => 'period', 'period_number' => 2,    'start_time' => '08:10:00', 'end_time' => '08:50:00', 'description' => null],
            ['name' => 'Jumat JP 3',      'type' => 'period', 'period_number' => 3,    'start_time' => '08:50:00', 'end_time' => '09:30:00', 'description' => null],
            ['name' => 'Jumat Istirahat 1','type' => 'break', 'period_number' => null, 'start_time' => '09:30:00', 'end_time' => '09:45:00', 'description' => 'Istirahat I'],
            ['name' => 'Jumat JP 4',      'type' => 'period', 'period_number' => 4,    'start_time' => '09:45:00', 'end_time' => '10:25:00', 'description' => null],
            ['name' => 'Jumat JP 5',      'type' => 'period', 'period_number' => 5,    'start_time' => '10:25:00', 'end_time' => '11:05:00', 'description' => null],
            ['name' => 'Jumat JP 6',      'type' => 'period', 'period_number' => 6,    'start_time' => '11:05:00', 'end_time' => '11:45:00', 'description' => null],
        ];

        foreach ($jumatSlots as $i => $slot) {
            $slot['id'] = 'TIME-JUMAT-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT);
            $jumatIds[] = $slot['id'];
            $allocations[] = $slot;
        }

        // Upsert semua alokasi waktu
        foreach (array_chunk($allocations, 100) as $chunk) {
            MasterTimeAllocation::upsert($chunk, ['id'], ['name', 'type', 'period_number', 'start_time', 'end_time', 'description']);
        }

        // Sinkronisasi pivot master_day_time_allocations
        MasterDay::find('DAY-SENIN')->timeAllocations()->sync($seninIds);

        foreach (['DAY-SELASA', 'DAY-RABU', 'DAY-KAMIS'] as $dayId) {
            MasterDay::find($dayId)->timeAllocations()->sync($midWeekIds);
        }

        MasterDay::find('DAY-JUMAT')->timeAllocations()->sync($jumatIds);
    }
}
