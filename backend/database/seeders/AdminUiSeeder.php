<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\InformasiPersyaratan;
use App\Models\User;
use App\Models\Pegawai;
use App\Models\LokasiSekolah;
use Illuminate\Support\Facades\DB;

class AdminUiSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed/Update Roles (no description column)
        $roles = [
            [
                'role_name' => 'super_admin',
                'display_name' => 'Administrator',
            ],
            [
                'role_name' => 'kepala_sekolah',
                'display_name' => 'Kepala Sekolah',
            ],
            [
                'role_name' => 'pegawai',
                'display_name' => 'Pegawai',
            ],
            [
                'role_name' => 'guru',
                'display_name' => 'Guru',
            ],
            [
                'role_name' => 'tata_usaha',
                'display_name' => 'Tata Usaha',
            ],
        ];

        foreach ($roles as $r) {
            Role::updateOrCreate(
                ['role_name' => $r['role_name']],
                [
                    'display_name' => $r['display_name'],
                ]
            );
        }

        // 2. Refresh & Seed Requirements
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        InformasiPersyaratan::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $requirements = [
            [
                'judul' => 'Surat Permohonan',
                'deskripsi' => 'Surat permohonan asli dari yang bersangkutan',
            ],
            [
                'judul' => 'Fotocopy KTP',
                'deskripsi' => 'Fotocopy KTP yang masih berlaku',
            ],
            [
                'judul' => 'SK Pangkat Terakhir',
                'deskripsi' => 'Salinan SK Pangkat terakhir',
            ],
            [
                'judul' => 'Penilaian Kinerja',
                'deskripsi' => 'SKP 2 tahun terakhir',
            ],
            [
                'judul' => 'Ijazah Terakhir',
                'deskripsi' => 'Fotocopy ijazah terakhir yang dilegalisir',
            ],
        ];

        foreach ($requirements as $req) {
            InformasiPersyaratan::create($req);
        }

        // 3. Seed Users and Pegawai
        $adminRole = Role::where('role_name', 'super_admin')->first();
        $kepsekRole = Role::where('role_name', 'kepala_sekolah')->first();
        $pegawaiRole = Role::where('role_name', 'pegawai')->first();

        // Robi Admin (Administrator)
        User::updateOrCreate(
            ['email' => 'admin@simpeg.com'],
            [
                'name' => 'Robi Admin',
                'username' => 'Admin',
                'password' => bcrypt('password'),
                'role_id' => $adminRole->id,
                'status' => 'aktif',
            ]
        );

        // Ikhsan Bayu (Kepala Sekolah)
        $kepsekUser = User::updateOrCreate(
            ['email' => 'ikhsan@simpeg.com'],
            [
                'name' => 'Ikhsan Bayu',
                'username' => 'Ikhsan',
                'password' => bcrypt('password'),
                'role_id' => $kepsekRole->id,
                'status' => 'aktif',
            ]
        );
        Pegawai::updateOrCreate(
            ['user_id' => $kepsekUser->id],
            [
                'nbm' => '123456',
                'nama_lengkap' => 'Ikhsan Bayu',
                'jenis_kelamin' => 'Laki-laki',
                'tempat_lahir' => 'Metro',
                'tanggal_lahir' => '1980-05-12',
                'agama' => 'Islam',
                'pendidikan_terakhir' => 'S2',
                'jurusan' => 'Manajemen Pendidikan',
                'jabatan' => 'Kepala Sekolah',
                'status_kepegawaian' => 'Pegawai Tetap Persyarikatan (PTP)',
                'alamat' => 'Jl. Jend. Sudirman No. 12, Metro',
                'nomor_telepon' => '081234567890',
            ]
        );

        // Joni Kurniawan (Pegawai / Guru)
        $pegawaiUser = User::updateOrCreate(
            ['email' => 'joni@pegawai.com'],
            [
                'name' => 'Joni Kurniawan',
                'username' => 'Joni',
                'password' => bcrypt('password'),
                'role_id' => $pegawaiRole->id,
                'status' => 'aktif',
            ]
        );
        Pegawai::updateOrCreate(
            ['user_id' => $pegawaiUser->id],
            [
                'nbm' => '789012',
                'nama_lengkap' => 'Joni Kurniawan',
                'jenis_kelamin' => 'Laki-laki',
                'tempat_lahir' => 'Metro',
                'tanggal_lahir' => '1990-08-20',
                'agama' => 'Islam',
                'pendidikan_terakhir' => 'S1',
                'jurusan' => 'Pendidikan Fisika',
                'jabatan' => 'Guru',
                'status_kepegawaian' => 'Guru Tetap Persyarikatan (GTP)',
                'alamat' => 'Jl. Ki Hajar Dewantara No. 45, Metro',
                'nomor_telepon' => '089876543210',
            ]
        );

        // 4. Seed School Location
        LokasiSekolah::updateOrCreate(
            ['nama_lokasi' => 'SMA Muhammadiyah 2 Metro'],
            [
                'latitude' => -5.12426372,
                'longitude' => 105.30680370,
                'radius_meter' => 100.00,
                'alamat' => 'Jl. Ki Hajar Dewantara No. 1, Metro',
                'status' => 'aktif',
            ]
        );
    }
}
