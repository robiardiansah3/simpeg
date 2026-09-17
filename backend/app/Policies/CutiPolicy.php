<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UsulanCuti;

class CutiPolicy
{
    /**
     * Memeriksa apakah pengguna dapat melihat semua usulan cuti.
     *
     * @param User $user Pengguna aktif.
     * @return bool
     */
    public function viewAny(User $user)
    {
        return true; // Bisa diakses semua, tapi logic query dibatasi di controller
    }

    /**
     * Memeriksa apakah pengguna dapat melihat usulan cuti tertentu.
     *
     * @param User $user Pengguna aktif.
     * @param UsulanCuti $cuti Objek usulan cuti.
     * @return bool
     */
    public function view(User $user, UsulanCuti $cuti)
    {
        if ($user->role->role_name === 'super_admin' || $user->role->role_name === 'kepala_sekolah') {
            return true;
        }
        return $user->pegawai && $user->pegawai->id === $cuti->pegawai_id;
    }

    /**
     * Memeriksa apakah pengguna dapat mengajukan usulan cuti baru.
     *
     * @param User $user Pengguna aktif.
     * @return bool
     */
    public function create(User $user)
    {
        return in_array($user->role->role_name, ['pegawai', 'guru', 'tata_usaha']);
    }

    /**
     * Memeriksa apakah pengguna dapat melakukan validasi admin pada usulan cuti.
     *
     * @param User $user Pengguna aktif.
     * @return bool
     */
    public function validasiAdmin(User $user)
    {
        return $user->role->role_name === 'super_admin';
    }

    /**
     * Memeriksa apakah pengguna dapat melakukan verifikasi akhir kepala sekolah pada usulan cuti.
     *
     * @param User $user Pengguna aktif.
     * @return bool
     */
    public function verifikasiKepsek(User $user)
    {
        return $user->role->role_name === 'kepala_sekolah';
    }
}
