<?php

namespace App\Filament\Widgets;

use App\Models\user;
use App\Models\Absensi;
use App\Models\Pegawai;
use App\Models\UsulanCuti;
use App\Models\UsulanKenaikanPangkat;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class DashboardStatsWidget extends StatsOverviewWidget
{
    protected ?string $pollingInterval = '30s';

    protected static ?int $sort = 1;

    protected function getExtraAttributes(): array
    {
        return [
            'class' => '!bg-transparent !shadow-none !border-none !ring-0',
        ];
    }

    protected function getStats(): array
    {
        $totalPegawai        = Pegawai::count();
        $pegawaiAktif        = User::where('status', 'aktif')->count();
        $pegawaiAktif        = User::whereIn('role_id', ['2','3'])->count();
        $absensiHariIni      = Absensi::whereDate('tanggal', today())->count();
        $ukpPending          = UsulanKenaikanPangkat::whereIn('status', ['diajukan', 'ditinjau_admin', 'diteruskan'])->count();
        $cutiPending         = UsulanCuti::whereIn('status', ['diajukan', 'ditinjau_admin', 'diteruskan'])->count();

        return [
            Stat::make('Total Pegawai', $totalPegawai)
                ->description('Seluruh pegawai terdaftar')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),

            Stat::make('Pegawai Aktif', $pegawaiAktif)
                ->description('Pegawai dengan status aktif')
                ->descriptionIcon('heroicon-m-user')
                ->color('success'),

            Stat::make('Absensi Hari Ini', $absensiHariIni)
                ->description('Check-in per ' . today()->translatedFormat('d M Y'))
                ->descriptionIcon('heroicon-m-map-pin')
                ->color('info'),

            Stat::make('UKP Perlu Diverifikasi', $ukpPending)
                ->description($ukpPending > 0 ? 'Memerlukan tindakan' : 'Semua selesai')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color($ukpPending > 0 ? 'warning' : 'success'),

            Stat::make('Cuti Perlu Diverifikasi', $cutiPending)
                ->description($cutiPending > 0 ? 'Memerlukan tindakan' : 'Semua selesai')
                ->descriptionIcon('heroicon-m-calendar-days')
                ->color($cutiPending > 0 ? 'warning' : 'success'),
        ];
    }
}
