<?php
/**
 * @file Role.php
 * @description Model Eloquent untuk data Peran (Role) Pengguna.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Role
 * Representasi tabel 'roles' untuk penentuan hak akses pengguna sistem (Admin, Kepsek, Pegawai, dll).
 * 
 * @property string $role_name
 * @property string $display_name
 */
class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'role_name',
        'display_name',
    ];

    /**
     * Hubungan HasMany dengan model User.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
