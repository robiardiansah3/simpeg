<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pegawai_id')->constrained('pegawai', 'id')->onDelete('cascade');
            $table->date('tanggal');
            $table->time('waktu_masuk');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('lokasi_masuk')->nullable();
            $table->decimal('jarak_meter', 8, 2)->nullable();
            $table->enum('status_lokasi', ['valid', 'tidak_valid'])->nullable();
            $table->enum('status_kehadiran', ['hadir', 'izin', 'sakit', 'tidak_hadir']);
            $table->string('device_info')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absensi');
    }
};
