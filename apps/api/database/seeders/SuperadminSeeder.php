<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $roleId = DB::table('roles')->where('name', 'supervisor')->value('id');

        $user = User::firstOrCreate(
            ['email' => 'admin@setyanet.com'],
            [
                'name' => 'Superadmin Setyanet',
                'password' => Hash::make('password123'),
                'role_id' => $roleId ?? 1,
            ]
        );

        // Also create address to avoid errors when loading relations
        $user->address()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'full_address' => 'Jl. Superadmin No. 1',
                'province' => 'Jawa Timur',
                'city' => 'Surabaya',
                'district' => 'Gubeng',
                'village' => 'Gubeng',
                'postal_code' => '60281',
                'phone' => '081234567891',
            ]
        );
    }
}
