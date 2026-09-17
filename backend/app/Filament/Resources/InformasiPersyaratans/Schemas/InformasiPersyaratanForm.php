<?php

namespace App\Filament\Resources\InformasiPersyaratans\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class InformasiPersyaratanForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('judul')
                    ->label('Judul')
                    ->required(),
                Textarea::make('deskripsi')
                    ->label('Deskripsi')
                    ->required()
                    ->columnSpanFull(),
            ]);
    }
}
