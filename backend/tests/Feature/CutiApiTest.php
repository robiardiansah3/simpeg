<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Pegawai;

class CutiApiTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $role = Role::create(['role_name' => 'pegawai', 'display_name' => 'Pegawai']);
        $this->user = User::factory()->create(['role_id' => $role->id]);
        Pegawai::create([
            'user_id' => $this->user->id,
            'nama_lengkap' => 'Pegawai Cuti',
            'jenis_kelamin' => 'Perempuan',
            'tempat_lahir' => 'Metro',
            'tanggal_lahir' => '1992-01-01',
            'agama' => 'Islam',
            'pendidikan_terakhir' => 'S1',
            'jurusan' => 'Pendidikan Matematika',
            'jabatan' => 'Guru',
            'status_kepegawaian' => 'Kontrak',
            'alamat' => 'Metro',
            'nomor_telepon' => '0812',
        ]);
    }

    public function test_pegawai_can_apply_for_leave()
    {
        $tomorrow = date('Y-m-d', strtotime('+1 day'));
        $nextWeek = date('Y-m-d', strtotime('+7 days'));

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/cuti', [
            'jenis_cuti' => 'Cuti Tahunan',
            'tanggal_mulai' => $tomorrow,
            'tanggal_selesai' => $nextWeek,
            'alasan' => 'Liburan keluarga',
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment(['status' => 'success']);
    }

    public function test_validation_fails_if_end_date_before_start_date()
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/cuti', [
            'jenis_cuti' => 'Cuti Tahunan',
            'tanggal_mulai' => '2027-01-10',
            'tanggal_selesai' => '2027-01-05',
        ]);

        $response->assertStatus(422);
    }
}
