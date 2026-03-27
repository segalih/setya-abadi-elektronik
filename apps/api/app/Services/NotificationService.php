<?php

namespace App\Services;

use App\Jobs\SendOrderNotification;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    protected $baseUrl;

    public function __construct()
    {
        $url = config('services.notification.url', 'http://localhost:8001');
        $this->baseUrl = rtrim($url, '/') . '/api/notify';
    }

    /**
     * Notify user about order status update.
     */
    public function notifyOrderUpdate($order, $status, $note = null, $images = [])
    {
        try {
            $payload = [
                'order_id' => $order->order_number ?? $order->id,
                'status' => $status,
                'note' => $note,
                'images' => $images,
                'customer_name' => $order->user->name,
                'customer_email' => $order->user->email,
                'customer_phone' => $order->user->address->phone ?? null,
            ];

            SendOrderNotification::dispatch("{$this->baseUrl}/order-update", $payload);

            return true;
        } catch (\Exception $e) {
            Log::error("NotificationService Error (OrderUpdate): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify user about payment success.
     */
    public function notifyPaymentSuccess($order)
    {
        try {
            $payload = [
                'order_id' => $order->order_number ?? $order->id,
                'product_type' => $order->product_type,
                'total_price' => $order->total_price,
                'customer_name' => $order->user->name,
                'customer_email' => $order->user->email,
                'customer_phone' => $order->user->address->phone ?? null,
            ];

            SendOrderNotification::dispatch("{$this->baseUrl}/payment-success", $payload);

            return true;
        } catch (\Exception $e) {
            Log::error("NotificationService Error (PaymentSuccess): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify user about order creation.
     */
    public function notifyOrderCreated($order)
    {
        try {
            $payload = [
                'order_id' => $order->order_number ?? $order->id,
                'product_type' => $order->product_type,
                'total_price' => $order->total_price,
                'customer_name' => $order->user->name,
                'customer_email' => $order->user->email,
                'customer_phone' => $order->user->address->phone ?? null,
            ];

            SendOrderNotification::dispatch("{$this->baseUrl}/order-created", $payload);

            return true;
        } catch (\Exception $e) {
            Log::error("NotificationService Error (OrderCreated): " . $e->getMessage());
            return false;
        }
    }
}
