<?php

namespace App\Filament\Resources\UsulanCutis\Pages;

use App\Filament\Resources\UsulanCutis\UsulanCutiResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditUsulanCuti extends EditRecord
{
    protected static string $resource = UsulanCutiResource::class;

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
