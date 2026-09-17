<?php

namespace App\Filament\Resources\LokasiSekolahs\Pages;

use App\Filament\Resources\LokasiSekolahs\LokasiSekolahResource;
use Filament\Resources\Pages\CreateRecord;

class CreateLokasiSekolah extends CreateRecord
{
    protected static string $resource = LokasiSekolahResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
