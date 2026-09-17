<?php

namespace App\Filament\Resources\Absensis\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\TimePicker;
use Filament\Schemas\Schema;

class AbsensiForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Placeholder::make('nama_lengkap')
                    ->label('Nama Pegawai')
                    ->content(fn ($record) => $record?->pegawai?->nama_lengkap ?? '-'),
                Placeholder::make('nbm')
                    ->label('NBM')
                    ->content(fn ($record) => $record?->pegawai?->nbm ?? '-'),
                Placeholder::make('jabatan')
                    ->label('Jabatan')
                    ->content(fn ($record) => $record?->pegawai?->jabatan ?? '-'),
                DatePicker::make('tanggal')
                    ->disabled(),
                TimePicker::make('waktu_masuk')
                    ->disabled(),
                TextInput::make('latitude')
                    ->disabled(),
                TextInput::make('longitude')
                    ->disabled(),
                TextInput::make('lokasi_masuk')
                    ->disabled(),
                TextInput::make('jarak_meter')
                    ->disabled(),
                Select::make('status_lokasi')
                    ->options(['valid' => 'Valid', 'tidak_valid' => 'Tidak valid'])
                    ->disabled(),
                Select::make('status_kehadiran')
                    ->options([
                        'hadir'      => 'Hadir',
                        'izin'       => 'Izin',
                        'sakit'      => 'Sakit',
                        'tidak_hadir' => 'Tidak Hadir',
                        'tugas_luar' => 'Tugas Luar',
                    ])
                    ->required(),
                TextInput::make('device_info')
                    ->disabled(),
                TextInput::make('ip_address')
                    ->disabled(),
            ]);
    }
}
