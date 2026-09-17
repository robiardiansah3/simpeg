<?php

namespace App\Filament\Resources\InformasiPersyaratans;

use App\Filament\Resources\InformasiPersyaratans\Pages\CreateInformasiPersyaratan;
use App\Filament\Resources\InformasiPersyaratans\Pages\EditInformasiPersyaratan;
use App\Filament\Resources\InformasiPersyaratans\Pages\ListInformasiPersyaratans;
use App\Filament\Resources\InformasiPersyaratans\Schemas\InformasiPersyaratanForm;
use App\Filament\Resources\InformasiPersyaratans\Tables\InformasiPersyaratansTable;
use App\Models\InformasiPersyaratan;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class InformasiPersyaratanResource extends Resource
{
    protected static ?string $model = InformasiPersyaratan::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;
    protected static ?string $navigationLabel = 'Informasi Persyaratan';
    protected static ?int $navigationSort = 5;

    public static function form(Schema $schema): Schema
    {
        return InformasiPersyaratanForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return InformasiPersyaratansTable::configure($table);
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
            'index' => ListInformasiPersyaratans::route('/'),
            'create' => CreateInformasiPersyaratan::route('/create'),
            'edit' => EditInformasiPersyaratan::route('/{record}/edit'),
        ];
    }
}
