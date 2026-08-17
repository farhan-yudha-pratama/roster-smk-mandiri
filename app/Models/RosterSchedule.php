<?php

namespace App\Models;

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
        'subject_id',
        'user_id',
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

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function classroom()
    {
        return $this->belongsTo(MasterClassroom::class, 'classroom_id', 'id');
    }

    protected $casts = [
        'day' => \App\Enums\Day::class,
        'week_cycle' => \App\Enums\WeekCycle::class,
        'period_number' => 'integer',
        'period_duration_hours' => 'integer',
    ];
}
