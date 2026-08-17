<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterSubject extends Model
{
    protected $table = 'master_subjects';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'id',
        'subject_name',
    ];
}
