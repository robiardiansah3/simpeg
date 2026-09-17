<?php

namespace App\Filament\Resources\JadwalAbsensis;

use App\Filament\Resources\JadwalAbsensis\Pages\EditJadwalAbsensi;
use App\Filament\Resources\JadwalAbsensis\Pages\ListJadwalAbsensis;
use App\Filament\Resources\JadwalAbsensis\Schemas\JadwalAbsensiForm;
use App\Filament\Resources\JadwalAbsensis\Tables\JadwalAbsensisTable;
use App\Models\JadwalAbsensi;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class JadwalAbsensiResource extends Resource
{
    protected static ?string $model = JadwalAbsensi::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedClock;
    protected static ?string $navigationLabel = 'Jadwal Absensi';
    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return JadwalAbsensiForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return JadwalAbsensisTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListJadwalAbsensis::route('/'),
            'edit'  => EditJadwalAbsensi::route('/{record}/edit'),
        ];
    }
}
