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
        $query = RosterSchedule::with(['masterClass', 'subject', 'teacher', 'classroom'])
            ->where('day', $todayIndo);

        // Apply general settings filters for hiding grades and majors
        $grades = \App\Enums\GradeLevel::values();
        $majors = \App\Enums\Major::values();
        $hiddenGrades = [];
        $hiddenMajors = [];

        foreach ($grades as $grade) {
            if (\App\Models\GeneralSetting::getValue('hide_roster_grade_' . strtolower($grade), 'false') === 'true') {
                $hiddenGrades[] = $grade;
            }
        }

        foreach ($majors as $major) {
            if (\App\Models\GeneralSetting::getValue('hide_roster_major_' . strtolower(str_replace(' ', '_', $major)), 'false') === 'true') {
                $hiddenMajors[] = $major;
            }
        }

        if (!empty($hiddenGrades)) {
            $query->whereHas('masterClass', function ($q) use ($hiddenGrades) {
                $q->whereNotIn('grade_level', $hiddenGrades);
            });
        }

        if (!empty($hiddenMajors)) {
            $query->whereHas('masterClass', function ($q) use ($hiddenMajors) {
                $q->whereNotIn('major', $hiddenMajors);
            });
        }

        $todaySchedules = $query->orderBy('start_time')
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

        // 4. Empty Rooms (Ruangan Kosong Hari Ini)
        $usedClassroomIds = RosterSchedule::where('day', $todayIndo)
            ->whereNotNull('classroom_id')
            ->pluck('classroom_id')
            ->unique()
            ->toArray();

        $emptyRoomsRaw = MasterClassroom::whereNotIn('id', $usedClassroomIds)->get();
        $emptyRooms = $emptyRoomsRaw->map(function ($room) {
            return [
                'room' => $room->room_name,
                'type' => $room->room_type ? $room->room_type->value : '-',
                'status' => 'Tidak dipakai hari ini',
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

        // 6. Top 20 Teachers by JP
        $jpCounts = RosterSchedule::whereNotNull('teacher_id')
            ->selectRaw('teacher_id, week_cycle, COUNT(*) as jp_count')
            ->groupBy('teacher_id', 'week_cycle')
            ->get();

        $teacherJpData = [];
        foreach ($jpCounts as $row) {
            $teacherId = $row->teacher_id;
            if (!isset($teacherJpData[$teacherId])) {
                $teacherJpData[$teacherId] = [
                    'ganjil' => 0,
                    'genap' => 0,
                    'total' => 0,
                ];
            }
            if ($row->week_cycle === 'GANJIL') {
                $teacherJpData[$teacherId]['ganjil'] += $row->jp_count;
            } else if ($row->week_cycle === 'GENAP') {
                $teacherJpData[$teacherId]['genap'] += $row->jp_count;
            }
            $teacherJpData[$teacherId]['total'] += $row->jp_count;
        }

        $teacherIds = array_keys($teacherJpData);
        $teachers = MasterHomeroomTeacher::whereIn('id', $teacherIds)->pluck('teacher_name', 'id');

        $topTeachersRaw = [];
        foreach ($teacherJpData as $id => $data) {
            $topTeachersRaw[] = [
                'name' => $teachers[$id] ?? $id,
                'ganjil' => $data['ganjil'],
                'genap' => $data['genap'],
                'total' => $data['total'],
            ];
        }

        usort($topTeachersRaw, function($a, $b) {
            return $b['total'] <=> $a['total'];
        });
        $topTeachers = array_slice($topTeachersRaw, 0, 20);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'todaySchedules' => $todaySchedules,
            'emptyRooms' => $emptyRooms,
            'uniforms' => $uniforms,
            'topTeachers' => $topTeachers,
            'todayDay' => $todayIndo,
            'currentDate' => Carbon::now()->translatedFormat('l, d F Y'),
        ]);
    }
}
