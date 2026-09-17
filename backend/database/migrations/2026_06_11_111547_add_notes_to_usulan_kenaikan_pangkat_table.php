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
        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {
            // Catatan validasi
            $table->text('catatan_admin')
                ->nullable()
                ->after('masa_kerja');

            $table->text('catatan_kepsek')
                ->nullable()
                ->after('catatan_admin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {
            
            $table->dropColumn([
                'catatan_admin',
                'catatan_kepsek',
            ]);
        });
    }
};
