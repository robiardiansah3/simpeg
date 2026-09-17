<?php
/**
 * @file User.php
 * @description Model Eloquent untuk data Akun Pengguna (User).
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

/**
 * Class User
 * Representasi akun pengguna sistem untuk keperluan login dan autentikasi.
 * Mengimplementasikan FilamentUser untuk verifikasi masuk ke admin panel.
 * 
 * @property string $name
 * @property string $username
 * @property string $email
 * @property string $password
 * @property int $role_id
 */
class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Menentukan hak akses pengguna untuk masuk ke panel Filament.
     * Hanya pengguna dengan peran 'super_admin' yang diperbolehkan masuk.
     *
     * @param Panel $panel
     * @return bool
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role && $this->role->role_name === 'super_admin';
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Hubungan BelongsTo dengan model Role.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Hubungan HasOne dengan model Pegawai.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function pegawai()
    {
        return $this->hasOne(Pegawai::class);
    }
}
