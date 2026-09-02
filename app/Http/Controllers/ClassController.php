<?php

namespace App\Http\Controllers;

use App\Enums\GradeLevel;
use App\Enums\Major;
use App\Models\MasterClass;
use App\Models\MasterHomeroomTeacher;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ClassController extends Controller
{
    public function index()
    {
        $classes = MasterClass::with('homeroomTeacher')->get();

        $teachers = MasterHomeroomTeacher::all();
        $gradeLevels = GradeLevel::values();
        $majors = Major::values();

        return Inertia::render('classes/index', [
            'classes' => $classes,
            'teachers' => $teachers,
            'gradeLevels' => $gradeLevels,
            'majors' => $majors,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|unique:master_classes,id|max:255',
            'grade_level' => ['required', Rule::in(GradeLevel::values())],
            'class_name' => 'required|string|max:255',
            'major' => ['required', Rule::in(Major::values())],
            'master_classroom_teacher_id' => 'nullable|string|exists:master_homeroom_teachers,id|unique:master_classes,master_classroom_teacher_id',
        ]);

        MasterClass::create($request->all());

        return redirect()->route('classes.index')->with('success', 'Class created successfully.');
    }

    public function update(Request $request, $id)
    {
        $masterClass = MasterClass::findOrFail($id);

        $request->validate([
            'grade_level' => ['required', Rule::in(GradeLevel::values())],
            'class_name' => 'required|string|max:255',
            'major' => ['required', Rule::in(Major::values())],
            'master_classroom_teacher_id' => 'nullable|string|exists:master_homeroom_teachers,id|unique:master_classes,master_classroom_teacher_id,'.$id.',id',
        ]);

        if ($request->id && $request->id !== $id) {
            $request->validate([
                'id' => 'required|string|unique:master_classes,id|max:255',
            ]);
            $masterClass->id = $request->id;
        }

        $masterClass->grade_level = $request->grade_level;
        $masterClass->class_name = $request->class_name;
        $masterClass->major = $request->major;
        $masterClass->master_classroom_teacher_id = $request->master_classroom_teacher_id;
        $masterClass->save();

        return redirect()->route('classes.index')->with('success', 'Class updated successfully.');
    }

    public function destroy($id)
    {
        $masterClass = MasterClass::findOrFail($id);
        $masterClass->delete();

        return redirect()->route('classes.index')->with('success', 'Class deleted successfully.');
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['No', 'Tingkat (X/XI/XII)', 'Nama Kelas (1, 2, A, B)', 'Jurusan'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValue(chr(65 + $index) . '1', $header);
        }
        
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => \PhpOffice\PhpSpreadsheet\Style\Color::COLOR_WHITE]],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2563EB']],
        ];
        $sheet->getStyle('A1:D1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        $exampleData = [
            [1, 'X', '1', 'PPL-GIM'],
            [2, 'XI', '2', 'TKJ'],
            [3, 'XII', 'A', 'RPL'],
        ];

        $row = 2;
        foreach ($exampleData as $data) {
            foreach ($data as $index => $val) {
                $sheet->setCellValue(chr(65 + $index) . $row, $val);
            }
            $row++;
        }
        
        $sheet->getStyle('A2:D4')->applyFromArray(['borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]]);
        $sheet->getStyle('A2:A4')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        
        $widths = [5, 20, 25, 30];
        foreach ($widths as $index => $width) {
            $sheet->getColumnDimension(chr(65 + $index))->setWidth($width);
        }
        
        // Data Validation for Tingkat
        $gradeLevels = implode(',', \App\Enums\GradeLevel::values());
        for ($i = 2; $i <= 100; $i++) {
            $validation = $sheet->getCell('B' . $i)->getDataValidation();
            $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
            $validation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_STOP);
            $validation->setAllowBlank(true);
            $validation->setShowDropDown(true);
            $validation->setShowErrorMessage(true);
            $validation->setErrorTitle('Pilihan Tidak Valid');
            $validation->setError('Pilih tingkat dari dropdown');
            $validation->setFormula1('"' . $gradeLevels . '"');
        }

        // Data Validation for Jurusan
        $majors = implode(',', \App\Enums\Major::values());
        for ($i = 2; $i <= 100; $i++) {
            $validation = $sheet->getCell('D' . $i)->getDataValidation();
            $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
            $validation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_STOP);
            $validation->setAllowBlank(true);
            $validation->setShowDropDown(true);
            $validation->setShowErrorMessage(true);
            $validation->setErrorTitle('Pilihan Tidak Valid');
            $validation->setError('Pilih jurusan dari dropdown');
            $validation->setFormula1('"' . $majors . '"');
        }
        
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Kelas.xlsx';
        
        // Save to storage instead of outputting directly to avoid shared hosting issues
        $path = storage_path('app/public/templates');
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
        
        $filePath = $path . '/' . $fileName;
        $writer->save($filePath);
        
        return response()->download($filePath, $fileName)->deleteFileAfterSend(false);
    }

    public function export()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['No', 'Tingkat (X/XI/XII)', 'Nama Kelas (1, 2, A, B)', 'Jurusan'];
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
        
        $classes = MasterClass::orderBy('grade_level')->orderBy('major')->orderBy('class_name')->get();

        $row = 2;
        foreach ($classes as $index => $cls) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $cls->grade_level?->value ?? $cls->grade_level);
            $sheet->setCellValue('C' . $row, $cls->class_name);
            $sheet->setCellValue('D' . $row, $cls->major?->value ?? $cls->major);
            $row++;
        }
        
        $lastRow = $row - 1;
        if ($lastRow >= 2) {
            $sheet->getStyle('A2:D' . $lastRow)->applyFromArray(['borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]]);
            $sheet->getStyle('A2:A' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        }
        
        $widths = [5, 20, 25, 30];
        foreach ($widths as $index => $width) {
            $sheet->getColumnDimension(chr(65 + $index))->setWidth($width);
        }
        
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Export_Kelas_' . date('Y-m-d_His') . '.xlsx';
        
        $path = storage_path('app/public/exports');
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
        
        $filePath = $path . '/' . $fileName;
        $writer->save($filePath);
        
        return response()->download($filePath, $fileName)->deleteFileAfterSend(true);
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

            $inserted = 0;
            // Skip header (index 0)
            for ($i = 1; $i < count($rows); $i++) {
                $gradeLevel = trim($rows[$i][1] ?? '');
                $className = trim($rows[$i][2] ?? '');
                $major = trim($rows[$i][3] ?? '');

                if (!empty($gradeLevel) && !empty($className) && !empty($major)) {
                    
                    // Validate if they match Enums
                    if (!in_array($gradeLevel, GradeLevel::values()) || !in_array($major, Major::values())) {
                        continue; // skip invalid enum values
                    }

                    // Generate ID like X-PPL-GIM-1
                    $id = $gradeLevel . '-' . str_replace(' ', '-', strtoupper($major)) . '-' . strtoupper(str_replace(' ', '', $className));

                    // Create or update
                    MasterClass::updateOrCreate(
                        ['id' => $id],
                        [
                            'grade_level' => $gradeLevel,
                            'class_name' => $className,
                            'major' => $major,
                        ]
                    );

                    $inserted++;
                }
            }
            
            return redirect()->route('classes.index')->with('success', $inserted . ' kelas berhasil diimport.');
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Gagal mengimport data: ' . $e->getMessage()]);
        }
    }
}
