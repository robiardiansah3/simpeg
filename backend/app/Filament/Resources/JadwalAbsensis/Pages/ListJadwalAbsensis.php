<?php

namespace App\Filament\Resources\JadwalAbsensis\Pages;

use App\Filament\Resources\JadwalAbsensis\JadwalAbsensiResource;
use Filament\Resources\Pages\ListRecords;

class ListJadwalAbsensis extends ListRecords
{
    protected static string $resource = JadwalAbsensiResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
