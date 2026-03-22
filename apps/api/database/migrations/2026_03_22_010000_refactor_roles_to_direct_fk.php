<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add role_id column to users table
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id')->nullable()->after('password');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('set null');
        });

        // Step 2: Migrate data from pivot table to role_id
        $pivotData = DB::table('role_user')->get();
        foreach ($pivotData as $pivot) {
            DB::table('users')
                ->where('id', $pivot->user_id)
                ->update(['role_id' => $pivot->role_id]);
        }

        // Step 3: Set default role_id for users without a role
        $defaultRoleId = DB::table('roles')->where('name', 'user')->value('id');
        if ($defaultRoleId) {
            DB::table('users')
                ->whereNull('role_id')
                ->update(['role_id' => $defaultRoleId]);
        }

        // Step 4: Drop pivot table
        Schema::dropIfExists('role_user');
    }

    public function down(): void
    {
        // Recreate pivot table
        Schema::create('role_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['user_id', 'role_id']);
        });

        // Migrate data back
        $users = DB::table('users')->whereNotNull('role_id')->get();
        foreach ($users as $user) {
            DB::table('role_user')->insert([
                'user_id' => $user->id,
                'role_id' => $user->role_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Drop role_id column
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }
};
