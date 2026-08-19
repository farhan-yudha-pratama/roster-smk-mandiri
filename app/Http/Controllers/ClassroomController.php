<?php

namespace App\Http\Controllers;

use App\Enums\RoomType;
use App\Models\MasterClassroom;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    public function index()
    {
        $classrooms = MasterClassroom::all();
        $roomTypes = RoomType::values();

        return Inertia::render('classrooms/index', [
            'classrooms' => $classrooms,
            'roomTypes' => $roomTypes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|unique:master_classrooms,id|max:255',
            'room_name' => 'required|string|max:255',
            'room_type' => ['nullable', Rule::in(RoomType::values())],
        ]);

        MasterClassroom::create($request->all());

        return redirect()->route('classrooms.index')->with('success', 'Classroom created successfully.');
    }

    public function update(Request $request, $id)
    {
        $classroom = MasterClassroom::findOrFail($id);

        $request->validate([
            'room_name' => 'required|string|max:255',
            'room_type' => ['nullable', Rule::in(RoomType::values())],
        ]);

        if ($request->id && $request->id !== $id) {
            $request->validate([
                'id' => 'required|string|unique:master_classrooms,id|max:255',
            ]);
            $classroom->id = $request->id;
        }

        $classroom->room_name = $request->room_name;
        $classroom->room_type = $request->room_type;
        $classroom->save();

        return redirect()->route('classrooms.index')->with('success', 'Classroom updated successfully.');
    }

    public function destroy($id)
    {
        $classroom = MasterClassroom::findOrFail($id);
        $classroom->delete();

        return redirect()->route('classrooms.index')->with('success', 'Classroom deleted successfully.');
    }
}
