<?php

namespace App\Filament\Resources\Pegawais\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PegawaisTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('index')
                    ->rowIndex()
                    ->label('No')
                    ->width('50px'),

                ImageColumn::make('foto')
                    ->label('')
                    ->circular()
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->nama_lengkap) . '&color=ffffff&background=2E3182&size=64')
                    ->size(36),

                TextColumn::make('nbm')
                    ->label('NBM')
                    ->searchable()
                    ->copyable()
                    ->placeholder('—')
                    ->visibleFrom('md'),

                TextColumn::make('nama_lengkap')
                    ->label('Nama')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                TextColumn::make('jabatan')
                    ->label('Jabatan')
                    ->searchable()
                    ->placeholder('—')
                    ->visibleFrom('sm'),

                TextColumn::make('status_kepegawaian')
                    ->label('Kepegawaian')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'PTP'  => 'success',
                        'PTTP' => 'success',
                        'GTP'  => 'info',
                        'GTTP' => 'info',
                        'Kontrak' => 'warning',
                        default   => 'gray',
                    }),

                TextColumn::make('status')
                    ->label('Jenis')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'guru'  => 'info',
                        'pegawai(staf)' => 'success',
                        default   => 'gray',
                    })
                    ->placeholder('—'),

                TextColumn::make('nomor_telepon')
                    ->label('No. HP')
                    ->searchable()
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status_kepegawaian')
                    ->label('Status Kepegawaian')
                    ->options([
                        'PTP'     => 'PTP',
                        'PTTP'    => 'PTTP',
                        'GTP'     => 'GTP',
                        'GTTP'    => 'GTTP',
                        'Kontrak' => 'Kontrak',
                    ]),

                SelectFilter::make('status')
                    ->label('Jenis Pegawai')
                    ->options([
                        'guru' => 'Guru',
                        'pegawai(staf)' => 'Pegawai (Staf)',
                    ]),
            ])
            ->recordActions([
                \Filament\Actions\ViewAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->headerActions([
                // Disabled per request
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('nama_lengkap');
    }
}
