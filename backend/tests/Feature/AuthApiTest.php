<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Buat role pegawai
        Role::create(['role_name' => 'pegawai', 'display_name' => 'Pegawai']);
    }

    public function test_user_can_login_with_correct_credentials()
    {
        $role = Role::first();
        $user = User::factory()->create([
            'email' => 'pegawai@sekolah.com',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'pegawai@sekolah.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'access_token',
                     'user'
                 ]);
    }

    public function test_user_cannot_login_with_incorrect_password()
    {
        $role = Role::first();
        User::factory()->create([
            'email' => 'pegawai@sekolah.com',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'pegawai@sekolah.com',
            'password' => 'salah',
        ]);

        $response->assertStatus(401);
    }

    public function test_user_cannot_access_profile_without_token()
    {
        $response = $this->getJson('/api/me');
        $response->assertStatus(401);
    }
}
