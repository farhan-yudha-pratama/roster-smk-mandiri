<?php

namespace App\Http\Controllers;

use App\Models\MasterDay;
use App\Models\MasterTimeAllocation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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

        $id = 'TIME-'.strtoupper(Str::random(6));

        $startTime = $validated['start_time'];
        if (strlen($startTime) == 5) {
            $startTime .= ':00';
        }

        $endTime = $validated['end_time'];
        if (strlen($endTime) == 5) {
            $endTime .= ':00';
        }

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
        if (strlen($startTime) == 5) {
            $startTime .= ':00';
        }

        $endTime = $validated['end_time'];
        if (strlen($endTime) == 5) {
            $endTime .= ':00';
        }

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

    public function destroyBatch(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:master_time_allocations,id',
        ]);

        MasterTimeAllocation::whereIn('id', $request->ids)->delete();

        return redirect()->route('time-allocations.index')->with('success', count($request->ids) . ' jadwal waktu berhasil dihapus.');
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['No', 'Nama Jadwal', 'Tipe (Pelajaran/Istirahat/Upacara)', 'JP Ke', 'Waktu Mulai (HH:mm)', 'Waktu Selesai (HH:mm)', 'Hari (Pisahkan dengan koma)', 'Deskripsi'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValue(chr(65 + $index) . '1', $header);
        }
        
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => \PhpOffice\PhpSpreadsheet\Style\Color::COLOR_WHITE]],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2563EB']],
        ];
        $sheet->getStyle('A1:H1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        $exampleData = [
            [1, 'Jam Pelajaran 1', 'Pelajaran', 1, '07:15', '07:55', 'Senin,Selasa,Rabu,Kamis,Jumat', ''],
            [2, 'Istirahat 1', 'Istirahat', '', '09:55', '10:15', 'Senin,Selasa,Rabu,Kamis', 'Waktu istirahat pertama'],
            [3, 'Upacara Bendera', 'Upacara', '', '07:15', '08:00', 'Senin', 'Upacara Rutin'],
        ];

        $row = 2;
        foreach ($exampleData as $data) {
            foreach ($data as $index => $val) {
                $sheet->setCellValue(chr(65 + $index) . $row, $val);
            }
            $row++;
        }
        
        $sheet->getStyle('A2:H4')->applyFromArray(['borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]]);
        $sheet->getStyle('A2:A4')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        
        $widths = [5, 25, 30, 10, 20, 20, 30, 25];
        foreach ($widths as $index => $width) {
            $sheet->getColumnDimension(chr(65 + $index))->setWidth($width);
        }
        
        // Set Data Validation for "Tipe" (Column C) as Dropdown
        for ($i = 2; $i <= 100; $i++) {
            $validation = $sheet->getCell('C' . $i)->getDataValidation();
            $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
            $validation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_STOP);
            $validation->setAllowBlank(true);
            $validation->setShowDropDown(true);
            $validation->setShowErrorMessage(true);
            $validation->setErrorTitle('Pilihan Tidak Valid');
            $validation->setError('Pilih dari dropdown (Pelajaran, Istirahat, Upacara)');
            $validation->setFormula1('"Pelajaran,Istirahat,Upacara"');
        }

        // Set Data Format for "Waktu Mulai" and "Waktu Selesai" (Columns E and F) as Time
        $sheet->getStyle('E2:F100')->getNumberFormat()->setFormatCode('hh:mm');
        
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Alokasi_Waktu.xlsx';
        
        // Save to storage instead of outputting directly to avoid shared hosting issues
        $path = storage_path('app/public/templates');
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
        
        $filePath = $path . '/' . $fileName;
        $writer->save($filePath);
        
        return response()->download($filePath, $fileName)->deleteFileAfterSend(false);
    }

    public function importBatch(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120'
        ], [
            'file.required' => 'File Excel wajib diunggah.',
            'file.mimes' => 'Format file harus berupa excel atau csv.',
            'file.max' => 'Ukuran file maksimal 5MB.'
        ]);

        try {
            $spreadsheet = IOFactory::load($request->file('file')->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();
            
            if (count($rows) <= 1) {
                return back()->withErrors(['file' => 'File Excel kosong atau tidak memiliki data.']);
            }

            // Find column indices based on header names (case-insensitive search)
            $header = $rows[0];
            $cols = [
                'name' => -1, 'type' => -1, 'period' => -1, 
                'start' => -1, 'end' => -1, 'days' => -1, 'desc' => -1
            ];
            
            foreach ($header as $index => $colText) {
                $col = strtolower((string)$colText);
                if (str_contains($col, 'nama jadwal') || str_contains($col, 'nama')) $cols['name'] = $index;
                elseif (str_contains($col, 'tipe')) $cols['type'] = $index;
                elseif (str_contains($col, 'jp ke') || str_contains($col, 'period')) $cols['period'] = $index;
                elseif (str_contains($col, 'waktu mulai') || str_contains($col, 'start')) $cols['start'] = $index;
                elseif (str_contains($col, 'waktu selesai') || str_contains($col, 'end')) $cols['end'] = $index;
                elseif (str_contains($col, 'hari')) $cols['days'] = $index;
                elseif (str_contains($col, 'deskripsi')) $cols['desc'] = $index;
            }

            // If headers not found by text, fallback to assumed positions (B,C,D,E,F,G,H)
            if ($cols['name'] === -1) {
                $cols = ['name' => 1, 'type' => 2, 'period' => 3, 'start' => 4, 'end' => 5, 'days' => 6, 'desc' => 7];
            }

            $inserted = 0;
            $allDays = MasterDay::all();

            for ($i = 1; $i < count($rows); $i++) {
                $name = $rows[$i][$cols['name']] ?? null;
                $typeRaw = $rows[$i][$cols['type']] ?? null;
                $period = $rows[$i][$cols['period']] ?? null;
                $start = $rows[$i][$cols['start']] ?? null;
                $end = $rows[$i][$cols['end']] ?? null;
                $daysRaw = $rows[$i][$cols['days']] ?? null;
                $desc = $rows[$i][$cols['desc']] ?? null;

                if (!empty($name) && !empty($typeRaw) && !empty($start) && !empty($end) && !empty($daysRaw)) {
                    // Normalize type
                    $typeRaw = strtolower(trim($typeRaw));
                    $type = 'period';
                    if (str_contains($typeRaw, 'istirahat')) $type = 'break';
                    if (str_contains($typeRaw, 'upacara')) $type = 'ceremony';

                    // Parse days
                    $dayNames = array_map('trim', explode(',', $daysRaw));
                    $dayIds = [];
                    foreach ($dayNames as $dName) {
                        $matchedDay = $allDays->first(function($d) use ($dName) {
                            return strtolower($d->day_name) === strtolower($dName);
                        });
                        if ($matchedDay) {
                            $dayIds[] = $matchedDay->id;
                        }
                    }

                    if (empty($dayIds)) continue; // skip if no valid days found

                    // Clean time (sometimes Excel returns decimal time, sometimes string HH:MM)
                    $parseTime = function($t) {
                        if (is_numeric($t)) {
                            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($t)->format('H:i');
                        }
                        $t = trim($t);
                        if (strlen($t) > 5) $t = substr($t, 0, 5); // cut seconds if any
                        return str_pad($t, 5, '0', STR_PAD_LEFT);
                    };

                    $start = $parseTime($start);
                    $end = $parseTime($end);
                    
                    // Generate ID
                    $id = 'TIME-'.strtoupper(Str::random(6));

                    $allocation = MasterTimeAllocation::create([
                        'id' => $id,
                        'name' => trim($name),
                        'type' => $type,
                        'period_number' => ($type === 'period' && is_numeric($period)) ? (int)$period : null,
                        'start_time' => $start . ':00',
                        'end_time' => $end . ':00',
                        'description' => $desc,
                    ]);

                    $allocation->masterDays()->sync($dayIds);
                    $inserted++;
                }
            }
            
            return redirect()->route('time-allocations.index')->with('success', $inserted . ' jadwal waktu berhasil diimport.');
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Gagal mengimport data: ' . $e->getMessage()]);
        }
    }
}
