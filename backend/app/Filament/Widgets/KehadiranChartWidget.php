<?php

namespace App\Filament\Widgets;

use App\Models\Absensi;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class KehadiranChartWidget extends ChartWidget
{
    protected ?string $heading = 'Grafik Kehadiran 7 Hari Terakhir';

    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected ?string $pollingInterval = '60s';

    protected function getData(): array
    {
        $labels   = [];
        $hadir    = [];
        $izin = [];
        $sakit    = [];
        $tidak_hadir    = [];
        $tugas_luar    = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $labels[] = $date->translatedFormat('D, d M');

            $hadir[]    = Absensi::whereDate('tanggal', $date)
                ->whereIn('status_kehadiran', ['hadir', 'Hadir'])
                ->count();

            $izin[] = Absensi::whereDate('tanggal', $date)
                ->whereIn('status_kehadiran', ['izin', 'Izin'])
                ->count();

            $sakit[] = Absensi::whereDate('tanggal', $date)
                ->whereIn('status_kehadiran', ['sakit', 'Sakit'])
                ->count();

            $tidak_hadir[] = Absensi::whereDate('tanggal', $date)
                ->whereIn('status_kehadiran', ['tidak_hadir', 'Tidak Hadir'])
                ->count();

            $tugas_luar[] = Absensi::whereDate('tanggal', $date)
                ->whereIn('status_kehadiran', ['tugas_luar', 'Tugas Luar'])
                ->count();
        }

        return [
            'datasets' => [
                [
                    'label'           => 'Hadir',
                    'data'            => $hadir,
                    'backgroundColor' => 'rgba(34, 197, 94, 0.8)',
                    'borderColor'     => 'rgba(34, 197, 94, 1)',
                    'borderWidth'     => 1,
                    'borderRadius'    => 6,
                ],
                [
                    'label'           => 'Izin',
                    'data'            => $izin,
                    'backgroundColor' => 'rgba(11, 183, 245, 0.8)',
                    'borderColor'     => 'rgba(11, 183, 245, 1)',
                    'borderWidth'     => 1,
                    'borderRadius'    => 6,
                ],
                [
                    'label'           => 'Sakit',
                    'data'            => $sakit,
                    'backgroundColor' => 'rgba(245, 158, 11, 0.8)',
                    'borderColor'     => 'rgba(245, 158, 11, 1)',
                    'borderWidth'     => 1,
                    'borderRadius'    => 6,
                ],
                [
                    'label'           => 'Tugas Luar',
                    'data'            => $tugas_luar,
                    'backgroundColor' => 'rgba(99, 102, 241, 0.8)', // Indigo
                    'borderColor'     => 'rgba(99, 102, 241, 1)',
                    'borderWidth'     => 1,
                    'borderRadius'    => 6,
                ],
                [
                    'label'           => 'Tidak Hadir',
                    'data'            => $tidak_hadir,
                    'backgroundColor' => 'rgba(239, 68, 68, 0.8)',
                    'borderColor'     => 'rgba(239, 68, 68, 1)',
                    'borderWidth'     => 1,
                    'borderRadius'    => 6,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => ['display' => true, 'position' => 'top'],
                'tooltip' => ['mode' => 'index', 'intersect' => false],
            ],
            'scales' => [
                'x' => ['stacked' => false, 'grid' => ['display' => false]],
                'y' => [
                    'stacked' => false,
                    'beginAtZero' => true,
                    'ticks' => ['stepSize' => 1],
                    'grid' => ['color' => 'rgba(0,0,0,0.05)'],
                ],
            ],
        ];
    }
}
