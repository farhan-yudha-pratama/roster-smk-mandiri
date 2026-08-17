<?php

namespace App\Enums;

enum GradeLevel: string
{
    case X = 'X';
    case XI = 'XI';
    case XII = 'XII';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
