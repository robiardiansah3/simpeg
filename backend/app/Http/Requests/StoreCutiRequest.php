<?php
/**
 * @file StoreCutiRequest.php
 * @description Request Validation class untuk pengajuan cuti pegawai baru.
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreCutiRequest
 * Memvalidasi data masukan dari klien untuk pengajuan usulan cuti baru.
 */
class StoreCutiRequest extends FormRequest
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
            'jenis_cuti' => 'required|in:Cuti Tahunan,Cuti Sakit,Cuti Melahirkan,Cuti Alasan Penting,Cuti lainnya',
            'tanggal_mulai' => 'required|date|after_or_equal:today',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan' => 'nullable|string',
            'lampiran' => 'nullable|file|mimes:pdf,png,jpg,jpeg|max:5120',
        ];
    }
}
