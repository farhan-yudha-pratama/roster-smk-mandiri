<?php

namespace App\Enums;

enum WeekCycle: string
{
    case ODD = 'GANJIL';
    case EVEN = 'GENAP';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
