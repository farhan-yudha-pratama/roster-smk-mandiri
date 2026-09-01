<?php

namespace App\Http\Controllers;


use App\Enums\WeekCycle;
use App\Models\MasterClass;
use App\Models\MasterClassroom;
use App\Models\MasterHomeroomTeacher;
use App\Models\MasterSubject;
use App\Models\MasterTimeAllocation;
use App\Models\RosterSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class RosterScheduleController extends Controller
{
    /**
     * Resolve start_time dan end_time dari tabel master_time_allocations
     * berdasarkan hari, JP mulai, dan jumlah JP.
     *
     * Contoh: hari=Selasa, period_number=3, period_duration=2
     *   -> start_time = waktu mulai JP 3
     *   -> end_time   = waktu selesai JP 4 (3 + 2 - 1)
     */
    private function resolveTimeFromAllocation(string $day, int $periodNumber, int $periodDuration): array
    {
        $lastPeriod = $periodNumber + $periodDuration - 1;

        // Ambil start_time dari JP pertama
        $firstSlot = MasterTimeAllocation::whereHas('masterDays', function ($q) use ($day) {
            $q->where('master_days.day_name', $day);
        })
            ->where('type', 'period')
            ->where('period_number', $periodNumber)
            ->first();

        // Ambil end_time dari JP terakhir
        $lastSlot = MasterTimeAllocation::whereHas('masterDays', function ($q) use ($day) {
            $q->where('master_days.day_name', $day);
        })
            ->where('type', 'period')
            ->where('period_number', $lastPeriod)
            ->first();

        if (! $firstSlot) {
            abort(422, "JP ke-{$periodNumber} tidak ditemukan untuk hari {$day}.");
        }

        if (! $lastSlot) {
            abort(422, "JP ke-{$lastPeriod} (JP akhir) tidak ditemukan untuk hari {$day}. Periksa jumlah JP yang dimasukkan.");
        }

        return [
            'start_time' => $firstSlot->start_time,
            'end_time' => $lastSlot->end_time,
        ];
    }

    /**
     * Mendapatkan maksimal JP untuk hari tertentu.
     */
    private function getMaxPeriodForDay(string $day): int
    {
        return MasterTimeAllocation::whereHas('masterDays', function ($q) use ($day) {
            $q->where('master_days.day_name', $day);
        })
            ->where('type', 'period')
            ->max('period_number') ?? 10;
    }

    /**
     * Validasi request untuk jadwal.
     */
    private function validateScheduleRequest(Request $request): array
    {
        $day = $request->input('day');
        $maxPeriod = 10; // Default fallback
        if ($day) {
            $maxPeriod = $this->getMaxPeriodForDay($day);
        }

        return $request->validate([
            'class_id' => 'nullable|string|exists:master_classes,id',
            'day' => ['required', 'string', 'exists:master_days,day_name'],
            'week_cycle' => ['required', Rule::in(WeekCycle::values())],
            'period_number' => ['required', 'integer', 'min:1', "max:{$maxPeriod}"],
            'subject_id' => 'nullable|string|exists:master_subjects,id',
            'teacher_id' => 'nullable|string|exists:master_homeroom_teachers,id',
            'classroom_id' => 'nullable|string|exists:master_classrooms,id',
            'period_duration_hours' => [
                'required',
                'integer',
                'min:1',
                "max:{$maxPeriod}",
                function ($attribute, $value, $fail) use ($request, $maxPeriod) {
                    $periodNumber = (int) $request->input('period_number');
                    $duration = (int) $value;
                    if ($periodNumber && $duration) {
                        $total = $periodNumber + $duration - 1;
                        if ($total > $maxPeriod) {
                            $fail("Total durasi JP melebihi batas maksimal {$maxPeriod} JP untuk hari ".$request->input('day').'.');
                        }
                    }
                },
            ],
        ], [
            'class_id.exists' => 'Kelas yang dipilih tidak valid atau tidak ditemukan.',
            'day.required' => 'Hari wajib dipilih.',
            'day.exists' => 'Hari yang dipilih tidak ditemukan di database.',
            'week_cycle.required' => 'Siklus minggu wajib dipilih.',
            'week_cycle.in' => 'Siklus minggu tidak valid.',
            'period_number.required' => 'Jam ke- (JP) wajib diisi.',
            'period_number.integer' => 'Jam ke- (JP) harus berupa angka.',
            'period_number.min' => 'Jam ke- (JP) minimal bernilai 1.',
            'period_number.max' => "Jam ke- (JP) maksimal bernilai {$maxPeriod}.",
            'subject_id.exists' => 'Mata pelajaran yang dipilih tidak valid.',
            'teacher_id.exists' => 'Guru yang dipilih tidak valid.',
            'classroom_id.exists' => 'Ruangan yang dipilih tidak valid.',
            'period_duration_hours.required' => 'Durasi (Banyak JP) wajib diisi.',
            'period_duration_hours.integer' => 'Durasi (Banyak JP) harus berupa angka.',
            'period_duration_hours.min' => 'Durasi (Banyak JP) minimal bernilai 1.',
            'period_duration_hours.max' => "Durasi (Banyak JP) maksimal bernilai {$maxPeriod}.",
        ]);
    }

    public function index(Request $request)
    {
        if ($request->has('resetFilter')) {
            $request->session()->forget(['roster_gradeFilter', 'roster_dayFilter', 'roster_teacherFilter']);
            return redirect()->route('roster-schedules.index');
        }

        if ($request->has('gradeFilter')) {
            $request->session()->put('roster_gradeFilter', $request->gradeFilter);
        }
        if ($request->has('dayFilter')) {
            $request->session()->put('roster_dayFilter', $request->dayFilter);
        }
        if ($request->has('teacherFilter')) {
            $request->session()->put('roster_teacherFilter', $request->teacherFilter);
        }

        $gradeFilter = $request->session()->get('roster_gradeFilter', 'all');
        $dayFilter = $request->session()->get('roster_dayFilter', 'all');
        $teacherFilter = $request->session()->get('roster_teacherFilter', 'all');

        $query = RosterSchedule::with(['masterClass', 'subject', 'teacher', 'classroom']);

        if ($gradeFilter !== 'all') {
            $query->whereHas('masterClass', function ($q) use ($gradeFilter) {
                $q->where('class_name', 'LIKE', $gradeFilter . ' %');
            });
        }

        if ($dayFilter !== 'all') {
            $query->where('day', $dayFilter);
        }

        if ($teacherFilter !== 'all') {
            $query->where('teacher_id', $teacherFilter);
        }

        // Apply general settings filters for hiding grades and majors
        $gradesEnum = \App\Enums\GradeLevel::values();
        $majorsEnum = \App\Enums\Major::values();
        $hiddenGrades = [];
        $hiddenMajors = [];

        foreach ($gradesEnum as $grade) {
            if (\App\Models\GeneralSetting::getValue('hide_roster_grade_' . strtolower($grade), 'false') === 'true') {
                $hiddenGrades[] = $grade;
            }
        }

        foreach ($majorsEnum as $major) {
            if (\App\Models\GeneralSetting::getValue('hide_roster_major_' . strtolower(str_replace(' ', '_', $major)), 'false') === 'true') {
                $hiddenMajors[] = $major;
            }
        }

        if (!empty($hiddenGrades)) {
            $query->whereHas('masterClass', function ($q) use ($hiddenGrades) {
                $q->whereNotIn('grade_level', $hiddenGrades);
            });
        }

        if (!empty($hiddenMajors)) {
            $query->whereHas('masterClass', function ($q) use ($hiddenMajors) {
                $q->whereNotIn('major', $hiddenMajors);
            });
        }

        $schedules = $query->paginate(20)->withQueryString();

        $classesQuery = MasterClass::query();
        if (!empty($hiddenGrades)) {
            $classesQuery->whereNotIn('grade_level', $hiddenGrades);
        }
        if (!empty($hiddenMajors)) {
            $classesQuery->whereNotIn('major', $hiddenMajors);
        }
        $classes = $classesQuery->get();
        $subjects = MasterSubject::all();
        $classrooms = MasterClassroom::all();

        $teachers = MasterHomeroomTeacher::all();

        $days = \App\Models\MasterDay::pluck('day_name')->toArray();
        $weekCycles = WeekCycle::values();

        // Kirim data alokasi waktu agar frontend bisa menampilkan info JP per hari
        $timeAllocations = MasterTimeAllocation::with('masterDays')
            ->where('type', 'period')
            ->orderBy('period_number')
            ->get();

        return Inertia::render('roster-schedules/index', [
            'schedules' => $schedules,
            'classes' => $classes,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'classrooms' => $classrooms,
            'days' => $days,
            'weekCycles' => $weekCycles,
            'timeAllocations' => $timeAllocations,
            'filters' => [
                'gradeFilter' => $gradeFilter,
                'dayFilter' => $dayFilter,
                'teacherFilter' => $teacherFilter,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateScheduleRequest($request);

        // Resolve waktu dari tabel alokasi berdasarkan hari dan nomor JP
        $times = $this->resolveTimeFromAllocation(
            $validated['day'],
            (int) $validated['period_number'],
            (int) $validated['period_duration_hours']
        );

        RosterSchedule::create([
            'id' => (string) Str::uuid(),
            'class_id' => $validated['class_id'] ?? null,
            'day' => $validated['day'],
            'week_cycle' => $validated['week_cycle'],
            'period_number' => $validated['period_number'],
            'start_time' => $times['start_time'],
            'end_time' => $times['end_time'],
            'subject_id' => $validated['subject_id'] ?? null,
            'teacher_id' => $validated['teacher_id'] ?? null,
            'classroom_id' => $validated['classroom_id'] ?? null,
            'period_duration_hours' => $validated['period_duration_hours'],
        ]);

        return redirect()->route('roster-schedules.index')->with('success', 'Jadwal berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $schedule = RosterSchedule::findOrFail($id);

        $validated = $this->validateScheduleRequest($request);

        // Resolve waktu dari tabel alokasi berdasarkan hari dan nomor JP
        $times = $this->resolveTimeFromAllocation(
            $validated['day'],
            (int) $validated['period_number'],
            (int) $validated['period_duration_hours']
        );

        $schedule->class_id = $validated['class_id'] ?? null;
        $schedule->day = $validated['day'];
        $schedule->week_cycle = $validated['week_cycle'];
        $schedule->period_number = $validated['period_number'];
        $schedule->start_time = $times['start_time'];
        $schedule->end_time = $times['end_time'];
        $schedule->subject_id = $validated['subject_id'] ?? null;
        $schedule->teacher_id = $validated['teacher_id'] ?? null;
        $schedule->classroom_id = $validated['classroom_id'] ?? null;
        $schedule->period_duration_hours = $validated['period_duration_hours'];

        $schedule->save();

        return redirect()->route('roster-schedules.index')->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $schedule = RosterSchedule::findOrFail($id);
        $schedule->delete();

        return redirect()->route('roster-schedules.index')->with('success', 'Jadwal berhasil dihapus.');
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $headers = ['No', 'ID Kelas', 'Hari', 'Siklus Minggu', 'JP Mulai Ke-', 'Durasi JP', 'ID Mata Pelajaran (Opsional)', 'ID Guru (Opsional)', 'ID Ruangan (Opsional)'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValue(chr(65 + $index) . '1', $header);
        }
        
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => \PhpOffice\PhpSpreadsheet\Style\Color::COLOR_WHITE]],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2563EB']],
        ];
        $sheet->getStyle('A1:I1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        $exampleData = [
            [1, 'X-PPL-GIM-1', 'Senin', 'GANJIL', 1, 2, 'MTK', 'BS', 'R-01'],
            [2, 'XI-TKJ-2', 'Selasa', 'GENAP', 3, 3, 'BING', 'AY', 'LAB-1'],
        ];

        $row = 2;
        foreach ($exampleData as $data) {
            foreach ($data as $index => $val) {
                $sheet->setCellValue(chr(65 + $index) . $row, $val);
            }
            $row++;
        }
        
        $sheet->getStyle('A2:I3')->applyFromArray(['borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]]);
        $sheet->getStyle('A2:I3')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        
        $widths = [5, 20, 15, 15, 15, 15, 25, 20, 20];
        foreach ($widths as $index => $width) {
            $sheet->getColumnDimension(chr(65 + $index))->setWidth($width);
        }

        // Dropdown for Hari
        $validDays = \App\Models\MasterDay::pluck('day_name')->toArray();
        $days = implode(',', $validDays);
        for ($i = 2; $i <= 100; $i++) {
            $validation = $sheet->getCell('C' . $i)->getDataValidation();
            $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
            $validation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_STOP);
            $validation->setAllowBlank(true);
            $validation->setShowDropDown(true);
            $validation->setShowErrorMessage(true);
            $validation->setErrorTitle('Pilihan Tidak Valid');
            $validation->setError('Pilih hari dari dropdown');
            $validation->setFormula1('"' . $days . '"');
        }

        // Dropdown for Siklus Minggu
        $cycles = implode(',', WeekCycle::values());
        for ($i = 2; $i <= 100; $i++) {
            $validation = $sheet->getCell('D' . $i)->getDataValidation();
            $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
            $validation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_STOP);
            $validation->setAllowBlank(true);
            $validation->setShowDropDown(true);
            $validation->setShowErrorMessage(true);
            $validation->setErrorTitle('Pilihan Tidak Valid');
            $validation->setError('Pilih siklus minggu dari dropdown');
            $validation->setFormula1('"' . $cycles . '"');
        }
        
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Jadwal_Mengajar.xlsx';
        
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
        
        $headers = ['No', 'ID Kelas', 'Hari', 'Siklus Minggu', 'JP Mulai Ke-', 'Durasi JP', 'ID Mata Pelajaran (Opsional)', 'ID Guru (Opsional)', 'ID Ruangan (Opsional)'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValue(chr(65 + $index) . '1', $header);
        }
        
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => \PhpOffice\PhpSpreadsheet\Style\Color::COLOR_WHITE]],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2563EB']],
        ];
        $sheet->getStyle('A1:I1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        $schedules = RosterSchedule::orderBy('class_id')->orderBy('day')->orderBy('period_number')->get();

        $row = 2;
        foreach ($schedules as $index => $schedule) {
            $sheet->setCellValue('A' . $row, $index + 1);
            $sheet->setCellValue('B' . $row, $schedule->class_id);
            $sheet->setCellValue('C' . $row, $schedule->day->value ?? $schedule->day);
            $sheet->setCellValue('D' . $row, $schedule->week_cycle->value ?? $schedule->week_cycle);
            $sheet->setCellValue('E' . $row, $schedule->period_number);
            $sheet->setCellValue('F' . $row, $schedule->period_duration_hours);
            $sheet->setCellValue('G' . $row, $schedule->subject_id);
            $sheet->setCellValue('H' . $row, $schedule->teacher_id);
            $sheet->setCellValue('I' . $row, $schedule->classroom_id);
            $row++;
        }
        
        $lastRow = $row - 1;
        if ($lastRow >= 2) {
            $sheet->getStyle('A2:I' . $lastRow)->applyFromArray(['borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]]);
            $sheet->getStyle('A2:I' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        }
        
        $widths = [5, 20, 15, 15, 15, 15, 25, 20, 20];
        foreach ($widths as $index => $width) {
            $sheet->getColumnDimension(chr(65 + $index))->setWidth($width);
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Export_Jadwal_Mengajar_' . date('Y-m-d_His') . '.xlsx';
        
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
                $classId = trim((string)($rows[$i][1] ?? ''));
                $day = trim((string)($rows[$i][2] ?? ''));
                $weekCycle = trim((string)($rows[$i][3] ?? ''));
                $periodNumber = trim((string)($rows[$i][4] ?? ''));
                $duration = trim((string)($rows[$i][5] ?? ''));
                $subjectId = trim((string)($rows[$i][6] ?? ''));
                $teacherId = trim((string)($rows[$i][7] ?? ''));
                $classroomId = trim((string)($rows[$i][8] ?? ''));

                if (!empty($classId) && !empty($day) && !empty($weekCycle) && !empty($periodNumber) && !empty($duration)) {
                    
                    // Validate basic requirements
                    $validDays = \App\Models\MasterDay::pluck('day_name')->toArray();
                    if (!in_array($day, $validDays) || !in_array($weekCycle, WeekCycle::values())) {
                        continue; // skip invalid enum values
                    }

                    if (!is_numeric($periodNumber) || !is_numeric($duration)) {
                        continue;
                    }

                    // Resolve time from allocation
                    try {
                        $times = $this->resolveTimeFromAllocation($day, (int)$periodNumber, (int)$duration);
                    } catch (\Exception $e) {
                        continue; // If resolving time fails (e.g. exceeds max period), skip this row
                    }

                    // Validate foreign keys implicitly (store will try to save, if it fails due to foreign key, it throws exception)
                    // Better to check if they exist or just rely on the DB throwing exception (which we catch broadly) or set to null if empty
                    
                    $subjectId = empty($subjectId) ? null : $subjectId;
                    $teacherId = empty($teacherId) ? null : $teacherId;
                    $classroomId = empty($classroomId) ? null : $classroomId;

                    RosterSchedule::create([
                        'id' => (string) Str::uuid(),
                        'class_id' => $classId,
                        'day' => $day,
                        'week_cycle' => $weekCycle,
                        'period_number' => (int)$periodNumber,
                        'start_time' => $times['start_time'],
                        'end_time' => $times['end_time'],
                        'subject_id' => $subjectId,
                        'teacher_id' => $teacherId,
                        'classroom_id' => $classroomId,
                        'period_duration_hours' => (int)$duration,
                    ]);

                    $inserted++;
                }
            }
            
            return redirect()->route('roster-schedules.index')->with('success', $inserted . ' jadwal berhasil diimport.');
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Gagal mengimport data: ' . $e->getMessage()]);
        }
    }
}
