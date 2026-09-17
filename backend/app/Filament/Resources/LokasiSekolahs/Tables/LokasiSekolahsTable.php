<?php

namespace App\Filament\Resources\LokasiSekolahs\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class LokasiSekolahsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nama_lokasi')
                    ->searchable(),
                TextColumn::make('latitude')
                    ->numeric()
                    ->sortable()
                    ->visibleFrom('sm'),
                TextColumn::make('longitude')
                    ->numeric()
                    ->sortable()
                    ->visibleFrom('sm'),
                TextColumn::make('radius_meter')
                    ->numeric()
                    ->sortable()
                    ->visibleFrom('sm'),
                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'aktif'    => 'success',
                        'nonaktif' => 'danger',
                        default    => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'aktif'    => 'Aktif',
                        'nonaktif' => 'Nonaktif',
                        default    => ucfirst($state),
                    }),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'aktif'    => 'Aktif',
                        'nonaktif' => 'Nonaktif',
                    ]),
            ])
            ->recordActions([
                \Filament\Actions\ViewAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
