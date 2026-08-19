<?php

namespace Database\Seeders;

use App\Enums\GradeLevel;
use App\Enums\Major;
use App\Enums\RoleType;
use App\Enums\RoomType;
use App\Models\MasterClass;
use App\Models\MasterClassroom;
use App\Models\MasterHomeroomTeacher;
use App\Models\MasterSubject;
use App\Models\User;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Classrooms
        $classrooms = [
            ['id' => 'LAB-1', 'room_name' => 'LAB 1', 'room_type' => RoomType::LABORATORY->value],
            ['id' => 'LAB-2', 'room_name' => 'LAB 2', 'room_type' => RoomType::LABORATORY->value],
            ['id' => 'LAB-3', 'room_name' => 'LAB 3', 'room_type' => RoomType::LABORATORY->value],
            ['id' => 'LAB-4', 'room_name' => 'LAB 4', 'room_type' => RoomType::LABORATORY->value],
            ['id' => 'LAB-5', 'room_name' => 'LAB 5', 'room_type' => RoomType::LABORATORY->value],
            ['id' => 'TEORI-11', 'room_name' => 'Ruang Teori 11', 'room_type' => RoomType::THEORY->value],
            ['id' => 'TEORI-10', 'room_name' => 'Ruang Teori 10', 'room_type' => RoomType::THEORY->value],
            ['id' => 'AXIOO', 'room_name' => 'Ruang Axioo', 'room_type' => RoomType::LABORATORY->value],
            ['id' => 'TEORI-17', 'room_name' => 'Ruang Teori 17', 'room_type' => RoomType::THEORY->value],
            ['id' => 'TEORI-18', 'room_name' => 'Ruang Teori 18', 'room_type' => RoomType::THEORY->value],
            ['id' => 'TEORI-19', 'room_name' => 'Ruang Teori 19', 'room_type' => RoomType::THEORY->value],
        ];

        foreach ($classrooms as $room) {
            MasterClassroom::updateOrCreate(['id' => $room['id']], $room);
        }

        // 2. Create Subjects
        $subjects = [
            ['id' => 'MTK', 'subject_name' => 'Matematika'],
            ['id' => 'PAI', 'subject_name' => 'Pendidikan Agama Islam'],
            ['id' => 'PJOK', 'subject_name' => 'Pendidikan Jasmani Olahraga dan Kesehatan'],
            ['id' => 'BING', 'subject_name' => 'Bahasa Inggris'],
            ['id' => 'BIND', 'subject_name' => 'Bahasa Indonesia'],
            ['id' => 'PKN', 'subject_name' => 'Pendidikan Pancasila dan Kewarganegaraan'],
            ['id' => 'PIPAS', 'subject_name' => 'Proyek IPAS'],
            ['id' => 'SENI', 'subject_name' => 'Seni'],
            ['id' => 'SEJARAH', 'subject_name' => 'Sejarah'],
            ['id' => 'DDPK', 'subject_name' => 'Dasar Dasar Program Keahlian'],
            ['id' => 'INFORMATIKA', 'subject_name' => 'Informatika'],
            ['id' => 'KIK', 'subject_name' => 'KIK'],
            ['id' => 'KEJURUAN', 'subject_name' => 'Kejuruan'],
            ['id' => 'PILIHAN', 'subject_name' => 'Pilihan'],
        ];

        foreach ($subjects as $sub) {
            MasterSubject::updateOrCreate(['id' => $sub['id']], $sub);
        }

        // Get a Guru user for relation
        $guruUser = User::whereHas('roles', function ($q) {
            $q->where('name', RoleType::GURU->value);
        })->first();

        // 3. Create Homeroom Teachers
        $homeroomTeachers = [
            ['id' => 'HR-001', 'teacher_name' => 'Maya Sari Dasopang', 'user_id' => null],
            ['id' => 'HR-002', 'teacher_name' => 'Wiwi Rahmadani', 'user_id' => null],
            ['id' => 'HR-003', 'teacher_name' => 'Henny Puspita', 'user_id' => null],
            ['id' => 'HR-004', 'teacher_name' => 'Lily Novelina Cahyani', 'user_id' => null],
            ['id' => 'HR-005', 'teacher_name' => 'Fatimah Dewi', 'user_id' => null],
            ['id' => 'HR-006', 'teacher_name' => 'Saharani Gibran Simatupang', 'user_id' => null],
            ['id' => 'HR-007', 'teacher_name' => 'Fitriyani Rambe', 'user_id' => null],
            ['id' => 'HR-008', 'teacher_name' => 'Alfandy Dachlan NST', 'user_id' => null],
            ['id' => 'HR-009', 'teacher_name' => 'Sri Rizky Ananda', 'user_id' => null],
            ['id' => 'HR-010', 'teacher_name' => 'M. Agri Febriansyah', 'user_id' => null],
            ['id' => 'HR-011', 'teacher_name' => 'Ridho Alfarizi Tanjung', 'user_id' => null],
            ['id' => 'HR-012', 'teacher_name' => 'Fatinah Zahra', 'user_id' => null],
            ['id' => 'HR-013', 'teacher_name' => 'Isna Nur Inda', 'user_id' => null],
            ['id' => 'HR-014', 'teacher_name' => 'Agung Dani Setiawan', 'user_id' => null],
            ['id' => 'HR-015', 'teacher_name' => 'Nurhayati Lubis', 'user_id' => null],
            ['id' => 'HR-016', 'teacher_name' => 'Rizka Amelia NST', 'user_id' => null],
            ['id' => 'HR-017', 'teacher_name' => 'Muhammad Al Habib Putra Erlangga', 'user_id' => null],
            ['id' => 'HR-018', 'teacher_name' => 'Farhan Yudha Pratama', 'user_id' => null],
            ['id' => 'HR-019', 'teacher_name' => 'Zamiat', 'user_id' => null],
            ['id' => 'HR-020', 'teacher_name' => 'Wiwitono', 'user_id' => null],
        ];

        foreach ($homeroomTeachers as $hr) {
            MasterHomeroomTeacher::updateOrCreate(['id' => $hr['id']], $hr);
        }

        // 4. Create Classes
        $classes = [
            ['id' => 'X-PPL-GIM-1', 'grade_level' => GradeLevel::X->value, 'class_name' => 'X PPL GIM 1', 'major' => Major::PPL_GIM->value, 'master_classroom_teacher_id' => 'HR-001'],
            ['id' => 'X-PPL-GIM-2', 'grade_level' => GradeLevel::X->value, 'class_name' => 'X PPL GIM 2', 'major' => Major::PPL_GIM->value, 'master_classroom_teacher_id' => 'HR-002'],
            ['id' => 'X-TJK-TELEKOMUNIKASI-1', 'grade_level' => GradeLevel::X->value, 'class_name' => 'X TJK TELEKOMUNIKASI 1', 'major' => Major::TJK_TELEKOMUNIKASI->value, 'master_classroom_teacher_id' => 'HR-003'],
            ['id' => 'X-TJK-TELEKOMUNIKASI-2', 'grade_level' => GradeLevel::X->value, 'class_name' => 'X TJK TELEKOMUNIKASI 2', 'major' => Major::TJK_TELEKOMUNIKASI->value, 'master_classroom_teacher_id' => 'HR-004'],
            ['id' => 'X-TJK-TELEKOMUNIKASI-3', 'grade_level' => GradeLevel::X->value, 'class_name' => 'X TJK TELEKOMUNIKASI 3', 'major' => Major::TJK_TELEKOMUNIKASI->value, 'master_classroom_teacher_id' => 'HR-005'],
            ['id' => 'X-TJK-TELEKOMUNIKASI-4', 'grade_level' => GradeLevel::X->value, 'class_name' => 'X TJK TELEKOMUNIKASI 4', 'major' => Major::TJK_TELEKOMUNIKASI->value, 'master_classroom_teacher_id' => 'HR-006'],
            ['id' => 'XI-TKJ-1', 'grade_level' => GradeLevel::XI->value, 'class_name' => 'XI TKJ 1', 'major' => Major::TKJ->value, 'master_classroom_teacher_id' => 'HR-007'],
            ['id' => 'XI-TKJ-2', 'grade_level' => GradeLevel::XI->value, 'class_name' => 'XI TKJ 2', 'major' => Major::TKJ->value, 'master_classroom_teacher_id' => 'HR-008'],
            ['id' => 'XI-TKJ-3', 'grade_level' => GradeLevel::XI->value, 'class_name' => 'XI TKJ 3', 'major' => Major::TKJ->value, 'master_classroom_teacher_id' => 'HR-009'],
            ['id' => 'XI-TKJ-4', 'grade_level' => GradeLevel::XI->value, 'class_name' => 'XI TKJ 4', 'major' => Major::TKJ->value, 'master_classroom_teacher_id' => 'HR-010'],
            ['id' => 'XI-RPL-1', 'grade_level' => GradeLevel::XI->value, 'class_name' => 'XI RPL 1', 'major' => Major::RPL->value, 'master_classroom_teacher_id' => 'HR-011'],
            ['id' => 'XI-RPL-2', 'grade_level' => GradeLevel::XI->value, 'class_name' => 'XI RPL 2', 'major' => Major::RPL->value, 'master_classroom_teacher_id' => 'HR-012'],
            ['id' => 'XII-TKJ-1', 'grade_level' => GradeLevel::XII->value, 'class_name' => 'XII TKJ 1', 'major' => Major::TKJ->value, 'master_classroom_teacher_id' => 'HR-013'],
            ['id' => 'XII-TKJ-2', 'grade_level' => GradeLevel::XII->value, 'class_name' => 'XII TKJ 2', 'major' => Major::TKJ->value, 'master_classroom_teacher_id' => 'HR-014'],
            ['id' => 'XII-TKJ-3', 'grade_level' => GradeLevel::XII->value, 'class_name' => 'XII TKJ 3', 'major' => Major::TKJ->value, 'master_classroom_teacher_id' => 'HR-015'],
            ['id' => 'XII-TKJ-4', 'grade_level' => GradeLevel::XII->value, 'class_name' => 'XII TKJ 4', 'major' => Major::TKJ->value, 'master_classroom_teacher_id' => 'HR-016'],
            ['id' => 'XII-RPL-1', 'grade_level' => GradeLevel::XII->value, 'class_name' => 'XII RPL 1', 'major' => Major::RPL->value, 'master_classroom_teacher_id' => 'HR-017'],
            ['id' => 'XII-RPL-2', 'grade_level' => GradeLevel::XII->value, 'class_name' => 'XII RPL 2', 'major' => Major::RPL->value, 'master_classroom_teacher_id' => 'HR-018'],
        ];

        foreach ($classes as $cls) {
            MasterClass::updateOrCreate(['id' => $cls['id']], $cls);
        }

        // 5. Call Dummy Schedule Seeder
        $this->call(DummyScheduleSeeder::class);
    }
}
