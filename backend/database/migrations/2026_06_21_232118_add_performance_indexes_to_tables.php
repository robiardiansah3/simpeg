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
            $table->index('tanggal');
            $table->index('status_kehadiran');
            $table->index('status_lokasi');
        });

        Schema::table('usulan_cuti', function (Blueprint $table) {
            $table->index('status');
            $table->index('tanggal_diajukan');
        });

        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            $table->dropIndex(['tanggal']);
            $table->dropIndex(['status_kehadiran']);
            $table->dropIndex(['status_lokasi']);
        });

        Schema::table('usulan_cuti', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['tanggal_diajukan']);
        });

        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });
    }
};
