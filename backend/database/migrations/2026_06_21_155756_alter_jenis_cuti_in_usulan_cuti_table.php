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
        // Migrate any existing 'Cuti Besar' to 'Cuti lainnya' before changing the type to enum
        \Illuminate\Support\Facades\DB::table('usulan_cuti')
            ->where('jenis_cuti', 'Cuti Besar')
            ->update(['jenis_cuti' => 'Cuti lainnya']);

        Schema::table('usulan_cuti', function (Blueprint $table) {
            $table->enum('jenis_cuti', [
                'Cuti Tahunan', 
                'Cuti Sakit', 
                'Cuti Melahirkan', 
                'Cuti Alasan Penting', 
                'Cuti lainnya'
            ])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usulan_cuti', function (Blueprint $table) {
            $table->string('jenis_cuti')->change();
        });
    }
};
