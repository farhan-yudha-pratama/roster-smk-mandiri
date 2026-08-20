<?php

namespace App\Http\Controllers;

use App\Enums\RoleType;
use App\Models\MasterHomeroomTeacher;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class HomeroomTeacherController extends Controller
{
    public function index()
    {
        $teachers = MasterHomeroomTeacher::with('user')->get();

        $users = User::whereHas('roles', function ($q) {
            $q->where('name', RoleType::GURU->value);
        })->get();

        return Inertia::render('homeroom-teachers/index', [
            'teachers' => $teachers,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|unique:master_homeroom_teachers,id|max:255',
            'teacher_name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id|unique:master_homeroom_teachers,user_id',
        ]);

        MasterHomeroomTeacher::create($request->all());

        return redirect()->route('homeroom-teachers.index')->with('success', 'Homeroom teacher created successfully.');
    }

    public function update(Request $request, $id)
    {
        $teacher = MasterHomeroomTeacher::findOrFail($id);

        $request->validate([
            'teacher_name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id|unique:master_homeroom_teachers,user_id,'.$id,
        ]);

        if ($request->id && $request->id !== $id) {
            $request->validate([
                'id' => 'required|string|unique:master_homeroom_teachers,id|max:255',
            ]);
            $teacher->id = $request->id;
        }

        $teacher->teacher_name = $request->teacher_name;
        $teacher->user_id = $request->user_id;
        $teacher->save();

        return redirect()->route('homeroom-teachers.index')->with('success', 'Homeroom teacher updated successfully.');
    }

    public function destroy($id)
    {
        $teacher = MasterHomeroomTeacher::findOrFail($id);
        $teacher->delete();

        return redirect()->route('homeroom-teachers.index')->with('success', 'Homeroom teacher deleted successfully.');
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['No', 'Nama Guru'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValue(chr(65 + $index) . '1', $header);
        }
        
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => \PhpOffice\PhpSpreadsheet\Style\Color::COLOR_WHITE]],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2563EB']],
        ];
        $sheet->getStyle('A1:B1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        $exampleData = [
            [1, 'Budi Santoso, S.Pd.'],
            [2, 'Ani Yudhoyono, M.Kom.'],
        ];

        $row = 2;
        foreach ($exampleData as $data) {
            foreach ($data as $index => $val) {
                $sheet->setCellValue(chr(65 + $index) . $row, $val);
            }
            $row++;
        }
        
        $sheet->getStyle('A2:B3')->applyFromArray(['borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]]);
        $sheet->getStyle('A2:A3')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        
        $widths = [5, 40];
        foreach ($widths as $index => $width) {
            $sheet->getColumnDimension(chr(65 + $index))->setWidth($width);
        }
        
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Guru.xlsx';
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="'. urlencode($fileName).'"');
        $writer->save('php://output');
        exit;
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
                $teacherName = trim($rows[$i][1] ?? $rows[$i][0] ?? ''); // In case user removes the "No" column

                if (!empty($teacherName) && stripos($teacherName, 'Nama Guru') === false && is_numeric($teacherName) === false) {
                    
                    // Generate Acronym for ID
                    // e.g. "Budi Santoso, S.Pd." -> "BS"
                    $cleanName = preg_replace('/[^a-zA-Z\s]/', '', $teacherName); // remove titles like S.Pd. partially
                    $words = array_filter(explode(' ', trim($cleanName)));
                    $acronym = '';
                    $wordCount = 0;
                    foreach ($words as $w) {
                        if (!empty($w) && $wordCount < 3) {
                            $acronym .= mb_substr($w, 0, 1);
                            $wordCount++;
                        }
                    }
                    $acronym = strtoupper($acronym);
                    
                    if (empty($acronym)) {
                        $acronym = strtoupper(substr(trim($teacherName), 0, 3));
                    }
                    
                    $id = $acronym;
                    $counter = 1;
                    // Check if ID already exists for a different teacher name
                    // Actually, if we are importing, we might be updating the same teacher if the name matches.
                    $existingTeacher = MasterHomeroomTeacher::where('teacher_name', $teacherName)->first();
                    
                    if ($existingTeacher) {
                        $id = $existingTeacher->id;
                    } else {
                        while (MasterHomeroomTeacher::where('id', $id)->exists()) {
                            $id = $acronym . $counter;
                            $counter++;
                        }
                    }

                    // Create or update
                    MasterHomeroomTeacher::updateOrCreate(
                        ['id' => $id],
                        [
                            'teacher_name' => $teacherName,
                        ]
                    );

                    $inserted++;
                }
            }
            
            return redirect()->route('homeroom-teachers.index')->with('success', $inserted . ' guru berhasil diimport.');
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Gagal mengimport data: ' . $e->getMessage()]);
        }
    }
}
