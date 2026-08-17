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
        $days = MasterDay::orderByRaw("FIELD(day_name, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')")->get();

        return Inertia::render('master-days/index', [
            'days' => $days,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:master_days,id|max:50',
            'day_name' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        MasterDay::create([
            'id' => strtoupper($validated['id']),
            'day_name' => $validated['day_name'],
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('master-days.index')->with('success', 'Master Hari berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $day = MasterDay::findOrFail($id);

        $validated = $request->validate([
            'day_name' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $day->update([
            'day_name' => $validated['day_name'],
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
