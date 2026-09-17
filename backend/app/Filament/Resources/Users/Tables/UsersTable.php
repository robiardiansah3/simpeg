<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('index')
                    ->rowIndex()
                    ->label('No')
                    ->width('50px'),

                TextColumn::make('name')
                    ->label('Nama')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                TextColumn::make('username')
                    ->label('Username')
                    ->searchable()
                    ->copyable()
                    ->badge()
                    ->color('gray'),

                TextColumn::make('role.display_name')
                    ->label('Role')
                    ->searchable()
                    ->sortable()
                    ->placeholder('—'),

                TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->copyable()
                    ->visibleFrom('md'),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'aktif' ? 'success' : 'danger')
                    ->formatStateUsing(fn (string $state): string => ucfirst($state)),

                TextColumn::make('created_at')
                    ->label('Bergabung')
                    ->date('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('role_id')
                    ->label('Role')
                    ->relationship('role', 'display_name'),

                SelectFilter::make('status')
                    ->label('Status')
                    ->options([
                        'aktif' => 'Aktif',
                        'nonaktif' => 'Nonaktif',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->headerActions([
                \Filament\Actions\CreateAction::make()
                    ->label('Tambah User')
                    ->icon('heroicon-o-plus'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
