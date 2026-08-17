<?php

namespace App\Enums;

enum Day: string
{
    case MONDAY = 'Senin';
    case TUESDAY = 'Selasa';
    case WEDNESDAY = 'Rabu';
    case THURSDAY = 'Kamis';
    case FRIDAY = 'Jumat';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
