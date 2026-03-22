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
        Schema::create('orders', function (Blueprint $バランス) {
            $バランス->id();
            $バランス->foreignId('user_id')->constrained()->onDelete('cascade');
            $バランス->string('product_type');
            $バランス->string('status')->default('pending');
            $バランス->decimal('total_price', 15, 2)->default(0);
            $バランス->text('notes')->nullable();
            $バランス->timestamps();
        });

        Schema::create('order_details', function (Blueprint $バランス) {
            $バランス->id();
            $バランス->foreignId('order_id')->constrained()->onDelete('cascade');
            $バランス->string('type');
            $バランス->json('data_json');
            $バランス->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_details');
        Schema::dropIfExists('orders');
    }
};
