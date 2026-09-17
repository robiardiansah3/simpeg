<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JadwalAbsensiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $days = [
            ['hari' => 'senin', 'is_active' => true, 'jam_mulai' => '07:00:00', 'jam_selesai' => '12:00:00'],
            ['hari' => 'selasa', 'is_active' => true, 'jam_mulai' => '07:00:00', 'jam_selesai' => '12:00:00'],
            ['hari' => 'rabu', 'is_active' => true, 'jam_mulai' => '07:00:00', 'jam_selesai' => '12:00:00'],
            ['hari' => 'kamis', 'is_active' => true, 'jam_mulai' => '07:00:00', 'jam_selesai' => '12:00:00'],
            ['hari' => 'jumat', 'is_active' => true, 'jam_mulai' => '07:00:00', 'jam_selesai' => '12:00:00'],
            ['hari' => 'sabtu', 'is_active' => false, 'jam_mulai' => '07:00:00', 'jam_selesai' => '12:00:00'],
            ['hari' => 'minggu', 'is_active' => false, 'jam_mulai' => '07:00:00', 'jam_selesai' => '12:00:00'],
        ];

        foreach ($days as $day) {
            \App\Models\JadwalAbsensi::updateOrCreate(
                ['hari' => $day['hari']],
                [
                    'is_active' => $day['is_active'],
                    'jam_mulai' => $day['jam_mulai'],
                    'jam_selesai' => $day['jam_selesai'],
                ]
            );
        }
    }
}
