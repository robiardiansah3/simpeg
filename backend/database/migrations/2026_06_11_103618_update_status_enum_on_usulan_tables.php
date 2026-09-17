<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Usulan Kenaikan Pangkat
        DB::statement("
            ALTER TABLE usulan_kenaikan_pangkat
            MODIFY COLUMN status ENUM(
                'diajukan',
                'ditinjau_admin',
                'revisi',
                'diteruskan',
                'disetujui',
                'ditolak'
            ) NOT NULL DEFAULT 'diajukan'
        ");

        // Usulan Cuti
        DB::statement("
            ALTER TABLE usulan_cuti
            MODIFY COLUMN status ENUM(
                'diajukan',
                'ditinjau_admin',
                'revisi',
                'diteruskan',
                'disetujui',
                'ditolak'
            ) NOT NULL DEFAULT 'diajukan'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        // Sesuaikan dengan enum lama Anda
        DB::statement("
            ALTER TABLE usulan_kenaikan_pangkat
            MODIFY COLUMN status ENUM(
                'pending',
                'disetujui',
                'ditolak'
            ) NOT NULL DEFAULT 'pending'
        ");

        DB::statement("
            ALTER TABLE usulan_cuti
            MODIFY COLUMN status ENUM(
                'pending',
                'disetujui',
                'ditolak'
            ) NOT NULL DEFAULT 'pending'
        ");
    }
};
