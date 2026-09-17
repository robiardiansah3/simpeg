<div>
    @php
        $navigation = filament()->getNavigation();
        $isRtl = __('filament-panels::layout.direction') === 'rtl';
    @endphp

    <aside
        x-data="{}"
        x-bind:class="{ 'fi-sidebar-open': $store.sidebar.isOpen }"
        class="sidebar fi-sidebar"
    >
        <!-- Brand -->
        <div class="sidebar-brand">
            <div class="sidebar-brand-icon">
                <img
                    src="{{ asset('images/logo.png') }}"
                    alt="Logo SMA Muhammadiyah 2 Metro"
                    style="width: 38px; height: 38px; object-fit: contain;"
                />
            </div>
            <div class="sidebar-brand-text">
                <span class="sidebar-brand-title">SMA MUHAMMADIYAH 2</span>
                <span class="sidebar-brand-subtitle">METRO</span>
            </div>

            <button
                class="sidebar-close-btn"
                x-on:click="$store.sidebar.close()"
                aria-label="Tutup"
            >
                <x-filament::icon
                    icon="heroicon-o-x-mark"
                    class="w-4 h-4"
                />
            </button>
        </div>

        <!-- Nav -->
        <nav class="sidebar-nav">
            @php
                $hasPrintedMenuAdmin = false;
            @endphp
            @foreach ($navigation as $group)
                @php
                    $groupLabel = $group->getLabel();
                    $groupItems = $group->getItems();
                @endphp
                @if ($groupLabel)
                    <p class="sidebar-nav-label">{{ $groupLabel }}</p>
                @elseif (!$hasPrintedMenuAdmin)
                    <p class="sidebar-nav-label">MENU ADMIN</p>
                    @php
                        $hasPrintedMenuAdmin = true;
                    @endphp
                @endif
                
                @foreach ($groupItems as $item)
                    @php
                        $isActive = $item->isActive();
                        $icon = $item->getIcon();
                    @endphp
                    <a
                        href="{{ $item->getUrl() }}"
                        class="sidebar-item {{ $isActive ? 'active' : '' }}"
                    >
                        @if ($icon)
                            <x-filament::icon
                                :icon="$icon"
                                class="sidebar-item-icon"
                                style="width: 18px; height: 18px;"
                            />
                        @endif
                        <span>{{ $item->getLabel() }}</span>
                    </a>
                @endforeach
            @endforeach
        </nav>

        <!-- Footer -->
        <div class="sidebar-footer">
            <form action="{{ filament()->getLogoutUrl() }}" method="post" class="w-full">
                @csrf
                <button type="submit" class="sidebar-logout-btn">
                    <x-filament::icon
                        icon="heroicon-o-arrow-left-on-rectangle"
                        class="w-[18px] h-[18px]"
                    />
                    <span>Logout</span>
                </button>
            </form>
        </div>
    </aside>
</div>
