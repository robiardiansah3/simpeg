<?php

namespace App\Filament\Exports;

use App\Models\Absensi;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;
use Illuminate\Support\Number;

class AbsensiExporter extends Exporter
{
    protected static ?string $model = Absensi::class;

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
            ExportColumn::make('tanggal'),
            ExportColumn::make('waktu_masuk'),
            ExportColumn::make('latitude'),
            ExportColumn::make('longitude'),
            ExportColumn::make('lokasi_masuk'),
            ExportColumn::make('jarak_meter'),
            ExportColumn::make('status_lokasi'),
            ExportColumn::make('status_kehadiran'),
            ExportColumn::make('device_info'),
            ExportColumn::make('ip_address'),
            ExportColumn::make('created_at'),
            ExportColumn::make('updated_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = 'Your absensi export has completed and ' . Number::format($export->successful_rows) . ' ' . str('row')->plural($export->successful_rows) . ' exported.';

        if ($failedRowsCount = $export->getFailedRowsCount()) {
            $body .= ' ' . Number::format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' failed to export.';
        }

        return $body;
    }
}
