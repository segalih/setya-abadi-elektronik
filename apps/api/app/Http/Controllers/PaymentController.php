<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Notification;

class PaymentController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Get or create Snap Token for an order.
     */
    public function getToken(Request $request, $id)
    {
        $order = $request->user()->orders()->with('user.address')->findOrFail($id);

        if ($order->payment_status === 'success') {
            return response()->json(['message' => 'Order is already paid.'], 422);
        }

        if (!$order->snap_token) {
            try {
                $order->snap_token = $this->midtransService->createSnapToken($order);
                $order->save();
            } catch (\Exception $e) {
                Log::error('Midtrans Snap Token Error: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Gagal mendapatkan token pembayaran: ' . $e->getMessage()
                ], 500);
            }
        }

        return response()->json([
            'snap_token' => $order->snap_token,
            'client_key' => config('midtrans.client_key')
        ]);
    }

    /**
     * Handle Midtrans Notification Webhook.
     */
    public function handleNotification(Request $request)
    {
        Log::info('Midtrans Notification Received', $request->all());

        try {
            $notif = new Notification();
        } catch (\Exception $e) {
            Log::error('Midtrans Notification Parse Error: ' . $e->getMessage());
            return response()->json(['message' => 'Invalid notification'], 400);
        }

        $transaction = $notif->transaction_status;
        $type = $notif->payment_type;
        $order_id_raw = $notif->order_id;
        $fraud = $notif->fraud_status;

        // Order ID in Midtrans was formatted as "$id-$timestamp"
        $parts = explode('-', $order_id_raw);
        $order_id = $parts[0];
        $order = Order::findOrFail($order_id);

        Log::info("Processing Midtrans Notification: Order {$order_id}, Status: {$transaction}, Type: {$type}");

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $order->payment_status = 'pending';
                } else {
                    $order->payment_status = 'success';
                    $order->payment_at = now();
                }
            }
        } else if ($transaction == 'settlement') {
            $order->payment_status = 'success';
            $order->payment_at = now();
        } else if ($transaction == 'pending') {
            $order->payment_status = 'waiting';
        } else if ($transaction == 'deny') {
            $order->payment_status = 'expired';
        } else if ($transaction == 'expire') {
            $order->payment_status = 'expired';
        } else if ($transaction == 'cancel') {
            $order->payment_status = 'expired';
        }

        $order->payment_method = $type;
        
        // Store extra info like VA number or QRIS issuer
        $paymentInfo = [];
        if (isset($notif->va_numbers)) {
            $paymentInfo['va_numbers'] = $notif->va_numbers;
        }
        if (isset($notif->permata_va_number)) {
            $paymentInfo['permata_va_number'] = $notif->permata_va_number;
        }
        if (isset($notif->payment_code)) {
            $paymentInfo['payment_code'] = $notif->payment_code;
        }
        if (isset($notif->issuer)) {
            $paymentInfo['issuer'] = $notif->issuer;
        }
        if (isset($notif->acquirer)) {
            $paymentInfo['acquirer'] = $notif->acquirer;
        }
        
        $order->payment_info = $paymentInfo;
        $order->save();

        return response()->json(['status' => 'success']);
    }
}
