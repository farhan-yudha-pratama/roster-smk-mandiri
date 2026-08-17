<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterHomeroomTeacher extends Model
{
    protected $table = 'master_homeroom_teachers';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'id',
        'teacher_name',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
