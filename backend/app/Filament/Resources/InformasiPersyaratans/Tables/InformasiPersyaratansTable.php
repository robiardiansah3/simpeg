<?php

namespace App\Filament\Resources\InformasiPersyaratans\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class InformasiPersyaratansTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('index')
                    ->rowIndex()
                    ->label('No')
                    ->width('50px'),
                TextColumn::make('judul')
                    ->label('Judul')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),
                TextColumn::make('deskripsi')
                    ->label('Deskripsi')
                    ->placeholder('—')
                    ->wrap()
                    ->visibleFrom('sm'),
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
                    ->label('Tambah Informasi')
                    ->icon('heroicon-o-plus'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
