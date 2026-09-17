<?php

namespace App\Filament\Resources\UsulanCutis\Pages;

use App\Filament\Resources\UsulanCutis\UsulanCutiResource;
use Filament\Resources\Pages\CreateRecord;

class CreateUsulanCuti extends CreateRecord
{
    protected static string $resource = UsulanCutiResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
