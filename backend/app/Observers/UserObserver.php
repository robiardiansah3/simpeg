<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Pegawai;

class UserObserver
{
    /**
     * Otomatis buat record pegawai kosong ketika user baru dibuat
     * dengan role pegawai atau kepala_sekolah.
     * Data lengkap akan diisi oleh user setelah login.
     */
    public function created(User $user): void
    {
        $user->load('role');

        $rolesThatNeedPegawai = ['pegawai', 'kepala_sekolah', 'guru', 'tata_usaha'];

        if ($user->role && in_array($user->role->role_name, $rolesThatNeedPegawai)) {
            Pegawai::create([
                'user_id'      => $user->id,
                'nama_lengkap' => $user->name, // ambil dari nama akun sebagai default
            ]);
        }
    }

    /**
     * Otomatis hapus record pegawai ketika user dihapus.
     */
    public function deleted(User $user): void
    {
        if ($pegawai = $user->pegawai) {
            $pegawai->delete();
        }
    }
}
