<?php

namespace App\Filament\Resources\InformasiPersyaratans\Pages;

use App\Filament\Resources\InformasiPersyaratans\InformasiPersyaratanResource;
use Filament\Resources\Pages\CreateRecord;

class CreateInformasiPersyaratan extends CreateRecord
{
    protected static string $resource = InformasiPersyaratanResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
