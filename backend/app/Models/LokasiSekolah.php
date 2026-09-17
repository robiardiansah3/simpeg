<?php
/**
 * @file LokasiSekolah.php
 * @description Model Eloquent untuk data titik koordinat geospasial sekolah.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class LokasiSekolah
 * Representasi tabel 'lokasi_sekolah' yang menampung titik pusat GPS sekolah dan batas radius kehadiran.
 * 
 * @property string $nama_lokasi
 * @property float $latitude
 * @property float $longitude
 * @property int $radius_meter
 * @property string $alamat
 * @property string $status
 */
class LokasiSekolah extends Model
{
    use HasFactory;

    protected $table = 'lokasi_sekolah';

    protected $fillable = [
        'nama_lokasi',
        'latitude',
        'longitude',
        'radius_meter',
        'alamat',
        'status',
    ];

    /**
     * Event boot model untuk mematikan lokasi lain saat lokasi ini diaktifkan.
     */
    protected static function booted()
    {
        static::saving(function ($model) {
            if ($model->status === 'aktif') {
                // Menonaktifkan lokasi aktif lain guna memastikan hanya ada 1 lokasi aktif utama
                static::where('id', '!=', $model->id)->update(['status' => 'nonaktif']);
            }
        });
    }
}
