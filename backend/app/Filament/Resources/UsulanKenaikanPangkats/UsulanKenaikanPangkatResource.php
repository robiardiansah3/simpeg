<?php

namespace App\Filament\Resources\UsulanKenaikanPangkats;

use App\Filament\Resources\UsulanKenaikanPangkats\Pages\CreateUsulanKenaikanPangkat;
use App\Filament\Resources\UsulanKenaikanPangkats\Pages\EditUsulanKenaikanPangkat;
use App\Filament\Resources\UsulanKenaikanPangkats\Pages\ListUsulanKenaikanPangkats;
use App\Filament\Resources\UsulanKenaikanPangkats\Pages\ViewUsulanKenaikanPangkat;
use App\Filament\Resources\UsulanKenaikanPangkats\Schemas\UsulanKenaikanPangkatForm;
use App\Filament\Resources\UsulanKenaikanPangkats\Tables\UsulanKenaikanPangkatsTable;
use App\Models\UsulanKenaikanPangkat;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class UsulanKenaikanPangkatResource extends Resource
{
    protected static ?string $model = UsulanKenaikanPangkat::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowTrendingUp;
    protected static ?string $navigationLabel = 'Usulan Kenaikan Pangkat';
    protected static ?int $navigationSort = 8;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return UsulanKenaikanPangkatForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return UsulanKenaikanPangkatsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\DokumenRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUsulanKenaikanPangkats::route('/'),
            'create' => CreateUsulanKenaikanPangkat::route('/create'),
            'view' => ViewUsulanKenaikanPangkat::route('/{record}'),
            'edit' => EditUsulanKenaikanPangkat::route('/{record}/edit'),
        ];
    }
}
