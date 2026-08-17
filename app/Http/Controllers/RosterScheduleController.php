<?php

namespace App\Http\Controllers;

use App\Models\RosterSchedule;
use App\Models\MasterClass;
use App\Models\MasterSubject;
use App\Models\MasterTimeAllocation;
use App\Models\User;
use App\Models\MasterClassroom;
use App\Enums\Day;
use App\Enums\WeekCycle;
use App\Enums\RoleType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class RosterScheduleController extends Controller
{
    /**
     * Mapping nama hari (Enum value) ke master_day_id di tabel master_days.
     */
    private function getDayId(string $day): string
    {
        $map = [
            'Senin'  => 'DAY-SENIN',
            'Selasa' => 'DAY-SELASA',
            'Rabu'   => 'DAY-RABU',
            'Kamis'  => 'DAY-KAMIS',
            'Jumat'  => 'DAY-JUMAT',
        ];

        return $map[$day] ?? 'DAY-' . strtoupper($day);
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
        $dayId      = $this->getDayId($day);
        $lastPeriod = $periodNumber + $periodDuration - 1;

        // Ambil start_time dari JP pertama
        $firstSlot = MasterTimeAllocation::whereHas('masterDays', function($q) use ($dayId) {
                $q->where('master_days.id', $dayId);
            })
            ->where('type', 'period')
            ->where('period_number', $periodNumber)
            ->first();

        // Ambil end_time dari JP terakhir
        $lastSlot = MasterTimeAllocation::whereHas('masterDays', function($q) use ($dayId) {
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
            'end_time'   => $lastSlot->end_time,
        ];
    }

    /**
     * Mendapatkan maksimal JP untuk hari tertentu.
     */
    private function getMaxPeriodForDay(string $day): int
    {
        $dayId = $this->getDayId($day);
        return MasterTimeAllocation::whereHas('masterDays', function($q) use ($dayId) {
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
            'class_id'              => 'nullable|string|exists:master_classes,id',
            'day'                   => ['required', Rule::in(Day::values())],
            'week_cycle'            => ['required', Rule::in(WeekCycle::values())],
            'period_number'         => ['required', 'integer', 'min:1', "max:{$maxPeriod}"],
            'subject_id'            => 'nullable|string|exists:master_subjects,id',
            'user_id'               => 'nullable|exists:users,id',
            'classroom_id'          => 'nullable|string|exists:master_classrooms,id',
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
                            $fail("Total durasi JP melebihi batas maksimal {$maxPeriod} JP untuk hari " . $request->input('day') . ".");
                        }
                    }
                }
            ],
        ]);
    }

    public function index()
    {
        $schedules = RosterSchedule::with(['masterClass', 'subject', 'user', 'classroom'])->get();

        $classes    = MasterClass::all();
        $subjects   = MasterSubject::all();
        $classrooms = MasterClassroom::all();

        $teachers = User::whereHas('roles', function ($q) {
            $q->where('name', RoleType::GURU->value);
        })->get();

        $days       = Day::values();
        $weekCycles = WeekCycle::values();

        // Kirim data alokasi waktu agar frontend bisa menampilkan info JP per hari
        $timeAllocations = MasterTimeAllocation::with('masterDays')
            ->where('type', 'period')
            ->orderBy('period_number')
            ->get();

        return Inertia::render('roster-schedules/index', [
            'schedules'       => $schedules,
            'classes'         => $classes,
            'subjects'        => $subjects,
            'teachers'        => $teachers,
            'classrooms'      => $classrooms,
            'days'            => $days,
            'weekCycles'      => $weekCycles,
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
            'id'                    => (string) Str::uuid(),
            'class_id'              => $validated['class_id'] ?? null,
            'day'                   => $validated['day'],
            'week_cycle'            => $validated['week_cycle'],
            'period_number'         => $validated['period_number'],
            'start_time'            => $times['start_time'],
            'end_time'              => $times['end_time'],
            'subject_id'            => $validated['subject_id'] ?? null,
            'user_id'               => $validated['user_id'] ?? null,
            'classroom_id'          => $validated['classroom_id'] ?? null,
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

        $schedule->class_id              = $validated['class_id'] ?? null;
        $schedule->day                   = $validated['day'];
        $schedule->week_cycle            = $validated['week_cycle'];
        $schedule->period_number         = $validated['period_number'];
        $schedule->start_time            = $times['start_time'];
        $schedule->end_time              = $times['end_time'];
        $schedule->subject_id            = $validated['subject_id'] ?? null;
        $schedule->user_id               = $validated['user_id'] ?? null;
        $schedule->classroom_id          = $validated['classroom_id'] ?? null;
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
}

