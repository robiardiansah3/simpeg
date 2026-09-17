<?php
/**
 * @file AuthController.php
 * @description Controller untuk melayani autentikasi pengguna SIMPEG,
 * menggunakan Laravel Sanctum untuk manajemen sesi token Bearer.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

/**
 * Class AuthController
 * Mengelola proses masuk (login), penarikan profil pengguna aktif, dan keluar (logout) dari sistem.
 */
class AuthController extends Controller
{
    /**
     * Memproses permintaan login dan membuat token Sanctum baru.
     * Mendukung autentikasi menggunakan Email atau Username.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string', // Dapat diisi email atau username
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');
        
        // Menentukan apakah input email adalah email valid atau username
        $fieldType = filter_var($request->email, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (!Auth::attempt([$fieldType => $request->email, 'password' => $request->password])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kredensial tidak valid (Email/Username atau Password salah)'
            ], 401);
        }

        $user = User::where($fieldType, $request->email)->firstOrFail();

        // Memuat relasi peran (role) dan biodata pegawai
        $user->load('role', 'pegawai');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     * Mengambil profil lengkap user yang sedang aktif.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile(Request $request)
    {
        $user = $request->user()->load('role', 'pegawai');
        
        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    /**
     * Memproses permintaan logout dengan menghapus token akses aktif saat ini.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil'
        ]);
    }
}
