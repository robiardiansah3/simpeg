<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usulan_cuti', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pegawai_id')->constrained('pegawai', 'id')->onDelete('cascade');
            $table->string('nomor_usulan')->unique();
            $table->string('jenis_cuti');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->integer('jumlah_hari');
            $table->text('alasan')->nullable();
            $table->text('catatan_admin')->nullable();
            $table->text('catatan_kepsek')->nullable();
            $table->enum('status', ['diajukan', 'ditinjau', 'disetujui', 'ditolak'])->default('diajukan');
            $table->timestamp('tanggal_diajukan')->useCurrent();
            $table->timestamp('tanggal_diverifikasi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usulan_cuti');
    }
};
