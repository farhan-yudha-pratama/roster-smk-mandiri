<?php

namespace Database\Seeders;

use App\Models\MasterClass;
use App\Models\MasterClassroom;
use App\Models\MasterHomeroomTeacher;
use App\Models\MasterSubject;
use App\Models\RosterSchedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RosterScheduleSeeder extends Seeder
{
    /**
     * Mapping nama kelas dari roster.json ke ID di database.
     */
    protected array $classNameToId = [
        // Kelas X - TO (Teknik Otomotif)
        'X TO-1'                  => 'X-TO-1',
        'X TO-2'                  => 'X-TO-2',
        'X TO-3'                  => 'X-TO-3',
        'X TO-4'                  => 'X-TO-4',
        'X TO-5'                  => 'X-TO-5',
        'X TO-6'                  => 'X-TO-6',
        'X TO-7'                  => 'X-TO-7',
        'X TO-8'                  => 'X-TO-8',
        'X TO-9'                  => 'X-TO-9',
        // Kelas X - TJK Telekomunikasi
        'X TJK TELEKOMUNIKASI-1'  => 'X-TJK-TELEKOMUNIKASI-1',
        'X TJK TELEKOMUNIKASI-2'  => 'X-TJK-TELEKOMUNIKASI-2',
        'X TJK TELEKOMUNIKASI-3'  => 'X-TJK-TELEKOMUNIKASI-3',
        'X TJK TELEKOMUNIKASI-4'  => 'X-TJK-TELEKOMUNIKASI-4',
        // Kelas X - PPL GIM
        'X PPL GIM-1'             => 'X-PPL-GIM-1',
        'X PPL GIM-2'             => 'X-PPL-GIM-2',
        // Kelas XI - TKR
        'XI TKR-1'                => 'XI-TKR-1',
        'XI TKR-2'                => 'XI-TKR-2',
        'XI TKR-3'                => 'XI-TKR-3',
        // Kelas XI - T-TEP
        'XI T-TEP'                => 'XI-T-TEP',
        // Kelas XI - TSM
        'XI TSM-1'                => 'XI-TSM-1',
        'XI TSM-2'                => 'XI-TSM-2',
        'XI TSM-3'                => 'XI-TSM-3',
        'XI TSM-4'                => 'XI-TSM-4',
        // Kelas XI - TKJ
        'XI TKJ-1'                => 'XI-TKJ-1',
        'XI TKJ-2'                => 'XI-TKJ-2',
        'XI TKJ-3'                => 'XI-TKJ-3',
        'XI TKJ-4'                => 'XI-TKJ-4',
        // Kelas XI - RPL
        'XI RPL-1'                => 'XI-RPL-1',
        'XI RPL-2'                => 'XI-RPL-2',
        // Kelas XI - TBKR
        'XI TBKR'                 => 'XI-TBKR',
        // Kelas XII - TKR
        'XII TKR 1'               => 'XII-TKR-1',
        'XII TKR 2'               => 'XII-TKR-2',
        'XII TKR 3'               => 'XII-TKR-3',
        // Kelas XII - T-TEP
        'XII T-TEP'               => 'XII-T-TEP',
        // Kelas XII - TSM
        'XII TSM 1'               => 'XII-TSM-1',
        'XII TSM 2'               => 'XII-TSM-2',
        'XII TSM 3'               => 'XII-TSM-3',
        'XII TSM 4'               => 'XII-TSM-4',
        // Kelas XII - TKJ
        'XII TKJ 1'               => 'XII-TKJ-1',
        'XII TKJ 2'               => 'XII-TKJ-2',
        'XII TKJ 3'               => 'XII-TKJ-3',
        'XII TKJ 4'               => 'XII-TKJ-4',
        // Kelas XII - RPL
        'XII RPL 1'               => 'XII-RPL-1',
        'XII RPL 2'               => 'XII-RPL-2',
        // Kelas XII - TBKR
        'XII TBKR'                => 'XII-TBKR',
    ];

    /**
     * Mapping nama ruangan dari roster.json ke ID di database.
     */
    protected array $roomNameToId = [
        'LAB 1'             => 'LAB-1',
        'LAB 2'             => 'LAB-2',
        'LAB 3'             => 'LAB-3',
        'LAB 4'             => 'LAB-4',
        'LAB 5'             => 'LAB-5',
        'LAB INFOR'         => 'LAB-INFOR',
        'R. AXIOO'          => 'AXIOO',
        'R. TEORI 1'        => 'TEORI-1',
        'R. TEORI 2'        => 'TEORI-2',
        'R. TEORI 3'        => 'TEORI-3',
        'R. TEORI 4'        => 'TEORI-4',
        'R. TEORI 5'        => 'TEORI-5',
        'R. TEORI 6'        => 'TEORI-6',
        'R. TEORI 7'        => 'TEORI-7',
        'R. TEORI 8'        => 'TEORI-8',
        'R. TEORI 10'       => 'TEORI-10',
        'R. TEORI 11'       => 'TEORI-11',
        'R. TEORI 12'       => 'TEORI-12',
        'R. TEORI 13'       => 'TEORI-13',
        'R. TEORI 14'       => 'TEORI-14',
        'R. TEORI 15'       => 'TEORI-15',
        'R. TEORI 16'       => 'TEORI-16',
        'R. TEORI 17'       => 'TEORI-17',
        'R. TEORI 18'       => 'TEORI-18',
        'R. TEORI 19'       => 'TEORI-19',
        'R. MUSHOLLAH'      => 'MUSHOLLAH',
        'BKL TEORI TKR 1'   => 'BKL-TEORI-TKR-1',
        'BKL TEORI TKR 2'   => 'BKL-TEORI-TKR-2',
        'BKL TEORI TKR'     => 'BKL-TEORI-TKR',
        'BKL TEORI TBKR'    => 'BKL-TEORI-TBKR',
        'BKL TEORI TSM'     => 'BKL-TEORI-TSM',
        'BKL TKR'           => 'BKL-TKR',
        'BKL TSM'           => 'BKL-TSM',
        'BKL TBKR'          => 'BKL-TBKR',
    ];

    /**
     * Mapping nama mapel dari roster.json ke ID di database.
     */
    protected array $subjectNameToId = [
        'MTK'         => 'MTK',
        'PAI'         => 'PAI',
        'PJOK'        => 'PJOK',
        'BING'        => 'BING',
        'BIND'        => 'BIND',
        'PKn'         => 'PKN',
        'PIPAS'       => 'PIPAS',
        'SENI'        => 'SENI',
        'SEJARAH'     => 'SEJARAH',
        'DDPK'        => 'DDPK',
        'INFORMATIKA' => 'INFORMATIKA',
        'KIK'         => 'KIK',
        'KEJURUAN'    => 'KEJURUAN',
        'PILIHAN'     => 'PILIHAN',
    ];

    /**
     * Mapping nama guru dari roster.json ke ID di master_homeroom_teachers.
     * Format ID: 'GT-NAMAGURU' untuk membedakan dengan wali kelas (HR-XXX).
     */
    protected array $teacherNameToId = [
        'AGRI'          => 'GT-AGRI',
        'AGUNG'         => 'GT-AGUNG',
        'AGUSTINA'      => 'GT-AGUSTINA',
        'AL-HABIB'      => 'GT-AL-HABIB',
        'AMEL'          => 'GT-AMEL',
        'AMI'           => 'GT-AMI',
        'ANDI'          => 'GT-ANDI',
        'ARIANSYAH'     => 'GT-ARIANSYAH',
        'ASNAWI'        => 'GT-ASNAWI',
        'BUALA'         => 'GT-BUALA',
        'CHOIRI'        => 'GT-CHOIRI',
        'DENI'          => 'GT-DENI',
        'DEWI'          => 'GT-DEWI',
        'DIANI'         => 'GT-DIANI',
        'DODY'          => 'GT-DODY',
        'DONA'          => 'GT-DONA',
        'ENNI'          => 'GT-ENNI',
        'FADHIL'        => 'GT-FADHIL',
        'FARHAN'        => 'GT-FARHAN',
        'FARIDA'        => 'GT-FARIDA',
        'FENY'          => 'GT-FENY',
        'FIRIANI'       => 'GT-FIRIANI',
        'FITRIANI'      => 'GT-FITRIANI',
        'GINTING'       => 'GT-GINTING',
        'HABIB'         => 'GT-HABIB',
        'HENNY'         => 'GT-HENNY',
        'HIDAYAT'       => 'GT-HIDAYAT',
        'ICA'           => 'GT-ICA',
        'IMAM'          => 'GT-IMAM',
        'ISNA'          => 'GT-ISNA',
        'JABBAR'        => 'GT-JABBAR',
        'KHAIRUL'       => 'GT-KHAIRUL',
        'LILY'          => 'GT-LILY',
        'LUPPI'         => 'GT-LUPPI',
        'MAULANA'       => 'GT-MAULANA',
        'MAYA'          => 'GT-MAYA',
        'MISRIANI'      => 'GT-MISRIANI',
        'NANDA'         => 'GT-NANDA',
        'NURHAYATI'     => 'GT-NURHAYATI',
        'PANDI'         => 'GT-PANDI',
        'PURNAMA'       => 'GT-PURNAMA',
        'PUTRI'         => 'GT-PUTRI',
        'QORI'          => 'GT-QORI',
        'RAEL'          => 'GT-RAEL',
        'RAHMADANI'     => 'GT-RAHMADANI',
        'RAMSI'         => 'GT-RAMSI',
        'RANI'          => 'GT-RANI',
        'RIDHO'         => 'GT-RIDHO',
        'RIPAI'         => 'GT-RIPAI',
        'RIVALDI'       => 'GT-RIVALDI',
        'RODIATUN'      => 'GT-RODIATUN',
        'SIGIT'         => 'GT-SIGIT',
        'SITI NURSEHA'  => 'GT-SITI-NURSEHA',
        'SRI RIZKI'     => 'GT-SRI-RIZKI',
        'SRI RIZKY'     => 'GT-SRI-RIZKI',
        'SUBRATA'       => 'GT-SUBRATA',
        'SUHENDRA'      => 'GT-SUHENDRA',
        'SYAHFITRI'     => 'GT-SYAHFITRI',
        'TIKA'          => 'GT-TIKA',
        'ULFA'          => 'GT-ULFA',
        'WAY'           => 'GT-WAY',
        'WIWIK'         => 'GT-WIWIK',
        'WIWITONO'      => 'GT-WIWITONO',
        'YASMIN'        => 'GT-YASMIN',
        'ZAHRA'         => 'GT-ZAHRA',
        'ZAKIR'         => 'GT-ZAKIR',
        'ZAMIAT'        => 'GT-ZAMIAT',
        'ZUHUD'         => 'GT-ZUHUD',
    ];

    /**
     * Mapping nama hari dari roster.json ke nama hari di database.
     */
    protected array $dayMap = [
        'SENIN'   => 'Senin',
        'SELASA'  => 'Selasa',
        'RABU'    => 'Rabu',
        'KAMIS'   => 'Kamis',
        "JUM'AT"  => 'Jumat',
        'JUMAT'   => 'Jumat',
    ];

    /**
     * Mapping key minggu dari roster.json ke nilai week_cycle di database.
     */
    protected array $weekCycleMap = [
        'minggu_ganjil' => 'GANJIL',
        'minggu_genap'  => 'GENAP',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hapus semua roster schedule lama sebelum insert baru
        RosterSchedule::truncate();

        // Baca file roster.json dari root project
        $rosterPath = base_path('roster.json');
        if (!file_exists($rosterPath)) {
            $this->command->error('File roster.json tidak ditemukan di root project!');
            return;
        }

        $rosterData = json_decode(file_get_contents($rosterPath), true);
        if (!$rosterData || !isset($rosterData['kelas'])) {
            $this->command->error('Format roster.json tidak valid!');
            return;
        }

        // Pastikan semua master data tersedia sebelum insert jadwal
        $this->ensureMasterDataExists($rosterData['kelas']);

        // Build dan insert roster schedules
        $schedules = [];

        foreach ($rosterData['kelas'] as $kelasData) {
            $namaKelas = $kelasData['nama'];
            $classId   = $this->classNameToId[$namaKelas] ?? null;

            if (!$classId) {
                $this->command->warn("Kelas '{$namaKelas}' tidak ada di mapping, dilewati.");
                continue;
            }

            foreach ($kelasData['jadwal'] as $weekKey => $days) {
                $weekCycle = $this->weekCycleMap[$weekKey] ?? strtoupper($weekKey);

                foreach ($days as $dayKey => $slots) {
                    $day = $this->dayMap[$dayKey] ?? ucfirst(strtolower($dayKey));

                    foreach ($slots as $slot) {
                        $subjectId   = $this->resolveSubjectId($slot['mapel']);
                        $teacherId   = $this->resolveTeacherId($slot['guru']);
                        $classroomId = $this->resolveClassroomId($slot['ruang']);
                        $jpMulai     = (int) $slot['jp_mulai'];
                        $jpSelesai   = (int) $slot['jp_selesai'];
                        $duration    = $jpSelesai - $jpMulai + 1;

                        [$startTime, $endTime] = $this->calculateTime($day, $jpMulai, $jpSelesai);

                        $schedules[] = [
                            'id'                    => (string) Str::uuid(),
                            'class_id'              => $classId,
                            'day'                   => $day,
                            'week_cycle'            => $weekCycle,
                            'period_number'         => (string) $jpMulai,
                            'start_time'            => $startTime,
                            'end_time'              => $endTime,
                            'subject_id'            => $subjectId,
                            'teacher_id'            => $teacherId,
                            'classroom_id'          => $classroomId,
                            'period_duration_hours' => (string) $duration,
                            'created_at'            => now(),
                            'updated_at'            => now(),
                        ];
                    }
                }
            }
        }

        // Insert dalam batch 100
        foreach (array_chunk($schedules, 100) as $chunk) {
            RosterSchedule::insert($chunk);
        }

        $this->command->info('RosterScheduleSeeder: Berhasil insert ' . count($schedules) . ' jadwal dari roster.json.');
    }

    /**
     * Pastikan semua kelas, guru, ruangan, dan mapel yang ada di roster.json
     * sudah tersedia di database. Jika belum ada, buat secara otomatis.
     */
    protected function ensureMasterDataExists(array $kelasList): void
    {
        $this->command->info('Memastikan semua master data tersedia...');

        // 1. Pastikan semua mata pelajaran ada
        foreach ($this->subjectNameToId as $name => $id) {
            MasterSubject::firstOrCreate(
                ['id' => $id],
                ['subject_name' => $this->subjectDisplayName($name)]
            );
        }

        // 2. Pastikan semua ruangan ada
        foreach ($this->roomNameToId as $roomName => $roomId) {
            [$type, $displayName] = $this->inferRoomTypeAndName($roomName, $roomId);
            MasterClassroom::firstOrCreate(
                ['id' => $roomId],
                ['room_name' => $displayName, 'room_type' => $type]
            );
        }

        // 3. Kumpulkan semua guru unik dari roster.json dan pastikan ada di DB
        $uniqueTeachers = [];
        foreach ($kelasList as $kelasData) {
            foreach ($kelasData['jadwal'] as $days) {
                foreach ($days as $slots) {
                    foreach ($slots as $slot) {
                        $teacherName = $slot['guru'];
                        if (isset($this->teacherNameToId[$teacherName])) {
                            $teacherId = $this->teacherNameToId[$teacherName];
                            // Deduplication (SRI RIZKI dan SRI RIZKY -> satu entri)
                            if (!isset($uniqueTeachers[$teacherId])) {
                                $uniqueTeachers[$teacherId] = $teacherName;
                            }
                        }
                    }
                }
            }
        }

        foreach ($uniqueTeachers as $teacherId => $teacherName) {
            MasterHomeroomTeacher::firstOrCreate(
                ['id' => $teacherId],
                ['teacher_name' => ucwords(strtolower($teacherName)), 'user_id' => null]
            );
        }

        // 4. Pastikan semua kelas ada
        foreach ($kelasList as $kelasData) {
            $namaKelas = $kelasData['nama'];
            $waliKelas = $kelasData['wali_kelas'];
            $classId   = $this->classNameToId[$namaKelas] ?? null;

            if (!$classId) {
                continue;
            }

            $homeroomTeacherId = $this->resolveHomeroomTeacherId($namaKelas, $waliKelas);
            [$gradeLevel, $major] = $this->inferGradeLevelAndMajor($namaKelas);

            MasterClass::firstOrCreate(
                ['id' => $classId],
                [
                    'grade_level'                 => $gradeLevel,
                    'class_name'                  => $namaKelas,
                    'major'                       => $major,
                    'master_classroom_teacher_id' => $homeroomTeacherId,
                ]
            );
        }
    }

    /**
     * Resolve atau buat wali kelas dan return ID-nya.
     * Prioritas: cari berdasarkan teacher_name terlebih dahulu,
     * jika tidak ada buat baru dengan ID 'HR-{SAFENAME}'.
     */
    protected function resolveHomeroomTeacherId(string $namaKelas, string $waliKelas): ?string
    {
        $existing = MasterHomeroomTeacher::where('teacher_name', $waliKelas)->first();
        if ($existing) {
            return $existing->id;
        }

        $safeName  = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '-', $waliKelas));
        $teacherId = 'HR-' . $safeName;

        MasterHomeroomTeacher::firstOrCreate(
            ['id' => $teacherId],
            ['teacher_name' => $waliKelas, 'user_id' => null]
        );

        return $teacherId;
    }

    /**
     * Resolve subject_id dari nama mapel di roster.json.
     * Jika tidak ada mapping, buat mapel baru secara otomatis.
     */
    protected function resolveSubjectId(string $mapel): ?string
    {
        if (isset($this->subjectNameToId[$mapel])) {
            return $this->subjectNameToId[$mapel];
        }

        $id = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $mapel));
        MasterSubject::firstOrCreate(
            ['id' => $id],
            ['subject_name' => $mapel]
        );

        return $id;
    }

    /**
     * Resolve teacher_id dari nama guru di roster.json.
     */
    protected function resolveTeacherId(string $guru): ?string
    {
        return $this->teacherNameToId[$guru] ?? null;
    }

    /**
     * Resolve classroom_id dari nama ruangan di roster.json.
     * Jika tidak ada mapping, buat ruangan baru secara otomatis.
     */
    protected function resolveClassroomId(string $ruang): ?string
    {
        if (isset($this->roomNameToId[$ruang])) {
            return $this->roomNameToId[$ruang];
        }

        $id = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '-', $ruang));
        MasterClassroom::firstOrCreate(
            ['id' => $id],
            ['room_name' => $ruang, 'room_type' => 'Theory']
        );

        return $id;
    }

    /**
     * Hitung start_time dan end_time berdasarkan hari dan nomor JP.
     *
     * Senin  : JP mulai 08:00 (setelah upacara), Istirahat 1: 10:00-10:20, Istirahat 2: 12:20-13:00
     * Jumat  : JP mulai 07:30, 6 JP, Istirahat 1: 09:30-09:45
     * Reguler: JP mulai 07:30, 10 JP, Istirahat 1: 10:10-10:30, Istirahat 2: 12:30-13:10
     */
    protected function calculateTime(string $day, int $jpMulai, int $jpSelesai): array
    {
        $schedule  = $this->getDaySchedule($day);
        $startTime = $schedule[$jpMulai]['start'] ?? '00:00:00';
        $endTime   = $schedule[$jpSelesai]['end'] ?? '00:00:00';

        return [$startTime, $endTime];
    }

    /**
     * Mendapatkan tabel alokasi waktu per JP berdasarkan hari.
     * Sesuai dengan data di MasterScheduleSeeder.
     */
    protected function getDaySchedule(string $day): array
    {
        if ($day === 'Senin') {
            return [
                1  => ['start' => '08:00:00', 'end' => '08:40:00'],
                2  => ['start' => '08:40:00', 'end' => '09:20:00'],
                3  => ['start' => '09:20:00', 'end' => '10:00:00'],
                4  => ['start' => '10:20:00', 'end' => '11:00:00'], // +20 menit istirahat 1
                5  => ['start' => '11:00:00', 'end' => '11:40:00'],
                6  => ['start' => '11:40:00', 'end' => '12:20:00'],
                7  => ['start' => '13:00:00', 'end' => '13:40:00'], // +40 menit istirahat 2
                8  => ['start' => '13:40:00', 'end' => '14:20:00'],
                9  => ['start' => '14:20:00', 'end' => '15:00:00'],
                10 => ['start' => '15:00:00', 'end' => '15:40:00'],
            ];
        } elseif ($day === 'Jumat') {
            return [
                1 => ['start' => '07:30:00', 'end' => '08:10:00'],
                2 => ['start' => '08:10:00', 'end' => '08:50:00'],
                3 => ['start' => '08:50:00', 'end' => '09:30:00'],
                4 => ['start' => '09:45:00', 'end' => '10:25:00'], // +15 menit istirahat 1
                5 => ['start' => '10:25:00', 'end' => '11:05:00'],
                6 => ['start' => '11:05:00', 'end' => '11:45:00'],
            ];
        } else {
            // Selasa, Rabu, Kamis
            return [
                1  => ['start' => '07:30:00', 'end' => '08:10:00'],
                2  => ['start' => '08:10:00', 'end' => '08:50:00'],
                3  => ['start' => '08:50:00', 'end' => '09:30:00'],
                4  => ['start' => '09:30:00', 'end' => '10:10:00'],
                5  => ['start' => '10:30:00', 'end' => '11:10:00'], // +20 menit istirahat 1
                6  => ['start' => '11:10:00', 'end' => '11:50:00'],
                7  => ['start' => '11:50:00', 'end' => '12:30:00'],
                8  => ['start' => '13:10:00', 'end' => '13:50:00'], // +40 menit istirahat 2
                9  => ['start' => '13:50:00', 'end' => '14:30:00'],
                10 => ['start' => '14:30:00', 'end' => '15:10:00'],
            ];
        }
    }

    /**
     * Inferensikan grade level dan major dari nama kelas.
     */
    protected function inferGradeLevelAndMajor(string $namaKelas): array
    {
        $gradeLevel = 'X';
        if (str_starts_with($namaKelas, 'XI ')) {
            $gradeLevel = 'XI';
        } elseif (str_starts_with($namaKelas, 'XII ')) {
            $gradeLevel = 'XII';
        }

        $major = 'UMUM';
        if (str_contains($namaKelas, 'TO')) {
            $major = 'TO';
        } elseif (str_contains($namaKelas, 'TJK TELEKOMUNIKASI')) {
            $major = 'TJK-TELEKOMUNIKASI';
        } elseif (str_contains($namaKelas, 'PPL GIM')) {
            $major = 'PPL-GIM';
        } elseif (str_contains($namaKelas, 'TKR')) {
            $major = 'TKR';
        } elseif (str_contains($namaKelas, 'T-TEP')) {
            $major = 'T-TEP';
        } elseif (str_contains($namaKelas, 'TSM')) {
            $major = 'TSM';
        } elseif (str_contains($namaKelas, 'TKJ')) {
            $major = 'TKJ';
        } elseif (str_contains($namaKelas, 'RPL')) {
            $major = 'RPL';
        } elseif (str_contains($namaKelas, 'TBKR')) {
            $major = 'TBKR';
        }

        return [$gradeLevel, $major];
    }

    /**
     * Tentukan tipe dan nama tampilan ruangan berdasarkan ID.
     */
    protected function inferRoomTypeAndName(string $roomName, string $roomId): array
    {
        $type = 'Theory';
        if (
            str_contains($roomId, 'LAB') ||
            str_contains($roomId, 'BKL') ||
            str_contains($roomId, 'AXIOO')
        ) {
            $type = 'Laboratory';
        } elseif (str_contains($roomId, 'MUSHOLLAH')) {
            $type = null;
        }

        return [$type, $roomName];
    }

    /**
     * Kembalikan nama tampilan mata pelajaran yang lebih rapi.
     */
    protected function subjectDisplayName(string $name): string
    {
        $names = [
            'MTK'         => 'Matematika',
            'PAI'         => 'Pendidikan Agama Islam',
            'PJOK'        => 'Pendidikan Jasmani Olahraga dan Kesehatan',
            'BING'        => 'Bahasa Inggris',
            'BIND'        => 'Bahasa Indonesia',
            'PKn'         => 'Pendidikan Pancasila dan Kewarganegaraan',
            'PIPAS'       => 'Proyek IPAS',
            'SENI'        => 'Seni',
            'SEJARAH'     => 'Sejarah',
            'DDPK'        => 'Dasar Dasar Program Keahlian',
            'INFORMATIKA' => 'Informatika',
            'KIK'         => 'KIK',
            'KEJURUAN'    => 'Kejuruan',
            'PILIHAN'     => 'Pilihan',
        ];

        return $names[$name] ?? $name;
    }
}
