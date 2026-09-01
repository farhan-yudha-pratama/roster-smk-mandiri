<?php

namespace App\Http\Controllers;

use App\Models\MasterDay;
use App\Models\MasterUniform;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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

    public function export()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['No', 'ID Seragam', 'Nama Seragam', 'Deskripsi', 'Berlaku Semua Hari', 'Hari Khusus'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValue(chr(65 + $index) . '1', $header);
        }
        
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['argb' => \PhpOffice\PhpSpreadsheet\Style\Color::COLOR_WHITE],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                ],
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => [
                    'argb' => 'FF2563EB',
                ],
            ],
        ];
        $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        $uniforms = MasterUniform::with('masterDays')->orderBy('uniform_name')->get();

        $row = 2;
        foreach ($uniforms as $index => $uniform) {
            $days = $uniform->is_any_day ? '-' : $uniform->masterDays->pluck('day_name')->join(', ');
            
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $uniform->id);
            $sheet->setCellValue('C' . $row, $uniform->uniform_name);
            $sheet->setCellValue('D' . $row, $uniform->description);
            $sheet->setCellValue('E' . $row, $uniform->is_any_day ? 'Ya' : 'Tidak');
            $sheet->setCellValue('F' . $row, $days);
            $row++;
        }
        
        $lastRow = $row - 1;
        if ($lastRow >= 2) {
            $sheet->getStyle('A2:F' . $lastRow)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    ],
                ],
            ]);
            $sheet->getStyle('A2:A' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('E2:E' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        }
        
        $widths = [6, 20, 25, 40, 20, 30];
        foreach ($widths as $index => $width) {
            $sheet->getColumnDimension(chr(65 + $index))->setWidth($width);
        }
        
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Export_Seragam_' . date('Y-m-d_His') . '.xlsx';
        
        $path = storage_path('app/public/exports');
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
        
        $filePath = $path . '/' . $fileName;
        $writer->save($filePath);
        
        return response()->download($filePath, $fileName)->deleteFileAfterSend(true);
    }
}
