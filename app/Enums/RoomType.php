<?php

namespace App\Enums;

enum RoomType: string
{
    case THEORY = 'Theory';
    case LABORATORY = 'Laboratory';
    case WORKSHOP = 'Workshop';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
