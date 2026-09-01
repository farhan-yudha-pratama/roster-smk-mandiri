<?php

namespace App\Enums;

enum Major: string
{
    case TKR = 'TKR';
    case TSM = 'TSM';
    case TBKR = 'TBKR';
    case TKJ = 'TKJ';
    case RPL = 'RPL';
    case PPL_GIM = 'PPL-GIM';
    case TJK_TELEKOMUNIKASI = 'TJK-TELEKOMUNIKASI';
    case TO = 'TO';
    case T_TEP = 'T-TEP';
    case UMUM = 'UMUM';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
