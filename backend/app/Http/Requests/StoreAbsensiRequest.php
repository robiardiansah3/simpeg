<?php
/**
 * @file StoreAbsensiRequest.php
 * @description Request Validation class untuk mencatat kehadiran (absensi) pegawai.
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreAbsensiRequest
 * Memvalidasi data masukan dari klien untuk proses check-in absensi.
 */
class StoreAbsensiRequest extends FormRequest
{
    /**
     * Menentukan apakah pengguna diizinkan untuk membuat request ini.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Menetapkan aturan validasi yang berlaku untuk request ini.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'lokasi_masuk' => 'nullable|string',
            'status_kehadiran' => 'nullable|string|in:hadir,izin,sakit,tidak_hadir,tugas_luar',
        ];
    }
}
