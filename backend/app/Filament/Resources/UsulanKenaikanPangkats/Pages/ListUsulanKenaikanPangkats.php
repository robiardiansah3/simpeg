<?php

namespace App\Filament\Resources\UsulanKenaikanPangkats\Pages;

use App\Filament\Resources\UsulanKenaikanPangkats\UsulanKenaikanPangkatResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListUsulanKenaikanPangkats extends ListRecords
{
    protected static string $resource = UsulanKenaikanPangkatResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // CreateAction::make(),
        ];
    }
}
