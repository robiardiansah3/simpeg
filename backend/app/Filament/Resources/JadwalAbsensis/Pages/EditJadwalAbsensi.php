<?php

namespace App\Filament\Resources\JadwalAbsensis\Pages;

use App\Filament\Resources\JadwalAbsensis\JadwalAbsensiResource;
use Filament\Resources\Pages\EditRecord;

class EditJadwalAbsensi extends EditRecord
{
    protected static string $resource = JadwalAbsensiResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
