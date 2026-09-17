<?php

namespace App\Filament\Resources\Absensis\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Forms\Components\DatePicker;

class AbsensisTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('index')
                    ->rowIndex()
                    ->label('No')
                    ->width('50px'),

                TextColumn::make('pegawai.nbm')
                    ->label('NBM')
                    ->searchable()
                    ->placeholder('—')
                    ->visibleFrom('md'),

                TextColumn::make('pegawai.nama_lengkap')
                    ->label('Nama')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                TextColumn::make('pegawai.jabatan')
                    ->label('Jabatan')
                    ->placeholder('—')
                    ->visibleFrom('md'),

                TextColumn::make('waktu_masuk')
                    ->label('Masuk')
                    ->time('H:i')
                    ->placeholder('—'),

                TextColumn::make('status_kehadiran')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match (strtolower($state)) {
                        'hadir'      => 'success',
                        'alpha'      => 'danger',
                        'tidak_hadir' => 'danger',
                        'sakit'      => 'info',
                        'izin'       => 'info',
                        'tugas_luar' => 'primary',
                        default      => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match (strtolower($state)) {
                        'hadir'      => 'Hadir',
                        'alpha'      => 'Alpha',
                        'tidak_hadir' => 'Tidak Hadir',
                        'sakit'      => 'Sakit',
                        'izin'       => 'Izin',
                        'tugas_luar' => 'Tugas Luar',
                        default      => $state,
                    }),

                TextColumn::make('lokasi_masuk')
                    ->label('Lokasi Masuk')
                    ->placeholder('—')
                    ->words(2)
                    ->tooltip(fn ($state) => $state)
                    ->visibleFrom('sm'),
             ])
             ->filters([
                 SelectFilter::make('status_kehadiran')
                     ->label('Status Kehadiran')
                     ->options([
                         'hadir'      => 'Hadir',
                         'tidak_hadir' => 'Tidak Hadir',
                         'sakit'      => 'Sakit',
                         'izin'       => 'Izin',
                         'tugas_luar' => 'Tugas Luar',
                     ]),

                SelectFilter::make('status_lokasi')
                    ->label('Status Lokasi')
                    ->options([
                        'valid'       => 'Dalam Radius',
                        'tidak_valid' => 'Luar Radius',
                    ]),

                Filter::make('tanggal')
                    ->form([
                        DatePicker::make('dari')->label('Dari Tanggal'),
                        DatePicker::make('sampai')->label('Sampai Tanggal'),
                    ])
                    ->query(function (Builder $query, array $data) {
                        return $query
                            ->when($data['dari'], fn ($q, $d) => $q->whereDate('tanggal', '>=', $d))
                            ->when($data['sampai'], fn ($q, $d) => $q->whereDate('tanggal', '<=', $d));
                    }),
            ])
            ->headerActions([
                \Filament\Actions\ExportAction::make()
                    ->exporter(\App\Filament\Exports\AbsensiExporter::class)
            ])
            ->recordActions([
                \Filament\Actions\ViewAction::make(),
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('tanggal', 'desc');
    }
}
