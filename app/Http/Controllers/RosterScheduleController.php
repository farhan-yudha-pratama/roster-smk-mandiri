<?php

namespace App\Http\Controllers;

use App\Models\RosterSchedule;
use App\Models\MasterClass;
use App\Models\MasterSubject;
use App\Models\User;
use App\Models\MasterClassroom;
use App\Enums\Day;
use App\Enums\WeekCycle;
use App\Enums\RoleType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class RosterScheduleController extends Controller
{
    public function index()
    {
        $schedules = RosterSchedule::with(['masterClass', 'subject', 'user', 'classroom'])->get();
        
        $classes = MasterClass::all();
        $subjects = MasterSubject::all();
        $classrooms = MasterClassroom::all();
        
        $teachers = User::whereHas('roles', function($q) {
            $q->where('name', RoleType::GURU->value);
        })->get();
        
        $days = Day::values();
        $weekCycles = WeekCycle::values();
        
        return Inertia::render('roster-schedules/index', [
            'schedules' => $schedules,
            'classes' => $classes,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'classrooms' => $classrooms,
            'days' => $days,
            'weekCycles' => $weekCycles,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'nullable|string|exists:master_classes,id',
            'day' => ['required', Rule::in(Day::values())],
            'week_cycle' => ['required', Rule::in(WeekCycle::values())],
            'period_number' => 'required|integer|min:1|max:20',
            'subject_id' => 'nullable|string|exists:master_subjects,id',
            'user_id' => 'nullable|exists:users,id',
            'classroom_id' => 'nullable|string|exists:master_classrooms,id',
            'period_duration_hours' => 'required|integer|min:1',
        ]);

        $data = $request->all();
        $data['id'] = (string) Str::uuid();

        RosterSchedule::create($data);

        return redirect()->route('roster-schedules.index')->with('success', 'Schedule created successfully.');
    }

    public function update(Request $request, $id)
    {
        $schedule = RosterSchedule::findOrFail($id);

        $request->validate([
            'class_id' => 'nullable|string|exists:master_classes,id',
            'day' => ['required', Rule::in(Day::values())],
            'week_cycle' => ['required', Rule::in(WeekCycle::values())],
            'period_number' => 'required|integer|min:1|max:20',
            'subject_id' => 'nullable|string|exists:master_subjects,id',
            'user_id' => 'nullable|exists:users,id',
            'classroom_id' => 'nullable|string|exists:master_classrooms,id',
            'period_duration_hours' => 'required|integer|min:1',
        ]);

        $schedule->class_id = $request->class_id;
        $schedule->day = $request->day;
        $schedule->week_cycle = $request->week_cycle;
        $schedule->period_number = $request->period_number;
        $schedule->subject_id = $request->subject_id;
        $schedule->user_id = $request->user_id;
        $schedule->classroom_id = $request->classroom_id;
        $schedule->period_duration_hours = $request->period_duration_hours;
        
        $schedule->save();

        return redirect()->route('roster-schedules.index')->with('success', 'Schedule updated successfully.');
    }

    public function destroy($id)
    {
        $schedule = RosterSchedule::findOrFail($id);
        $schedule->delete();

        return redirect()->route('roster-schedules.index')->with('success', 'Schedule deleted successfully.');
    }
}
