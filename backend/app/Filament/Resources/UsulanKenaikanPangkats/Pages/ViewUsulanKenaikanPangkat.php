<?php

namespace App\Filament\Resources\UsulanKenaikanPangkats\Pages;

use App\Filament\Resources\UsulanKenaikanPangkats\UsulanKenaikanPangkatResource;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewUsulanKenaikanPangkat extends ViewRecord
{
    protected static string $resource = UsulanKenaikanPangkatResource::class;

    protected string $view = 'filament.pages.view-usulan-kenaikan-pangkat';

    protected function getHeaderActions(): array
    {
        return [];
    }
}
