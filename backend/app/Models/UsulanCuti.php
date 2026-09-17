<?php
/**
 * @file UsulanCuti.php
 * @description Model Eloquent untuk data pengajuan cuti pegawai.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UsulanCuti
 * Representasi tabel 'usulan_cuti' yang merekam pengajuan cuti, jangka waktu, status, dan catatan pimpinan.
 * 
 * @property int $pegawai_id
 * @property string $nomor_usulan
 * @property string $jenis_cuti
 * @property string $tanggal_mulai
 * @property string $tanggal_selesai
 * @property int $jumlah_hari
 * @property string $alasan
 * @property string $catatan_admin
 * @property string $catatan_kepsek
 * @property string $status
 * @property string $tanggal_diajukan
 * @property string $tanggal_diverifikasi
 * @property string $lampiran
 */
class UsulanCuti extends Model
{
    use HasFactory;

    protected $table = 'usulan_cuti';

    protected $fillable = [
        'pegawai_id',
        'nomor_usulan',
        'jenis_cuti',
        'tanggal_mulai',
        'tanggal_selesai',
        'jumlah_hari',
        'alasan',
        'catatan_admin',
        'catatan_kepsek',
        'status',
        'tanggal_diajukan',
        'tanggal_diverifikasi',
        'lampiran',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
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
}
