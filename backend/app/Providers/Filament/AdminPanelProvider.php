<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Navigation\NavigationGroup;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login(\App\Filament\Pages\Auth\CustomLogin::class)
            ->brandName('SIMPEG - SMA Muhammadiyah 2 Metro')
            ->brandLogo(view('filament.components.brand-logo'))
            ->colors([
                // Warna brand utama SIMPEG — sesuai template SMA Muhammadiyah 2 Metro
                'primary' => Color::hex('#2E3182'), // Biru tua utama
                'info'    => Color::hex('#38BDF8'), // Biru info
                'success' => Color::hex('#22C55E'), // Hijau berhasil
                'warning' => Color::hex('#F59E0B'), // Kuning menunggu
                'danger'  => Color::hex('#EF4444'), // Merah ditolak
            ])
            // Font Poppins dari Google Fonts
            ->font('Poppins', provider: \Filament\FontProviders\GoogleFontProvider::class)
            ->viteTheme('resources/css/filament/admin/theme.css')
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                \App\Filament\Widgets\CustomAccountWidget::class,
                \App\Filament\Widgets\DashboardStatsWidget::class,
                \App\Filament\Widgets\KehadiranChartWidget::class,
                \App\Filament\Widgets\AbsensiHariIniWidget::class,
                \App\Filament\Widgets\PengajuanTerbaruWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
