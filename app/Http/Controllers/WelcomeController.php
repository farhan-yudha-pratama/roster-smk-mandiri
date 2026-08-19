<?php

namespace App\Http\Controllers;

use App\Enums\WeekCycle;
use App\Models\MasterDay;
use App\Models\MasterUniform;
use App\Models\RosterSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
            'Sunday' => 'Minggu',
        ];
        $currentDay = $mapDay[Carbon::now()->format('l')] ?? 'Senin';
        // Simple logic for week cycle: odd or even week of the year
        $currentCycle = Carbon::now()->weekOfYear % 2 == 0 ? WeekCycle::EVEN->value : WeekCycle::ODD->value;

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
            'classroom',
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

        $currentTimeStr = Carbon::now('Asia/Jakarta')->format('H:i:s');
        $currentDayModel = MasterDay::with(['timeAllocations' => function ($q) {
            $q->orderBy('start_time', 'asc');
        }])->where('day_name', $currentDay)->first();

        $currentScheduleStatus = [
            'status' => 'NO_SCHEDULE',
            'message' => 'Tidak Ada Jadwal Hari Ini',
            'allocation' => null,
            'first_time' => null,
            'last_time' => null,
            'all_allocations' => [],
        ];

        if ($currentDayModel && $currentDayModel->timeAllocations->isNotEmpty()) {
            $allocations = $currentDayModel->timeAllocations;
            $firstAllocation = $allocations->first();
            $lastAllocation = $allocations->last();

            if ($currentTimeStr < $firstAllocation->start_time) {
                $currentScheduleStatus = [
                    'status' => 'NOT_STARTED',
                    'message' => 'JP Belum Dimulai',
                    'allocation' => null,
                    'first_time' => $firstAllocation->start_time,
                    'last_time' => $lastAllocation->end_time,
                    'all_allocations' => $allocations->values(),
                ];
            } elseif ($currentTimeStr > $lastAllocation->end_time) {
                $currentScheduleStatus = [
                    'status' => 'ENDED',
                    'message' => 'JP Sudah Selesai',
                    'allocation' => null,
                    'first_time' => $firstAllocation->start_time,
                    'last_time' => $lastAllocation->end_time,
                    'all_allocations' => $allocations->values(),
                ];
            } else {
                $active = $allocations->first(function ($alloc) use ($currentTimeStr) {
                    return $currentTimeStr >= $alloc->start_time && $currentTimeStr <= $alloc->end_time;
                });

                if ($active) {
                    $currentScheduleStatus = [
                        'status' => $active->type === 'break' ? 'BREAK' : 'ACTIVE',
                        'message' => $active->type === 'break' ? 'Sedang Istirahat' : 'Sedang Berlangsung',
                        'allocation' => $active,
                        'first_time' => $firstAllocation->start_time,
                        'last_time' => $lastAllocation->end_time,
                        'all_allocations' => $allocations->values(),
                    ];
                } else {
                    $currentScheduleStatus = [
                        'status' => 'BREAK',
                        'message' => 'Pergantian Jam',
                        'allocation' => null,
                        'first_time' => $firstAllocation->start_time,
                        'last_time' => $lastAllocation->end_time,
                        'all_allocations' => $allocations->values(),
                    ];
                }
            }
        }

        return Inertia::render('welcome', [
            'schedules' => $schedules,
            'filters' => $filters,
            'currentScheduleStatus' => $currentScheduleStatus,
            'currentTime' => Carbon::now('Asia/Jakarta')->format('H:i'),
        ]);
    }

    public function scheduleInfo()
    {
        $days = MasterDay::with([
            'timeAllocations' => function ($q) {
                $q->orderBy('start_time', 'asc');
            },
            'masterUniforms',
        ])->orderByRaw("FIELD(day_name, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')")->get();

        $anyDayUniforms = MasterUniform::where('is_any_day', true)->get();

        $carbonNow = Carbon::now('Asia/Jakarta');
        $mapDays = [
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
            'Sunday' => 'Minggu',
        ];
        $currentDayNameEn = $carbonNow->format('l');
        $currentDay = $mapDays[$currentDayNameEn] ?? 'Senin';

        return Inertia::render('ScheduleInfo', [
            'days' => $days,
            'anyDayUniforms' => $anyDayUniforms,
            'currentTime' => $carbonNow->format('H:i:s'),
            'currentDay' => $currentDay,
        ]);
    }
}
