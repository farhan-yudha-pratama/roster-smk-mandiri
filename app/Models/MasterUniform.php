<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterUniform extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'uniform_name',
        'description',
        'is_any_day',
    ];

    protected $casts = [
        'is_any_day' => 'boolean',
    ];

    public function masterDays()
    {
        return $this->belongsToMany(MasterDay::class, 'master_day_uniforms', 'master_uniform_id', 'master_day_id');
    }

}
