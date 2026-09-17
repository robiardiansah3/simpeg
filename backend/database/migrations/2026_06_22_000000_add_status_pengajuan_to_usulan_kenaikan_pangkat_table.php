<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->enum('status_pengajuan', ['belum diproses', 'diproses', 'selesai'])->default('belum diproses')->after('status')->index();
        });
    }

    public function down(): void
    {
        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->dropColumn('status_pengajuan');
        });
    }
};
