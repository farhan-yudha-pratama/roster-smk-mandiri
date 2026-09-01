<?php

namespace App\Http\Controllers;

use App\Enums\RoomType;
use App\Models\MasterClassroom;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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

    public function export()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['No', 'ID Ruangan', 'Nama Ruangan', 'Tipe Ruangan'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValue(chr(65 + $index) . '1', $header);
        }
        
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => \PhpOffice\PhpSpreadsheet\Style\Color::COLOR_WHITE]],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER, 'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2563EB']],
        ];
        $sheet->getStyle('A1:D1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        $classrooms = MasterClassroom::orderBy('room_name')->get();

        $row = 2;
        foreach ($classrooms as $index => $classroom) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $classroom->id);
            $sheet->setCellValue('C' . $row, $classroom->room_name);
            $sheet->setCellValue('D' . $row, $classroom->room_type ? $classroom->room_type->value : '');
            $row++;
        }
        
        $lastRow = $row - 1;
        if ($lastRow >= 2) {
            $sheet->getStyle('A2:D' . $lastRow)->applyFromArray(['borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]]);
            $sheet->getStyle('A2:A' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        }
        
        $widths = [5, 20, 30, 20];
        foreach ($widths as $index => $width) {
            $sheet->getColumnDimension(chr(65 + $index))->setWidth($width);
        }
        
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Export_Ruangan_' . date('Y-m-d_His') . '.xlsx';
        
        $path = storage_path('app/public/exports');
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
        
        $filePath = $path . '/' . $fileName;
        $writer->save($filePath);
        
        return response()->download($filePath, $fileName)->deleteFileAfterSend(true);
    }
}
