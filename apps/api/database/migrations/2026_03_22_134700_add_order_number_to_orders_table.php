<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Order;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_number')->nullable()->unique()->after('id');
        });

        // Initialize existing orders with padded numbers
        $orders = Order::all();
        foreach ($orders as $order) {
            $order->order_number = 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
            $order->save();
        }

        // Make it non-nullable after population if desired, but nullable is fine for now
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('order_number');
        });
    }
};
