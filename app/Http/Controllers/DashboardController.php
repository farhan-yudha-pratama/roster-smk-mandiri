<?php

namespace App\Http\Controllers;

use App\Enums\Day;
use App\Models\MasterClass;
use App\Models\MasterClassroom;
use App\Models\MasterDay;
use App\Models\MasterHomeroomTeacher;
use App\Models\MasterSubject;
use App\Models\RosterSchedule;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Basic Stats
        $stats = [
            'total_teachers' => MasterHomeroomTeacher::count(),
            'total_classes' => MasterClass::count(),
            'total_subjects' => MasterSubject::count(),
            'total_classrooms' => MasterClassroom::count(),
        ];

        // 2. Map English day names to Indonesian Day Enum values
        $dayMap = [
            'Monday' => Day::MONDAY->value,
            'Tuesday' => Day::TUESDAY->value,
            'Wednesday' => Day::WEDNESDAY->value,
            'Thursday' => Day::THURSDAY->value,
            'Friday' => Day::FRIDAY->value,
            // Saturday and Sunday might not be in the enum, but let's handle it gracefully
            'Saturday' => 'Sabtu',
            'Sunday' => 'Minggu',
        ];

        $todayString = Carbon::now()->format('l'); // e.g. 'Monday'
        $todayIndo = $dayMap[$todayString] ?? $todayString;

        // 3. Today's Schedules
        $todaySchedules = RosterSchedule::with(['masterClass', 'subject', 'teacher', 'classroom'])
            ->where('day', $todayIndo)
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                return [
                    'time' => $schedule->start_time.' - '.$schedule->end_time,
                    'class' => $schedule->masterClass ? $schedule->masterClass->class_name : '-',
                    'subject' => $schedule->subject ? $schedule->subject->subject_name : '-',
                    'teacher' => $schedule->teacher ? $schedule->teacher->teacher_name : '-',
                    'room' => $schedule->classroom ? $schedule->classroom->room_name : '-',
                ];
            });

        // 4. Empty Classes (Jam Kosong) - Scenario A
        $currentTime = Carbon::now()->format('H:i:s');

        // Find schedules that are active RIGHT NOW
        $activeSchedules = RosterSchedule::where('day', $todayIndo)
            ->where('start_time', '<=', $currentTime)
            ->where('end_time', '>=', $currentTime)
            ->pluck('class_id')
            ->toArray();

        // Classes that do NOT have active schedules right now are "Empty"
        // But we might only care if it's during school hours.
        // Let's just fetch all classes not in $activeSchedules
        $emptyClassesRaw = MasterClass::whereNotIn('id', $activeSchedules)->get();
        $emptyClasses = $emptyClassesRaw->map(function ($cls) {
            return [
                'class' => $cls->class_name,
                'time' => 'Saat ini',
                'reason' => 'Tidak ada jadwal (Kosong)',
            ];
        });

        // 5. Uniforms for Today
        $uniforms = [];
        $masterDay = MasterDay::with('masterUniforms')->where('day_name', $todayIndo)->first();
        if ($masterDay && $masterDay->masterUniforms) {
            $uniforms = $masterDay->masterUniforms->pluck('uniform_name')->toArray();
        }

        // Add some default uniforms if none found just to not break the UI expectation immediately
        if (empty($uniforms)) {
            $uniforms = ['Bebas Rapi'];
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'todaySchedules' => $todaySchedules,
            'emptyClasses' => $emptyClasses,
            'uniforms' => $uniforms,
            'todayDay' => $todayIndo,
            'currentDate' => Carbon::now()->translatedFormat('l, d F Y'),
        ]);
    }
}
