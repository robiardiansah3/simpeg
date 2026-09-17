<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            $table->enum('status_kehadiran', ['hadir', 'izin', 'sakit', 'tidak_hadir', 'tugas_luar'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            $table->enum('status_kehadiran', ['hadir', 'izin', 'sakit', 'tidak_hadir'])->change();
        });
    }
};
