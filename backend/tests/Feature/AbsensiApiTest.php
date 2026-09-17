<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Pegawai;
use App\Models\LokasiSekolah;

class AbsensiApiTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $pegawai;

    protected function setUp(): void
    {
        parent::setUp();
        $role = Role::create(['role_name' => 'pegawai', 'display_name' => 'Pegawai']);
        $this->user = User::factory()->create(['role_id' => $role->id]);
        $this->pegawai = Pegawai::where('user_id', $this->user->id)->first();
        if ($this->pegawai) {
            $this->pegawai->update([
                'nama_lengkap' => 'Pegawai Test',
                'jenis_kelamin' => 'Laki-laki',
                'tempat_lahir' => 'Metro',
                'tanggal_lahir' => '1990-01-01',
                'agama' => 'Islam',
                'pendidikan_terakhir' => 'S1',
                'jurusan' => 'Pendidikan Matematika',
                'jabatan' => 'Guru',
                'status_kepegawaian' => 'Kontrak',
                'alamat' => 'Metro',
                'nomor_telepon' => '0812',
            ]);
        } else {
            $this->pegawai = Pegawai::create([
                'user_id' => $this->user->id,
                'nama_lengkap' => 'Pegawai Test',
                'jenis_kelamin' => 'Laki-laki',
                'tempat_lahir' => 'Metro',
                'tanggal_lahir' => '1990-01-01',
                'agama' => 'Islam',
                'pendidikan_terakhir' => 'S1',
                'jurusan' => 'Pendidikan Matematika',
                'jabatan' => 'Guru',
                'status_kepegawaian' => 'Kontrak',
                'alamat' => 'Metro',
                'nomor_telepon' => '0812',
            ]);
        }

        LokasiSekolah::create([
            'nama_lokasi' => 'SMA Muhammadiyah 2 Metro',
            'latitude' => -5.11159,
            'longitude' => 105.30690,
            'radius_meter' => 100,
            'alamat' => 'Jl. Metro',
        ]);
    }

    public function test_pegawai_can_checkin()
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/absensi/checkin', [
            'latitude' => -5.11159,
            'longitude' => 105.30690,
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment(['status' => 'success']);
                 
        $this->assertDatabaseHas('absensi', [
            'pegawai_id' => $this->pegawai->id,
            'status_lokasi' => 'valid'
        ]);
    }

    public function test_pegawai_cannot_checkin_twice_a_day()
    {
        $this->actingAs($this->user, 'sanctum')->postJson('/api/absensi/checkin', [
            'latitude' => -5.11159,
            'longitude' => 105.30690,
        ]);

        // Second checkin
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/absensi/checkin', [
            'latitude' => -5.11159,
            'longitude' => 105.30690,
        ]);

        $response->assertStatus(400)
                 ->assertJsonFragment(['message' => 'Anda sudah melakukan check-in hari ini']);
    }
}
