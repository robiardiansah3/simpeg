<?php

namespace App\Filament\Resources\UsulanKenaikanPangkats\Pages;

use App\Filament\Resources\UsulanKenaikanPangkats\UsulanKenaikanPangkatResource;
use Filament\Resources\Pages\CreateRecord;

class CreateUsulanKenaikanPangkat extends CreateRecord
{
    protected static string $resource = UsulanKenaikanPangkatResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
