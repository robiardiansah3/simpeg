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
        Schema::create('jadwal_absensi', function (Blueprint $table) {
            $table->id();
            $table->string('hari');
            $table->boolean('is_active')->default(true);
            $table->time('jam_mulai')->default('07:00:00');
            $table->time('jam_selesai')->default('09:00:00');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_absensi');
    }
};
