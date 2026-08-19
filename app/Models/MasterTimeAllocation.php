<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterTimeAllocation extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'type',
        'period_number',
        'start_time',
        'end_time',
        'description',
    ];

    public function masterDays()
    {
        return $this->belongsToMany(
            MasterDay::class,
            'master_day_time_allocations',
            'master_time_allocation_id',
            'master_day_id'
        );
    }
}
