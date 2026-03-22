<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Seed default roles
        $roles = [
            'user' => DB::table('roles')->insertGetId(['name' => 'user', 'created_at' => now(), 'updated_at' => now()]),
            'staff' => DB::table('roles')->insertGetId(['name' => 'staff', 'created_at' => now(), 'updated_at' => now()]),
            'supervisor' => DB::table('roles')->insertGetId(['name' => 'supervisor', 'created_at' => now(), 'updated_at' => now()]),
        ];

        // Migrate existing user roles
        $users = DB::table('users')->get();
        foreach ($users as $user) {
            $roleName = $user->role ?? 'user';
            $roleId = $roles[$roleName] ?? $roles['user'];

            DB::table('role_user')->insert([
                'user_id' => $user->id,
                'role_id' => $roleId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
