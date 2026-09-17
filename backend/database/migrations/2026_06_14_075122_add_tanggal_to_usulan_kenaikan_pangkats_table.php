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
            $table->timestamp('tanggal_diajukan')->nullable()->after('status');
            $table->timestamp('tanggal_diverifikasi')->nullable()->after('tanggal_diajukan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usulan_kenaikan_pangkat', function (Blueprint $table) {
            $table->dropColumn(['tanggal_diajukan', 'tanggal_diverifikasi']);
        });
    }
};
