<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset auto increment of tables so they start from ID 1
        \Illuminate\Support\Facades\Artisan::call('db:reset-increment');

        $this->call([
            AdminUiSeeder::class,
            JadwalAbsensiSeeder::class,
            DataJuni2026Seeder::class,
        ]);
    }
}
