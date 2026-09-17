<?php

namespace App\Filament\Resources\UsulanKenaikanPangkats\Pages;

use App\Filament\Resources\UsulanKenaikanPangkats\UsulanKenaikanPangkatResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditUsulanKenaikanPangkat extends EditRecord
{
    protected static string $resource = UsulanKenaikanPangkatResource::class;

    protected function getHeaderActions(): array
    {
        return [
            //
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
