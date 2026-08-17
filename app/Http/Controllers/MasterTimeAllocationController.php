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
        $allocations = MasterTimeAllocation::with('masterDay')
            ->orderBy('master_day_id')
            ->orderBy('start_time')
            ->get();
            
        $days = MasterDay::orderBy('id')->get();

        return Inertia::render('time-allocations/index', [
            'allocations' => $allocations,
            'days' => $days,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'master_day_id' => 'required|exists:master_days,id',
            'type' => ['required', Rule::in(['ceremony', 'period', 'break'])],
            'period_number' => 'nullable|integer|min:1',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'description' => 'nullable|string|max:255',
        ], [
            'master_day_id.required' => 'Hari wajib dipilih.',
            'type.required' => 'Tipe alokasi wajib dipilih.',
            'start_time.required' => 'Waktu mulai wajib diisi.',
            'end_time.required' => 'Waktu selesai wajib diisi.',
            'end_time.after' => 'Waktu selesai harus setelah waktu mulai.',
        ]);

        $id = 'TIME-' . strtoupper(Str::random(6));
        
        // Append seconds to time for database storing correctly if necessary, but H:i should be fine or H:i:s
        // Usually Laravel can handle H:i for time column, but to be safe, append :00
        $startTime = $validated['start_time'];
        if (strlen($startTime) == 5) $startTime .= ':00';
        
        $endTime = $validated['end_time'];
        if (strlen($endTime) == 5) $endTime .= ':00';

        MasterTimeAllocation::create([
            'id' => $id,
            'master_day_id' => $validated['master_day_id'],
            'type' => $validated['type'],
            'period_number' => $validated['type'] === 'period' ? $validated['period_number'] : null,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'description' => $validated['description'],
        ]);

        return redirect()->route('time-allocations.index')->with('success', 'Alokasi waktu berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $allocation = MasterTimeAllocation::findOrFail($id);

        $validated = $request->validate([
            'master_day_id' => 'required|exists:master_days,id',
            'type' => ['required', Rule::in(['ceremony', 'period', 'break'])],
            'period_number' => 'nullable|integer|min:1',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'description' => 'nullable|string|max:255',
        ], [
            'master_day_id.required' => 'Hari wajib dipilih.',
            'type.required' => 'Tipe alokasi wajib dipilih.',
            'start_time.required' => 'Waktu mulai wajib diisi.',
            'end_time.required' => 'Waktu selesai wajib diisi.',
            'end_time.after' => 'Waktu selesai harus setelah waktu mulai.',
        ]);
        
        $startTime = $validated['start_time'];
        if (strlen($startTime) == 5) $startTime .= ':00';
        
        $endTime = $validated['end_time'];
        if (strlen($endTime) == 5) $endTime .= ':00';

        $allocation->update([
            'master_day_id' => $validated['master_day_id'],
            'type' => $validated['type'],
            'period_number' => $validated['type'] === 'period' ? $validated['period_number'] : null,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'description' => $validated['description'],
        ]);

        return redirect()->route('time-allocations.index')->with('success', 'Alokasi waktu berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $allocation = MasterTimeAllocation::findOrFail($id);
        $allocation->delete();

        return redirect()->route('time-allocations.index')->with('success', 'Alokasi waktu berhasil dihapus.');
    }
}
