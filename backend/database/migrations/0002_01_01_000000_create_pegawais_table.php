<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pegawai', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users', 'id')->onDelete('cascade');
            $table->string('nbm')->nullable();
            $table->string('nama_lengkap');
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan']);
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->string('agama');
            $table->string('pendidikan_terakhir');
            $table->string('jurusan');
            $table->string('jabatan');
            $table->enum('status_kepegawaian', [
                'Kontrak', 
                'Pegawai Tidak Tetap Persyarikatan (PTTP)', 
                'Pegawai Tetap Persyarikatan (PTP)', 
                'Guru Tidak Tetap Persyarikatan (GTTP)', 
                'Guru Tetap Persyarikatan (GTP)'
            ]);
            $table->text('alamat');
            $table->string('nomor_telepon');
            $table->string('foto')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pegawai');
    }
};
