<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('table_name')->index();
            $table->unsignedBigInteger('table_id')->index();
            $table->string('parent_table')->nullable()->index();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            
            $table->string('action'); // created, updated, deleted
            
            $table->json('before_data')->nullable();
            $table->json('after_data')->nullable();
            $table->json('changed_fields')->nullable();
            
            $table->foreignId('user_id')->nullable()->index();
            $table->string('user_role')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamp('created_at')->index();

            $table->index(['table_name', 'table_id']);
            $table->index(['parent_table', 'parent_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
