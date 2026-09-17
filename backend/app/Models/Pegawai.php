<?php
/**
 * @file Pegawai.php
 * @description Model Eloquent untuk data master profil dan biodata Pegawai.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Pegawai
 * Representasi data biodata guru dan staf kepegawaian sekolah.
 * 
 * @property int $user_id
 * @property string $nbm
 * @property string $nama_lengkap
 * @property string $jenis_kelamin
 * @property string $tempat_lahir
 * @property string $tanggal_lahir
 * @property string $agama
 * @property string $pendidikan_terakhir
 * @property string $jurusan
 * @property string $jabatan
 * @property string $status_kepegawaian
 * @property string $alamat
 * @property string $nomor_telepon
 * @property string $foto
 * @property string $status
 */
class Pegawai extends Model
{
    use HasFactory;

    protected $table = 'pegawai';

    /**
     * Event boot model untuk menghapus akun user terkait secara kaskade jika data pegawai dihapus.
     */
    protected static function booted()
    {
        static::deleted(function ($pegawai) {
            if ($user = $pegawai->user) {
                $user->delete();
            }
        });
    }

    protected $fillable = [
        'user_id',
        'nbm',
        'nama_lengkap',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'agama',
        'pendidikan_terakhir',
        'jurusan',
        'jabatan',
        'status_kepegawaian',
        'alamat',
        'nomor_telepon',
        'foto',
        'status',
    ];

    /**
     * Hubungan BelongsTo dengan model User.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Hubungan HasMany dengan model UsulanKenaikanPangkat.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function usulanKenaikanPangkats()
    {
        return $this->hasMany(UsulanKenaikanPangkat::class);
    }

    /**
     * Hubungan HasMany dengan model UsulanCuti.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function usulanCutis()
    {
        return $this->hasMany(UsulanCuti::class);
    }

    /**
     * Hubungan HasMany dengan model Absensi.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function absensis()
    {
        return $this->hasMany(Absensi::class);
    }
}
