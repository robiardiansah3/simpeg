/**
 * @file AbsensiPage.jsx
 * @description Halaman Presensi Online untuk Pegawai. Memungkinkan pegawai melakukan 
 * absen masuk dengan memverifikasi koordinat GPS (geolokasi) terhadap radius koordinat sekolah.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import PageHeader from '../../components/ui/page-header';
import PageTable from '../../components/ui/page-table';
import { MapPin, Loader2, AlertTriangle, Clock, CheckCircle2, Navigation, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

// Impor komponen dan pustaka Leaflet
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Perbaikan kompatibilitas ikon penanda (marker) Leaflet dengan build Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/**
 * Komponen pembantu untuk memusatkan ulang (re-center) Leaflet Map secara dinamis saat koordinat GPS diperbarui.
 * 
 * @param {Object} props - Properti komponen.
 * @param {Array} props.center - Koordinat lokasi baru [lat, lng].
 */
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
}

/**
 * Halaman utama Presensi Online Pegawai.
 * Mengelola deteksi geolokasi GPS secara realtime, validasi radius sekolah, dan mutasi data absensi.
 * 
 * @returns {React.ReactElement} Komponen Halaman Absensi.
 */
export default function AbsensiPage() {
  const { user } = useAuthStore();
  
  // State Absensi Check In
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('Mendapatkan alamat...');
  const [isLocating, setIsLocating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [sekolah, setSekolah] = useState(null);
  const [attendanceType, setAttendanceType] = useState('hadir');
  const [schedule, setSchedule] = useState(null);
  
  // State Waktu Real-time
  const [currentTime, setCurrentTime] = useState(new Date());

  // State Riwayat Absensi
  const [historyData, setHistoryData] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [sorting, setSorting] = useState([{ id: 'tanggal', desc: true }]);

  // Ref & State Geolokasi GPS
  const [accuracy, setAccuracy] = useState(null);
  const watchIdRef = useRef(null);
  const lastGeocodeTime = useRef(0);
  const geocodeTimeout = useRef(null);

  /**
   * Menjalankan reverse geocoding menggunakan OpenStreetMap Nominatim API 
   * untuk mengubah koordinat lintang/bujur menjadi alamat teks.
   * 
   * @param {number} lat - Latitude (Lintang).
   * @param {number} lng - Longitude (Bujur).
   */
  const executeGeocode = async (lat, lng) => {
    lastGeocodeTime.current = Date.now();
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      setAddress(data.display_name || 'Alamat tidak diketahui');
    } catch {
      setAddress('Gagal menerjemahkan lokasi');
    } finally {
      setIsLocating(false);
    }
  };

  /**
   * Mengatur jeda (debouncing) pemanggilan reverse geocoding agar tidak membebani server Nominatim API.
   * 
   * @param {number} lat - Latitude.
   * @param {number} lng - Longitude.
   */
  const reverseGeocode = (lat, lng) => {
    const now = Date.now();
    
    if (geocodeTimeout.current) {
      clearTimeout(geocodeTimeout.current);
    }

    if (now - lastGeocodeTime.current >= 5000) {
      executeGeocode(lat, lng);
    } else {
      geocodeTimeout.current = setTimeout(() => {
        executeGeocode(lat, lng);
      }, 5000 - (now - lastGeocodeTime.current));
    }
  };

  /**
   * Mulai memantau (watch) koordinat GPS secara realtime menggunakan navigator.geolocation.
   */
  const startLocating = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    if (!navigator.geolocation) {
      setLocationError('Geolokasi tidak didukung oleh browser Anda.');
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPosition([latitude, longitude]);
        setAccuracy(accuracy);
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        let msg = 'Gagal mendapatkan lokasi. Pastikan GPS aktif.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Izin lokasi ditolak. Harap izinkan akses GPS di pengaturan browser Anda.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Sinyal GPS tidak tersedia atau tidak terdeteksi.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Waktu pencarian lokasi habis. Harap coba lagi di area terbuka.';
        }
        setLocationError(msg);
        setIsLocating(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 0 
      }
    );
  };

  // Memuat data konfigurasi sekolah, jadwal absensi, riwayat absensi, serta mulai melacak GPS.
  useEffect(() => {
    fetchRiwayat();
    
    api.get('/lokasi-sekolah')
      .then(res => setSekolah(res.data.data))
      .catch(() => setLocationError('Gagal memuat konfigurasi sekolah.'));

    api.get('/jadwal-absensi/hari-ini')
      .then(res => setSchedule(res.data.data))
      .catch(() => console.error('Gagal memuat jadwal absensi.'));

    startLocating();

    // Memperbarui jam realtime setiap detik
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (geocodeTimeout.current) {
        clearTimeout(geocodeTimeout.current);
      }
    };
  }, []);

  // Menghitung jarak geospasial (meter) antara posisi pegawai dengan sekolah (Formula Haversine)
  useEffect(() => {
    if (position && sekolah) {
      const R = 6371e3; // Radius bumi dalam meter
      const dLat = (position[0] - sekolah.latitude) * Math.PI / 180;
      const dLon = (position[1] - sekolah.longitude) * Math.PI / 180;
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(sekolah.latitude * Math.PI / 180) * Math.cos(position[0] * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      setDistanceInfo(Math.round(R * c));
    }
  }, [position, sekolah]);

  /**
   * Mengambil data riwayat presensi pegawai dari server backend.
   */
  const fetchRiwayat = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await api.get('/absensi/riwayat', { params: { scope: 'own' } });
      setHistoryData(res.data.data || []);
    } catch {
      setHistoryError('Gagal memuat data riwayat.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  /**
   * Melakukan check-in presensi pegawai ke server backend dengan melampirkan koordinat GPS.
   */
  const handleCheckIn = async () => {
    if (!position) return;
    setIsSubmitting(true);
    setLocationError(null);
    try {
      await api.post('/absensi/checkin', {
        latitude: position[0].toString(),
        longitude: position[1].toString(),
        lokasi_masuk: address,
        status_kehadiran: attendanceType
      });
      await fetchRiwayat(); // Memuat ulang tabel riwayat
      alert('Absen Masuk Berhasil!');
    } catch (err) {
      setLocationError(err.response?.data?.message || 'Check-In gagal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Menentukan apakah pegawai berada di luar radius koordinat sekolah yang ditentukan.
  const isOutsideRadius = sekolah && distanceInfo !== null && distanceInfo > (sekolah.radius_meter || 200);

  // Secara otomatis mengubah pilihan opsi kehadiran menjadi 'Tugas Luar' jika berada di luar radius
  useEffect(() => {
    if (isOutsideRadius) {
      setAttendanceType('tugas_luar');
    } else {
      setAttendanceType('hadir');
    }
  }, [isOutsideRadius]);

  // Menentukan apakah saat ini berada di luar jam operasional absensi yang diizinkan sekolah
  const isOutsideScheduleHours = useMemo(() => {
    if (!schedule) return false;
    if (!schedule.is_active) return true;

    const nowHours = currentTime.getHours();
    const nowMinutes = currentTime.getMinutes();
    const nowSeconds = currentTime.getSeconds();
    const nowTotalSeconds = nowHours * 3600 + nowMinutes * 60 + nowSeconds;

    const [startH, startM, startS] = schedule.jam_mulai.split(':').map(Number);
    const startTotalSeconds = startH * 3600 + startM * 60 + (startS || 0);

    const [endH, endM, endS] = schedule.jam_selesai.split(':').map(Number);
    const endTotalSeconds = endH * 3600 + endM * 60 + (endS || 0);

    return nowTotalSeconds < startTotalSeconds || nowTotalSeconds > endTotalSeconds;
  }, [schedule, currentTime]);

  // Konfigurasi kolom tabel riwayat absensi
  const columns = useMemo(() => [
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
      cell: ({ row }) => {
        const tgl = row.original.tanggal;
        return tgl ? new Date(tgl).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-';
      },
    },
    {
      accessorKey: 'waktu_masuk',
      header: 'Waktu Check-In',
      cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.waktu_masuk || '-'}</span>,
    },
    {
      accessorKey: 'status_kehadiran',
      header: 'Status Kehadiran',
      cell: ({ row }) => {
        const s = row.original.status_kehadiran || 'tidak_hadir';
        const variantMap = {
          hadir: 'success',
          tugas_luar: 'info',
          izin: 'warning',
          sakit: 'warning',
          tidak_hadir: 'danger',
          alpha: 'danger'
        };
        const labelMap = {
          hadir: 'Hadir',
          tugas_luar: 'Tugas Luar',
          izin: 'Izin',
          sakit: 'Sakit',
          tidak_hadir: 'Tidak Hadir',
          alpha: 'Alpha'
        };
        const variant = variantMap[s.toLowerCase()] || 'default';
        const label = labelMap[s.toLowerCase()] || s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ');
        return <Badge variant={variant} className="uppercase font-bold tracking-wider text-[10px]">{label}</Badge>;
      },
    },
  ], []);

  const table = useReactTable({ 
    data: historyData, 
    columns, 
    state: { sorting }, 
    onSortingChange: setSorting, 
    getCoreRowModel: getCoreRowModel(), 
    getSortedRowModel: getSortedRowModel() 
  });

  /**
   * Memformat objek tanggal ke string format lokal Indonesia (contoh: Senin, 10 Agustus 2026).
   *
   * @param {Date} date Objek Date yang akan diformat.
   * @returns {string} String tanggal yang diformat.
   */
  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  /**
   * Memformat objek tanggal/waktu ke string waktu lokal Indonesia (contoh: 08:00:00 WIB).
   *
   * @param {Date} date Objek Date yang akan diformat.
   * @returns {string} String waktu yang diformat.
   */
  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Center coordinate for the Leaflet Map
  const mapCenter = position || (sekolah ? [sekolah.latitude, sekolah.longitude] : [-6.2088, 106.8456]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <PageHeader 
        title="Presensi Online" 
        subtitle="Lakukan absen masuk secara mandiri dengan verifikasi geolokasi GPS."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri: Check-In Absen */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Navigation size={16} className="text-blue-600 animate-pulse" />
                <span>Absensi Hari Ini</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              
              {/* Jam Real-time */}
              <div className="flex items-center gap-2 mb-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <Clock size={14} />
                <span>{formatDate(currentTime)}</span>
              </div>
              
              <div className="text-4xl font-black text-slate-800 mb-6 flex items-baseline gap-1.5">
                {formatTime(currentTime)} <span className="text-sm font-extrabold text-blue-600">WIB</span>
              </div>

              {/* Jadwal Absensi Status Banner */}
              {schedule && (
                <div className={`w-full mb-5 p-4 rounded-2xl border text-center transition-all ${
                  !schedule.is_active
                    ? 'bg-rose-50/70 border-rose-100 text-rose-800'
                    : isOutsideScheduleHours
                    ? 'bg-amber-50/70 border-amber-100 text-amber-800'
                    : 'bg-emerald-50/70 border-emerald-100 text-emerald-800'
                }`}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-70">
                    Jadwal Hari Ini ({schedule.hari})
                  </p>
                  {!schedule.is_active ? (
                    <p className="text-xs font-extrabold">Hari Libur / Absensi Tutup</p>
                  ) : (
                    <div>
                      <p className="text-xs font-extrabold">Waktu Absen: {schedule.jam_mulai.substring(0, 5)} - {schedule.jam_selesai.substring(0, 5)} WIB</p>
                      {isOutsideScheduleHours && (
                        <p className="text-[10px] mt-1 text-amber-600 font-bold">Waktu absensi belum aktif atau telah berakhir</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Peta Lokasi (Leaflet Map) */}
              <div className="w-full h-[220px] rounded-2xl overflow-hidden border border-slate-200 mb-5 relative shadow-inner z-10">
                {isLocating ? (
                  <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <span className="text-xs font-semibold">Mengunci Sinyal GPS...</span>
                  </div>
                ) : (
                  <MapContainer 
                    center={mapCenter} 
                    zoom={16} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* User Marker */}
                    {position && (
                      <Marker position={position}>
                        <Circle 
                          center={position} 
                          radius={15} 
                          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }} 
                        />
                      </Marker>
                    )}

                    {/* School Center & Radius Circle */}
                    {sekolah && (
                      <>
                        <Marker position={[sekolah.latitude, sekolah.longitude]} />
                        <Circle 
                          center={[sekolah.latitude, sekolah.longitude]} 
                          radius={sekolah.radius_meter || 200} 
                          pathOptions={{ color: isOutsideRadius ? '#ef4444' : '#10b981', fillColor: isOutsideRadius ? '#ef4444' : '#10b981', fillOpacity: 0.15 }}
                        />
                      </>
                    )}

                    <MapRecenter center={position} />
                  </MapContainer>
                )}
              </div>

              {/* Status Kehadiran selector if outside radius */}
              {isOutsideRadius && (
                <div className="w-full mb-5 animate-in slide-in-from-bottom-2 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Keterangan (Di Luar Radius)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'tugas_luar', label: 'Tugas Luar', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/50' },
                      { id: 'izin', label: 'Izin', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/50' },
                      { id: 'sakit', label: 'Sakit', color: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50' },
                      { id: 'tidak_hadir', label: 'Tidak Hadir', color: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' },
                    ].map(opt => {
                      const isSelected = attendanceType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAttendanceType(opt.id)}
                          className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? `${opt.color} ring-2 ring-offset-1 ring-blue-500/25` 
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info Detail GPS */}
              <div className="w-full space-y-3 mb-6">
                <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl hover:bg-slate-100/30 transition-colors">
                  <MapPin className="text-slate-400 mt-0.5 shrink-0" size={16} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titik Koordinat Anda</p>
                      <div className="flex items-center gap-2">
                        {accuracy !== null && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            accuracy <= 25 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : accuracy <= 75 
                              ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            Akurasi: {Math.round(accuracy)}m {accuracy <= 25 ? '⚡ Presisi' : '⚠️ Rendah'}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={startLocating}
                          disabled={isLocating}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Perbarui GPS"
                        >
                          <RefreshCw size={12} className={isLocating ? 'animate-spin text-blue-600' : ''} />
                        </button>
                      </div>
                    </div>
                    {isLocating ? (
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5"><Loader2 size={12} className="animate-spin text-blue-600" /> Mengunci GPS...</p>
                    ) : (
                      <p className="text-xs text-slate-700 font-medium truncate mt-0.5">{address}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl hover:bg-slate-100/30 transition-colors">
                  <div className={`mt-0.5 rounded-full p-1 shrink-0 ${isOutsideRadius ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isOutsideRadius ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zona Radius Presensi</p>
                    <p className={`text-xs font-bold mt-0.5 ${isOutsideRadius ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isOutsideRadius 
                        ? `Di luar radius (${distanceInfo} meter dari sekolah)` 
                        : `Dalam radius (${distanceInfo} meter dari sekolah)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Absen Hari Ini */}
              <div className="w-full flex justify-center border-t border-slate-100 pt-5 pb-2 mb-5">
                <div className="text-center w-full">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status Absensi Hari Ini</p>
                  <p className={`text-sm font-black ${historyData.some(h => new Date(h.tanggal).toDateString() === new Date().toDateString()) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {historyData.find(h => new Date(h.tanggal).toDateString() === new Date().toDateString())?.waktu_masuk 
                      ? `Sudah Absen pada ${historyData.find(h => new Date(h.tanggal).toDateString() === new Date().toDateString()).waktu_masuk} WIB` 
                      : 'Belum Melakukan Absensi'}
                  </p>
                </div>
              </div>

              {locationError && (
                <div className="w-full mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-100 flex gap-2 items-start animate-in fade-in duration-200">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p className="font-semibold">{locationError}</p>
                </div>
              )}

              <div className="w-full">
                <Button 
                  className="w-full rounded-xl py-6 text-sm font-bold shadow-md shadow-blue-500/10 cursor-pointer" 
                  disabled={!position || isLocating || isSubmitting || isOutsideScheduleHours || (attendanceType === 'hadir' && isOutsideRadius)}
                  onClick={handleCheckIn}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Merekam...</>
                  ) : (
                    'Kirim Presensi'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Tabel Riwayat */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800">Riwayat Presensi Kerja</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <PageTable
                table={table}
                isLoading={isHistoryLoading}
                error={historyError}
                emptyIcon={<MapPin size={36} className="text-slate-300" />}
                emptyTitle="Belum ada riwayat"
                emptyDesc="Anda belum pernah absen di sistem."
              />

              <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3 text-blue-800 text-xs font-medium leading-relaxed">
                <AlertTriangle size={18} className="shrink-0 text-blue-600 mt-0.5" />
                <p>Pastikan koneksi internet stabil dan izin akses lokasi GPS diaktifkan pada browser Anda. Radius yang diizinkan untuk presensi kehadiran normal adalah {sekolah?.radius_meter || 200} meter dari titik koordinat sekolah.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
