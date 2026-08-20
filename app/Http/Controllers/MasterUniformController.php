<?php

namespace App\Http\Controllers;

use App\Models\MasterDay;
use App\Models\MasterUniform;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MasterUniformController extends Controller
{
    public function index()
    {
        $uniforms = MasterUniform::with('masterDays')->orderBy('id')->get();
        $days = MasterDay::orderByRaw("FIELD(day_name, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')")->get();

        return Inertia::render('master-uniforms/index', [
            'uniforms' => $uniforms,
            'days' => $days,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'uniform_name' => 'required|string|max:255|unique:master_uniforms,uniform_name',
            'description' => 'nullable|string|max:255',
            'is_any_day' => 'boolean',
            'master_day_ids' => 'required_if:is_any_day,false|array',
            'master_day_ids.*' => 'exists:master_days,id',
        ], [
            'uniform_name.required' => 'Nama seragam wajib diisi.',
            'uniform_name.unique' => 'Nama seragam sudah terdaftar.',
            'master_day_ids.required_if' => 'Pilih setidaknya satu hari atau centang "Berlaku di Semua Hari".',
        ]);

        $id = 'UNI-'.strtoupper(Str::random(6));

        $uniform = MasterUniform::create([
            'id' => $id,
            'uniform_name' => $validated['uniform_name'],
            'description' => $validated['description'],
            'is_any_day' => $request->boolean('is_any_day'),
        ]);

        if (! $request->boolean('is_any_day') && ! empty($validated['master_day_ids'])) {
            $uniform->masterDays()->sync($validated['master_day_ids']);
        }

        return redirect()->route('master-uniforms.index')->with('success', 'Seragam berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $uniform = MasterUniform::findOrFail($id);

        $validated = $request->validate([
            'uniform_name' => 'required|string|max:255|unique:master_uniforms,uniform_name,'.$id,
            'description' => 'nullable|string|max:255',
            'is_any_day' => 'boolean',
            'master_day_ids' => 'required_if:is_any_day,false|array',
            'master_day_ids.*' => 'exists:master_days,id',
        ], [
            'uniform_name.required' => 'Nama seragam wajib diisi.',
            'uniform_name.unique' => 'Nama seragam sudah terdaftar.',
            'master_day_ids.required_if' => 'Pilih setidaknya satu hari atau centang "Berlaku di Semua Hari".',
        ]);

        $uniform->update([
            'uniform_name' => $validated['uniform_name'],
            'description' => $validated['description'],
            'is_any_day' => $request->boolean('is_any_day'),
        ]);

        if ($request->boolean('is_any_day')) {
            $uniform->masterDays()->detach(); // If any day, remove specific bindings
        } else {
            $uniform->masterDays()->sync($validated['master_day_ids'] ?? []);
        }

        return redirect()->route('master-uniforms.index')->with('success', 'Seragam berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $uniform = MasterUniform::findOrFail($id);
        $uniform->delete();

        return redirect()->route('master-uniforms.index')->with('success', 'Seragam berhasil dihapus.');
    }
}
