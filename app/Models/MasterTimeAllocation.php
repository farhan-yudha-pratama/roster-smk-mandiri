<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterTimeAllocation extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'master_day_id',
        'type',
        'period_number',
        'start_time',
        'end_time',
        'description',
    ];

    public function masterDay()
    {
        return $this->belongsTo(MasterDay::class, 'master_day_id', 'id');
    }
}
