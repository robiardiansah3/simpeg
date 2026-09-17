<?php
/**
 * @file InformasiPersyaratan.php
 * @description Model Eloquent untuk data informasi persyaratan administrasi cuti dan UKP.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class InformasiPersyaratan
 * Representasi tabel 'informasi_persyaratan' yang menyimpan panduan berkas bagi pegawai.
 * 
 * @property string $judul
 * @property string $deskripsi
 * @property int $urutan
 * @property bool $is_published
 */
class InformasiPersyaratan extends Model
{
    use HasFactory;

    protected $table = 'informasi_persyaratan';

    protected $fillable = [
        'judul',
        'deskripsi',
        'urutan',
        'is_published',
    ];
}
