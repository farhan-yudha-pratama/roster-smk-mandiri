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
        'master_uniform_id',
        'notes',
    ];

    public function masterUniforms()
    {
        return $this->belongsToMany(MasterUniform::class, 'master_day_uniforms', 'master_day_id', 'master_uniform_id');
    }

    public function timeAllocations()
    {
        return $this->belongsToMany(
            MasterTimeAllocation::class,
            'master_day_time_allocations',
            'master_day_id',
            'master_time_allocation_id'
        );
    }
}
