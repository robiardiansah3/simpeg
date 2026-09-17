<?php

namespace App\Filament\Resources\LokasiSekolahs\Schemas;

use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\View;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
// use Filament\Forms\Components\View;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class LokasiSekolahForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Lokasi Utama')
                    ->schema([
                        TextInput::make('nama_lokasi')
                            ->label('Nama Lokasi')
                            ->required()
                            ->placeholder('SMA Muhammadiyah 2 Metro'),

                        Textarea::make('alamat')
                            ->label('Alamat Lengkap')
                            ->required()
                            ->rows(2)
                            ->columnSpanFull()
                            ->helperText('Alamat tidak akan berubah secara otomatis saat menentukan lokasi baru pada peta.'),

                        Select::make('status')
                            ->label('Status Lokasi')
                            ->options([
                                'aktif'    => 'Aktif (Lokasi yang digunakan)',
                                'nonaktif' => 'Tidak Aktif (Tidak digunakan)',
                            ])
                            ->default('aktif')
                            ->required()
                            ->native(false),
                    ])
                    ->columns(2),

                Section::make('Peta Lokasi')
                    ->description('Klik pada peta untuk menentukan koordinat, atau isi manual di bawah ini.')
                    ->schema([
                        View::make('filament.components.lokasi-map')
                            ->columnSpanFull(),
                        // TextEntry::make('map')
                        //     ->state(
                        //         View::make('filament.components.lokasi-map')
                        //     )
                        //     ->columnSpanFull(),

                        TextInput::make('latitude')
                            ->label('Latitude')
                            ->required()
                            ->numeric()
                            ->live()
                            ->step(0.0000001),

                            // ->placeholder('-5.1780230'),

                        TextInput::make('longitude')
                            ->label('Longitude')
                            ->required()
                            ->numeric()
                            ->live()
                            ->step(0.0000001),

                            // ->placeholder('105.3005400'),

                        TextInput::make('radius_meter')
                            ->label('Radius Absensi (Meter)')
                            ->required()
                            ->numeric()
                            ->live()
                            // ->default(200)
                            ->suffix('meter')
                            ->minValue(50)
                            ->maxValue(2000)
                            ->helperText('Jarak maksimal dari sekolah yang diizinkan untuk absensi.'),
                    ])
                    ->columns(2),
            ]);
    }
}
