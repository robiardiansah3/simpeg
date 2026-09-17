<?php

namespace App\Filament\Resources\JadwalAbsensis\Tables;

use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Table;

class JadwalAbsensisTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('hari')
                    ->label('Hari')
                    ->formatStateUsing(fn ($state) => ucfirst($state))
                    ->fontFamily('sans')
                    ->weight('bold'),

                IconColumn::make('is_active')
                    ->label('Status Aktif')
                    ->boolean(),

                TextColumn::make('jam_mulai')
                    ->label('Jam Mulai')
                    ->time('H:i')
                    ->sortable(),

                TextColumn::make('jam_selesai')
                    ->label('Jam Selesai')
                    ->time('H:i')
                    ->sortable(),
            ])
            ->filters([
                // No filters needed
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([]);
    }
}
