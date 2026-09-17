<?php

namespace App\Filament\Resources\Pegawais;

use App\Filament\Resources\Pegawais\Pages\CreatePegawai;
use App\Filament\Resources\Pegawais\Pages\EditPegawai;
use App\Filament\Resources\Pegawais\Pages\ListPegawais;
use App\Filament\Resources\Pegawais\Schemas\PegawaiForm;
use App\Filament\Resources\Pegawais\Tables\PegawaisTable;
use App\Models\Pegawai;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PegawaiResource extends Resource
{
    protected static ?string $model = Pegawai::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedIdentification;
    protected static ?string $navigationLabel = 'Pegawai';
    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return PegawaiForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PegawaisTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPegawais::route('/'),
            'view' => Pages\ViewPegawai::route('/{record}'),
        ];
    }
}
