<?php

namespace App\Http\Controllers;

use App\Models\MasterSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = MasterSubject::all();
        return Inertia::render('subjects/index', [
            'subjects' => $subjects
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|unique:master_subjects,id|max:255',
            'subject_name' => 'required|string|max:255',
        ]);

        MasterSubject::create($request->all());

        return redirect()->route('subjects.index')->with('success', 'Subject created successfully.');
    }

    public function update(Request $request, $id)
    {
        $subject = MasterSubject::findOrFail($id);

        $request->validate([
            'subject_name' => 'required|string|max:255',
        ]);

        if ($request->id && $request->id !== $id) {
            $request->validate([
                'id' => 'required|string|unique:master_subjects,id|max:255',
            ]);
            $subject->id = $request->id;
        }

        $subject->subject_name = $request->subject_name;
        $subject->save();

        return redirect()->route('subjects.index')->with('success', 'Subject updated successfully.');
    }

    public function destroy($id)
    {
        $subject = MasterSubject::findOrFail($id);
        $subject->delete();

        return redirect()->route('subjects.index')->with('success', 'Subject deleted successfully.');
    }
}
