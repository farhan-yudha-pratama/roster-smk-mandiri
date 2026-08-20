<?php

namespace App\Http\Controllers;

use App\Enums\Day;
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
     * Mapping nama hari (Enum value) ke master_day_id di tabel master_days.
     */
    private function getDayId(string $day): string
    {
        $map = [
            'Senin' => 'DAY-SENIN',
            'Selasa' => 'DAY-SELASA',
            'Rabu' => 'DAY-RABU',
            'Kamis' => 'DAY-KAMIS',
            'Jumat' => 'DAY-JUMAT',
        ];

        return $map[$day] ?? 'DAY-'.strtoupper($day);
    }

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
        $dayId = $this->getDayId($day);
        $lastPeriod = $periodNumber + $periodDuration - 1;

        // Ambil start_time dari JP pertama
        $firstSlot = MasterTimeAllocation::whereHas('masterDays', function ($q) use ($dayId) {
            $q->where('master_days.id', $dayId);
        })
            ->where('type', 'period')
            ->where('period_number', $periodNumber)
            ->first();

        // Ambil end_time dari JP terakhir
        $lastSlot = MasterTimeAllocation::whereHas('masterDays', function ($q) use ($dayId) {
            $q->where('master_days.id', $dayId);
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
        $dayId = $this->getDayId($day);

        return MasterTimeAllocation::whereHas('masterDays', function ($q) use ($dayId) {
            $q->where('master_days.id', $dayId);
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
        if ($day && in_array($day, Day::values())) {
            $maxPeriod = $this->getMaxPeriodForDay($day);
        }

        return $request->validate([
            'class_id' => 'nullable|string|exists:master_classes,id',
            'day' => ['required', Rule::in(Day::values())],
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
        ]);
    }

    public function index()
    {
        $schedules = RosterSchedule::with(['masterClass', 'subject', 'teacher', 'classroom'])->get();

        $classes = MasterClass::all();
        $subjects = MasterSubject::all();
        $classrooms = MasterClassroom::all();

        $teachers = MasterHomeroomTeacher::all();

        $days = Day::values();
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
        $days = implode(',', Day::values());
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
                    if (!in_array($day, Day::values()) || !in_array($weekCycle, WeekCycle::values())) {
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
