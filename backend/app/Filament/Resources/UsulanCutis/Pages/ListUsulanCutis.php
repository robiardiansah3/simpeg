<?php

namespace App\Filament\Resources\UsulanCutis\Pages;

use App\Filament\Resources\UsulanCutis\UsulanCutiResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListUsulanCutis extends ListRecords
{
    protected static string $resource = UsulanCutiResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // CreateAction::make(),
        ];
    }
}
