<?php

namespace App\Filament\Resources\LokasiSekolahs\Pages;

use App\Filament\Resources\LokasiSekolahs\LokasiSekolahResource;
use Filament\Resources\Pages\ViewRecord;

class ViewLokasiSekolah extends ViewRecord
{
    protected static string $resource = LokasiSekolahResource::class;

    protected string $view = 'filament.pages.view-lokasi-sekolah';

    protected function getHeaderActions(): array
    {
        return [];
    }
}
