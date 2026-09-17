<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pegawai;
use App\Models\Absensi;
use App\Models\UsulanCuti;
use App\Models\UsulanKenaikanPangkat;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class DataJuni2026Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pegawais = Pegawai::all();

        if ($pegawais->isEmpty()) {
            $this->command->info('Tidak ada data pegawai. Silakan jalankan AdminUiSeeder terlebih dahulu.');
            return;
        }

        $this->command->info('Memulai seeding data Usulan Cuti, Usulan Kenaikan Pangkat, dan Absensi dari Juni 2026...');

        // 1. Seed Usulan Cuti dari Juni 2026
        $this->seedUsulanCuti($pegawais);

        // 2. Seed Usulan Kenaikan Pangkat dari Juni 2026
        $this->seedUsulanKenaikanPangkat($pegawais);

        // 3. Seed Absensi dari 1 Juni 2026 - 31 Agustus 2026
        $this->seedAbsensi($pegawais);

        $this->command->info('Seeding data Juni - Agustus 2026 selesai!');
    }

    private function seedUsulanCuti($pegawais)
    {
        $cutiData = [
            [
                'pegawai_index' => 0, // Pegawai pertama
                'nomor_usulan' => 'CUTI/2026/06/001',
                'jenis_cuti' => 'Cuti Tahunan',
                'tanggal_mulai' => '2026-06-16',
                'tanggal_selesai' => '2026-06-18',
                'jumlah_hari' => 3,
                'alasan' => 'Keperluan keluarga di luar kota',
                'catatan_admin' => 'Dokumen lengkap, kuota cuti mencukupi.',
                'catatan_kepsek' => 'Disetujui. Harap selesaikan tugas sebelum cuti.',
                'status' => 'disetujui',
                'tanggal_diajukan' => '2026-06-10 08:30:00',
                'tanggal_diverifikasi' => '2026-06-11 10:00:00',
            ],
            [
                'pegawai_index' => count($pegawais) > 1 ? 1 : 0,
                'nomor_usulan' => 'CUTI/2026/07/001',
                'jenis_cuti' => 'Cuti Sakit',
                'tanggal_mulai' => '2026-07-14',
                'tanggal_selesai' => '2026-07-15',
                'jumlah_hari' => 2,
                'alasan' => 'Istirahat dokter (Demam/Flu)',
                'catatan_admin' => 'Surat dokter terlampir.',
                'catatan_kepsek' => 'Disetujui. Semoga cepat sembuh.',
                'status' => 'disetujui',
                'tanggal_diajukan' => '2026-07-13 07:45:00',
                'tanggal_diverifikasi' => '2026-07-13 09:15:00',
            ],
            [
                'pegawai_index' => 0,
                'nomor_usulan' => 'CUTI/2026/08/001',
                'jenis_cuti' => 'Cuti Alasan Penting',
                'tanggal_mulai' => '2026-08-10',
                'tanggal_selesai' => '2026-08-11',
                'jumlah_hari' => 2,
                'alasan' => 'Mendampingi anggota keluarga operasi',
                'catatan_admin' => 'Berkas permohonan disetujui.',
                'catatan_kepsek' => 'Disetujui.',
                'status' => 'disetujui',
                'tanggal_diajukan' => '2026-08-08 09:00:00',
                'tanggal_diverifikasi' => '2026-08-09 11:30:00',
            ],
            [
                'pegawai_index' => count($pegawais) > 1 ? 1 : 0,
                'nomor_usulan' => 'CUTI/2026/08/002',
                'jenis_cuti' => 'Cuti Tahunan',
                'tanggal_mulai' => '2026-08-27',
                'tanggal_selesai' => '2026-08-28',
                'jumlah_hari' => 2,
                'alasan' => 'Urusan administrasi keluarga',
                'catatan_admin' => 'Dalam proses peninjauan.',
                'catatan_kepsek' => null,
                'status' => 'ditinjau_admin',
                'tanggal_diajukan' => '2026-08-25 14:00:00',
                'tanggal_diverifikasi' => null,
            ],
        ];

        foreach ($cutiData as $item) {
            $pegawai = $pegawais[$item['pegawai_index']] ?? $pegawais->first();
            UsulanCuti::updateOrCreate(
                ['nomor_usulan' => $item['nomor_usulan']],
                [
                    'pegawai_id' => $pegawai->id,
                    'jenis_cuti' => $item['jenis_cuti'],
                    'tanggal_mulai' => $item['tanggal_mulai'],
                    'tanggal_selesai' => $item['tanggal_selesai'],
                    'jumlah_hari' => $item['jumlah_hari'],
                    'alasan' => $item['alasan'],
                    'catatan_admin' => $item['catatan_admin'],
                    'catatan_kepsek' => $item['catatan_kepsek'],
                    'status' => $item['status'],
                    'tanggal_diajukan' => $item['tanggal_diajukan'],
                    'tanggal_diverifikasi' => $item['tanggal_diverifikasi'],
                ]
            );
        }
    }

    private function seedUsulanKenaikanPangkat($pegawais)
    {
        $counter = 1;
        $statusConfig = [
            ['status' => 'disetujui', 'status_pengajuan' => 'selesai', 'catatan_admin' => 'Persyaratan administrasi lengkap dan valid.', 'catatan_kepsek' => 'Rekomendasi disetujui untuk kenaikan pangkat.', 'verif' => true],
            ['status' => 'diteruskan', 'status_pengajuan' => 'diproses', 'catatan_admin' => 'Berkas telah diverifikasi oleh admin.', 'catatan_kepsek' => 'Usulan diteruskan ke Majelis Dikdasmen.', 'verif' => true],
            ['status' => 'ditinjau_admin', 'status_pengajuan' => 'belum diproses', 'catatan_admin' => 'Sedang dalam peninjauan dokumen persyaratan.', 'catatan_kepsek' => null, 'verif' => false],
            ['status' => 'diajukan', 'status_pengajuan' => 'belum diproses', 'catatan_admin' => null, 'catatan_kepsek' => null, 'verif' => false],
        ];

        foreach ($pegawais as $index => $pegawai) {
            $currentStatus = $pegawai->status_kepegawaian ?? '';
            $jabatan = strtolower($pegawai->jabatan ?? '');
            $isGuru = str_contains($jabatan, 'guru') || ($pegawai->user && str_contains(strtolower($pegawai->user->role->role_name ?? ''), 'guru'));

            // Tentukan target pangkat baru (status_baru) berdasarkan status kepegawaian pegawai saat ini
            if (str_contains($currentStatus, 'GTTP') || $currentStatus === 'Guru Tidak Tetap Persyarikatan (GTTP)') {
                $targetStatus = 'Guru Tetap Persyarikatan (GTP)';
            } elseif (str_contains($currentStatus, 'PTTP') || $currentStatus === 'Pegawai Tidak Tetap Persyarikatan (PTTP)') {
                $targetStatus = 'Pegawai Tetap Persyarikatan (PTP)';
            } elseif (str_contains($currentStatus, 'Kontrak') || empty($currentStatus)) {
                $targetStatus = $isGuru ? 'Guru Tidak Tetap Persyarikatan (GTTP)' : 'Pegawai Tidak Tetap Persyarikatan (PTTP)';
            } else {
                // Pegawai sudah mencapai status tertinggi (GTP / PTP)
                $targetStatus = $isGuru ? 'Guru Tetap Persyarikatan (GTP)' : 'Pegawai Tetap Persyarikatan (PTP)';
            }

            $st = $statusConfig[$index % count($statusConfig)];
            $bulanNum = ($index % 3) + 6; // Bulan Juni (06), Juli (07), Agustus (08)
            $bulanStr = sprintf('%02d', $bulanNum);
            $day = ($index * 3) % 20 + 5;
            $nomorUsulan = sprintf('UKP/2026/%s/%03d', $bulanStr, $counter++);
            $tanggalDiajukan = sprintf('2026-%s-%02d 09:00:00', $bulanStr, $day);
            $tanggalVerifikasi = $st['verif'] ? sprintf('2026-%s-%02d 14:00:00', $bulanStr, $day + 2) : null;

            UsulanKenaikanPangkat::updateOrCreate(
                ['pegawai_id' => $pegawai->id],
                [
                    'nomor_usulan' => $nomorUsulan,
                    'masa_kerja_tahun' => rand(2, 8),
                    'masa_kerja_bulan' => rand(0, 11),
                    'catatan_admin' => $st['catatan_admin'],
                    'catatan_kepsek' => $st['catatan_kepsek'],
                    'status' => $st['status'],
                    'status_pengajuan' => $st['status_pengajuan'],
                    'status_baru' => $targetStatus,
                    'tanggal_diajukan' => $tanggalDiajukan,
                    'tanggal_diverifikasi' => $tanggalVerifikasi,
                ]
            );
        }
    }

    private function seedAbsensi($pegawais)
    {
        $startDate = Carbon::create(2026, 6, 1);
        $endDate = Carbon::create(2026, 8, 31);

        $period = CarbonPeriod::create($startDate, $endDate);

        $latBase = -5.12426372;
        $lngBase = 105.30680370;

        foreach ($period as $date) {
            // Hanya buat absensi untuk hari kerja (Senin - Jumat)
            if ($date->isWeekend()) {
                continue;
            }

            $tanggalStr = $date->format('Y-m-d');

            foreach ($pegawais as $pegawai) {
                // Cek apakah ada cuti disetujui pada tanggal ini
                $cutiApproved = UsulanCuti::where('pegawai_id', $pegawai->id)
                    ->where('status', 'disetujui')
                    ->whereDate('tanggal_mulai', '<=', $tanggalStr)
                    ->whereDate('tanggal_selesai', '>=', $tanggalStr)
                    ->first();

                if ($cutiApproved) {
                    Absensi::updateOrCreate(
                        [
                            'pegawai_id' => $pegawai->id,
                            'tanggal' => $tanggalStr,
                        ],
                        [
                            'waktu_masuk' => '07:00:00',
                            'latitude' => $latBase,
                            'longitude' => $lngBase,
                            'lokasi_masuk' => 'Cuti Disetujui (' . $cutiApproved->jenis_cuti . ')',
                            'jarak_meter' => 0,
                            'status_lokasi' => 'valid',
                            'status_kehadiran' => 'izin',
                            'device_info' => 'System Auto',
                            'ip_address' => '127.0.0.1',
                        ]
                    );
                    continue;
                }

                // Variasi jam & status kehadiran
                // Menggunakan hash tanggal + id pegawai agar konsisten setiap kali seeder dijalankan
                $hashVal = crc32($tanggalStr . '_' . $pegawai->id) % 100;

                if ($hashVal < 88) {
                    // 88% Hadir Tepat Waktu / Hadir
                    $minuteOffset = sprintf('%02d', abs($hashVal) % 40 + 5); // 06:45 - 07:25
                    $hour = $minuteOffset > 30 ? '07' : '06';
                    $minute = sprintf('%02d', (45 + $hashVal) % 60);

                    Absensi::updateOrCreate(
                        [
                            'pegawai_id' => $pegawai->id,
                            'tanggal' => $tanggalStr,
                        ],
                        [
                            'waktu_masuk' => "07:{$minuteOffset}:15",
                            'latitude' => $latBase + (rand(-5, 5) * 0.00001),
                            'longitude' => $lngBase + (rand(-5, 5) * 0.00001),
                            'lokasi_masuk' => 'SMA Muhammadiyah 2 Metro',
                            'jarak_meter' => rand(3, 25),
                            'status_lokasi' => 'valid',
                            'status_kehadiran' => 'hadir',
                            'device_info' => 'Android 14 / Mobile Chrome',
                            'ip_address' => '182.1.22.' . rand(1, 250),
                        ]
                    );
                } elseif ($hashVal < 94) {
                    // 6% Tugas Luar
                    Absensi::updateOrCreate(
                        [
                            'pegawai_id' => $pegawai->id,
                            'tanggal' => $tanggalStr,
                        ],
                        [
                            'waktu_masuk' => '07:30:00',
                            'latitude' => $latBase + 0.002,
                            'longitude' => $lngBase + 0.002,
                            'lokasi_masuk' => 'Dinas Pendidikan Kota Metro (Tugas Luar)',
                            'jarak_meter' => 1500,
                            'status_lokasi' => 'valid',
                            'status_kehadiran' => 'tugas_luar',
                            'device_info' => 'Android 14 / Mobile Chrome',
                            'ip_address' => '182.1.22.' . rand(1, 250),
                        ]
                    );
                } elseif ($hashVal < 97) {
                    // 3% Sakit
                    Absensi::updateOrCreate(
                        [
                            'pegawai_id' => $pegawai->id,
                            'tanggal' => $tanggalStr,
                        ],
                        [
                            'waktu_masuk' => '07:00:00',
                            'latitude' => $latBase,
                            'longitude' => $lngBase,
                            'lokasi_masuk' => 'Izin Sakit',
                            'jarak_meter' => 0,
                            'status_lokasi' => 'valid',
                            'status_kehadiran' => 'sakit',
                            'device_info' => 'Android 14 / Mobile Chrome',
                            'ip_address' => '182.1.22.' . rand(1, 250),
                        ]
                    );
                } else {
                    // 3% Tidak Hadir
                    Absensi::updateOrCreate(
                        [
                            'pegawai_id' => $pegawai->id,
                            'tanggal' => $tanggalStr,
                        ],
                        [
                            'waktu_masuk' => '09:00:00',
                            'latitude' => null,
                            'longitude' => null,
                            'lokasi_masuk' => 'Sistem Otomatis (Tidak Hadir)',
                            'jarak_meter' => 9999,
                            'status_lokasi' => 'tidak_valid',
                            'status_kehadiran' => 'tidak_hadir',
                            'device_info' => 'System Auto',
                            'ip_address' => '127.0.0.1',
                        ]
                    );
                }
            }
        }
    }
}
