<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            // Jadikan semua kolom nullable agar observer bisa membuat record minimal saat user dibuat
            $table->string('nama_lengkap', 100)->nullable()->change();
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->nullable()->change();
            $table->string('tempat_lahir')->nullable()->change();
            $table->date('tanggal_lahir')->nullable()->change();
            $table->string('agama')->nullable()->change();
            $table->string('pendidikan_terakhir')->nullable()->change();
            $table->string('jurusan')->nullable()->change();
            $table->string('jabatan')->nullable()->change();
            $table->enum('status_kepegawaian', [
                'Kontrak',
                'Pegawai Tidak Tetap Persyarikatan (PTTP)',
                'Pegawai Tetap Persyarikatan (PTP)',
                'Guru Tidak Tetap Persyarikatan (GTTP)',
                'Guru Tetap Persyarikatan (GTP)'
            ])->nullable()->change();
            $table->text('alamat')->nullable()->change();
            $table->string('nomor_telepon')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Tidak di-rollback karena berisiko data yang sudah ada
    }
};
