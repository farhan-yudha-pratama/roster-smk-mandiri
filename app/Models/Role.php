<?php

namespace App\Models;

use App\Enums\RoleType;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'roles';
    
    protected $fillable = [
        'name',
        'guard_name',
    ];

    protected $casts = [
        'name' => RoleType::class,
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'model_has_roles', 'role_id', 'model_id');
    }
}
