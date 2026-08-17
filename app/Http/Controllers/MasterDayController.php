<?php

namespace App\Http\Controllers;

use App\Models\MasterDay;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class MasterDayController extends Controller
{
    public function index()
    {
        $days = MasterDay::orderBy('id')->get();
        return Inertia::render('master-days/index', [
            'days' => $days,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'day_name' => 'required|string|max:255|unique:master_days,day_name',
            'uniform_description' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ], [
            'day_name.required' => 'Nama Hari wajib diisi.',
            'day_name.unique' => 'Nama Hari sudah terdaftar.',
        ]);

        $id = 'DAY-' . strtoupper($validated['day_name']);

        MasterDay::create([
            'id' => $id,
            'day_name' => $validated['day_name'],
            'uniform_description' => $validated['uniform_description'],
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('master-days.index')->with('success', 'Master Hari berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $day = MasterDay::findOrFail($id);

        $validated = $request->validate([
            'day_name' => 'required|string|max:255|unique:master_days,day_name,' . $id,
            'uniform_description' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ], [
            'day_name.required' => 'Nama Hari wajib diisi.',
            'day_name.unique' => 'Nama Hari sudah terdaftar.',
        ]);

        $day->update([
            'day_name' => $validated['day_name'],
            'uniform_description' => $validated['uniform_description'],
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('master-days.index')->with('success', 'Master Hari berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $day = MasterDay::findOrFail($id);
        $day->delete();

        return redirect()->route('master-days.index')->with('success', 'Master Hari berhasil dihapus.');
    }
}
