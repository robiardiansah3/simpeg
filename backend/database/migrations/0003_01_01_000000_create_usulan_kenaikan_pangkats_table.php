<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pegawai_id')->constrained('pegawai', 'id')->onDelete('cascade');
            $table->string('nomor_usulan')->unique();
            $table->string('masa_kerja');
            $table->enum('status', ['diajukan', 'ditinjau', 'disetujui', 'ditolak'])->default('diajukan');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usulan_kenaikan_pangkat');
    }
};
