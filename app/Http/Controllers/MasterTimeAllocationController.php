<?php

namespace App\Http\Controllers;

use App\Models\MasterTimeAllocation;
use App\Models\MasterDay;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MasterTimeAllocationController extends Controller
{
    public function index()
    {
        // Fetch allocations with their attached days
        $allocations = MasterTimeAllocation::with('masterDays')->orderBy('start_time')->get();
        $days = MasterDay::orderByRaw("FIELD(day_name, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')")->get();

        return Inertia::render('time-allocations/index', [
            'allocations' => $allocations,
            'days' => $days,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['ceremony', 'period', 'break'])],
            'period_number' => 'nullable|integer|min:1',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'description' => 'nullable|string|max:255',
            'master_day_ids' => 'required|array|min:1',
            'master_day_ids.*' => 'exists:master_days,id',
        ], [
            'name.required' => 'Nama jadwal wajib diisi.',
            'type.required' => 'Tipe alokasi wajib dipilih.',
            'start_time.required' => 'Waktu mulai wajib diisi.',
            'end_time.required' => 'Waktu selesai wajib diisi.',
            'end_time.after' => 'Waktu selesai harus setelah waktu mulai.',
            'master_day_ids.required' => 'Pilih setidaknya satu hari untuk jadwal ini.',
            'master_day_ids.min' => 'Pilih setidaknya satu hari untuk jadwal ini.',
        ]);

        $id = 'TIME-' . strtoupper(Str::random(6));
        
        $startTime = $validated['start_time'];
        if (strlen($startTime) == 5) $startTime .= ':00';
        
        $endTime = $validated['end_time'];
        if (strlen($endTime) == 5) $endTime .= ':00';

        $allocation = MasterTimeAllocation::create([
            'id' => $id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'period_number' => $validated['type'] === 'period' ? $validated['period_number'] : null,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'description' => $validated['description'],
        ]);

        $allocation->masterDays()->sync($validated['master_day_ids']);

        return redirect()->route('time-allocations.index')->with('success', 'Jadwal waktu berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $allocation = MasterTimeAllocation::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['ceremony', 'period', 'break'])],
            'period_number' => 'nullable|integer|min:1',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'description' => 'nullable|string|max:255',
            'master_day_ids' => 'required|array|min:1',
            'master_day_ids.*' => 'exists:master_days,id',
        ], [
            'name.required' => 'Nama jadwal wajib diisi.',
            'type.required' => 'Tipe alokasi wajib dipilih.',
            'start_time.required' => 'Waktu mulai wajib diisi.',
            'end_time.required' => 'Waktu selesai wajib diisi.',
            'end_time.after' => 'Waktu selesai harus setelah waktu mulai.',
            'master_day_ids.required' => 'Pilih setidaknya satu hari untuk jadwal ini.',
            'master_day_ids.min' => 'Pilih setidaknya satu hari untuk jadwal ini.',
        ]);
        
        $startTime = $validated['start_time'];
        if (strlen($startTime) == 5) $startTime .= ':00';
        
        $endTime = $validated['end_time'];
        if (strlen($endTime) == 5) $endTime .= ':00';

        $allocation->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'period_number' => $validated['type'] === 'period' ? $validated['period_number'] : null,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'description' => $validated['description'],
        ]);

        $allocation->masterDays()->sync($validated['master_day_ids']);

        return redirect()->route('time-allocations.index')->with('success', 'Jadwal waktu berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $allocation = MasterTimeAllocation::findOrFail($id);
        $allocation->delete();

        return redirect()->route('time-allocations.index')->with('success', 'Jadwal waktu berhasil dihapus.');
    }
}
