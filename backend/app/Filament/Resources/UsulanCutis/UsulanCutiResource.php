<?php

namespace App\Filament\Resources\UsulanCutis;

use App\Filament\Resources\UsulanCutis\Pages\CreateUsulanCuti;
use App\Filament\Resources\UsulanCutis\Pages\EditUsulanCuti;
use App\Filament\Resources\UsulanCutis\Pages\ListUsulanCutis;
use App\Filament\Resources\UsulanCutis\Pages\ViewUsulanCuti;
use App\Filament\Resources\UsulanCutis\Schemas\UsulanCutiForm;
use App\Filament\Resources\UsulanCutis\Tables\UsulanCutisTable;
use App\Models\UsulanCuti;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class UsulanCutiResource extends Resource
{
    protected static ?string $model = UsulanCuti::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendarDays;
    protected static ?string $navigationLabel = 'Usulan Cuti';
    protected static ?int $navigationSort = 7;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return UsulanCutiForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return UsulanCutisTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUsulanCutis::route('/'),
            'create' => CreateUsulanCuti::route('/create'),
            'view' => ViewUsulanCuti::route('/{record}'),
            'edit' => EditUsulanCuti::route('/{record}/edit'),
        ];
    }
}
