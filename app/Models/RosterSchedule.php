<?php

namespace App\Models;

use App\Enums\Day;
use App\Enums\WeekCycle;
use Illuminate\Database\Eloquent\Model;

class RosterSchedule extends Model
{
    protected $table = 'roster_schedules';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'class_id',
        'day',
        'week_cycle',
        'period_number',
        'start_time',
        'end_time',
        'subject_id',
        'teacher_id',
        'classroom_id',
        'period_duration_hours',
    ];

    public function masterClass()
    {
        return $this->belongsTo(MasterClass::class, 'class_id', 'id');
    }

    public function subject()
    {
        return $this->belongsTo(MasterSubject::class, 'subject_id', 'id');
    }

    public function teacher()
    {
        return $this->belongsTo(MasterHomeroomTeacher::class, 'teacher_id');
    }

    public function classroom()
    {
        return $this->belongsTo(MasterClassroom::class, 'classroom_id', 'id');
    }

    protected $casts = [
        'day' => Day::class,
        'week_cycle' => WeekCycle::class,
        'period_number' => 'integer',
        'period_duration_hours' => 'integer',
        'start_time' => 'string',
        'end_time' => 'string',
    ];
}
