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
        // Ubah data lama terlebih dahulu
        DB::table('dokumen_usulan_kenaikan_pangkat')
            ->where('status_validasi', 'tidak valid')
            ->update(['status_validasi' => 'revisi']);

        // Ubah kolom nama_dokumen menjadi ENUM
        DB::statement("
            ALTER TABLE dokumen_usulan_kenaikan_pangkat
            MODIFY COLUMN nama_dokumen ENUM(
                'ktp',
                'kartu_keluarga',
                'ijazah',
                'sk_pengangkatan',
                'sk_pembagian_tugas'
            ) NOT NULL
        ");

        // Ubah enum status_validasi
        DB::statement("
            ALTER TABLE dokumen_usulan_kenaikan_pangkat
            MODIFY COLUMN status_validasi ENUM(
                'pending',
                'valid',
                'revisi',
                'ditolak'
            ) NOT NULL DEFAULT 'pending'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Ubah data yang tidak ada di enum lama
        DB::table('dokumen_usulan_kenaikan_pangkat')
            ->whereIn('status_validasi', ['revisi', 'ditolak'])
            ->update(['status_validasi' => 'tidak valid']);

        // Kembalikan nama_dokumen menjadi varchar
        DB::statement("
            ALTER TABLE dokumen_usulan_kenaikan_pangkat
            MODIFY COLUMN nama_dokumen VARCHAR(255) NOT NULL
        ");

        // Kembalikan enum lama
        DB::statement("
            ALTER TABLE dokumen_usulan_kenaikan_pangkat
            MODIFY COLUMN status_validasi ENUM(
                'pending',
                'valid',
                'tidak valid'
            ) NOT NULL DEFAULT 'pending'
        ");
    }
};
