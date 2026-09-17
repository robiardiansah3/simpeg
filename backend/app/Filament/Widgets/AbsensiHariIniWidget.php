<?php

namespace App\Filament\Widgets;

use App\Models\Absensi;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class AbsensiHariIniWidget extends BaseWidget
{
    protected static ?string $heading = 'Absensi Hari Ini';

    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';

    /**
     * Konfigurasi tabel untuk menampilkan status kehadiran pegawai hari ini di widget Filament.
     *
     * @param Table $table Objek tabel Filament.
     * @return Table
     */
    public function table(Table $table): Table
    {
        return $table
            ->query(
                Absensi::query()
                    ->with('pegawai')
                    ->whereDate('tanggal', today())
                    ->latest('waktu_masuk')
            )
            ->columns([
                TextColumn::make('pegawai.nbm')
                    ->label('NIP/NBM')
                    ->searchable()
                    ->placeholder('—'),

                TextColumn::make('pegawai.nama_lengkap')
                    ->label('Nama')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('pegawai.jabatan')
                    ->label('Jabatan')
                    ->placeholder('—'),

                TextColumn::make('waktu_masuk')
                    ->label('Masuk')
                    ->time('H:i')
                    ->sortable(),

                TextColumn::make('status_kehadiran')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match (strtolower($state)) {
                        'hadir'       => 'success',
                        'izin'        => 'info',
                        'sakit'       => 'warning',
                        'tidak_hadir' => 'danger',
                        'tugas_luar'  => 'primary',
                        default       => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match (strtolower($state)) {
                        'hadir'       => 'Hadir',
                        'izin'        => 'Izin',
                        'sakit'       => 'Sakit',
                        'tidak_hadir' => 'Tidak Hadir',
                        'tugas_luar'  => 'Tugas Luar',
                        default       => $state,
                    }),

                TextColumn::make('status_lokasi')
                    ->label('Lokasi')
                    ->badge()
                    ->color(fn (string $state): string => match (strtolower($state)) {
                        'valid'       => 'success',
                        'tidak_valid' => 'danger',
                        default       => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match (strtolower($state)) {
                        'valid'       => 'Dalam Radius',
                        'tidak_valid' => 'Luar Radius',
                        default       => $state,
                    }),

                TextColumn::make('jarak_meter')
                    ->label('Jarak')
                    ->suffix(' m')
                    ->sortable(),
            ])
            ->paginated([10, 25])
            ->defaultPaginationPageOption(10);
    }
}
