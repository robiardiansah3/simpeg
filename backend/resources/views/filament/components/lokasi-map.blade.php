<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<style>
    #simpeg-map {
        height: 400px;
        width: 100%;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        z-index: 0;
    }
    .map-instructions {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
        color: #475569;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .map-instructions svg {
        color: #2E3182;
        flex-shrink: 0;
    }
    .coordinate-box {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-top: 12px;
    }
    .coord-card {
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
    }
    .coord-card-prev {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
    }
    .coord-card-new {
        background: #f0fdf4;
        border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .coord-label {
        font-weight: 600;
        display: block;
        margin-bottom: 2px;
    }
    .coord-label-prev {
        color: #64748b;
    }
    .coord-label-new {
        color: #166534;
    }
    .coord-val {
        font-family: monospace;
        font-weight: 700;
    }
    .coord-val-prev {
        color: #334155;
    }
    .coord-val-new {
        color: #15803d;
    }
</style>

<div wire:ignore id="lokasi-map-container" style="width: 100%;">
    <div class="map-instructions">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
        </svg>
        Klik pada peta untuk menentukan koordinat lokasi baru sekolah, atau ketik langsung pada kolom input. Lingkaran biru menunjukkan radius absensi.
    </div>
    <div id="simpeg-map"></div>

    <div class="coordinate-box" id="coordinate-comparison" style="display: none;">
        <div class="coord-card coord-card-prev">
            <span class="coord-label coord-label-prev">Koordinat Sebelumnya:</span>
            <span class="coord-val coord-val-prev" id="prev-coord-text">-</span>
        </div>
        <div class="coord-card coord-card-new">
            <span class="coord-label coord-label-new">Koordinat Baru (Dipilih/Diinput):</span>
            <span class="coord-val coord-val-new" id="new-coord-text">-</span>
        </div>
    </div>
</div>

<script>
(function () {
    let map;
    let marker;
    let circle;
    let originalMarker;
    let originalLat = null;
    let originalLng = null;
    let mapInitialized = false;
    let isUpdatingFromMap = false;

    function getField(name) {
        return document.querySelector(`input[id$="${name}"], textarea[id$="${name}"], input[name$="${name}"], [wire\\:model*="${name}"], [wire\\:model\\.live*="${name}"]`);
    }

    function getLatitudeField() {
        return getField('latitude');
    }

    function getLongitudeField() {
        return getField('longitude');
    }

    function getRadiusField() {
        return getField('radius_meter');
    }

    function getCurrentCoordinate() {
        const latField = getLatitudeField();
        const lngField = getLongitudeField();
        const latStr = latField?.value ? latField.value.replace(',', '.') : '';
        const lngStr = lngField?.value ? lngField.value.replace(',', '.') : '';
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);

        return {
            lat: isNaN(lat) ? null : lat,
            lng: isNaN(lng) ? null : lng,
        };
    }

    function getRadius() {
        const radiusField = getRadiusField();
        return parseFloat(radiusField?.value) || 200;
    }

    function updateFields(lat, lng) {
        const latField = getLatitudeField();
        const lngField = getLongitudeField();

        isUpdatingFromMap = true;
        try {
            if (latField) {
                latField.value = lat.toFixed(7);
                latField.dispatchEvent(new Event('input', { bubbles: true }));
            }

            if (lngField) {
                lngField.value = lng.toFixed(7);
                lngField.dispatchEvent(new Event('input', { bubbles: true }));
            }
        } finally {
            isUpdatingFromMap = false;
        }

        // Update comparison display
        const compDiv = document.getElementById('coordinate-comparison');
        const prevText = document.getElementById('prev-coord-text');
        const newText = document.getElementById('new-coord-text');
        if (compDiv && prevText && newText) {
            compDiv.style.display = 'grid';
            if (originalLat !== null && originalLng !== null) {
                prevText.textContent = `${originalLat.toFixed(7)}, ${originalLng.toFixed(7)}`;
            } else {
                prevText.textContent = "Belum ditentukan";
            }
            newText.textContent = `${lat.toFixed(7)}, ${lng.toFixed(7)}`;
        }
    }

    function updateMapFromInputs() {
        const latField = getLatitudeField();
        const lngField = getLongitudeField();
        if (!latField || !lngField) return;

        const latVal = parseFloat(latField.value.replace(',', '.'));
        const lngVal = parseFloat(lngField.value.replace(',', '.'));

        if (!isNaN(latVal) && !isNaN(lngVal) && latVal >= -90 && latVal <= 90 && lngVal >= -180 && lngVal <= 180) {
            const pos = L.latLng(latVal, lngVal);
            if (map) {
                map.setView(pos, map.getZoom());
            }
            if (marker) {
                marker.setLatLng(pos);
            }
            if (circle) {
                circle.setLatLng(pos);
            }

            // Update comparison display
            const compDiv = document.getElementById('coordinate-comparison');
            const prevText = document.getElementById('prev-coord-text');
            const newText = document.getElementById('new-coord-text');
            if (compDiv && prevText && newText) {
                compDiv.style.display = 'grid';
                if (originalLat !== null && originalLng !== null) {
                    prevText.textContent = `${originalLat.toFixed(7)}, ${originalLng.toFixed(7)}`;
                } else {
                    prevText.textContent = "Belum ditentukan";
                }
                newText.textContent = `${latVal.toFixed(7)}, ${lngVal.toFixed(7)}`;
            }
        }
    }

    function isFieldMatch(element, name) {
        if (!element) return false;
        return (
            (element.id && element.id.endsWith(name)) ||
            (element.name && element.name.endsWith(name)) ||
            Array.from(element.attributes).some(attr => attr.name.includes('wire:model') && attr.value.includes(name))
        );
    }

    function setupInputListeners() {
        document.addEventListener('input', function (e) {
            if (isUpdatingFromMap) return;
            const target = e.target;
            if (!target) return;

            if (isFieldMatch(target, 'latitude') || isFieldMatch(target, 'longitude')) {
                updateMapFromInputs();
            } else if (isFieldMatch(target, 'radius_meter')) {
                if (circle) {
                    circle.setRadius(parseFloat(target.value) || 200);
                }
            }
        });
    }

    function initializeMap(lat, lng) {
        const container = document.getElementById('simpeg-map');
        if (!container || container.mapInstance) {
            return;
        }
        if (mapInitialized) {
            return;
        }
        mapInitialized = true;

        originalLat = lat;
        originalLng = lng;

        map = L.map('simpeg-map', {
            scrollWheelZoom: false
        }).setView([lat, lng], 16);

        container.mapInstance = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add static gray marker representing original location
        const originalIcon = L.divIcon({
            className: 'custom-div-icon-gray',
            html: `<div style="background-color: #6b7280; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
        originalMarker = L.marker([lat, lng], {
            icon: originalIcon
        }).addTo(map).bindPopup('Koordinat Sebelumnya');

        // Add main draggable marker representing current/new selection
        marker = L.marker([lat, lng], {
            draggable: true
        }).addTo(map).bindPopup('Koordinat Baru');

        circle = L.circle([lat, lng], {
            radius: getRadius(),
            color: '#2E3182',
            fillOpacity: 0.15
        }).addTo(map);

        map.on('click', function (e) {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            circle.setLatLng([lat, lng]);
            updateFields(lat, lng);
        });

        marker.on('dragend', function (e) {
            const pos = e.target.getLatLng();
            marker.setLatLng(pos);
            circle.setLatLng(pos);
            updateFields(pos.lat, pos.lng);
        });

        setupInputListeners();

        // Populate initial comparison values
        const compDiv = document.getElementById('coordinate-comparison');
        const prevText = document.getElementById('prev-coord-text');
        const newText = document.getElementById('new-coord-text');
        if (compDiv && prevText && newText) {
            compDiv.style.display = 'grid';
            prevText.textContent = `${lat.toFixed(7)}, ${lng.toFixed(7)}`;
            newText.textContent = `${lat.toFixed(7)}, ${lng.toFixed(7)} (Sama)`;
        }
    }

    const DEFAULT_LAT = -5.11159000;
    const DEFAULT_LNG = 105.30690330;

    // Cek langsung jika ada nilai (mode Edit — form sudah terisi)
    const immediate = getCurrentCoordinate();
    if (immediate.lat !== null && immediate.lng !== null) {
        initializeMap(immediate.lat, immediate.lng);
    } else {
        // Mode Create — polling singkat, lalu tampilkan default dalam 500ms
        const wait = setInterval(() => {
            const current = getCurrentCoordinate();
            if (current.lat !== null && current.lng !== null) {
                clearInterval(wait);
                initializeMap(current.lat, current.lng);
            }
        }, 300);

        setTimeout(() => {
            if (!mapInitialized) {
                clearInterval(wait);
                initializeMap(DEFAULT_LAT, DEFAULT_LNG);
            }
        }, 500);
    }
})();
</script>
