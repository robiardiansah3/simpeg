<?php
/**
 * @file InformasiPersyaratanController.php
 * @description Controller untuk mengambil daftar artikel informasi persyaratan administrasi 
 * yang dibutuhkan untuk pengajuan cuti dan kenaikan pangkat.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InformasiPersyaratan;
use App\Http\Resources\InformasiPersyaratanResource;

/**
 * Class InformasiPersyaratanController
 * Mengelola penyajian data artikel prasyarat administrasi.
 */
class InformasiPersyaratanController extends Controller
{
    /**
     * Menampilkan daftar semua artikel informasi persyaratan yang diurutkan dari terbaru.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        $informasi = InformasiPersyaratan::orderBy('created_at', 'desc')->get();

        return InformasiPersyaratanResource::collection($informasi);
    }

    /**
     * Menampilkan informasi detail dari satu artikel persyaratan.
     *
     * @param InformasiPersyaratan $informasi_persyaratan
     * @return InformasiPersyaratanResource
     */
    public function show(InformasiPersyaratan $informasi_persyaratan)
    {
        return new InformasiPersyaratanResource($informasi_persyaratan);
    }
}
