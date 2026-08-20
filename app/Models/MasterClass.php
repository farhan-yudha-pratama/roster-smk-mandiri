<?php

namespace App\Models;

use App\Enums\GradeLevel;
use App\Enums\Major;
use Illuminate\Database\Eloquent\Model;

class MasterClass extends Model
{
    protected $table = 'master_classes';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'grade_level',
        'class_name',
        'major',
        'master_classroom_teacher_id',
    ];

    public function homeroomTeacher()
    {
        return $this->belongsTo(MasterHomeroomTeacher::class, 'master_classroom_teacher_id', 'id');
    }

    protected $casts = [
        'grade_level' => GradeLevel::class,
        'major' => Major::class,
    ];
}
