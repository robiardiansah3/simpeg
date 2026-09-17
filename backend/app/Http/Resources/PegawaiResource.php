<?php
/**
 * @file PegawaiResource.php
 * @description API Resource class untuk transformasi data profil/biodata pegawai.
 */

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class PegawaiResource
 * Mentransformasikan data master pegawai ke representasi format JSON API.
 */
class PegawaiResource extends JsonResource
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
            'user' => [
                'id' => $this->user->id ?? null,
                'name' => $this->user->name ?? null,
                'email' => $this->user->email ?? null,
            ],
            'nbm' => $this->nbm,
            'nama_lengkap' => $this->nama_lengkap,
            'jenis_kelamin' => $this->jenis_kelamin,
            'tempat_lahir' => $this->tempat_lahir,
            'tanggal_lahir' => $this->tanggal_lahir,
            'agama' => $this->agama,
            'pendidikan_terakhir' => $this->pendidikan_terakhir,
            'jurusan' => $this->jurusan,
            'jabatan' => $this->jabatan,
            'status_kepegawaian' => $this->status_kepegawaian,
            'status' => $this->status,
            'alamat' => $this->alamat,
            'nomor_telepon' => $this->nomor_telepon,
            'foto' => $this->foto ? url('storage/' . $this->foto) : null,
            'bergabung_sejak' => $this->created_at->format('Y-m-d'),
        ];
    }
}
