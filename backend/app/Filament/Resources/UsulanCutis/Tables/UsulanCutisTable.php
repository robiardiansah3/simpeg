<?php

namespace App\Filament\Resources\UsulanCutis\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class UsulanCutisTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('index')
                    ->rowIndex()
                    ->label('No')
                    ->width('50px'),

                TextColumn::make('pegawai.nama_lengkap')
                    ->label('Nama Pegawai')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                TextColumn::make('nomor_usulan')
                    ->label('No. Usulan')
                    ->searchable()
                    ->placeholder('—')
                    ->visibleFrom('md'),

                TextColumn::make('jenis_cuti')
                    ->label('Jenis Cuti')
                    ->searchable()
                    ->badge()
                    ->color('info'),

                TextColumn::make('tanggal_mulai')
                    ->label('Tgl Mulai')
                    ->date('d M Y')
                    ->sortable()
                    ->visibleFrom('md'),

                TextColumn::make('tanggal_selesai')
                    ->label('Tgl Selesai')
                    ->date('d M Y')
                    ->sortable()
                    ->visibleFrom('md'),

                TextColumn::make('durasi')
                    ->label('Durasi')
                    ->getStateUsing(function ($record): string {
                        if ($record->jumlah_hari) {
                            return $record->jumlah_hari . ' hari';
                        }
                        if ($record->tanggal_mulai && $record->tanggal_selesai) {
                            $diff = \Carbon\Carbon::parse($record->tanggal_mulai)
                                ->diffInDays(\Carbon\Carbon::parse($record->tanggal_selesai)) + 1;
                            return $diff . ' hari';
                        }
                        return '—';
                    })
                    ->visibleFrom('sm'),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'diajukan'       => 'warning',
                        'ditinjau_admin' => 'warning',
                        'revisi'         => 'danger',
                        'diteruskan'     => 'info',
                        'disetujui'      => 'success',
                        'ditolak'        => 'danger',
                        default          => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'diajukan'       => 'Diajukan',
                        'ditinjau_admin' => 'Ditinjau Admin',
                        'revisi'         => 'Revisi',
                        'diteruskan'     => 'Diteruskan',
                        'disetujui'      => 'Disetujui',
                        'ditolak'        => 'Ditolak',
                        default          => ucfirst($state),
                    }),

                TextColumn::make('tanggal_diajukan')
                    ->label('Tgl Diajukan')
                    ->date('d M Y')
                    ->sortable()
                    ->visibleFrom('lg'),

                TextColumn::make('tanggal_diverifikasi')
                    ->label('Tgl Diverifikasi')
                    ->date('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'diajukan'       => 'Diajukan',
                        'ditinjau_admin' => 'Ditinjau Admin',
                        'revisi'         => 'Revisi',
                        'diteruskan'     => 'Diteruskan',
                        'disetujui'      => 'Disetujui',
                        'ditolak'        => 'Ditolak',
                    ]),

                SelectFilter::make('jenis_cuti')
                    ->label('Jenis Cuti')
                    ->options([
                        'Cuti Tahunan'         => 'Cuti Tahunan',
                        'Cuti Sakit'           => 'Cuti Sakit',
                        'Cuti Melahirkan'      => 'Cuti Melahirkan',
                        'Cuti Alasan Penting'  => 'Cuti Alasan Penting',
                        'Cuti Besar'           => 'Cuti Besar',
                    ]),
            ])
            ->recordActions([
                \Filament\Actions\ViewAction::make(),
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->headerActions([
                \Filament\Actions\ExportAction::make()
                    ->exporter(\App\Filament\Exports\UsulanCutiExporter::class)
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
