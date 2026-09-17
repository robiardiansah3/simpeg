<?php
/**
 * @file InformasiPersyaratanResource.php
 * @description API Resource class untuk transformasi data informasi prasyarat administrasi.
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class InformasiPersyaratanResource
 * Mentransformasikan model InformasiPersyaratan ke representasi format JSON API.
 */
class InformasiPersyaratanResource extends JsonResource
{
    /**
     * Mengubah resource ke dalam bentuk array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'judul' => $this->judul,
            'deskripsi' => $this->deskripsi,
            'urutan' => $this->urutan,
            'is_published' => (bool) $this->is_published,
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
