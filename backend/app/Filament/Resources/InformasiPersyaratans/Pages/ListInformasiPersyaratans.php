<?php

namespace App\Filament\Resources\InformasiPersyaratans\Pages;

use App\Filament\Resources\InformasiPersyaratans\InformasiPersyaratanResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListInformasiPersyaratans extends ListRecords
{
    protected static string $resource = InformasiPersyaratanResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
