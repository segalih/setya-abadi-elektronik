<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use App\Models\Order;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');

        // Bypass SSL verification on local/sandbox to avoid common certificate issues
        if (!Config::$isProduction) {
            Config::$curlOptions = [
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_HTTPHEADER => [], // Fix for Midtrans PHP SDK bug at ApiRequestor.php:117
            ];
        }
    }

    public function createSnapToken(Order $order)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $order->id . '-' . time(), // Unique order id for Midtrans
                'gross_amount' => (int) $order->total_price,
            ],
            'customer_details' => [
                'first_name' => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->user->address->phone ?? '',
            ],
            'item_details' => [
                [
                    'id' => $order->id,
                    'price' => (int) $order->total_price,
                    'quantity' => 1,
                    'name' => $order->product_type,
                ]
            ],
            // Enable Bank Transfer and QRIS specifically
            'enabled_payments' => ['bank_transfer', 'qris', 'gopay', 'shopeepay'],
            'expiry' => [
                'unit' => 'minute',
                'duration' => 1440,
            ],
        ];

        return Snap::getSnapToken($params);
    }
}
