<?php

namespace App\Http\Controllers;

use App\Models\MasterSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = MasterSubject::orderBy('subject_name', 'asc')->get();

        return Inertia::render('subjects/index', [
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|unique:master_subjects,id|max:255',
            'subject_name' => 'required|string|max:255',
        ]);

        MasterSubject::create($request->all());

        return redirect()->route('subjects.index')->with('success', 'Subject created successfully.');
    }

    public function update(Request $request, $id)
    {
        $subject = MasterSubject::findOrFail($id);

        $request->validate([
            'subject_name' => 'required|string|max:255',
        ]);

        if ($request->id && $request->id !== $id) {
            $request->validate([
                'id' => 'required|string|unique:master_subjects,id|max:255',
            ]);
            $subject->id = $request->id;
        }

        $subject->subject_name = $request->subject_name;
        $subject->save();

        return redirect()->route('subjects.index')->with('success', 'Subject updated successfully.');
    }

    public function destroy($id)
    {
        $subject = MasterSubject::findOrFail($id);
        $subject->delete();

        return redirect()->route('subjects.index')->with('success', 'Subject deleted successfully.');
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set header
        $sheet->setCellValue('A1', 'No');
        $sheet->setCellValue('B1', 'Nama Mata Pelajaran');
        
        // Style the header
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
                    'argb' => 'FF2563EB', // Blue-600 Tailwind color
                ],
            ],
        ];
        $sheet->getStyle('A1:B1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        // Add some example data
        $sheet->setCellValue('A2', 1);
        $sheet->setCellValue('B2', 'Matematika');
        $sheet->setCellValue('A3', 2);
        $sheet->setCellValue('B3', 'Bahasa Indonesia');
        
        // Add borders to example data
        $dataStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                ],
            ],
        ];
        $sheet->getStyle('A2:B3')->applyFromArray($dataStyle);
        
        // Center the number column
        $sheet->getStyle('A2:A3')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        
        // Set column widths
        $sheet->getColumnDimension('A')->setWidth(6);
        $sheet->getColumnDimension('B')->setWidth(30);
        
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Mata_Pelajaran.xlsx';

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
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120',
        ], [
            'file.required' => 'File Excel wajib diunggah.',
            'file.mimes' => 'Format file harus berupa excel atau csv.',
            'file.max' => 'Ukuran file maksimal 5MB.',
        ]);

        $file = $request->file('file');

        try {
            $spreadsheet = IOFactory::load($request->file('file')->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();
            
            if (count($rows) === 0) {
                return back()->withErrors(['file' => 'File Excel kosong.']);
            }

            // Find which column contains the subject name
            $header = $rows[0];
            $subjectColIndex = 0;
            foreach ($header as $index => $col) {
                if (stripos((string)$col, 'Nama Mata Pelajaran') !== false || stripos((string)$col, 'Mata Pelajaran') !== false || stripos((string)$col, 'Nama') !== false) {
                    $subjectColIndex = $index;
                    break;
                }
            }
            // Fallback if the first column is 'No'
            if ($subjectColIndex === 0 && count($header) > 1 && stripos((string)$header[0], 'No') !== false) {
                 $subjectColIndex = 1;
            }
            
            $inserted = 0;
            // Skip header (index 0)
            for ($i = 1; $i < count($rows); $i++) {
                $subjectName = $rows[$i][$subjectColIndex] ?? null;

                if (! empty($subjectName)) {
                    $words = explode(' ', trim($subjectName));
                    $abbr = '';
                    foreach ($words as $w) {
                        if (! empty($w)) {
                            $abbr .= strtoupper(substr($w, 0, 1));
                        }
                    }
                    if (strlen($abbr) < 3) {
                        $abbr = strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $subjectName), 0, 3));
                    }
                    if (empty($abbr)) {
                        $abbr = 'SUB';
                    }

                    $baseId = $abbr;
                    $counter = 1;
                    $id = $baseId;
                    while (MasterSubject::where('id', $id)->exists()) {
                        $id = $baseId.$counter;
                        $counter++;
                    }

                    MasterSubject::create([
                        'id' => $id,
                        'subject_name' => trim($subjectName),
                    ]);
                    $inserted++;
                }
            }

            return redirect()->route('subjects.index')->with('success', $inserted.' mata pelajaran berhasil diimport.');
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Gagal mengimport data: '.$e->getMessage()]);
        }
    }
}
