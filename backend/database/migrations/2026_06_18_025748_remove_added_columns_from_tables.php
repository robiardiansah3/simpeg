<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
        if (Schema::hasColumn('pegawai', 'status')) {
            Schema::table('pegawai', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }

        if (Schema::hasColumn('roles', 'description')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropColumn('description');
            });
        }

        if (Schema::hasColumn('absensi', 'waktu_pulang')) {
            Schema::table('absensi', function (Blueprint $table) {
                $table->dropColumn('waktu_pulang');
            });
        }

        if (Schema::hasColumn('informasi_persyaratan', 'berlaku_untuk')) {
            Schema::table('informasi_persyaratan', function (Blueprint $table) {
                $table->dropColumn('berlaku_untuk');
            });
        }

        if (Schema::hasColumn('pegawai', 'unit_kerja')) {
            Schema::table('pegawai', function (Blueprint $table) {
                $table->dropColumn('unit_kerja');
            });
        }
    }

    public function down(): void
    {
        // Kosongkan atau tambahkan kembali kolom jika diperlukan
    }
};