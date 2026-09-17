<?php

namespace App\Filament\Resources\UsulanKenaikanPangkats\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class UsulanKenaikanPangkatsTable
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
                    ->copyable()
                    ->placeholder('—')
                    ->visibleFrom('md'),

                TextColumn::make('status_baru')
                    ->label('Target Pangkat')
                    ->placeholder('—')
                    ->visibleFrom('sm'),

                TextColumn::make('masa_kerja')
                    ->label('Masa Kerja')
                    ->getStateUsing(fn ($record) => $record->masa_kerja_tahun . ' Thn ' . $record->masa_kerja_bulan . ' Bln')
                    ->visibleFrom('sm'),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'diajukan'       => 'warning',
                        'ditinjau_admin' => 'info',
                        'diteruskan'     => 'info',
                        'revisi'         => 'danger',
                        'disetujui'      => 'success',
                        'ditolak'        => 'danger',
                        default          => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'diajukan'       => 'Diajukan',
                        'ditinjau_admin' => 'Ditinjau Admin',
                        'diteruskan'     => 'Diteruskan',
                        'revisi'         => 'Revisi',
                        'disetujui'      => 'Disetujui',
                        'ditolak'        => 'Ditolak',
                        default          => ucfirst($state),
                    }),

                TextColumn::make('status_pengajuan')
                    ->label('Status Pengajuan')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'belum diproses' => 'gray',
                        'diproses'       => 'warning',
                        'selesai'        => 'success',
                        default          => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'belum diproses' => 'Belum Diproses',
                        'diproses'       => 'Diproses',
                        'selesai'        => 'Selesai',
                        default          => ucfirst($state),
                    }),

                TextColumn::make('tanggal_diajukan')
                    ->label('Tgl Diajukan')
                    ->date('d M Y')
                    ->sortable()
                    ->visibleFrom('md'),

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
                        'diteruskan'     => 'Diteruskan',
                        'revisi'         => 'Revisi',
                        'disetujui'      => 'Disetujui',
                        'ditolak'        => 'Ditolak',
                    ]),
                SelectFilter::make('status_pengajuan')
                    ->label('Status Pengajuan')
                    ->options([
                        'belum diproses' => 'Belum Diproses',
                        'diproses'       => 'Diproses',
                        'selesai'        => 'Selesai',
                    ]),
            ])
            ->recordActions([
                \Filament\Actions\ViewAction::make(),
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->headerActions([
                \Filament\Actions\ExportAction::make()
                    ->exporter(\App\Filament\Exports\UsulanKenaikanPangkatExporter::class)
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            // Urutkan default: terbaru di atas
            ->defaultSort('created_at', 'desc');
    }
}
