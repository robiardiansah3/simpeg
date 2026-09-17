<?php

namespace App\Filament\Resources\JadwalAbsensis\Schemas;

use Filament\Schemas\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\TimePicker;
use Filament\Schemas\Schema;

class JadwalAbsensiForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Pengaturan Hari Absensi')
                    ->schema([
                        TextInput::make('hari')
                            ->label('Hari')
                            ->disabled()
                            ->dehydrated(false)
                            ->formatStateUsing(fn ($state) => ucfirst($state)),

                        Toggle::make('is_active')
                            ->label('Aktifkan Absensi Hari Ini')
                            ->default(true),

                        TimePicker::make('jam_mulai')
                            ->label('Jam Mulai Absensi')
                            ->required()
                            ->seconds(false),

                        TimePicker::make('jam_selesai')
                            ->label('Jam Selesai Absensi')
                            ->required()
                            ->seconds(false),
                    ])
                    ->columns(2),
            ]);
    }
}
