<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Callback untuk mereset seluruh nilai AUTO_INCREMENT tabel basis data ke 1.
 */
Artisan::command('db:reset-increment', function () {
    $this->info('Resetting AUTO_INCREMENT of all tables in the database...');
    
    Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    
    $tables = Illuminate\Support\Facades\DB::select('SHOW TABLES');
    $dbName = Illuminate\Support\Facades\DB::getDatabaseName();
    $columnKey = "Tables_in_" . $dbName;
    
    foreach ($tables as $table) {
        $tableName = $table->$columnKey ?? array_values((array)$table)[0];
        
        // Skip system/internal tables if any, e.g., migrations
        if ($tableName === 'migrations' || $tableName === 'cache' || $tableName === 'sessions') {
            continue;
        }
        
        try {
            Illuminate\Support\Facades\DB::statement("ALTER TABLE `{$tableName}` AUTO_INCREMENT = 1;");
            $this->line("Resetted: {$tableName}");
        } catch (\Exception $e) {
            $this->error("Failed for {$tableName}: " . $e->getMessage());
        }
    }
    
    Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    $this->info('All AUTO_INCREMENT values have been reset successfully!');
})->purpose('Reset AUTO_INCREMENT values of all tables to 1');

/**
 * Callback untuk menandai pegawai yang tidak presensi sebagai tidak_hadir atau izin (jika cuti).
 */
Artisan::command('absensi:auto-tidak-hadir {--days=3 : Jumlah hari ke belakang yang akan dicek}', function () {
    $days = (int) $this->option('days');
    $this->info("Menjalankan pengecekan absensi otomatis untuk {$days} hari ke belakang...");
    
    for ($i = 0; $i < $days; $i++) {
        $tanggal = date('Y-m-d', strtotime("-{$i} days"));
        $this->line("Memeriksa tanggal: {$tanggal}");
        \App\Models\Absensi::autoMarkTidakHadir($tanggal);
    }
    
    $this->info("Pengecekan absensi otomatis selesai!");
})->purpose('Menandai pegawai yang tidak absen sebagai tidak_hadir atau izin (jika cuti)');

// Jalankan otomatis setiap jam untuk memastikan jika hari ini sudah lewat jam_selesai langsung terupdate
Illuminate\Support\Facades\Schedule::command('absensi:auto-tidak-hadir --days=3')->hourly();

