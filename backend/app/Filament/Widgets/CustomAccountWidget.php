<?php

namespace App\Filament\Widgets;

use Filament\Widgets\AccountWidget as BaseWidget;

class CustomAccountWidget extends BaseWidget
{
    protected string $view = 'filament.widgets.custom-account-widget';

    protected int | string | array $columnSpan = 'full';
}
