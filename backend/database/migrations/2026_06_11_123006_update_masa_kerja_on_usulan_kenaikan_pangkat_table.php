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
        //
        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {

            $table->unsignedInteger('masa_kerja_tahun')
                ->default(0)
                ->after('nomor_usulan');

            $table->unsignedTinyInteger('masa_kerja_bulan')
                ->default(0)
                ->after('masa_kerja_tahun');

            $table->dropColumn('masa_kerja');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {

            $table->string('masa_kerja')
                ->after('nomor_usulan');

            $table->dropColumn([
                'masa_kerja_tahun',
                'masa_kerja_bulan'
            ]);
        });
    }
};
