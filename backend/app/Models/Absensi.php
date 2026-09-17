<?php
/**
 * @file Absensi.php
 * @description Model Eloquent untuk representasi data kehadiran (absensi) pegawai.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\JadwalAbsensi;
use App\Models\Pegawai;
use App\Models\UsulanCuti;

/**
 * Class Absensi
 * Representasi tabel 'absensi' yang menyimpan data koordinat, waktu, dan validasi lokasi presensi pegawai.
 * 
 * @property int $pegawai_id
 * @property string $tanggal
 * @property string $waktu_masuk
 * @property float $latitude
 * @property float $longitude
 * @property string $lokasi_masuk
 * @property float $jarak_meter
 * @property string $status_lokasi
 * @property string $status_kehadiran
 * @property string $device_info
 * @property string $ip_address
 */
class Absensi extends Model
{
    use HasFactory;

    protected $table = 'absensi';

    protected $fillable = [
        'pegawai_id',
        'tanggal',
        'waktu_masuk',
        'latitude',
        'longitude',
        'lokasi_masuk',
        'jarak_meter',
        'status_lokasi',
        'status_kehadiran',
        'device_info',
        'ip_address',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'waktu_masuk' => 'datetime:H:i:s',
    ];

    /**
     * Hubungan BelongsTo dengan model Pegawai.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class);
    }

    /**
     * Secara otomatis menandai pegawai yang tidak melakukan presensi sebagai 'tidak_hadir'
     * atau 'izin' (jika sedang cuti) pada tanggal tertentu.
     *
     * @param string $tanggal Format 'Y-m-d'
     * @return void
     */
    public static function autoMarkTidakHadir($tanggal)
    {
        $hariMap = [
            'Sunday' => 'minggu',
            'Monday' => 'senin',
            'Tuesday' => 'selasa',
            'Wednesday' => 'rabu',
            'Thursday' => 'kamis',
            'Friday' => 'jumat',
            'Saturday' => 'sabtu',
        ];
        
        $dayName = date('l', strtotime($tanggal));
        $hariIndo = $hariMap[$dayName] ?? 'senin';

        // Ambil jadwal absensi untuk hari tersebut
        $jadwal = JadwalAbsensi::where('hari', $hariIndo)->first();
        if (!$jadwal || !$jadwal->is_active) {
            return; // Hari libur atau dinonaktifkan
        }

        // Jika tanggal adalah hari ini, pastikan jam selesai absensi sudah lewat
        if ($tanggal === date('Y-m-d')) {
            $now = date('H:i:s');
            if ($now <= $jadwal->jam_selesai) {
                return; // Batas waktu absensi hari ini belum selesai
            }
        }

        // Ambil semua pegawai aktif
        $pegawais = Pegawai::all();

        foreach ($pegawais as $pegawai) {
            // Cek apakah pegawai sudah memiliki catatan absensi pada tanggal tersebut
            $exists = self::where('pegawai_id', $pegawai->id)
                ->whereDate('tanggal', $tanggal)
                ->exists();

            if (!$exists) {
                // Cek apakah pegawai sedang dalam masa cuti yang disetujui
                $cuti = UsulanCuti::where('pegawai_id', $pegawai->id)
                    ->where('status', 'disetujui')
                    ->whereDate('tanggal_mulai', '<=', $tanggal)
                    ->whereDate('tanggal_selesai', '>=', $tanggal)
                    ->first();

                if ($cuti) {
                    // Catat sebagai izin karena sedang cuti
                    self::create([
                        'pegawai_id' => $pegawai->id,
                        'tanggal' => $tanggal,
                        'waktu_masuk' => $jadwal->jam_mulai,
                        'status_kehadiran' => 'izin',
                        'lokasi_masuk' => 'Cuti Disetujui (' . $cuti->jenis_cuti . ')',
                        'status_lokasi' => 'valid',
                        'jarak_meter' => 0,
                    ]);
                } else {
                    // Catat sebagai tidak hadir
                    self::create([
                        'pegawai_id' => $pegawai->id,
                        'tanggal' => $tanggal,
                        'waktu_masuk' => $jadwal->jam_mulai,
                        'status_kehadiran' => 'tidak_hadir',
                        'lokasi_masuk' => 'Sistem Otomatis (Tidak Hadir)',
                        'status_lokasi' => 'tidak_valid',
                        'jarak_meter' => 9999,
                    ]);
                }
            }
        }
    }
}
