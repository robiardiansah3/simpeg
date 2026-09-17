<div class="fi-topbar-ctn navbar-wrapper transition-all duration-300">
    @php
        $hasNavigation = filament()->hasNavigation();
        
        // Dynamically compute the page title
        $pageTitle = 'Dashboard';
        $routeName = request()->route()?->getName();
        
        if ($routeName) {
            if (str_contains($routeName, '.resources.')) {
                $parts = explode('.', $routeName);
                $resourceKey = $parts[3] ?? null;
                
                if ($resourceKey) {
                    foreach (filament()->getResources() as $resource) {
                        if (str_contains(strtolower($resource::getSlug()), strtolower($resourceKey)) || str_contains(strtolower(class_basename($resource)), strtolower(str_replace('-', '', $resourceKey)))) {
                            $pageTitle = $resource::getNavigationLabel();
                            if (str_contains($routeName, '.create')) {
                                $pageTitle = 'Tambah ' . $pageTitle;
                            } elseif (str_contains($routeName, '.edit')) {
                                $pageTitle = 'Edit ' . $pageTitle;
                            } elseif (str_contains($routeName, '.view')) {
                                $pageTitle = 'Detail ' . $pageTitle;
                            }
                            break;
                        }
                    }
                }
            } elseif (str_contains($routeName, '.pages.')) {
                $parts = explode('.', $routeName);
                $pageKey = $parts[3] ?? null;
                if ($pageKey) {
                    $pageTitle = ucwords(str_replace('-', ' ', $pageKey));
                }
            } elseif ($routeName === 'filament.admin.pages.dashboard') {
                $pageTitle = 'Dashboard';
            }
        }
    @endphp

    <nav class="fi-topbar navbar">
        <div class="navbar-left">
            @if ($hasNavigation)
                <button
                    class="navbar-menu-btn fi-topbar-open-sidebar-btn"
                    x-cloak
                    x-data="{}"
                    x-on:click="$store.sidebar.open()"
                    aria-label="Buka sidebar"
                >
                    <x-filament::icon
                        icon="heroicon-o-bars-3"
                        style="width: 20px; height: 20px;"
                    />
                </button>
            @endif

            <span class="navbar-page-title">
                {{ $pageTitle }}
            </span>
        </div>

        <div class="navbar-right">
            @if (filament()->auth()->check())
                @if (filament()->hasDatabaseNotifications())
                    @livewire(filament()->getDatabaseNotificationsLivewireComponent(), [
                        'lazy' => filament()->hasLazyLoadedDatabaseNotifications(),
                    ])
                @endif

                <x-filament-panels::user-menu />
            @endif
        </div>
    </nav>
</div>
