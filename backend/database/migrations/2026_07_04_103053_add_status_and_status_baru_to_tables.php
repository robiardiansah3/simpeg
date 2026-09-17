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
        Schema::table('pegawai', function (Blueprint $table) {
            $table->enum('status', ['guru', 'pegawai(staf)'])->nullable()->after('foto');
        });

        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->string('status_baru')->nullable()->after('status_pengajuan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->dropColumn('status_baru');
        });
    }
};
