<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterDay extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'id',
        'day_name',
        'uniform_description',
        'notes',
    ];

    public function timeAllocations()
    {
        return $this->hasMany(MasterTimeAllocation::class, 'master_day_id', 'id');
    }
}
