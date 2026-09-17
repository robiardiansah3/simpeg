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
        Schema::table('dokumen_usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->text('catatan_validasi')
                ->nullable()
                ->after('status_validasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dokumen_usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->dropColumn('catatan_validasi');
        });
    }
};
