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
            $table->string('tipe_file')->nullable()->after('file_dokumen');
            $table->integer('ukuran_file')->nullable()->after('tipe_file');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dokumen_usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->dropColumn(['tipe_file', 'ukuran_file']);
        });
    }
};
