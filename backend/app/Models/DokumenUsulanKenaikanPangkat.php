<?php
/**
 * @file DokumenUsulanKenaikanPangkat.php
 * @description Model Eloquent untuk menyimpan dokumen digital lampiran usulan kenaikan pangkat.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class DokumenUsulanKenaikanPangkat
 * Menangani berkas digital pendukung (KTP, Ijazah, SK, dll) untuk pengajuan pangkat baru.
 * 
 * @property int $ukp_id
 * @property string $nama_dokumen
 * @property string $file_dokumen
 * @property string $tipe_file
 * @property int $ukuran_file
 * @property string $status_validasi
 * @property string $catatan_validasi
 */
class DokumenUsulanKenaikanPangkat extends Model
{
    use HasFactory;

    protected $table = 'dokumen_usulan_kenaikan_pangkat';

    protected $fillable = [
        'ukp_id',
        'nama_dokumen',
        'file_dokumen',
        'tipe_file',
        'ukuran_file',
        'status_validasi',
        'catatan_validasi',
    ];

    /**
     * Hubungan BelongsTo dengan model UsulanKenaikanPangkat.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function usulanKenaikanPangkat()
    {
        return $this->belongsTo(UsulanKenaikanPangkat::class, 'ukp_id');
    }
}
