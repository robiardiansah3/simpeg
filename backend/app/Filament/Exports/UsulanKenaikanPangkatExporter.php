<?php

namespace App\Filament\Exports;

use App\Models\UsulanKenaikanPangkat;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;
use Illuminate\Support\Number;

class UsulanKenaikanPangkatExporter extends Exporter
{
    protected static ?string $model = UsulanKenaikanPangkat::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('id')
                ->label('ID'),
            ExportColumn::make('pegawai_id'),
            ExportColumn::make('pegawai.nama_lengkap')
                ->label('Nama Pegawai'),
            ExportColumn::make('pegawai.nbm')
                ->label('NBM'),
            ExportColumn::make('nomor_usulan'),
            ExportColumn::make('masa_kerja_tahun'),
            ExportColumn::make('masa_kerja_bulan'),
            ExportColumn::make('catatan_admin'),
            ExportColumn::make('catatan_kepsek'),
            ExportColumn::make('status'),
            ExportColumn::make('status_pengajuan'),
            ExportColumn::make('created_at'),
            ExportColumn::make('updated_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = 'Your usulan kenaikan pangkat export has completed and ' . Number::format($export->successful_rows) . ' ' . str('row')->plural($export->successful_rows) . ' exported.';

        if ($failedRowsCount = $export->getFailedRowsCount()) {
            $body .= ' ' . Number::format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' failed to export.';
        }

        return $body;
    }
}
