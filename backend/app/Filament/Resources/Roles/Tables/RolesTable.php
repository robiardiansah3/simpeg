<?php

namespace App\Filament\Resources\Roles\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class RolesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('index')
                    ->rowIndex()
                    ->label('No')
                    ->width('50px'),
                TextColumn::make('display_name')
                    ->label('Nama Role')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),
                TextColumn::make('users_count')
                    ->counts('users')
                    ->label('Jumlah User')
                    ->badge()
                    ->color('primary')
                    ->alignCenter(),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->headerActions([
                \Filament\Actions\CreateAction::make()
                    ->label('Tambah Role')
                    ->icon('heroicon-o-plus'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
