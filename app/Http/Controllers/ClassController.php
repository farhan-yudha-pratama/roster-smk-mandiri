<?php

namespace App\Http\Controllers;

use App\Models\MasterClass;
use App\Models\MasterHomeroomTeacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    public function index()
    {
        $classes = MasterClass::with('homeroomTeacher')->get();
        
        $teachers = \App\Models\MasterHomeroomTeacher::all();
        $gradeLevels = \App\Enums\GradeLevel::values();
        $majors = \App\Enums\Major::values();
        
        return Inertia::render('classes/index', [
            'classes' => $classes,
            'teachers' => $teachers,
            'gradeLevels' => $gradeLevels,
            'majors' => $majors,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|unique:master_classes,id|max:255',
            'grade_level' => ['required', \Illuminate\Validation\Rule::in(\App\Enums\GradeLevel::values())],
            'class_name' => 'required|string|max:255',
            'major' => ['required', \Illuminate\Validation\Rule::in(\App\Enums\Major::values())],
            'master_classroom_teacher_id' => 'nullable|string|exists:master_homeroom_teachers,id|unique:master_classes,master_classroom_teacher_id',
        ]);

        MasterClass::create($request->all());

        return redirect()->route('classes.index')->with('success', 'Class created successfully.');
    }

    public function update(Request $request, $id)
    {
        $masterClass = MasterClass::findOrFail($id);

        $request->validate([
            'grade_level' => ['required', \Illuminate\Validation\Rule::in(\App\Enums\GradeLevel::values())],
            'class_name' => 'required|string|max:255',
            'major' => ['required', \Illuminate\Validation\Rule::in(\App\Enums\Major::values())],
            'master_classroom_teacher_id' => 'nullable|string|exists:master_homeroom_teachers,id|unique:master_classes,master_classroom_teacher_id,' . $id . ',id',
        ]);

        if ($request->id && $request->id !== $id) {
            $request->validate([
                'id' => 'required|string|unique:master_classes,id|max:255',
            ]);
            $masterClass->id = $request->id;
        }

        $masterClass->grade_level = $request->grade_level;
        $masterClass->class_name = $request->class_name;
        $masterClass->major = $request->major;
        $masterClass->master_classroom_teacher_id = $request->master_classroom_teacher_id;
        $masterClass->save();

        return redirect()->route('classes.index')->with('success', 'Class updated successfully.');
    }

    public function destroy($id)
    {
        $masterClass = MasterClass::findOrFail($id);
        $masterClass->delete();

        return redirect()->route('classes.index')->with('success', 'Class deleted successfully.');
    }
}
