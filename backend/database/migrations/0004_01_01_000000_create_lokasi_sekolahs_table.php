<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lokasi_sekolah', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lokasi');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('radius_meter', 8, 2);
            $table->text('alamat');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lokasi_sekolah');
    }
};
