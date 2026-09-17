<?php

namespace App\Filament\Resources\InformasiPersyaratans\Pages;

use App\Filament\Resources\InformasiPersyaratans\InformasiPersyaratanResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditInformasiPersyaratan extends EditRecord
{
    protected static string $resource = InformasiPersyaratanResource::class;

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
