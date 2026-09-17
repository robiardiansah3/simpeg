<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UsulanKenaikanPangkat;

class UsulanKenaikanPangkatPolicy
{
    /**
     * Memeriksa apakah pengguna dapat melihat semua usulan kenaikan pangkat.
     *
     * @param User $user Pengguna aktif.
     * @return bool
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * Memeriksa apakah pengguna dapat melihat usulan kenaikan pangkat tertentu.
     *
     * @param User $user Pengguna aktif.
     * @param UsulanKenaikanPangkat $ukp Objek usulan kenaikan pangkat.
     * @return bool
     */
    public function view(User $user, UsulanKenaikanPangkat $ukp)
    {
        if ($user->role->role_name === 'super_admin' || $user->role->role_name === 'kepala_sekolah') {
            return true;
        }
        return $user->pegawai && $user->pegawai->id === $ukp->pegawai_id;
    }

    /**
     * Memeriksa apakah pengguna dapat membuat usulan kenaikan pangkat baru.
     *
     * @param User $user Pengguna aktif.
     * @return bool
     */
    public function create(User $user)
    {
        return in_array($user->role->role_name, ['pegawai', 'guru', 'tata_usaha']);
    }

    /**
     * Memeriksa apakah pengguna dapat melakukan validasi admin pada usulan kenaikan pangkat.
     *
     * @param User $user Pengguna aktif.
     * @return bool
     */
    public function validasiAdmin(User $user)
    {
        return $user->role->role_name === 'super_admin';
    }

    /**
     * Memeriksa apakah pengguna dapat melakukan verifikasi kepala sekolah pada usulan kenaikan pangkat.
     *
     * @param User $user Pengguna aktif.
     * @return bool
     */
    public function verifikasiKepsek(User $user)
    {
        return $user->role->role_name === 'kepala_sekolah';
    }
}
