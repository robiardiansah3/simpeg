<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dokumen_usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ukp_id')->constrained('usulan_kenaikan_pangkat', 'id')->onDelete('cascade');
            $table->string('nama_dokumen');
            $table->string('file_dokumen');
            $table->enum('status_validasi', ['pending', 'valid', 'tidak valid'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen_usulan_kenaikan_pangkat');
    }
};
