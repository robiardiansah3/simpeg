<?php
/**
 * @file JadwalAbsensi.php
 * @description Model Eloquent untuk data pembatasan jadwal absensi harian pegawai.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class JadwalAbsensi
 * Representasi tabel 'jadwal_absensi' untuk penentuan jam mulai/selesai presensi per hari.
 * 
 * @property string $hari
 * @property bool $is_active
 * @property string $jam_mulai
 * @property string $jam_selesai
 */
class JadwalAbsensi extends Model
{
    use HasFactory;

    protected $table = 'jadwal_absensi';

    protected $fillable = [
        'hari',
        'is_active',
        'jam_mulai',
        'jam_selesai',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
