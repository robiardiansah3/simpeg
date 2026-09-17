<?php

namespace App\Filament\Resources\UsulanKenaikanPangkats\RelationManagers;

use Filament\Actions\AssociateAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\DissociateAction;
use Filament\Actions\DissociateBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class DokumenRelationManager extends RelationManager
{
    protected static string $relationship = 'dokumen';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('nama_dokumen')
                    ->options([
                        'ktp' => 'KTP',
                        'kartu_keluarga' => 'Kartu Keluarga',
                        'ijazah' => 'Ijazah',
                        'sk_pengangkatan' => 'SK Pengangkatan',
                        'sk_pembagian_tugas' => 'SK Pembagian Tugas',
                    ])
                    ->required()
                    ->disabled(),
                \Filament\Forms\Components\FileUpload::make('file_dokumen')
                    ->disk('public')
                    ->directory('dokumen_ukp')
                    ->downloadable()
                    ->openable()
                    ->required()
                    ->disabled(),
                TextInput::make('tipe_file')
                    ->disabled(),
                TextInput::make('ukuran_file')
                    ->numeric()
                    ->disabled(),
                Select::make('status_validasi')
                    ->options(['pending' => 'Pending', 'valid' => 'Valid', 'revisi' => 'Revisi', 'ditolak' => 'Ditolak'])
                    ->default('pending')
                    ->required(),
                Textarea::make('catatan_validasi')
                    ->default(null)
                    ->columnSpanFull(),
            ]);
    }

    public function infolist(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('nama_dokumen')
                    ->badge(),
                TextEntry::make('file_dokumen')
                    ->label('File Dokumen')
                    ->formatStateUsing(fn ($state) => 'Lihat File')
                    ->url(fn ($record) => asset('storage/' . $record->file_dokumen), true)
                    ->color('primary'),
                TextEntry::make('tipe_file')
                    ->placeholder('-'),
                TextEntry::make('ukuran_file')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state / 1024, 2) . ' KB' : '-')
                    ->placeholder('-'),
                TextEntry::make('status_validasi')
                    ->badge(),
                TextEntry::make('catatan_validasi')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('nama_dokumen')
            ->columns([
                TextColumn::make('nama_dokumen')
                    ->badge(),
                TextColumn::make('file_dokumen')
                    ->label('File Dokumen')
                    ->formatStateUsing(fn ($state) => 'Lihat File')
                    ->url(fn ($record) => asset('storage/' . $record->file_dokumen), true)
                    ->color('primary'),
                TextColumn::make('tipe_file')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('ukuran_file')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state / 1024, 2) . ' KB' : '-')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('status_validasi')
                    ->badge(),
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
                //
            ])
            ->headerActions([
                // Disabled per request
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    // Disabled per request
                ]),
            ]);
    }
}
