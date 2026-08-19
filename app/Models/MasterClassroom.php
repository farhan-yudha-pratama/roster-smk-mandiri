<?php

namespace App\Models;

use App\Enums\RoomType;
use Illuminate\Database\Eloquent\Model;

class MasterClassroom extends Model
{
    protected $table = 'master_classrooms';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'room_name',
        'room_type',
    ];

    protected $casts = [
        'room_type' => RoomType::class,
    ];
}
