<?php

namespace App\Enums;

enum RoleType: string
{
    case SUPERADMIN = 'SUPERADMIN';
    case GURU = 'GURU';
    case TEKNISI = 'TEKNISI';
}
