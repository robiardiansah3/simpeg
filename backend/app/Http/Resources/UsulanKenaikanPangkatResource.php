<?php
/**
 * @file UsulanKenaikanPangkatResource.php
 * @description API Resource class untuk transformasi data usulan kenaikan pangkat (UKP).
 */

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class UsulanKenaikanPangkatResource
 * Mentransformasikan data usulan kenaikan pangkat beserta dokumen lampirannya ke representasi format JSON API.
 */
class UsulanKenaikanPangkatResource extends JsonResource
{
    /**
     * Mengubah resource ke dalam bentuk array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nomor_usulan' => $this->nomor_usulan,
            'pegawai' => [
                'id' => $this->pegawai->id ?? null,
                'nama_lengkap' => $this->pegawai->nama_lengkap ?? null,
                'status_kepegawaian' => $this->pegawai->status_kepegawaian ?? null,
                'status' => $this->pegawai->status ?? null,
                'jabatan' => $this->pegawai->jabatan ?? null,
                'nbm' => $this->pegawai->nbm ?? null,
            ],
            'masa_kerja_tahun' => $this->masa_kerja_tahun,
            'masa_kerja_bulan' => $this->masa_kerja_bulan,
            'catatan_pegawai' => $this->catatan_pegawai,
            'catatan_admin' => $this->catatan_admin,
            'catatan_kepsek' => $this->catatan_kepsek,
            'status' => $this->status,
            'status_pengajuan' => $this->status_pengajuan,
            'status_baru' => $this->status_baru,
            'tanggal_diajukan' => $this->tanggal_diajukan ? $this->tanggal_diajukan->format('Y-m-d H:i:s') : null,
            'tanggal_diverifikasi' => $this->tanggal_diverifikasi ? $this->tanggal_diverifikasi->format('Y-m-d H:i:s') : null,
            // Mengubah format berkas lampiran jika relasi dokumen ikut dimuat (loaded)
            'dokumen' => $this->whenLoaded('dokumen', function () {
                return $this->dokumen->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'nama_dokumen' => $doc->nama_dokumen,
                        'tipe_file' => $doc->tipe_file,
                        'ukuran_file' => $doc->ukuran_file,
                        'status_validasi' => $doc->status_validasi,
                        'catatan_validasi' => $doc->catatan_validasi,
                        'url' => url('storage/' . $doc->file_dokumen),
                    ];
                });
            }),
        ];
    }
}
