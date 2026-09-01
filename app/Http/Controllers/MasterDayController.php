<?php

namespace App\Http\Controllers;

use App\Models\MasterDay;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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

    public function export()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['No', 'ID Hari', 'Nama Hari', 'Catatan'];
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
        $sheet->getStyle('A1:D1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        $days = MasterDay::orderByRaw("FIELD(day_name, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')")->get();

        $row = 2;
        foreach ($days as $index => $day) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $day->id);
            $sheet->setCellValue('C' . $row, $day->day_name);
            $sheet->setCellValue('D' . $row, $day->notes);
            $row++;
        }
        
        $lastRow = $row - 1;
        if ($lastRow >= 2) {
            $sheet->getStyle('A2:D' . $lastRow)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    ],
                ],
            ]);
            $sheet->getStyle('A2:A' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        }
        
        $widths = [6, 15, 20, 40];
        foreach ($widths as $index => $width) {
            $sheet->getColumnDimension(chr(65 + $index))->setWidth($width);
        }
        
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Export_Hari_' . date('Y-m-d_His') . '.xlsx';
        
        $path = storage_path('app/public/exports');
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
        
        $filePath = $path . '/' . $fileName;
        $writer->save($filePath);
        
        return response()->download($filePath, $fileName)->deleteFileAfterSend(true);
    }
}
