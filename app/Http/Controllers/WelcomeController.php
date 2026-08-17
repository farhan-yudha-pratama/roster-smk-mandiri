<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\RosterSchedule;

class WelcomeController extends Controller
{
    public function index(Request $request)
    {
        $mapDay = [
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
            'Sunday' => 'Minggu'
        ];
        $currentDay = $mapDay[\Carbon\Carbon::now()->format('l')] ?? 'Senin';
        // Simple logic for week cycle: odd or even week of the year
        $currentCycle = \Carbon\Carbon::now()->weekOfYear % 2 == 0 ? \App\Enums\WeekCycle::EVEN->value : \App\Enums\WeekCycle::ODD->value;

        $filters = [
            'search' => $request->search ?? '',
            'major' => $request->major ?? 'all',
            'grade_level' => $request->grade_level ?? 'all',
            'week_cycle' => $request->week_cycle ?? $currentCycle,
            'day' => $request->day ? ($mapDay[$request->day] ?? $request->day) : $currentDay,
        ];

        $query = RosterSchedule::with([
            'masterClass.homeroomTeacher', 
            'subject', 
            'user', 
            'classroom'
        ]);

        if ($filters['day'] !== 'all') {
            $query->where('day', $filters['day']);
        }

        if ($filters['week_cycle'] !== 'all') {
            $query->where('week_cycle', $filters['week_cycle']);
        }

        if ($filters['major'] !== 'all') {
            $query->whereHas('masterClass', function ($q) use ($filters) {
                $q->where('major', $filters['major']);
            });
        }

        if ($filters['grade_level'] !== 'all') {
            $query->whereHas('masterClass', function ($q) use ($filters) {
                $q->where('grade_level', $filters['grade_level']);
            });
        }

        if ($filters['search']) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($u) use ($search) {
                    $u->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
                })
                ->orWhereHas('classroom', function ($c) use ($search) {
                    $c->whereRaw('LOWER(room_name) LIKE ?', ["%{$search}%"]);
                })
                ->orWhereHas('subject', function ($s) use ($search) {
                    $s->whereRaw('LOWER(subject_name) LIKE ?', ["%{$search}%"]);
                });
            });
        }

        $schedules = $query->orderBy('period_number')->get();

        return Inertia::render('welcome', [
            'schedules' => $schedules,
            'filters' => $filters,
        ]);
    }

    public function scheduleInfo()
    {
        $days = \App\Models\MasterDay::with([
            'timeAllocations' => function ($q) {
                $q->orderBy('start_time', 'asc');
            },
            'masterUniforms'
        ])->orderByRaw("FIELD(day_name, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')")->get();
        
        $anyDayUniforms = \App\Models\MasterUniform::where('is_any_day', true)->get();

        return Inertia::render('ScheduleInfo', [
            'days' => $days,
            'anyDayUniforms' => $anyDayUniforms,
        ]);
    }
}
