<?php
/**
 * @file CutiResource.php
 * @description API Resource class untuk transformasi data pengajuan cuti.
 */

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class CutiResource
 * Mentransformasikan data pengajuan cuti pegawai ke representasi format JSON API.
 */
class CutiResource extends JsonResource
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
            'jenis_cuti' => $this->jenis_cuti,
            'tanggal_mulai' => $this->tanggal_mulai ? $this->tanggal_mulai->format('Y-m-d') : null,
            'tanggal_selesai' => $this->tanggal_selesai ? $this->tanggal_selesai->format('Y-m-d') : null,
            'jumlah_hari' => $this->jumlah_hari,
            'alasan' => $this->alasan,
            'catatan_admin' => $this->catatan_admin,
            'catatan_kepsek' => $this->catatan_kepsek,
            'status' => $this->status,
            'tanggal_diajukan' => $this->tanggal_diajukan ? $this->tanggal_diajukan->format('Y-m-d H:i:s') : null,
            'tanggal_diverifikasi' => $this->tanggal_diverifikasi ? $this->tanggal_diverifikasi->format('Y-m-d H:i:s') : null,
            'lampiran' => $this->lampiran ? asset('storage/' . $this->lampiran) : null,
        ];
    }
}
