<?php

namespace App\Http\Controllers;

use App\Models\MasterHomeroomTeacher;
use App\Models\User;
use App\Enums\RoleType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeroomTeacherController extends Controller
{
    public function index()
    {
        $teachers = MasterHomeroomTeacher::with('user')->get();
        
        $users = User::whereHas('roles', function($q) {
            $q->where('name', RoleType::GURU->value);
        })->get();
        
        return Inertia::render('homeroom-teachers/index', [
            'teachers' => $teachers,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|unique:master_homeroom_teachers,id|max:255',
            'teacher_name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id|unique:master_homeroom_teachers,user_id',
        ]);

        MasterHomeroomTeacher::create($request->all());

        return redirect()->route('homeroom-teachers.index')->with('success', 'Homeroom teacher created successfully.');
    }

    public function update(Request $request, $id)
    {
        $teacher = MasterHomeroomTeacher::findOrFail($id);

        $request->validate([
            'teacher_name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id|unique:master_homeroom_teachers,user_id,' . $id,
        ]);

        if ($request->id && $request->id !== $id) {
            $request->validate([
                'id' => 'required|string|unique:master_homeroom_teachers,id|max:255',
            ]);
            $teacher->id = $request->id;
        }

        $teacher->teacher_name = $request->teacher_name;
        $teacher->user_id = $request->user_id;
        $teacher->save();

        return redirect()->route('homeroom-teachers.index')->with('success', 'Homeroom teacher updated successfully.');
    }

    public function destroy($id)
    {
        $teacher = MasterHomeroomTeacher::findOrFail($id);
        $teacher->delete();

        return redirect()->route('homeroom-teachers.index')->with('success', 'Homeroom teacher deleted successfully.');
    }
}
