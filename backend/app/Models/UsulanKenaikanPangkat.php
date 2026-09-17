<?php
/**
 * @file UsulanKenaikanPangkat.php
 * @description Model Eloquent untuk data Usulan Kenaikan Pangkat (UKP) pegawai.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UsulanKenaikanPangkat
 * Representasi tabel 'usulan_kenaikan_pangkat' yang merekam promosi status kepegawaian staf.
 * 
 * @property int $pegawai_id
 * @property string $nomor_usulan
 * @property int $masa_kerja_tahun
 * @property int $masa_kerja_bulan
 * @property string $catatan_admin
 * @property string $catatan_kepsek
 * @property string $status
 * @property string $status_pengajuan
 * @property string $status_baru
 * @property string $tanggal_diajukan
 * @property string $tanggal_diverifikasi
 */
class UsulanKenaikanPangkat extends Model
{
    use HasFactory;

    protected $table = 'usulan_kenaikan_pangkat';

    protected $fillable = [
        'pegawai_id',
        'nomor_usulan',
        'masa_kerja_tahun',
        'masa_kerja_bulan',
        'catatan_admin',
        'catatan_kepsek',
        'status',
        'status_pengajuan',
        'status_baru',
        'tanggal_diajukan',
        'tanggal_diverifikasi',
    ];

    protected $casts = [
        'tanggal_diajukan' => 'datetime',
        'tanggal_diverifikasi' => 'datetime',
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
     * Hubungan HasMany dengan model DokumenUsulanKenaikanPangkat.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function dokumen()
    {
        return $this->hasMany(DokumenUsulanKenaikanPangkat::class, 'ukp_id');
    }
}
