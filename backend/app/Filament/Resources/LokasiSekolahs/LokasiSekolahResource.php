<?php

namespace App\Filament\Resources\LokasiSekolahs;

use App\Filament\Resources\LokasiSekolahs\Pages\CreateLokasiSekolah;
use App\Filament\Resources\LokasiSekolahs\Pages\EditLokasiSekolah;
use App\Filament\Resources\LokasiSekolahs\Pages\ListLokasiSekolahs;
use App\Filament\Resources\LokasiSekolahs\Pages\PilihLokasiAktif;
use App\Filament\Resources\LokasiSekolahs\Pages\ViewLokasiSekolah;
use App\Filament\Resources\LokasiSekolahs\Schemas\LokasiSekolahForm;
use App\Filament\Resources\LokasiSekolahs\Tables\LokasiSekolahsTable;
use App\Models\LokasiSekolah;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class LokasiSekolahResource extends Resource
{
    protected static ?string $model = LokasiSekolah::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedMapPin;
    protected static ?string $navigationLabel = 'Lokasi Sekolah';
    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return LokasiSekolahForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LokasiSekolahsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => ListLokasiSekolahs::route('/'),
            'create' => CreateLokasiSekolah::route('/create'),
            'pilih-aktif' => PilihLokasiAktif::route('/pilih-aktif'),
            'view'   => ViewLokasiSekolah::route('/{record}'),
            'edit'   => EditLokasiSekolah::route('/{record}/edit'),
        ];
    }
}

