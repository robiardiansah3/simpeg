<?php
/**
 * @file AbsensiResource.php
 * @description API Resource class untuk transformasi data kehadiran (absensi) pegawai.
 */

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class AbsensiResource
 * Mentransformasikan model Absensi ke dalam representasi format JSON API.
 */
class AbsensiResource extends JsonResource
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
            'pegawai' => [
                'id' => $this->pegawai->id ?? null,
                'nama_lengkap' => $this->pegawai->nama_lengkap ?? null,
            ],
            'tanggal' => $this->tanggal ? $this->tanggal->format('Y-m-d') : null,
            'waktu_masuk' => $this->waktu_masuk ? $this->waktu_masuk->format('H:i:s') : null,
            'lokasi' => [
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
                'nama_lokasi' => $this->lokasi_masuk,
                'jarak_meter' => $this->jarak_meter,
                'status' => $this->status_lokasi,
            ],
            'status_kehadiran' => $this->status_kehadiran,
            'device_info' => $this->device_info,
        ];
    }
}
